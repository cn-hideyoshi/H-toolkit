package utils

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

const DefaultDateTimeLayout = "2006-01-02 15:04:05"

var supportedDateTimeLayouts = []string{
	DefaultDateTimeLayout,
	"2006-01-02T15:04:05",
	"2006-01-02",
	time.RFC3339,
	time.RFC3339Nano,
}

const supportedDateTimeFormatsDesc = "YYYY-MM-DD HH:mm:ss, YYYY-MM-DDTHH:mm:ss, YYYY-MM-DD, RFC3339, RFC3339Nano"

type Timestamp struct{}

func (t *Timestamp) NowSeconds() string {
	return strconv.FormatInt(time.Now().Unix(), 10)
}

func (t *Timestamp) NowMilliseconds() string {
	return strconv.FormatInt(time.Now().UnixMilli(), 10)
}

func (t *Timestamp) SecondsToDateTime(input string) (string, error) {
	seconds, err := parseTimestampInput(input)
	if err != nil {
		return "", err
	}
	return time.Unix(seconds, 0).In(time.Local).Format(DefaultDateTimeLayout), nil
}

func (t *Timestamp) MillisecondsToDateTime(input string) (string, error) {
	milliseconds, err := parseTimestampInput(input)
	if err != nil {
		return "", err
	}
	return time.UnixMilli(milliseconds).In(time.Local).Format(DefaultDateTimeLayout), nil
}

func (t *Timestamp) DateTimeToSeconds(input string) (string, error) {
	parsedTime, err := parseDateTimeInput(input)
	if err != nil {
		return "", err
	}
	return strconv.FormatInt(parsedTime.Unix(), 10), nil
}

func (t *Timestamp) DateTimeToMilliseconds(input string) (string, error) {
	parsedTime, err := parseDateTimeInput(input)
	if err != nil {
		return "", err
	}
	return strconv.FormatInt(parsedTime.UnixMilli(), 10), nil
}

func parseTimestampInput(input string) (int64, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return 0, fmt.Errorf("timestamp input cannot be empty")
	}

	value, err := strconv.ParseInt(trimmed, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid timestamp: must be a base-10 integer")
	}

	return value, nil
}

func parseDateTimeInput(input string) (time.Time, error) {
	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return time.Time{}, fmt.Errorf("datetime input cannot be empty")
	}

	for _, layout := range supportedDateTimeLayouts {
		if layout == time.RFC3339 || layout == time.RFC3339Nano {
			parsed, err := time.Parse(layout, trimmed)
			if err == nil {
				return parsed, nil
			}
			continue
		}

		parsed, err := time.ParseInLocation(layout, trimmed, time.Local)
		if err == nil {
			return parsed, nil
		}
	}

	return time.Time{}, fmt.Errorf("invalid datetime format, supported formats: %s", supportedDateTimeFormatsDesc)
}
