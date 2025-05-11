package repository

import (
	"database/sql"
	"database/sql/driver"
	_ "embed"
	"fmt"
	"regexp"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/jmoiron/sqlx/reflectx"
	"github.com/tnychn/sq"
	"modernc.org/sqlite"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/models"
	"finawise.app/server/models/types"
)

func init() {
	sqlite.MustRegisterFunction("REGEXP", &sqlite.FunctionImpl{
		NArgs: 2,
		Scalar: func(ctx *sqlite.FunctionContext, args []driver.Value) (driver.Value, error) {
			if len(args) != 2 {
				return nil, fmt.Errorf("expected 2 arguments, got %d", len(args))
			}
			pattern, ok := args[0].(string)
			if !ok {
				return nil, fmt.Errorf("expected string for pattern, got %T", args[0])
			}
			value, ok := args[1].(string)
			if !ok {
				return nil, fmt.Errorf("expected string for value, got %T", args[0])
			}
			matched, err := regexp.MatchString(pattern, value)
			if err != nil {
				return nil, err
			}
			return matched, nil
		},
	})
}

//go:embed "schema.sql"
var schema string

var SQL = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

var ErrNoRows = sql.ErrNoRows

type Error = sqlite.Error

type Repository interface {
	container.Initializable
	container.Terminatable

	CreateAccount(a models.Account) (int64, error)
	CreateCategory(c models.Category) (types.ID, error)
	CreateTransaction(t models.Transaction) (types.ID, error)
	CreateBudget(b models.Budget) error

	GetCategory(cid types.ID) (models.Category, error)
	GetCategories(gid int64, ct *models.CategoryType) ([]models.Category, error)
	GetTransaction(tid types.ID) (models.Transaction, error)
	GetBudget(cid types.ID) (models.Budget, error)
	GetBudgets(gid int64) ([]models.Budget, error)
	GetAccount(aid int64) (models.Account, error)
	GetAccountSummary(aid int64) (as models.AccountSummary, err error)

	FindAccountByEmail(email string) (models.Account, error)

	// TODO: implement pagination
	ListTransactions(aid int64, cid *types.ID, ct *models.CategoryType) ([]models.Transaction, error)
}

type repository struct {
	config config.Config

	db *sqlx.DB
}

func New(config config.Config) Repository {
	return &repository{config: config}
}

func (r *repository) Initialize() (err error) {
	r.db, err = sqlx.Open("sqlite", r.config.Database.URL.String())
	r.db.Mapper = reflectx.NewMapperFunc("json", strings.ToLower)
	if err != nil {
		return
	}
	_, err = r.db.Exec(schema)
	return
}

func (r *repository) Terminate() (err error) {
	if r.db != nil {
		err = r.db.Close()
	}
	return
}

func (r *repository) CreateAccount(a models.Account) (int64, error) {
	tx, err := r.db.Beginx()
	if err != nil {
		return -1, err
	}
	defer tx.Rollback()
	s, args := SQL.Insert("groups").
		Columns("id").
		Values(nil).
		Suffix("RETURNING id").
		MustSQL()
	result, err := tx.Exec(s, args...)
	if err != nil {
		return -1, err
	}
	gid, err := result.LastInsertId()
	if err != nil {
		return -1, err
	}
	s, args = SQL.Insert("accounts").
		Columns("id", "group_id", "email", "fullname", "passhash").
		Values(nil, gid, a.Email, a.Fullname, a.Passhash).
		Suffix("RETURNING id").
		MustSQL()
	result, err = tx.Exec(s, args...)
	if err != nil {
		return -1, err
	}
	if err := tx.Commit(); err != nil {
		return -1, err
	}
	return result.LastInsertId()
}

func (r *repository) CreateCategory(c models.Category) (types.ID, error) {
	cid := types.MakeID()
	s, args := SQL.Insert("categories").
		Columns("id", "group_id", "name", "type", "emoji", "color").
		Values(cid, c.GroupID, c.Name, c.Type, c.Emoji, c.Color).
		MustSQL()
	_, err := r.db.Exec(s, args...)
	return cid, err
}

