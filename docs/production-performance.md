# Production bundle and request baseline

Measured on macOS arm64, Node 22.23.4, Bun 1.4.4, Next.js 16.2.4,
production Turbopack build, locked dependencies. Baseline source: `ff5f29f`.

Reproduce in an isolated checkout with no private environment files:

```bash
bun install --frozen-lockfile
bun run build
bun run measure:production
```

The dependency-free measurement script starts a production Next handler on an
OS-assigned loopback port, fetches `/en`, `/uz`, `/ru`, deduplicates their declared
static URLs, fetches each resource, and sums raw and locally gzipped JS bytes. It
asserts successful responses and locale HTML attributes, checks unauthenticated
`/api/auth/me` returns 401, and closes the server. The Next standalone warning is
expected for this programmatic measurement; deployment still uses standalone output.

| Per locale (all three identical) | Baseline | Lightweight Motion |
| --- | ---: | ---: |
| HTML-declared JS bytes | 925,544 | 889,492 |
| JS bytes, gzip per resource | 280,973 | 271,691 |
| Unique JS requests | 16 | 16 |
| Document + declared static requests | 18 | 18 |
| Explicit unauthenticated session probe | 1 (401) | 1 (401) |

The synchronous `LazyMotion`/`domAnimation` boundary with `motion/react-m` removes
36,052 raw bytes (3.90%) / 9,282 gzip bytes (3.30%) without adding a feature-download
request. It excludes unused drag/layout-projection features, not gesture/viewport
animation support. All current Motion components use the lightweight entry point;
strict mode detects accidental full `motion` components inside the boundary.

Auth, Query, theme and locale provider scopes are unchanged. `MotionConfig`
retains `reducedMotion="user"`, all animation props and markup are unchanged, and
features load synchronously so SSR/first-frame content is not delayed. Async feature
loading was not adopted: it would add a request and complicate first-frame behavior.
Query provider removal was not adopted: it would remove the starter’s public query
context contract. These alternatives have no claimed measured benefit.

These are asset counts/bytes, **not** browser hydration, cached navigation, network
waterfalls, latency, Lighthouse or Core Web Vitals results. CSS-referenced font/image
fetches and runtime-only requests are outside the count. AuthProvider’s mount-time
session request is unchanged; the script’s session probe is explicit, not evidence
of browser execution. No browser visual/reduced-motion simulation was run. Server
rendering tests exercise provider context and the strict Motion boundary; production
HTTP checks cover each locale. No timing improvement is claimed.
