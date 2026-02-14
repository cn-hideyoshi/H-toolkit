package utils

import (
	"bytes"
	"encoding/json"
)

type Json struct{}

// 格式化
func (j *Json) Format(input string) (string, error) {
	if input == "" {
		return "", nil
	}

	var buf bytes.Buffer
	buf.Grow(len(input) + len(input)/2)
	if err := json.Indent(&buf, []byte(input), "", "  "); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// 压缩
func (j *Json) Compress(input string) (string, error) {
	var obj interface{}
	err := json.Unmarshal([]byte(input), &obj)
	if err != nil {
		return "", err
	}

	compressed, err := json.Marshal(obj)
	if err != nil {
		return "", err
	}

	return string(compressed), nil
}

// UNICODE编码
func (j *Json) EncodeUnicode(input string) string {
	bytes, _ := json.Marshal(input)
	return string(bytes)
}

// UNICODE解码
func (j *Json) DecodeUnicode(input string) (string, error) {
	var output string
	err := json.Unmarshal([]byte(`"`+input+`"`), &output)
	return output, err
}

// 转义
func (j *Json) Escape(input string) (string, error) {
	bytes, err := json.Marshal(input)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// 去转义
func (j *Json) Unescape(input string) (string, error) {
	var output string
	err := json.Unmarshal([]byte(input), &output)
	return output, err
}
