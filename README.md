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
bun install
cp .env.example .env.local
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
bun dev          # local dev
bun build        # production build
bun start        # run production build
bun check        # Biome lint + format check
bun check:write  # auto-fix Biome issues
bun typecheck    # TypeScript check
bun audit        # dependency security audit
```

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
