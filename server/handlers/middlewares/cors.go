package middlewares

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"
)

// TODO: consider using rs/cors or gorilla/handlers instead
func CORS(debug bool) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
			if !debug {
				return httpx.H(next)(req, res)
			}
			res.Header().Add("Access-Control-Allow-Origin", "http://localhost:8080") // DEBUG: hardcode frontend origin
			res.Header().Add("Access-Control-Allow-Credentials", "true")
			res.Header().Add("Access-Control-Allow-Headers", "content-type")
			res.Header().Add("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE")
			if req.Method == http.MethodOptions {
				return res.Status(http.StatusNoContent).NoContent()
			}
			return httpx.H(next)(req, res)
		})
	}
}
