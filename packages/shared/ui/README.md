# shared-ui

`type:ui · scope:shared`

Presentational components shared by **two or more** projects (Rule of Two): link adapter, product card, price tag, carousel, section header. Knows nothing about domain models, data fetching or the router. The only place allowed to import `embla-carousel-react`.

- **May depend on:** `ui`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
