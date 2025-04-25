package repository

import (
	"database/sql"
	_ "embed"

	"github.com/jmoiron/sqlx"
	"github.com/tnychn/sq"
	"modernc.org/sqlite"

	"finawise.app/server/config"
	"finawise.app/server/container"
	"finawise.app/server/models"
	"finawise.app/server/models/types"
)

//go:embed schema.sql
var rawSchemaSQL string

var SQL = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

var ErrNoRows = sql.ErrNoRows

type Error = sqlite.Error

type Repository interface {
	container.Initializable
	container.Terminatable

	CreateAccount(a models.Account) (int64, error)
	CreateCategory(c models.Category) (types.ID, error)
	CreateTransaction(t models.Transaction) (types.ID, error)

	GetGroup(gid int64) (models.Group, error)
	GetCategory(cid types.ID) (models.Category, error)
	GetCategories(gid int64, tt *models.TxnType) ([]models.Category, error)
	GetTransaction(tid types.ID) (models.Transaction, error)
	GetAccount(aid int64) (models.Account, error)
	GetAccountSummary(aid int64) (as models.AccountSummary, err error)

	FindAccountByEmail(email string) (models.Account, error)

	// TODO: implement pagination
	ListTransactions(aid int64, cid *types.ID, tt *models.TxnType) ([]models.Transaction, error)
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
		Columns("id", "group_id", "name", "type").
		Values(cid, c.GroupID, c.Name, c.Type).
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

func (r *repository) GetGroup(gid int64) (g models.Group, err error) {
	s, args := SQL.Select("*").
		From("groups").
		Where(sq.Eq{"id": gid}).
		MustSQL()
	err = r.db.Get(&g, s, args...)
	return
}

func (r *repository) GetCategory(cid types.ID) (c models.Category, err error) {
	s, args := SQL.Select("*").
		From("categories").
		Where(sq.Eq{"id": cid}).
		MustSQL()
	err = r.db.Get(&c, s, args...)
	return
}

func (r *repository) GetCategories(gid int64, tt *models.TxnType) (c []models.Category, err error) {
	eq := sq.Eq{"group_id": gid}
	if tt != nil {
		eq["type"] = *tt
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
		`IFNULL(SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END)
			- SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS balance`,
		`IFNULL(SUM(CASE WHEN c.type = 'INCOME' THEN t.amount ELSE 0 END), 0) AS income`,
		`IFNULL(SUM(CASE WHEN c.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) AS expense`,
		`0 as budget`,
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

func (r *repository) ListTransactions(aid int64, cid *types.ID, tt *models.TxnType) (results []models.Transaction, err error) {
	b := SQL.Select("t.id", "t.account_id", "t.category_id", "t.amount", "t.timestamp", "t.title").
		Where(sq.Eq{"t.account_id": aid}).
		From("transactions t").
		OrderBy("t.timestamp DESC")
	if cid != nil {
		b = b.Where(sq.Eq{"t.category_id": cid})
	}
	if tt != nil {
		b = b.Join("categories c ON t.category_id = c.id").Where(sq.Eq{"c.type": *tt})
	}
	s, args := b.MustSQL()
	err = r.db.Select(&results, s, args...)
	return
}
