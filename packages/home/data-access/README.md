# home-data-access

`type:data-access · scope:home`

The home page as data: what a CMS would send, and the seam it arrives through. Deliberately separate from the catalog - in production the layout comes from a CMS and products from a catalog service. The two are coupled only by a collection key string; neither imports the other.

```
src/
├─ index.ts        public API
├─ testing.tsx     second entry: '@momo/home-data-access/testing'
├─ models/         HomeSection (a union of 8 types) · Banner · Shortcut · SectionTitle
├─ repository/     the interface, the mock, the context
├─ hooks/          useHomeLayout
├─ fixtures/       home-layout.ts: the home page, top to bottom
└─ query-keys.ts
```

- **A section says what goes where; how a type looks is the page's business.** Six types are generic blocks; two only name a feature, which fetches for itself.
- **Reordering or removing a block is an edit to `home-layout.ts` and nothing else.** A spec pins the order the specification states.
- **A section that needs no logic of its own is an entry, not a type.** "今日暢銷榜" was planned as a third feature. On the live site it is the same CMS block as "momo 店取" (`bt_7_777_01` / `_02`, identical card markup); what differs is data - the products, a badge beside the title, and a background colour the CMS sets per section. So it is a `product-rail` entry with `title.badge` and `background`.
- **`background` is a CSS colour, not a design token.** It is campaign content, like a banner image. The price: the data can carry any colour, and the design system has no say.
- **Layout numbers are data** (`perView`, `gap`, `columns`, a banner's `width` and `height`). They were measured on the live site. That a CMS has to know a little about layout is the price of one block serving five sections.
- **Nothing in here is a link.** Banners are not clickable in this project.
- **The artwork is checked from the app**, which serves it: a spec there fails if the layout points at a file that is not in `public/`.
- **Testing entry.** `createFakeHomeRepository(overrides)` is an empty home page; `HomeTestProvider` gives a fresh query cache with no retries.

- **May depend on:** `util` (enforced by `@nx/enforce-module-boundaries`)
- **External dependencies:** `react`, `@tanstack/react-query` - declared in this package's own `package.json` as `catalog:`
- **Public API:** the two entries in `exports`. Everything else is private to this package.
