package types

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"io"
	"strconv"

	"github.com/oklog/ulid/v2"
)

var ZeroID ID

type ID struct {
	ulid.ULID
}

func MakeID() ID {
	return ID{ulid.Make()}
}

func (id ID) IsZero() bool {
	return id == ID(ZeroID)
}

func (id ID) Value() (driver.Value, error) {
	if id.IsZero() {
		return nil, nil
	}
	return id.String(), nil
}

func (id *ID) Scan(src any) error {
	switch x := src.(type) {
	case nil:
		return nil
	case string:
		return id.UnmarshalText([]byte(x))
	case []byte:
		return id.UnmarshalText(x)
	}
	return ulid.ErrScanValue
}

func (id ID) MarshalJSON() ([]byte, error) {
	if id.IsZero() {
		return json.Marshal(nil)
	}
	return json.Marshal(id.String())
}

func (id *ID) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	return id.UnmarshalText([]byte(s))
}

func (id *ID) UnmarshalGQL(v any) error {
	return id.Scan(v)
}

func (id ID) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(id.String()))
}
