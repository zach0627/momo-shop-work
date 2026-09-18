# home-feature-ranking

`type:feature · scope:home`

Best sellers section: the products of `getRanking()` as horizontal cards (image left; promo line, name and price right). No rank badge - neither the live site nor the target screenshot has one.

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
