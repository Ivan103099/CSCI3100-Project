package account

import (
	"golang.org/x/crypto/bcrypt"

	"finawise.app/server/models"
	"finawise.app/server/repository"
)

var (
	ErrNotFound = repository.ErrNoRows
	ErrPassword = bcrypt.ErrMismatchedHashAndPassword
)

type Service struct {
	repo repository.Repository
}

func NewService(repo repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Register(email, password, fullname string) (int64, error) {
	passhash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return -1, err
	}
	return s.repo.CreateAccount(models.Account{
		Email:    email,
		Fullname: fullname,
		Passhash: string(passhash),
	})
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
