# home-data-access

`type:data-access · scope:home`

Home page layout as data: the `HomeSection` discriminated union, the layout fixture (section order and CMS banners), its repository, context and query hook. Deliberately separate from the catalog - in production the layout comes from a CMS, products from a catalog service. The two are coupled only by a collection key string.

- **May depend on:** `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
