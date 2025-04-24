package handlers

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/handlers/middlewares"
	"finawise.app/server/repository"
	"finawise.app/server/services"
	"finawise.app/server/services/account"
)

func init() {
	Handlers = append(Handlers, newAuthHandler)
}

type AuthHandler struct {
	config  config.Config
	repo    repository.Repository
	account *services.AccountService
}

func newAuthHandler(c *container.Container) Handler {
	config := container.Use[config.Config](c, "config")
	repo := container.Use[repository.Repository](c, "repository")
	account := container.Use[*services.AccountService](c, "service/account")
	return &AuthHandler{config: config, repo: repo, account: account}
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

		a, err := h.account.Login(params.Email, params.Password)
		if err != nil {
			if err == account.ErrNotFound {
				return res.Status(http.StatusUnauthorized).String("account not found")
			}
			if err == account.ErrPassword {
				return res.Status(http.StatusUnauthorized).String("incorrect password")
			}
			return err
		}

		now := time.Now()
		expire := now.AddDate(0, 1, 0) // 1 month
		claims := &middlewares.AuthTokenClaims{
			RegisteredClaims: jwt.RegisteredClaims{
				IssuedAt:  jwt.NewNumericDate(now),
				ExpiresAt: jwt.NewNumericDate(expire),
			},
			Session: account.Session{
				AccountID: a.ID,
				GroupID:   a.GroupID,
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signed, err := token.SignedString([]byte(h.config.Secret))
		if err != nil {
			return httpx.WrapHTTPError(err,
				http.StatusUnprocessableEntity,
				"failed to sign token",
			)
		}

		res.SetCookie(&http.Cookie{
			Name:     "token",
			Value:    signed,
			Path:     "/",
			Expires:  expire.Add(1 * time.Minute),
			Secure:   req.IsTLS(),
			HttpOnly: true,
		})
		return res.Status(http.StatusOK).JSON(a, "")
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
