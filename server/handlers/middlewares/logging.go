package middlewares

import (
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/zerolog/log"
	"github.com/tnychn/httpx"
)

func Logging(debug bool) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
			start := time.Now()
			err := httpx.H(next)(req, res)
			duration := time.Since(start)
			if err != nil && debug {
				if res.StatusCode == http.StatusInternalServerError {
					log.Debug().Int64("size", res.Size).
						Dur("duration", duration).
						Msgf(`%d %s %s`, res.StatusCode, req.Method, req.URL.EscapedPath())
					log.Error().Msg(err.Error())
				} else {
					log.Debug().Int64("size", res.Size).
						Dur("duration", duration).
						Msgf(`%d %s %s`, res.StatusCode, req.Method, req.URL.EscapedPath())
					log.Debug().Msg("=> " + err.Error())
				}
			} else {
				log.Debug().Int64("size", res.Size).
					Dur("duration", duration).
					Msgf(`%d %s %s`, res.StatusCode, req.Method, req.URL.EscapedPath())
			}
			return err
		})
	}
}
