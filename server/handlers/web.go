//go:build web

package handlers

import (
	"embed"
	"io/fs"
	"net/http"

	"github.com/gorilla/mux"

	"finawise.app/server/config"
	"finawise.app/server/container"
)

//go:embed "web"
var web embed.FS

func init() {
	Handlers = append(Handlers, newWebHandler)
}

type WebHandler struct {
	config config.Config
}

func newWebHandler(c *container.Container) Handler {
	config := container.Use[config.Config](c, "config")
	return &WebHandler{config: config}
}

func (h *WebHandler) Mount(router *mux.Router) {
	webfs, err := fs.Sub(web, "web")
	if err != nil {
		panic(err)
	}
	router.PathPrefix("").
		Methods(http.MethodGet).
		Handler(http.FileServer(http.FS(webfs)))
}
