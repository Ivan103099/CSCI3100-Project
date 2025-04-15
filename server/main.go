package main

import (
	"errors"
	"flag"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/tnychn/httpx"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/handlers"
	"finawise.app/server/handlers/middlewares"
	"finawise.app/server/repository"
)

// TODO: use log/slog instead of zerolog

const HTTPMaxBytes = 1 * 1024 * 1024 // 1MB

var debug = flag.Bool("debug", false, "enable debug mode")

type RequestBinder struct {
	binder *httpx.DefaultRequestBinder

	validate *validator.Validate
}

func (rb *RequestBinder) Bind(req *httpx.Request, v any) error {
	if err := rb.binder.Bind(req, v); err != nil {
		return httpx.ErrBadRequest.WithError(err)
	}
	if err := rb.validate.Struct(v); err != nil {
		var e validator.ValidationErrors
		if errors.As(err, &e) {
			return httpx.ErrBadRequest.WithError(err)
		}
		return err
	}
	return nil
}

func newRequestBinder() *RequestBinder {
	v := validator.New(validator.WithRequiredStructEnabled())
	return &RequestBinder{binder: new(httpx.DefaultRequestBinder), validate: v}
}

func init() {
	flag.Parse()

	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	if *debug {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	w := zerolog.NewConsoleWriter()
	log.Logger = log.Output(w)

	httpx.RequestBinder = newRequestBinder()
	httpx.HTTPErrorHandler = httpx.HandleHTTPError(*debug)
}

func main() {
	config := config.MustLoad()
	router := mux.NewRouter()

	router.Use(middlewares.Logging())
	router.Use(func(handler http.Handler) http.Handler {
		return http.MaxBytesHandler(handler, HTTPMaxBytes)
	})
	router.NotFoundHandler = httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
		return httpx.ErrNotFound
	})
	router.MethodNotAllowedHandler = httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
		return httpx.ErrMethodNotAllowed
	})

	c := container.New(container.Dependencies{
		"config":     config,
		"repository": repository.New(config),
	})

	for _, provider := range handlers.Handlers {
		provider(c).Mount(router)
	}

	log.Debug().Msg("initializing dependencies")
	if errs := c.Initialize(); errs != nil {
		for name, err := range errs {
			log.Error().Str("name", name).Msg(err.Error())
		}
		log.Error().Msgf("%d errors occurred", len(errs))
		return
	}

	defer func() {
		log.Debug().Msg("terminating dependencies")
		if errs := c.Terminate(); errs != nil {
			for name, err := range errs {
				log.Error().Str("name", name).Msg(err.Error())
			}
			log.Error().Msgf("%d errors occurred", len(errs))
		}
	}()

	server := http.Server{
		Addr:     config.ServerAddress(),
		Handler:  router,
		ErrorLog: nil,
	}

	log.Info().Msgf("server starts: http://%s/", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Panic().Msg(err.Error())
		}
	}
}
