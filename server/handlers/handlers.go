package handlers

import (
	"github.com/gorilla/mux"

	"finawise.app/server/container"
)

var Handlers []container.Provider[Handler]

type Handler interface {
	Mount(router *mux.Router)
}
