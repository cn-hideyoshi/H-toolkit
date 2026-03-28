package test

import (
	"H-toolkit/backend/utils"
	"strings"
	"testing"

	"github.com/google/uuid"
)

func TestEncodingBase64(t *testing.T) {
	encoding := &utils.Encoding{}

	encoded := encoding.Base64Encode("H-toolkit")
	if encoded != "SC10b29sa2l0" {
		t.Fatalf("Base64Encode() = %q, want %q", encoded, "SC10b29sa2l0")
	}

	decoded, err := encoding.Base64Decode(encoded)
	if err != nil {
		t.Fatalf("Base64Decode returned error: %v", err)
	}
	if decoded != "H-toolkit" {
		t.Fatalf("Base64Decode() = %q, want %q", decoded, "H-toolkit")
	}
}

func TestEncodingURL(t *testing.T) {
	encoding := &utils.Encoding{}

	encoded := encoding.URLEncode("Hello World?x=1&y=2")
	if encoded != "Hello+World%3Fx%3D1%26y%3D2" {
		t.Fatalf("URLEncode() = %q, want %q", encoded, "Hello+World%3Fx%3D1%26y%3D2")
	}

	decoded, err := encoding.URLDecode(encoded)
	if err != nil {
		t.Fatalf("URLDecode returned error: %v", err)
	}
	if decoded != "Hello World?x=1&y=2" {
		t.Fatalf("URLDecode() = %q, want %q", decoded, "Hello World?x=1&y=2")
	}
}

func TestEncodingUUID(t *testing.T) {
	encoding := &utils.Encoding{}

	generated := encoding.GenerateUUID()
	parsed, err := uuid.Parse(generated)
	if err != nil {
		t.Fatalf("GenerateUUID() returned invalid UUID %q: %v", generated, err)
	}
	if parsed.Version() != 4 {
		t.Fatalf("GenerateUUID() version = %d, want 4", parsed.Version())
	}

	normalized, err := encoding.NormalizeUUID("550E8400-E29B-41D4-A716-446655440000")
	if err != nil {
		t.Fatalf("NormalizeUUID returned error: %v", err)
	}
	if normalized != "550e8400-e29b-41d4-a716-446655440000" {
		t.Fatalf("NormalizeUUID() = %q, want %q", normalized, "550e8400-e29b-41d4-a716-446655440000")
	}
}

func TestEncodingInvalidInputs(t *testing.T) {
	encoding := &utils.Encoding{}

	cases := []struct {
		name        string
		run         func() error
		wantMessage string
	}{
		{
			name: "empty base64 decode",
			run: func() error {
				_, err := encoding.Base64Decode("   ")
				return err
			},
			wantMessage: "base64 input cannot be empty",
		},
		{
			name: "invalid base64 decode",
			run: func() error {
				_, err := encoding.Base64Decode("%%%")
				return err
			},
			wantMessage: "invalid base64 input",
		},
		{
			name: "empty url decode",
			run: func() error {
				_, err := encoding.URLDecode(" ")
				return err
			},
			wantMessage: "url input cannot be empty",
		},
		{
			name: "invalid url decode",
			run: func() error {
				_, err := encoding.URLDecode("100%")
				return err
			},
			wantMessage: "invalid url-encoded input",
		},
		{
			name: "empty uuid normalize",
			run: func() error {
				_, err := encoding.NormalizeUUID(" ")
				return err
			},
			wantMessage: "uuid input cannot be empty",
		},
		{
			name: "invalid uuid normalize",
			run: func() error {
				_, err := encoding.NormalizeUUID("not-a-uuid")
				return err
			},
			wantMessage: "invalid uuid",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := tc.run()
			if err == nil {
				t.Fatalf("expected error but got nil")
			}
			if !strings.Contains(err.Error(), tc.wantMessage) {
				t.Fatalf("error %q does not contain %q", err.Error(), tc.wantMessage)
			}
		})
	}
}
