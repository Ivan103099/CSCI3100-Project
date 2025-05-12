//go:generate go run github.com/99designs/gqlgen generate

package graphql

import "finawise.app/server/repository"

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	Repository repository.Repository
}
