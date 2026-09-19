# goods-page

`type:page · scope:goods`

The goods detail page, `/goods/:goodsId`: the picture on the left; title, description lines, goods code and price on the right; three action buttons under them. Receives `goodsId` as a prop - reading the route param is the app's job.

```
src/
├─ index.ts               exports GoodsDetailPage only
├─ goods-detail-page.tsx  useProduct(goodsId) → loading / error / not found / the page
└─ ui/                    goods-gallery · goods-info · goods-actions · goods-not-found (private)
```

- **Display-only, by decision.** The three buttons (`直接購買`, `放入購物車`, `加入追蹤`) have no `onClick`, no navigation, no state, no request. Cart and checkout are future domains ([ADR-0006](../../../docs/adr/0006-domain-dependency-map.md)). A spec clicks each button and compares the page's HTML, the URL, the history length and the repository call count before and after - wiring one up has to be done on purpose.
- **Same product table as the home page**, through the same hook, so a card and the page it leads to cannot disagree on name or price. An app-level spec walks from a home page card to its detail page and checks exactly that.
- **"Not found" is an answer, not a failure** (`useProduct` resolves to `null`): a page with a way home and no buttons. A failed load is `role="alert"`; the failure is reported by the app's query cache.
- **Left out on purpose:** the thumbnail strip and zoom (interactions), related products, payment and delivery rows, the breadcrumb.

- **May depend on:** `feature`, `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Everything under `ui/` is private to this package.
