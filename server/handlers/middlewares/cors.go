package middlewares

import (
	"net/http"
	"net/url"

	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"
)

func CORS(url url.URL) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
			res.Header().Add("Access-Control-Allow-Origin", url.String())
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
