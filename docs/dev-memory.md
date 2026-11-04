# Development memory comparison

## Result

Webpack is now the explicit development default; `bun dev:turbo` remains an opt-in.
This is a workaround, not a confirmed fix for the reported Linux OOM. The OOM did
not reproduce in either completed local run, and peak memory was nearly equal.
Production build/start are unchanged.

## Completed measurements

Environment: macOS, 64 GiB physical RAM, Node 24.18.0, Next.js 16.2.4,
lockfile installed with `bun install --frozen-lockfile`. Base commit:
`2e751543e25baa2ee356197bf46f3dfe2b4ff3c1`.

All figures are MiB of resident memory (RSS), not virtual memory or JS heap size.
Process-tree totals include the CLI, next-server and child workers; sums may
include shared pages and are not system-wide physical-memory measurements.

| Metric | Turbopack | Webpack |
| --- | ---: | ---: |
| Warm process tree | 1401.50 | 1225.81 |
| Peak process tree | 1658.92 | 1641.62 |
| End process tree (after 30 s idle) | 1500.30 | 1316.19 |
| Peak next-server | 1335.17 | 1422.05 |
| End next-server | 1230.61 | 1240.41 |
| Duration (seconds) | 133.32 | 132.24 |

Webpack's process-tree peak was only 1.0% lower; its idle total was 12.3% lower.
The next-server process itself was not lower. These single-run differences do
not establish a reliable memory improvement, plateau, or leak fix.

## Method and limitations

- Sequential fresh-cache runs, Turbopack then Webpack; identical dependency versions.
- Start `node node_modules/next/dist/bin/next dev --turbopack` or `--webpack`
  with `--hostname 127.0.0.1 --port 3197` and telemetry disabled.
- Warm `/en`, `/uz`, `/ru`, referenced JS/CSS assets, and `/api/health`.
- Perform 30 source invalidations, changing a temporary `data-memory-probe`
  attribute on the homepage. Request all three pages and their assets each cycle;
  assert HTTP 200, locale, CRAFTLY content, the current marker and health JSON.
- Target three seconds per cycle; sample process-tree and next-server RSS every
  second with `ps`. Wait 30 seconds idle afterward. Stop at 6 GiB or six minutes.
- Both completed runs passed every HTTP/content assertion. Temporary source
  changes were restored and test servers stopped.
- A reverse-order repeat was interrupted and excluded from the results.
- No browser, HMR WebSocket, client navigation, long development session, Linux
  reproduction, backend integration, or production memory measurement was tested.
  HTTP-triggered recompilation is not equivalent to browser Fast Refresh.
- The temporary harness and raw logs are local artifacts at
  `/tmp/nextjs-memory-ZabFlc/`; they are not a portable committed test suite.

For the lowest memory when not actively editing, use a production build rather
than a dev compiler. Measure production separately; its memory was not compared
here. Establish the actual application's long-running edit/browser workload on
the affected machine before calling the reported leak resolved.
