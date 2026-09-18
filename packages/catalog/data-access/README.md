# catalog-data-access

`type:data-access · scope:catalog`

Product catalog: domain models, the `CatalogRepository` interface, its mock implementation and fixtures, the repository context, and TanStack Query hooks. UI only ever talks to the hooks; swapping mock for a real API is a change to the repository implementation injected at the composition root.

- **May depend on:** `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Anything under `ui/` or `model/` that is not re-exported there is private to this lib.
