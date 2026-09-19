# shared-ui

`type:ui · scope:shared`

Presentational components shared by **two or more** projects (Rule of Two), and the design tokens. Knows nothing about domain models, data fetching, routes or the router.

```
src/
├─ index.ts            public API
├─ link/               AppLink + LinkProvider: the app injects its router's link
├─ price-tag/          price, struck original price
├─ product-card/       vertical / horizontal, outlined / plain, two slots
├─ carousel/           the only file that imports embla
├─ section-header/     the title of a home page section
└─ styles/             tokens.primitive.css → tokens.semantic.css → theme.css
```

- **Components declare the least they need.** `ProductCardItem` has four fields; a domain `Product` is passed as it is (structural typing), so this package never imports a data-access package.
- **No routes.** `ProductCard` takes an `href`; the caller builds it with `paths` from `@momo/shared-util`.
- **Visual options, not business variants.** `layout="horizontal"`, `frame="plain"`, `priceTag={{ tone: 'brand' }}` - never `variant="flash-sale"`. What a feature adds to a card goes into a slot (`promoText`, `footer`).
- **Options arrive with their first user.** There is no `topBadge`, no "限搶價" label and no red 23px price yet: nothing in the workspace would use them. They belong to the flash sale and are added with it.
- **`Carousel` is the only importer of `embla-carousel-react`** (an ESLint rule rejects it anywhere else), so replacing the library is a change to one file. Its wiring is tested against a fake embla, because jsdom lays nothing out; a second spec mounts the real library, and real paging is checked in a browser.
- **Class names are written out in full** (lookup tables, not string building), so Tailwind's scanner sees them. Colours and sizes come from the semantic tokens only.

- **May depend on:** `ui`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **External dependencies:** `react`, `embla-carousel-react` - declared in this package's own `package.json` as `catalog:`
- **Public API:** the entries in `exports`: `.` and `./theme.css`. Everything else is private to this package.
