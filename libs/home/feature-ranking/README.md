# home-feature-ranking

`type:feature · scope:home`

Best sellers section: ranked products with a rank badge (private to this lib).

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
