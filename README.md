
# H-toolkit

[中文](./README.CN.md)

A multiplatform desktop toolkit built with Wails.

## Features
- **JSON Tool:** Supports JSON formatting, compression, escaping, and adding escape characters.
- **Timestamp Tool:** Supports getting the current timestamp and converting between timestamps and date-time.

## Tech Stack
- **Language:** Vue 3 + TS 5 + Golang
- **UI Framework:** TDesign
- **Build Tool:** Wails

## Development Guide

Develop with the Wails CLI:

```bash
wails dev
# Linux only (for distros using libwebkit2gtk-4.1, e.g. Ubuntu 24.04+)
wails dev -tags webkit2_41
```

## Build

```bash
wails build
```

Windows uses WebView2 and does not need the `webkit2_41` tag.

## Testing

```bash
go test ./...
cd frontend && npm test
cd frontend && npm run test:coverage
```
