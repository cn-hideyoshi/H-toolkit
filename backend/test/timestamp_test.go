package test

import (
	"H-toolkit/backend/utils"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestTimestampNowMethods(t *testing.T) {
	ts := &utils.Timestamp{}

	secondsValue, err := strconv.ParseInt(ts.NowSeconds(), 10, 64)
	if err != nil {
		t.Fatalf("NowSeconds() should return a parseable integer: %v", err)
	}

	millisecondsValue, err := strconv.ParseInt(ts.NowMilliseconds(), 10, 64)
	if err != nil {
		t.Fatalf("NowMilliseconds() should return a parseable integer: %v", err)
	}

	diff := millisecondsValue/1000 - secondsValue
	if diff < -1 || diff > 1 {
		t.Fatalf("NowMilliseconds()/1000 and NowSeconds() should be close, got diff=%d", diff)
	}
}

func TestSecondsToDateTime(t *testing.T) {
	ts := &utils.Timestamp{}

	cases := []struct {
		name  string
		input string
	}{
		{name: "zero", input: "0"},
		{name: "positive", input: "1700000000"},
		{name: "negative", input: "-1"},
		{name: "trim whitespace", input: " 1700000000 "},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := ts.SecondsToDateTime(tc.input)
			if err != nil {
				t.Fatalf("SecondsToDateTime(%q) returned error: %v", tc.input, err)
			}

			parsed, _ := strconv.ParseInt(strings.TrimSpace(tc.input), 10, 64)
			want := time.Unix(parsed, 0).In(time.Local).Format(utils.DefaultDateTimeLayout)
			if got != want {
				t.Fatalf("SecondsToDateTime(%q) = %q, want %q", tc.input, got, want)
			}
		})
	}
}

func TestMillisecondsToDateTime(t *testing.T) {
	ts := &utils.Timestamp{}

	cases := []struct {
		name  string
		input string
	}{
		{name: "zero", input: "0"},
		{name: "positive", input: "1700000000123"},
		{name: "negative", input: "-1"},
		{name: "trim whitespace", input: " 1700000000123 "},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := ts.MillisecondsToDateTime(tc.input)
			if err != nil {
				t.Fatalf("MillisecondsToDateTime(%q) returned error: %v", tc.input, err)
			}

			parsed, _ := strconv.ParseInt(strings.TrimSpace(tc.input), 10, 64)
			want := time.UnixMilli(parsed).In(time.Local).Format(utils.DefaultDateTimeLayout)
			if got != want {
				t.Fatalf("MillisecondsToDateTime(%q) = %q, want %q", tc.input, got, want)
			}
		})
	}
}

func TestDateTimeToSeconds(t *testing.T) {
	ts := &utils.Timestamp{}

	parseLocal := func(layout string, value string) int64 {
		parsed, err := time.ParseInLocation(layout, value, time.Local)
		if err != nil {
			t.Fatalf("failed to parse local time %q with layout %q: %v", value, layout, err)
		}
		return parsed.Unix()
	}
	parseAbsolute := func(layout string, value string) int64 {
		parsed, err := time.Parse(layout, value)
		if err != nil {
			t.Fatalf("failed to parse time %q with layout %q: %v", value, layout, err)
		}
		return parsed.Unix()
	}

	cases := []struct {
		name  string
		input string
		want  int64
	}{
		{name: "default layout", input: "2026-02-27 12:34:56", want: parseLocal(utils.DefaultDateTimeLayout, "2026-02-27 12:34:56")},
		{name: "iso local", input: "2026-02-27T12:34:56", want: parseLocal("2006-01-02T15:04:05", "2026-02-27T12:34:56")},
		{name: "rfc3339", input: "2026-02-27T12:34:56+08:00", want: parseAbsolute(time.RFC3339, "2026-02-27T12:34:56+08:00")},
		{name: "rfc3339nano", input: "2026-02-27T12:34:56.123456789Z", want: parseAbsolute(time.RFC3339Nano, "2026-02-27T12:34:56.123456789Z")},
		{name: "date only", input: "2026-02-27", want: parseLocal("2006-01-02", "2026-02-27")},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := ts.DateTimeToSeconds(tc.input)
			if err != nil {
				t.Fatalf("DateTimeToSeconds(%q) returned error: %v", tc.input, err)
			}

			gotInt, err := strconv.ParseInt(got, 10, 64)
			if err != nil {
				t.Fatalf("DateTimeToSeconds(%q) returned non-integer %q", tc.input, got)
			}
			if gotInt != tc.want {
				t.Fatalf("DateTimeToSeconds(%q) = %d, want %d", tc.input, gotInt, tc.want)
			}
		})
	}
}

