package account

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"

	"finawise.app/server/models"
	"finawise.app/server/repository"
)

var (
	ErrNotFound   = repository.ErrNoRows
	ErrPassword   = bcrypt.ErrMismatchedHashAndPassword
	ErrLicenseKey = fmt.Errorf("invalid license key")
)

type Service struct {
	repo repository.Repository
}

func NewService(repo repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Register(email, password, fullname, key string) (a models.Account, err error) {
	passhash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return
	}
	a = models.Account{
		Email:    email,
		Fullname: fullname,
		Passhash: string(passhash),
	}
	id, err := s.repo.CreateAccount(a, key)
	if err != nil {
		if err == repository.ErrNoRows {
			err = ErrLicenseKey
		}
		return
	}
	a.ID = id
	a.Passhash = ""
	return
}

func (s *Service) Login(email, password string) (models.Account, error) {
	a, err := s.repo.FindAccountByEmail(email)
	if err != nil {
		return a, err
	}
	return a, bcrypt.CompareHashAndPassword(
		[]byte(a.Passhash),
		[]byte(password),
	)
}
