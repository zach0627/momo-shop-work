# home-page

`type:page · scope:home`

The home page. Renders `HomeSection[]` through a typed section registry (config-driven) and owns the CMS-style blocks that have no logic of their own. `page` is the only layer allowed to compose several features.

- **May depend on:** `feature`, `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
