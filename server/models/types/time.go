package types

import (
	"database/sql/driver"
	"errors"
	"time"
)

type Time struct {
	time.Time
}

func (t Time) Value() (driver.Value, error) {
	return t.Unix(), nil
}

func (t *Time) Scan(src any) error {
	switch x := src.(type) {
	case nil:
		return nil
	case int64:
		t.Time = time.Unix(x, 0)
		return nil
	case string:
		return t.UnmarshalText([]byte(x))
	}
	return errors.New("time: source value must be a string or integer")
}
