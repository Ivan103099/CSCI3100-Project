package models

import "finawise.app/server/models/types"

type CategoryType string

const (
	CategoryTypeIncome  CategoryType = "INCOME"
	CategoryTypeExpense CategoryType = "EXPENSE"
)

type Account struct {
	ID       int64  `db:"id" json:"id"`
	GroupID  int64  `db:"group_id" json:"gid"`
	Email    string `db:"email" json:"email"`
	Fullname string `db:"fullname" json:"fullname"`
	Passhash string `db:"passhash" json:"-"`
}

type AccountSummary struct {
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
}

type Group struct {
	ID int64 `db:"id" json:"id"`
}

type Category struct {
	ID      types.ID     `db:"id" json:"id"`
	GroupID int64        `db:"group_id" json:"gid"`
	Name    string       `db:"name" json:"name"`
	Type    CategoryType `db:"type" json:"type"`
	Emoji   string       `db:"emoji" json:"emoji"`
	Color   string       `db:"color" json:"color"`
}

type Budget struct {
	Amount     float64  `json:"amount"`
	CategoryID types.ID `db:"category_id" json:"cid"`
}

type Transaction struct {
	ID         types.ID        `db:"id" json:"id"`
	AccountID  int64           `db:"account_id" json:"aid"`
	CategoryID types.ID        `db:"category_id" json:"cid"`
	Title      string          `db:"title" json:"title"`
	Amount     float64         `db:"amount" json:"amount"`
	Timestamp  types.Timestamp `db:"timestamp" json:"timestamp"`
}
