package middlewares

import (
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"
)

type Session struct {
	AccountID int64 `json:"aid"`
	GroupID   int64 `json:"gid"`
}

type AuthTokenClaims struct {
	Session
	jwt.RegisteredClaims
}

func Auth(secret string) mux.MiddlewareFunc {
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
				return httpx.ErrUnauthorized
			}
			if err := cookie.Valid(); err != nil {
				return httpx.ErrBadRequest.WithError(err)
			}
			token, err := jwt.ParseWithClaims(cookie.Value, new(AuthTokenClaims), keyfunc)
			if err != nil || !token.Valid {
				return httpx.ErrBadRequest.WithError(err)
			}
			claims, ok := token.Claims.(*AuthTokenClaims)
			if !ok {
				return httpx.ErrBadRequest
			}
			req.SetValue("session", claims.Session)
			return httpx.H(next)(req, res)
		})
	}
}
