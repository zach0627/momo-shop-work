# catalog-feature-recommendation

`type:feature · scope:catalog`

"You may like" - a paginated product grid that shows three rows and loads more on demand. Lives in `catalog` (not `home`) because the goods detail page is expected to reuse it.

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
