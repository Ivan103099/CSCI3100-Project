package services

import (
	"finawise.app/server/container"
	"finawise.app/server/repository"
	"finawise.app/server/services/account"
)

type AccountService = account.Service

func NewAccountService(c *container.Container) *account.Service {
	repo := container.Use[repository.Repository](c, "repository")
	return account.NewService(repo)
}
