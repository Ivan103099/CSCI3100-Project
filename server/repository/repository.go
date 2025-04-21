package repository

import (
	"database/sql"
	_ "embed"

	"github.com/jmoiron/sqlx"
	"github.com/tnychn/sq"
	_ "modernc.org/sqlite"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/models"
	"finawise.app/server/models/types"
)

//go:embed schema.sql
var rawSchemaSQL string

var SQL = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

var ErrNoRows = sql.ErrNoRows

type Repository interface {
	container.Initializable
	container.Terminatable

	CreateAccount(a models.Account) (int64, error)
	GetAccount(aid int64) (models.Account, error)
	FindAccountByEmail(email string) (models.Account, error)

	GetAccountSummary(aid int64) (as models.AccountSummary, err error)

	CreateCategory(c models.Category) (types.ID, error)
	GetCategories(gid int64) ([]models.Category, error)

	CreateTransaction(t models.Transaction) (types.ID, error)
	ListTransactions(id int64, cid types.ID, txntype models.TxnType, grouped bool) ([]models.Transaction, error)
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
	if err != nil {
		return
	}
	_, err = r.db.Exec(rawSchemaSQL)
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

func (r *repository) GetAccount(aid int64) (a models.Account, err error) {
	s, args := SQL.Select("id", "group_id", "email", "fullname").
		From("accounts").
		Where(sq.Eq{"id": aid}).
		MustSQL()
	err = r.db.Get(&a, s, args...)
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

func (r *repository) GetAccountSummary(aid int64) (as models.AccountSummary, err error) {
	s, args := SQL.Select(
		`IFNULL(SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END)
			- SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END), 0) AS balance`,
		`IFNULL(SUM(CASE WHEN c.type = 'income' THEN t.amount ELSE 0 END), 0) AS income`,
		`IFNULL(SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense`,
		`0 as budget`,
	).
		From("transactions t").
		Join("categories c ON t.category_id = c.id").
		Where(sq.Eq{"t.account_id": aid}).
		MustSQL()
	err = r.db.Get(&as, s, args...)
	return
}

func (r *repository) CreateCategory(c models.Category) (types.ID, error) {
	cid := types.MakeID()
	s, args := SQL.Insert("categories").
		Columns("id", "group_id", "name", "type").
		Values(cid, c.GroupID, c.Name, c.Type).
		MustSQL()
	_, err := r.db.Exec(s, args...)
	return cid, err
}

func (r *repository) GetCategories(gid int64) (c []models.Category, err error) {
	s, args := SQL.Select("id", "group_id", "name", "type").
		From("categories").
		Where(sq.Eq{"group_id": gid}).
		MustSQL()
	err = r.db.Select(&c, s, args...)
	return
}

func (r *repository) CreateTransaction(t models.Transaction) (types.ID, error) {
	tid := types.MakeID()
	s, args := SQL.Insert("transactions").
		Columns("id", "account_id", "category_id", "amount", "time", "title", "note").
		Values(tid, t.AccountID, t.CategoryID, t.Amount, t.Time, t.Title, t.Note).
		MustSQL()
	_, err := r.db.Exec(s, args...)
	return tid, err
}

func (r *repository) ListTransactions(id int64, cid types.ID, txntype models.TxnType, grouped bool) (results []models.Transaction, err error) {
	// TODO: implement pagination
	eq := make(sq.Eq)
	if grouped {
		eq["c.group_id"] = id
	} else {
		eq["t.account_id"] = id
	}
	if !cid.IsZero() {
		eq["c.id"] = cid
	}
	if txntype != "" {
		eq["c.type"] = txntype
	}
	s, args := SQL.
		Select("t.id", "account_id", "category_id", "amount", "time", "title", "note").
		From("transactions t").
		Join("categories c ON t.category_id = c.id").
		Where(eq).
		OrderBy("time DESC").
		MustSQL()
	err = r.db.Select(&results, s, args...)
	return
}
