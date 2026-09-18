# shared-util

`type:util · scope:shared`

Pure functions shared by **two or more** projects (Rule of Two): price formatting, URL paths (single source of truth for routes), telemetry sink.

- **May depend on:** `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
