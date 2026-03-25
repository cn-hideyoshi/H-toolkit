# Repository Guidelines

## Project Structure & Module Organization
`main.go` and `app.go` bootstrap the Wails desktop app and bind Go services into the frontend. Put backend logic in `backend/utils`; existing Go tests live in `backend/test` and follow the `_test.go` pattern. The Vue 3 + TypeScript client lives in `frontend/src`, with feature pages under `pages/`, shared UI under `components/`, routing in `router/`, and state in `store/`. Treat `frontend/wailsjs` and `frontend/dist` as generated output, not hand-edited source. Packaging assets and platform metadata live in `build/`, and repeatable build helpers are in `scripts/`.

## Build, Test, and Development Commands
Run `wails dev` from the repo root for the desktop app with live reload. On Linux environments that need the alternate WebKit tag, use `wails dev -tags webkit2_41`. Build production binaries with `wails build`, or use `scripts/build.sh`, `scripts/build-windows.sh`, and `scripts/build-macos.sh` for common targets. Run backend tests with `go test ./...`. For frontend-only checks, use `cd frontend && npm run build` for type-check + Vite build, `cd frontend && npm run lint` for ESLint, and `cd frontend && npm run stylelint` for style rules.

## Coding Style & Naming Conventions
Format Go code with `gofmt`; use PascalCase for exported identifiers and lowerCamelCase for internal helpers. Frontend formatting is defined in `frontend/.prettierrc.cjs`: 2-space indentation, single quotes, no semicolons, trailing commas, and LF line endings. Keep Vue component filenames in PascalCase when reusable, but use kebab-case component tags in templates as enforced by ESLint. Name route modules and feature files by domain, for example `timestamp.ts` and `json.ts`.

## Testing Guidelines
Backend tests use Go's `testing` package and should stay close to the behavior being validated, preferably table-driven for parsers and converters. No coverage gate is configured today. Frontend changes should at minimum pass `npm test`, `npm run build`, `npm run lint`, and manual verification through `wails dev`.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits, for example `feat(frontend): default icon` and `feat(json): add tree node`. Prefer `type(scope): summary`, with scopes matching repo areas such as `frontend`, `backend`, `timestamp`, or `build`. Pull requests should describe the user-visible change, list verification steps, link related issues, and include screenshots for UI-facing updates.
