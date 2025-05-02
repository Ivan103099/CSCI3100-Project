package types

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"io"
	"time"
)

type Timestamp struct {
	time.Time
}

func (t Timestamp) Value() (driver.Value, error) {
	return t.Unix(), nil
}

func (t *Timestamp) Scan(src any) error {
	switch x := src.(type) {
	case nil:
		return nil
	case int64:
		t.Time = time.Unix(x, 0)
		return nil
	case string:
		return t.UnmarshalText([]byte(x))
	}
	return fmt.Errorf("timestamp: source value must be a string or integer")
}

func (t *Timestamp) UnmarshalGQL(v any) error {
	if x, ok := v.(json.Number); ok {
		i, err := x.Int64()
		if err != nil {
			return err
		}
		v = i
	}
	return t.Scan(v)
}

func (t Timestamp) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, t.Unix())
}
