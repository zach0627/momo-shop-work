# home-feature-flash-sale

`type:feature · scope:home`

Flash sale section: countdown to the end of the sale and a two-row product carousel. Countdown logic and sale-specific card decorations are private to this lib.

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
