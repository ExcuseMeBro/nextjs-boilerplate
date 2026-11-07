# Next.js Boilerplate

Modern starter for real projects: secure, fast, multilingual, REST-first.

## What's inside

- **Next.js 16** + **React 19**
- **REST API client** with timeout, typed errors, locale header, bearer token support
- **JWT auth flow** with HTTP-only cookies and refresh endpoint
- **i18n** with English, Uzbek, Russian routes
- **Biome** for linting and formatting
- **Tailwind CSS** + shadcn/ui-style components
- **Motion** for lightweight UI animations and micro-interactions
- Secure headers, strict TypeScript, optimized package imports

## Quick start

```bash
bun install --frozen-lockfile
cp -n .env.example .env.local
bun dev
```

Open:

```txt
http://localhost:3000/en
```

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
API_BASE_URL=http://localhost:8000/api
AUTH_LOGIN_PATH=/auth/login
AUTH_REFRESH_PATH=/auth/refresh
AUTH_ME_PATH=/auth/me
```

Auth expects backend login to return one of these token shapes:

```json
{ "access": "jwt", "refresh": "jwt" }
```

or

```json
{ "accessToken": "jwt", "refreshToken": "jwt" }
```

## Scripts

```bash
bun dev          # local dev with Webpack
bun dev:turbo    # opt in to Turbopack
bun build        # production build
bun start        # run production build
bun check        # Biome lint + format check
bun check:write  # auto-fix Biome issues
bun typecheck    # TypeScript check
bun audit        # dependency security audit
bun run lint     # Biome lint (CI gate)
bun run test     # Bun auth/API/provider tests + Python bootstrap tests
bun run measure:production # after bun build: local HTTP/static-asset baseline
```

Development explicitly uses Webpack as a workaround for reported high Turbopack
memory usage. Next.js 16 defaults to Turbopack, so removing `--turbopack` alone does
not switch bundlers. Stop the existing dev server before switching commands.
Production build/start commands are unchanged. This workaround is not proof that
an upstream memory leak has been fixed; see [memory comparison](docs/dev-memory.md).

## Bootstrap a new project

Use Python 3.9+ (standard library only), from any working directory:

```bash
python3 scripts/bootstrap.py --name my-app --dry-run
python3 scripts/bootstrap.py --name my-app
bun install --frozen-lockfile
bun run lint && bun run typecheck && bun run test && bun run build
```

`--name` is required: 1–64 lowercase ASCII letters/digits, starting with a letter,
with single internal hyphens; `node`, `npm`, and `bun` are reserved. Scoped npm names,
paths, whitespace, shell fragments and non-ASCII names are rejected. Next.js has no
native application ID: only `package.json` and the root workspace name in `bun.lock`
change. Branding, domains and translations stay yours to edit deliberately.

The script validates both files before writes, rejects symlinks/hardlinks, preserves
all other bytes, and is idempotent. Dry-run prints only the planned names/files.
It never reads/writes `.env*`, generates secrets, installs packages, invokes a shell,
or renames directories. Copy `.env.example` manually only if your target does not
already exist (`cp -n` above). Each file replacement is atomic; the pair is not a
filesystem transaction, so review both files after a disk/interruption failure.

## Tests and CI

Use Node **22.23.4**, Bun **1.4.4**, and Python **3.9+** (CI: **3.13**). The committed GitHub Actions
workflow runs on pull requests and pushes to `dev`: frozen install, lint, typecheck,
tests, production build, then production asset measurement. Cache keys include OS,
architecture, both runtimes and `bun.lock`; cache hits never skip the frozen install.
Actions are commit-pinned, checkout credentials are not persisted, permissions are
read-only, and any failed command fails the job. No deployment or production secrets
are used. The existing Google font build requires outbound access to Google Fonts.

`bun run test` uses Bun’s built-in runner (no added test dependency). Auth handlers
run against mocked `fetch` and `next/headers`, but the real API client, validation,
token extraction and cookie helpers. Fixtures cover login, refresh rotation/fallback,
logout, session normalization, unauthorized/input/upstream/network/timeout errors,
and cookie flags. Configuration is overwritten with dummy test values before imports;
no actual backend or credential is needed. Python tests use temporary copies and
include invalid names, dry-run, repeat runs, untouched secret fixtures and link guards.
Provider tests verify the SSR boundary and retained auth/query/reduced-motion context;
they are not browser hydration/visual tests. Run production cookie-mode checks with
`NODE_ENV=production bun --no-env-file test tests/auth-api.test.js`.

Backend auth failures retain their HTTP status but return generic messages, never
upstream diagnostic bodies. API-client errors remain typed internally. Backend token
values must be non-empty strings before they can become auth cookies.

See [production measurements](docs/production-performance.md) for the measured
Motion feature split and its limits.

## Project structure

```txt
app/[locale]          localized pages and providers
app/api/auth          JWT auth route handlers
app/api/health        deployment health check
components            UI, auth, app components
i18n                  locale routing and request config
lib/api               REST client
lib/auth              auth types, cookies, session helpers
lib/config            env validation
messages              translation files
```

## Add REST calls

```ts
import { serverApi } from "@/lib/api/client";

const { data } = await serverApi.get<User[]>('/users');
```

For protected calls, pass token:

```ts
const { data } = await serverApi.get<User>('/auth/me', { token });
```

## Add translations

Edit all files together:

- `messages/en.json`
- `messages/uz.json`
- `messages/ru.json`

Keep keys and placeholders aligned.
