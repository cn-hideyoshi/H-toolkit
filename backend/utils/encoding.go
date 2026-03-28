package utils

import (
	"encoding/base64"
	"fmt"
	"net/url"
	"strings"

	"github.com/google/uuid"
)

type Encoding struct{}

func (e *Encoding) Base64Encode(input string) string {
	return base64.StdEncoding.EncodeToString([]byte(input))
}

func (e *Encoding) Base64Decode(input string) (string, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return "", fmt.Errorf("base64 input cannot be empty")
	}

	decoded, err := base64.StdEncoding.DecodeString(trimmed)
	if err != nil {
		return "", fmt.Errorf("invalid base64 input")
	}

	return string(decoded), nil
}

func (e *Encoding) URLEncode(input string) string {
	return url.QueryEscape(input)
}

func (e *Encoding) URLDecode(input string) (string, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return "", fmt.Errorf("url input cannot be empty")
	}

	decoded, err := url.QueryUnescape(trimmed)
	if err != nil {
		return "", fmt.Errorf("invalid url-encoded input")
	}

	return decoded, nil
}

func (e *Encoding) GenerateUUID() string {
	return uuid.NewString()
}

func (e *Encoding) NormalizeUUID(input string) (string, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return "", fmt.Errorf("uuid input cannot be empty")
	}

	parsed, err := uuid.Parse(trimmed)
	if err != nil {
		return "", fmt.Errorf("invalid uuid")
	}

	return strings.ToLower(parsed.String()), nil
}
