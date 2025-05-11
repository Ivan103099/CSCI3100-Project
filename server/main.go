package main

import (
	"errors"
	"flag"
	"fmt"
	"net/http"
	"time"

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
	"finawise.app/server/services"
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
			return httpx.ErrBadRequest.WithError(
				fmt.Errorf("invalid value for '%s': constraint '%s' failed",
					e[0].Field(), e[0].Tag()),
			)
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

	if *debug {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	} else {
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	}

	w := zerolog.NewConsoleWriter()
	log.Logger = log.Output(w)

	httpx.RequestBinder = newRequestBinder()
	httpx.HTTPErrorHandler = httpx.HandleHTTPError(*debug)
}

func main() {
	config := config.MustLoad()
	router := mux.NewRouter()

	if config.URL != nil {
		router.Use(middlewares.CORS(*config.URL))
	}
	router.Use(func(handler http.Handler) http.Handler {
		return http.MaxBytesHandler(handler, HTTPMaxBytes)
	})

	router.NotFoundHandler = httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
		if req.Method == http.MethodOptions {
			return res.Status(http.StatusNoContent).NoContent()
		}
		return httpx.ErrNotFound
	})
	router.MethodNotAllowedHandler = httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
		return httpx.ErrMethodNotAllowed
	})

	repo := repository.New(config)
	c := container.New(container.Dependencies{
		"config":     config,
		"repository": repo,
	})
	container.Set(c, "debug", *debug)
	container.Provide(c, "service/account", services.NewAccountService)

	for _, provider := range handlers.Handlers {
		provider(c).Mount(router)
	}

	if errs := c.Initialize(); errs != nil {
		for name, err := range errs {
			log.Error().Str("from", name).Msg(err.Error())
		}
		return
	}

	defer func() {
		if errs := c.Terminate(); errs != nil {
			for name, err := range errs {
				log.Error().Str("from", name).Msg(err.Error())
			}
		}
	}()

	server := http.Server{
		Addr:         config.ServerAddress(),
		Handler:      router,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
		ErrorLog:     nil,
	}

	log.Info().Msgf("server starts: http://%s/", server.Addr)
	if err := server.ListenAndServe(); err != nil {
		if err != http.ErrServerClosed {
			log.Panic().Msg(err.Error())
		}
	}
}
