# catalog-feature-recommendation

`type:feature · scope:catalog`

"你可能會喜歡": three rows of five products, and three more each time the user asks, until there are none left - then the button goes away. It lives in `catalog`, not `home`, because the goods detail page is meant to show it too; that is also why it takes `{ title, lead? }` rather than a home layout section.

```
src/
├─ index.ts             exports Recommendation only
├─ recommendation.tsx   container: useRecommendations(PAGE_SIZE) + the pieces below
├─ model/page-size.ts   COLUMNS 5 × ROWS_PER_LOAD 3 = PAGE_SIZE 15
└─ ui/                  recommendation-grid · load-more-button (private: nobody else uses them)
```

- **Paging is the data layer's business.** `useRecommendations` returns the flattened list, `hasMore` and a `loadMore` that is safe to call at any time - including again before the page arrives.
- **What is on screen stays where it is.** New products are appended to one list keyed by id.
- **The button is `aria-disabled` while loading, not `disabled`**, so keyboard focus is not lost after every batch.
- **Failure:** nothing loaded at all → the section leaves the page; a later batch fails → everything shown stays, and the button stays as the retry. The failure itself is reported by the app's query cache.
- **Specs mirror the scenarios** of spec `product-recommendation`, with its numbers (55, 10, exactly 15).

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Everything under `ui/` and `model/` is private to this package.
