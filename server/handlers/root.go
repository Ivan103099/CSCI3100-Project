package handlers

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/handlers/middlewares"
	"finawise.app/server/repository"
)

func init() {
	Handlers = append(Handlers, newRootHandler)
}

type RootHandler struct {
	config config.Config
	repo   repository.Repository
}

func newRootHandler(c *container.Container) Handler {
	config := container.Use[config.Config](c, "config")
	repo := container.Use[repository.Repository](c, "repository")
	return &RootHandler{config: config, repo: repo}
}

func (h *RootHandler) Mount(router *mux.Router) {
	r := router.PathPrefix("/api").Subrouter()
	guard := middlewares.Auth(h.config.Secret)
	r.Handle("/summary", guard(h.handleGetSummary())).Methods(http.MethodGet)
}

func (h *RootHandler) handleGetSummary() httpx.HandlerFunc {
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
