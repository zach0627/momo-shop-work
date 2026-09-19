# shared-util

`type:util · scope:shared`

Pure functions shared by **two or more** projects (Rule of Two). No React, no DOM.

- `paths` / `ROUTE_PATTERNS` - the single source of truth for URLs. The router registers the patterns; everything that links somewhere builds the URL with `paths`. A spec checks that the two cannot drift apart.
- `formatPrice` - `49900 → "49,900"`. The locale is pinned; the currency sign is left to the caller, because where it sits and how big it is belongs to the design.
- (step 8) a telemetry sink.

- **May depend on:** `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only.
- Module resolution here is `nodenext`: relative imports carry the `.js` extension.
