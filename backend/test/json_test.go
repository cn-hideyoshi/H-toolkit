package test

import (
	"H-toolkit/backend/utils"
	"testing"
)

func TestJsonFormat(t *testing.T) {
	j := &utils.Json{}

	cases := []struct {
		name  string
		input string
		want  string
	}{
		{
			name:  "formats object",
			input: `{"name":"kit","nested":{"enabled":true}}`,
			want:  "{\n  \"name\": \"kit\",\n  \"nested\": {\n    \"enabled\": true\n  }\n}",
		},
		{
			name:  "empty input returns empty output",
			input: "",
			want:  "",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := j.Format(tc.input)
			if err != nil {
				t.Fatalf("Format(%q) returned error: %v", tc.input, err)
			}
			if got != tc.want {
				t.Fatalf("Format(%q) = %q, want %q", tc.input, got, tc.want)
			}
		})
	}
}

func TestJsonCompress(t *testing.T) {
	j := &utils.Json{}

	got, err := j.Compress("{\n  \"name\": \"kit\",\n  \"nested\": {\n    \"enabled\": true\n  }\n}")
	if err != nil {
		t.Fatalf("Compress returned error: %v", err)
	}

	want := `{"name":"kit","nested":{"enabled":true}}`
	if got != want {
		t.Fatalf("Compress() = %q, want %q", got, want)
	}
}

func TestJsonTextTransforms(t *testing.T) {
	j := &utils.Json{}

	if got := j.EncodeUnicode("你好\nkit"); got != "\"你好\\nkit\"" {
		t.Fatalf("EncodeUnicode() = %q, want %q", got, "\"你好\\nkit\"")
	}

	decoded, err := j.DecodeUnicode(`\u4f60\u597d`)
	if err != nil {
		t.Fatalf("DecodeUnicode returned error: %v", err)
	}
	if decoded != "你好" {
		t.Fatalf("DecodeUnicode() = %q, want %q", decoded, "你好")
	}

	escaped, err := j.Escape("line\n\"value\"")
	if err != nil {
		t.Fatalf("Escape returned error: %v", err)
	}
	if escaped != "\"line\\n\\\"value\\\"\"" {
		t.Fatalf("Escape() = %q, want %q", escaped, "\"line\\n\\\"value\\\"\"")
	}

	unescaped, err := j.Unescape(`"line\n\"value\""`)
	if err != nil {
		t.Fatalf("Unescape returned error: %v", err)
	}
	if unescaped != "line\n\"value\"" {
		t.Fatalf("Unescape() = %q, want %q", unescaped, "line\n\"value\"")
	}
}

func TestJsonInvalidInputs(t *testing.T) {
	j := &utils.Json{}

	cases := []struct {
		name string
		run  func() error
	}{
		{
			name: "format invalid json",
			run: func() error {
				_, err := j.Format(`{"name":}`)
				return err
			},
		},
		{
			name: "compress invalid json",
			run: func() error {
				_, err := j.Compress(`{"name":}`)
				return err
			},
		},
		{
			name: "decode invalid unicode",
			run: func() error {
				_, err := j.DecodeUnicode(`\uZZZZ`)
				return err
			},
		},
		{
			name: "unescape without quotes",
			run: func() error {
				_, err := j.Unescape(`plain text`)
				return err
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if err := tc.run(); err == nil {
				t.Fatalf("expected error but got nil")
			}
		})
	}
}
