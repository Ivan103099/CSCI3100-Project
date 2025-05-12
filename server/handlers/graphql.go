package handlers

import (
	"context"
	"errors"
	"fmt"

	gqlgen "github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
	"github.com/vektah/gqlparser/v2/ast"
	"github.com/vektah/gqlparser/v2/gqlerror"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/graphql"
	"finawise.app/server/handlers/middlewares"
	"finawise.app/server/repository"
	"finawise.app/server/services"
)

var validate *validator.Validate

func init() {
	Handlers = append(Handlers, newGraphQLHandler)
	validate = validator.New(validator.WithRequiredStructEnabled())
}

type GraphQLHandler struct {
	debug   bool
	config  config.Config
	repo    repository.Repository
	account *services.AccountService
}

func newGraphQLHandler(c *container.Container) Handler {
	debug := container.Get[bool](c, "debug")
	config := container.Use[config.Config](c, "config")
	repo := container.Use[repository.Repository](c, "repository")
	account := container.Use[*services.AccountService](c, "service/account")
	return &GraphQLHandler{debug: debug, config: config, repo: repo, account: account}
}

func (h *GraphQLHandler) Mount(router *mux.Router) {
	config := graphql.Config{
		Resolvers: &graphql.Resolver{
			Repository: h.repo,
		},
	}
	config.Directives.Validate = func(ctx context.Context, obj any, next gqlgen.Resolver, tag string) (res any, err error) {
		res, err = next(ctx)
		if err != nil {
			return
		}
		if err = validate.Var(res, tag); err != nil {
			e := err.(validator.ValidationErrors)[0]
			return nil, fmt.Errorf("constraint '%s' failed", e.Tag())
		}
		return
	}

	handler := handler.New(graphql.NewExecutableSchema(config))

	handler.AddTransport(transport.Options{})
	handler.AddTransport(transport.GET{})
	handler.AddTransport(transport.POST{})
	handler.Use(extension.Introspection{})

	handler.SetQueryCache(lru.New[*ast.QueryDocument](1000))
	handler.SetErrorPresenter(func(ctx context.Context, e error) (err *gqlerror.Error) {
		err = gqlgen.DefaultErrorPresenter(ctx, e)
		var ee *repository.Error
		if errors.As(err, &ee) {
			if !h.debug {
				switch ee.Code() {
				case 2067: // SQLITE_CONSTRAINT_UNIQUE
					err.Message = "entity already exists"
				default:
					err.Message = "database failed"
				}
			} else {
				err.Message = fmt.Sprintf("database failed: %s", ee.Error())
			}
		} else if errors.Is(err, repository.ErrNoRows) {
			err.Message = "entity not found"
		}
		return
	})

	r := router.PathPrefix("/api/graphql").Subrouter()
	r.Use(middlewares.RateLimit())
	r.Handle("", middlewares.Session(h.config.Secret, true)(handler))
	r.Handle("/playground", playground.Handler("", "/api/graphql"))
}
