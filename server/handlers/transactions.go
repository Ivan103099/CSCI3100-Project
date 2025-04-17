package handlers

import (
	"net/http"
	"slices"

	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/handlers/middlewares"
	"finawise.app/server/models"
	"finawise.app/server/models/types"
	"finawise.app/server/repository"
	"finawise.app/server/utils"
)

func init() {
	Handlers = append(Handlers, newTransactionsHandler)
}

type TransactionsHandler struct {
	config config.Config
	repo   repository.Repository
}

func newTransactionsHandler(c *container.Container) Handler {
	config := container.Use[config.Config](c, "config")
	repo := container.Use[repository.Repository](c, "repository")
	return &TransactionsHandler{config: config, repo: repo}
}

func (h *TransactionsHandler) Mount(router *mux.Router) {
	r := router.PathPrefix("/transactions").Subrouter()
	r.Use(middlewares.Auth(h.config.Secret))
	r.Handle("", h.handleList()).Methods(http.MethodGet)
	r.Handle("", h.handleCreate()).Methods(http.MethodPost)
}

func (h *TransactionsHandler) handleList() httpx.HandlerFunc {
	// TODO: filter by date range
	type Params struct {
		CategoryID types.ID       `query:"cid" validate:"omitempty,ulid"`
		Type       models.TxnType `query:"type" validate:"omitempty,oneof=income expense"`
		Grouped    bool           `query:"grouped" validate:"omitempty,boolean"`
	}
	return func(req *httpx.Request, res *httpx.Responder) (err error) {
		session := req.GetValue("session").(middlewares.Session)

		var params Params
		if err = req.Bind(&params); err != nil {
			return err
		}

		var id int64 = -1
		if params.Grouped {
			id = session.GroupID
		} else {
			id = session.AccountID
		}

		var results []models.Transaction
		results, err = h.repo.ListTransactions(id, params.CategoryID, params.Type, params.Grouped)
		if err != nil {
			return err
		}
		return res.Status(http.StatusOK).JSON(utils.SliceMaybeEmpty(results), "")
	}
}

func (h *TransactionsHandler) handleCreate() httpx.HandlerFunc {
	type Params struct {
		CategoryID types.ID   `json:"cid" validate:"ulid"`
		Amount     float64    `json:"amount" validate:"required,gt=0"`
		Time       types.Time `json:"time" validate:"required"`
		Title      string     `json:"title" validate:"required"`
		Note       string     `json:"note"`
	}
	return func(req *httpx.Request, res *httpx.Responder) error {
		session := req.GetValue("session").(middlewares.Session)

		var params Params
		if err := req.Bind(&params); err != nil {
			return err
		}

		if !params.CategoryID.IsZero() {
			categories, err := h.repo.GetCategories(session.GroupID)
			if err != nil {
				return err
			}
			if !slices.ContainsFunc(categories, func(cat models.Category) bool {
				return cat.ID == params.CategoryID
			}) {
				return res.Status(http.StatusBadRequest).String("invalid category")
			}
		}

		id, err := h.repo.CreateTransaction(models.Transaction{
			AccountID:  session.AccountID,
			CategoryID: params.CategoryID,
			Amount:     params.Amount,
			Time:       params.Time,
			Title:      params.Title,
			Note:       params.Note,
		})
		if err != nil {
			return err
		}
		return res.Status(http.StatusCreated).String(id.String())
	}
}
