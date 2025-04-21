package handlers

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/handlers/middlewares"
	"finawise.app/server/models"
	"finawise.app/server/repository"
	"finawise.app/server/utils"
)

func init() {
	Handlers = append(Handlers, newCategoriesHandler)
}

type CategoriesHandler struct {
	config config.Config
	repo   repository.Repository
}

func newCategoriesHandler(c *container.Container) Handler {
	config := container.Use[config.Config](c, "config")
	repo := container.Use[repository.Repository](c, "repository")
	return &CategoriesHandler{config: config, repo: repo}
}

func (h *CategoriesHandler) Mount(router *mux.Router) {
	r := router.PathPrefix("/categories").Subrouter()
	r.Use(middlewares.Auth(h.config.Secret))
	r.Handle("", h.handleGet()).Methods(http.MethodGet)
	r.Handle("", h.handleCreate()).Methods(http.MethodPost)
}

func (h *CategoriesHandler) handleGet() httpx.HandlerFunc {
	return func(req *httpx.Request, res *httpx.Responder) (err error) {
		session := req.GetValue("session").(middlewares.Session)
		cateogories, err := h.repo.GetCategories(session.GroupID)
		if err != nil {
			return err
		}
		return res.Status(http.StatusOK).JSON(utils.SliceMaybeEmpty(cateogories), "")
	}
}

func (h *CategoriesHandler) handleCreate() httpx.HandlerFunc {
	type Params struct {
		Name string         `json:"name" validate:"required,min=1,max=20"`
		Type models.TxnType `json:"type" validate:"required,oneof=income expense"`
	}
	return func(req *httpx.Request, res *httpx.Responder) error {
		session := req.GetValue("session").(middlewares.Session)

		var params Params
		if err := req.Bind(&params); err != nil {
			return err
		}

		id, err := h.repo.CreateCategory(models.Category{
			GroupID: session.GroupID,
			Name:    params.Name,
			Type:    params.Type,
		})
		if err != nil {
			return err
		}
		return res.Status(http.StatusCreated).String(id.String())
	}
}
