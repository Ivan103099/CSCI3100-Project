package account

type Session struct {
	AccountID int64 `json:"aid"`
	GroupID   int64 `json:"gid"`
}
