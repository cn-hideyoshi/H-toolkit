package json

import (
	"bytes"
	stdjson "encoding/json"
)

func Format(input string) (string, error) {
	if input == "" {
		return "", nil
	}

	var buf bytes.Buffer
	buf.Grow(len(input) + len(input)/2)
	if err := stdjson.Indent(&buf, []byte(input), "", "  "); err != nil {
		return "", err
	}
	return buf.String(), nil
}
