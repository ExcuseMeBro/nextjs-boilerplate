# In Progress

- [ ] 🔍 In Review — Use Webpack for development and compare memory usage against Turbopack <!-- asana:1218210109205904 -->
  - Compare identical bounded route requests and source invalidations with process-tree RSS sampling; verify response content, health and compilation.
  - Verified: 30 source invalidations per bundler; locale pages/assets/health passed; Biome, TypeScript and diff checks passed.
  - Peak tree RSS: Turbopack 1658.92 MiB; Webpack 1641.62 MiB. OOM not reproduced; leak fix unproven. Reverse-order repeat interrupted and excluded; test source/process cleanup completed.
  - Evidence: docs/dev-memory.md. Local changes only; not pushed.
