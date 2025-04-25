package models

import "finawise.app/server/models/types"

type TxnType string

const (
	TxnTypeIncome  TxnType = "income"
	TxnTypeExpense TxnType = "expense"
)

type Account struct {
	ID       int64  `db:"id" json:"id"`
	GroupID  int64  `db:"group_id" json:"gid"`
	Email    string `db:"email" json:"email"`
	Fullname string `db:"fullname" json:"fullname"`
	Passhash string `db:"passhash" json:"-"`
}

type AccountSummary struct {
	Balance float64 `json:"balance"`
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
	Budget  float64 `json:"budget"`
}

type Group struct {
	ID int64 `db:"id" json:"id"`
}

type Category struct {
	ID      types.ID `db:"id" json:"id"`
	GroupID int64    `db:"group_id" json:"-"`
	Name    string   `db:"name" json:"name"`
	Type    TxnType  `db:"type" json:"type"`
}

type Transaction struct {
	ID         types.ID        `db:"id" json:"id"`
	AccountID  int64           `db:"account_id" json:"aid"`
	CategoryID types.ID        `db:"category_id" json:"cid"`
	Amount     float64         `db:"amount" json:"amount"`
	Timestamp  types.Timestamp `db:"timestamp" json:"timestamp"`
	Title      string          `db:"title" json:"title"`
}
