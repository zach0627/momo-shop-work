# home-feature-ranking

`type:feature · scope:home`

Best sellers section: the products of `getRanking()` as horizontal cards (image left; promo line, name and price right). No rank badge - neither the live site nor the target screenshot has one.

> **Placeholder until step 12.** The container renders its title and `建置中`, and takes `{ title, lead? }`. It holds the section's place on the home page so the page's registry points at this package from the start; the step replaces the body and the page does not change.

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
