package handlers

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"
	"golang.org/x/crypto/bcrypt"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/handlers/middlewares"
	"finawise.app/server/models"
	"finawise.app/server/repository"
)

func init() {
	Handlers = append(Handlers, newAccountHandler)
}

type AccountHandler struct {
	config config.Config
	repo   repository.Repository
}

func newAccountHandler(c *container.Container) Handler {
	config := container.Use[config.Config](c, "config")
	repo := container.Use[repository.Repository](c, "repository")
	return &AccountHandler{config: config, repo: repo}
}

func (h *AccountHandler) Mount(router *mux.Router) {
	r := router.PathPrefix("/account").Subrouter()
	r.Use(middlewares.Auth(h.config.Secret))
	r.Handle("", h.handleGet()).Methods(http.MethodGet, http.MethodOptions)
	r.Handle("", h.handleCreate()).Methods(http.MethodPost, http.MethodOptions)
	r.Handle("/summary", h.handleGetSummary()).Methods(http.MethodGet)
}

func (h *AccountHandler) handleGet() httpx.HandlerFunc {
	return func(req *httpx.Request, res *httpx.Responder) error {
		session := req.GetValue("session").(middlewares.Session)
		account, err := h.repo.GetAccount(session.AccountID)
		if err != nil {
			return err
		}
		return res.Status(http.StatusOK).JSON(account, "")
	}
}

func (h *AccountHandler) handleCreate() httpx.HandlerFunc {
	type Params struct {
		Email    string `json:"email" validate:"required,email"`
		Fullname string `json:"fullname" validate:"required,min=1,max=50,printascii"`
		Password string `json:"password" validate:"required,min=8,max=50,printascii"` // plain text
	}
	return func(req *httpx.Request, res *httpx.Responder) error {
		var params Params
		if err := req.Bind(&params); err != nil {
			return err
		}

		_, err := h.repo.FindAccountByEmail(params.Email)
		if err != nil {
			if err != repository.ErrNoRows {
				return err
			}
		} else {
			return res.Status(http.StatusConflict).String("account already exists")
		}

		passhash, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		id, err := h.repo.CreateAccount(models.Account{
			Email:    params.Email,
			Fullname: params.Fullname,
			Passhash: string(passhash),
		})
		if err != nil {
			return err
		}
		return res.Status(http.StatusCreated).String(fmt.Sprint(id))
	}
}

func (h *AccountHandler) handleGetSummary() httpx.HandlerFunc {
	return func(req *httpx.Request, res *httpx.Responder) (err error) {
		session := req.GetValue("session").(middlewares.Session)
		summary, err := h.repo.GetAccountSummary(session.AccountID)
		if err != nil {
			if err == repository.ErrNoRows {
				return res.Status(http.StatusNotFound).String("account not found")
			}
			return err
		}
		return res.Status(http.StatusOK).JSON(summary, "")
	}
}
