# catalog-feature-recommendation

`type:feature · scope:catalog`

"You may like" - a paginated product grid that shows three rows and loads more on demand. Lives in `catalog` (not `home`) because the goods detail page is expected to reuse it.

> **Placeholder until step 9.** The container renders its title and `建置中`, and takes `{ title, lead? }`. It holds the section's place on the home page so the page's registry points at this package from the start; the step replaces the body and the page does not change.

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
