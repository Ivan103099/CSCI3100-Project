package middlewares

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"

	"finawise.app/server/services/account"
)

type SessionTokenClaims struct {
	account.Session
	jwt.RegisteredClaims
}

func Session(secret string, strict bool) mux.MiddlewareFunc {
	keyfunc := func(_ *jwt.Token) (any, error) {
		return []byte(secret), nil
	}
	return func(next http.Handler) http.Handler {
		return httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
			cookie, err := req.Cookie("token")
			if err != nil {
				if err != http.ErrNoCookie {
					return err // should be unreachable
				}
				if !strict {
					return httpx.H(next)(req, res)
				}
				return httpx.ErrUnauthorized
			}
			if err := cookie.Valid(); err != nil {
				if !strict {
					return httpx.H(next)(req, res)
				}
				return httpx.ErrBadRequest
			}
			token, err := jwt.ParseWithClaims(cookie.Value, new(SessionTokenClaims), keyfunc)
			if err != nil || !token.Valid {
				if !strict {
					return httpx.H(next)(req, res)
				}
				return httpx.ErrBadRequest
			}
			claims, ok := token.Claims.(*SessionTokenClaims)
			if !ok {
				if !strict {
					return httpx.H(next)(req, res)
				}
				return httpx.ErrBadRequest
			}
			req.SetValue("session", claims.Session)
			return httpx.H(next)(req, res)
		})
	}
}
