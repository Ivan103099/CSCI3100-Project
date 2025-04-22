package handlers

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"
	"golang.org/x/crypto/bcrypt"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/handlers/middlewares"
	"finawise.app/server/repository"
)

func init() {
	Handlers = append(Handlers, newAuthHandler)
}

type AuthHandler struct {
	config config.Config
	repo   repository.Repository
}

func newAuthHandler(c *container.Container) Handler {
	config := container.Use[config.Config](c, "config")
	repo := container.Use[repository.Repository](c, "repository")
	return &AuthHandler{config: config, repo: repo}
}

func (h *AuthHandler) Mount(router *mux.Router) {
	r := router.PathPrefix("/auth").Subrouter()
	r.Handle("/login", h.handleLogin()).Methods(http.MethodPost, http.MethodOptions)
	r.Handle("/logout", h.handleLogout()).Methods(http.MethodPost, http.MethodOptions)
}

func (h *AuthHandler) handleLogin() httpx.HandlerFunc {
	type Params struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required"` // plain text
	}
	return func(req *httpx.Request, res *httpx.Responder) error {
		var params Params
		if err := req.Bind(&params); err != nil {
			return err
		}

		account, err := h.repo.FindAccountByEmail(params.Email)
		if err != nil {
			if err == repository.ErrNoRows {
				return res.Status(http.StatusNotFound).String("account not found")
			}
			return err
		}

		if err = bcrypt.CompareHashAndPassword(
			[]byte(account.Passhash),
			[]byte(params.Password),
		); err != nil {
			return httpx.ErrUnauthorized.WithError(err)
		}

		now := time.Now()
		expire := now.AddDate(0, 1, 0) // 1 month
		claims := &middlewares.AuthTokenClaims{
			RegisteredClaims: jwt.RegisteredClaims{
				IssuedAt:  jwt.NewNumericDate(now),
				ExpiresAt: jwt.NewNumericDate(expire),
			},
			Session: middlewares.Session{
				AccountID: account.ID,
				GroupID:   account.GroupID,
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		sign, err := token.SignedString([]byte(h.config.Secret))
		if err != nil {
			return err
		}

		res.SetCookie(&http.Cookie{
			Name:     "token",
			Value:    sign,
			Path:     "/",
			Expires:  expire.Add(1 * time.Minute),
			Secure:   req.IsTLS(),
			HttpOnly: true,
		})
		return res.Status(http.StatusOK).JSON(account, "")
	}
}

func (h *AuthHandler) handleLogout() httpx.HandlerFunc {
	return func(req *httpx.Request, res *httpx.Responder) error {
		res.SetCookie(&http.Cookie{
			Name:     "token",
			Value:    "",
			Path:     "/",
			Expires:  time.Now().Add(-1 * time.Minute),
			Secure:   req.IsTLS(),
			HttpOnly: true,
			SameSite: http.SameSiteStrictMode,
		})
		return res.Status(http.StatusOK).NoContent()
	}
}