func (r *repository) CreateTransaction(t models.Transaction) (types.ID, error) {
	tid := types.MakeID()
	s, args := SQL.Insert("transactions").
		Columns("id", "account_id", "category_id", "amount", "timestamp", "title").
		Values(tid, t.AccountID, t.CategoryID, t.Amount, t.Timestamp, t.Title).
		MustSQL()
	_, err := r.db.Exec(s, args...)
	return tid, err
}

func (r *repository) CreateBudget(b models.Budget) error {
	s, args := SQL.Insert("budgets").
		Columns("category_id", "amount").
		Values(b.CategoryID, b.Amount).
		MustSQL()
	_, err := r.db.Exec(s, args...)
	return err
}

func (r *repository) GetCategory(cid types.ID) (c models.Category, err error) {
	s, args := SQL.Select("*").
		From("categories").
		Where(sq.Eq{"id": cid}).
		MustSQL()
	err = r.db.Get(&c, s, args...)
	return
}

func (r *repository) GetCategories(gid int64, ct *models.CategoryType) (c []models.Category, err error) {
	eq := sq.Eq{"group_id": gid}
	if ct != nil {
		eq["type"] = *ct
	}
	s, args := SQL.Select("*").
		From("categories").
		Where(eq).
		MustSQL()
	err = r.db.Select(&c, s, args...)
	return
}

func (r *repository) GetTransaction(tid types.ID) (t models.Transaction, err error) {
	s, args := SQL.Select("*").
		From("transactions").
		Where(sq.Eq{"id": tid}).
		MustSQL()
	err = r.db.Get(&t, s, args...)
	return
}

func (r *repository) GetBudget(cid types.ID) (b models.Budget, err error) {
	s, args := SQL.Select("*").
		From("budgets").
		Where(sq.Eq{"category_id": cid}).
		MustSQL()
	err = r.db.Get(&b, s, args...)
	if err != nil {
		return
	}
	return
}

func (r *repository) GetBudgets(gid int64) (b []models.Budget, err error) {
	s, args := SQL.Select("b.*").
		From("budgets b").
		Join("categories c ON b.category_id = c.id").
		Where(sq.Eq{"c.group_id": gid}).
		MustSQL()
	err = r.db.Select(&b, s, args...)
	if err != nil {
		return
	}
	return
}

func (r *repository) GetAccount(aid int64) (a models.Account, err error) {
	// explicitly select columns to hide passhash
	s, args := SQL.Select("id", "group_id", "email", "fullname").
		From("accounts").
		Where(sq.Eq{"id": aid}).
		MustSQL()
	err = r.db.Get(&a, s, args...)
	return
}

func (r *repository) GetAccountSummary(aid int64) (as models.AccountSummary, err error) {
	s, args := SQL.Select(
		`IFNULL(SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income`,
		`IFNULL(SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense`,
	).
		From("transactions t").
		Join("categories c ON t.category_id = c.id").
		Where(sq.Eq{"t.account_id": aid}).
		MustSQL()
	err = r.db.Get(&as, s, args...)
	return
}

func (r *repository) FindAccountByEmail(email string) (a models.Account, err error) {
	s, args := SQL.Select("*").
		From("accounts").
		Where(sq.Eq{"email": email}).
		MustSQL()
	err = r.db.Get(&a, s, args...)
	return
}

func (r *repository) ListTransactions(aid int64, cid *types.ID, ct *models.CategoryType) (results []models.Transaction, err error) {
	b := SQL.Select("t.*").
		From("transactions t").
		Where(sq.Eq{"t.account_id": aid}).
		OrderBy("t.timestamp DESC")
	if cid != nil {
		b = b.Where(sq.Eq{"t.category_id": cid})
	}
	if ct != nil {
		b = b.Join("categories c ON t.category_id = c.id").
			Where(sq.Eq{"c.type": *ct})
	}
	s, args := b.MustSQL()
	err = r.db.Select(&results, s, args...)
	return
}
