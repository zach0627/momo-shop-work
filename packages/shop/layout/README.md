# shop-layout

`type:layout · scope:shop`

Application chrome shared by every page: sticky top bar (compact on scroll), main header, expandable category navigation and footer. Exposes a single `AppLayout`.

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
