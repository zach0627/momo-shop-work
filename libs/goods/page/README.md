# goods-page

`type:page · scope:goods`

The goods detail page: gallery, title and description, and the three action buttons. Display only - the buttons intentionally have no behaviour. Receives `goodsId` as a prop; reading the route param is the app's job.

- **May depend on:** `feature`, `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