func TestDateTimeToMilliseconds(t *testing.T) {
	ts := &utils.Timestamp{}

	parseLocal := func(layout string, value string) int64 {
		parsed, err := time.ParseInLocation(layout, value, time.Local)
		if err != nil {
			t.Fatalf("failed to parse local time %q with layout %q: %v", value, layout, err)
		}
		return parsed.UnixMilli()
	}
	parseAbsolute := func(layout string, value string) int64 {
		parsed, err := time.Parse(layout, value)
		if err != nil {
			t.Fatalf("failed to parse time %q with layout %q: %v", value, layout, err)
		}
		return parsed.UnixMilli()
	}

	cases := []struct {
		name  string
		input string
		want  int64
	}{
		{name: "default layout", input: "2026-02-27 12:34:56", want: parseLocal(utils.DefaultDateTimeLayout, "2026-02-27 12:34:56")},
		{name: "iso local", input: "2026-02-27T12:34:56", want: parseLocal("2006-01-02T15:04:05", "2026-02-27T12:34:56")},
		{name: "rfc3339", input: "2026-02-27T12:34:56+08:00", want: parseAbsolute(time.RFC3339, "2026-02-27T12:34:56+08:00")},
		{name: "rfc3339nano", input: "2026-02-27T12:34:56.123456789Z", want: parseAbsolute(time.RFC3339Nano, "2026-02-27T12:34:56.123456789Z")},
		{name: "date only", input: "2026-02-27", want: parseLocal("2006-01-02", "2026-02-27")},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := ts.DateTimeToMilliseconds(tc.input)
			if err != nil {
				t.Fatalf("DateTimeToMilliseconds(%q) returned error: %v", tc.input, err)
			}

			gotInt, err := strconv.ParseInt(got, 10, 64)
			if err != nil {
				t.Fatalf("DateTimeToMilliseconds(%q) returned non-integer %q", tc.input, got)
			}
			if gotInt != tc.want {
				t.Fatalf("DateTimeToMilliseconds(%q) = %d, want %d", tc.input, gotInt, tc.want)
			}
		})
	}
}

func TestTimestampInvalidInputs(t *testing.T) {
	ts := &utils.Timestamp{}

	cases := []struct {
		name        string
		run         func() error
		wantMessage string
	}{
		{
			name:        "empty timestamp",
			run:         func() error { _, err := ts.SecondsToDateTime("   "); return err },
			wantMessage: "timestamp input cannot be empty",
		},
		{
			name:        "non numeric timestamp",
			run:         func() error { _, err := ts.MillisecondsToDateTime("abc"); return err },
			wantMessage: "invalid timestamp: must be a base-10 integer",
		},
		{
			name:        "empty datetime",
			run:         func() error { _, err := ts.DateTimeToSeconds(""); return err },
			wantMessage: "datetime input cannot be empty",
		},
		{
			name:        "malformed datetime",
			run:         func() error { _, err := ts.DateTimeToMilliseconds("2026/02/27"); return err },
			wantMessage: "supported formats",
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

func TestNegativeTimestampRoundTrip(t *testing.T) {
	ts := &utils.Timestamp{}

	input := "-123456789"
	dateTimeValue, err := ts.SecondsToDateTime(input)
	if err != nil {
		t.Fatalf("SecondsToDateTime returned error: %v", err)
	}

	roundTrip, err := ts.DateTimeToSeconds(dateTimeValue)
	if err != nil {
		t.Fatalf("DateTimeToSeconds returned error: %v", err)
	}

	if roundTrip != input {
		t.Fatalf("round trip mismatch: got %q want %q", roundTrip, input)
	}
}
