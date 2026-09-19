# home-feature-flash-sale

`type:feature · scope:home`

Flash sale section: countdown to the end of the sale and a two-row product carousel. Countdown logic and sale-specific card decorations are private to this lib.

> **Placeholder until step 11.** The container renders its title and `建置中`, and takes `{ title, lead? }`. It holds the section's place on the home page so the page's registry points at this package from the start; the step replaces the body and the page does not change.

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
