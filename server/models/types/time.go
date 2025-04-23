package types

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"io"
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

func (t *Time) UnmarshalGQL(v any) error {
	return t.Scan(v)
}

func (t Time) MarshalGQL(w io.Writer) {
	w.Write(fmt.Append(nil, t.Unix()))
}
