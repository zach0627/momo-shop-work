# catalog-data-access

`type:data-access · scope:catalog`

The product catalog: domain models, the `CatalogRepository` interface, its mock implementation and fixtures, the context that injects it, and TanStack Query hooks. UI only ever talks to the hooks; swapping mock for a real API is a change to the repository created at the composition root.

```
src/
├─ index.ts        public API
├─ testing.tsx     second entry: '@momo/catalog-data-access/testing'
├─ models/         Product · FlashSale(Item) · Category · Page<T>
├─ repository/     the interface, the mock, the context
├─ hooks/          one hook per repository method
├─ fixtures/       products / collections: GENERATED · categories: by hand
└─ query-keys.ts   every cache key of this package
```

- **"Not found" is an answer, not a failure.** `getProduct` resolves to `null`, `getCollection` to `[]`. Nothing throws.
- **One product table; collections hold ids.** The same product appears in several home page sections, so its name and price cannot differ between them, or between the home page and the detail page.
- **The flash sale ends relative to an injected `now`**, never at a fixed date.
- **Fixtures are generated**, deterministically, from the artwork: `pnpm gen:fixtures`, and `pnpm verify:fixtures` fails when they are stale. Do not edit `*.generated.ts` by hand. Ids are real; names, brands and prices are made up.
- **Testing entry.** `createFakeCatalogRepository(overrides)` answers "nothing" everywhere, so a test overrides only what it cares about; `CatalogTestProvider` gives a fresh query cache with no retries. It is a separate entry so it never reaches the app bundle.

- **May depend on:** `util` (enforced by `@nx/enforce-module-boundaries`)
- **External dependencies:** `react`, `@tanstack/react-query` - declared in this package's own `package.json` as `catalog:`
- **Public API:** the two entries in `exports`. Everything else is private to this package.
