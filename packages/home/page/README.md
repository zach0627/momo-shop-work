# home-page

`type:page · scope:home`

The home page. It fetches one thing - its layout - and renders it through a typed registry. `page` is the only layer allowed to compose several features.

```
src/
├─ index.ts
├─ home-page.tsx            useHomeLayout → loading / error / <SectionRenderer>
├─ section-renderer/
│  ├─ section-renderer.tsx  pure: sections + registry → the page, in data order
│  ├─ registry.ts           SectionRegistry: a mapped type over the union
│  └─ section-registry.tsx  the real registry
├─ blocks/                  hero · banner-carousel · banner-grid · shortcut-bar · notice · product-rail
└─ ui/                      section-frame · banner-image
```

- **The order of the page is the order of the data.** `SectionRenderer` fetches nothing and takes the registry as a prop, so its specs use one-line components and are about dispatch, order and fault tolerance - not about blocks.
- **A missing renderer is a compile error.** `SectionRegistry` maps every type of the union to a component of exactly that variant.
- **An unknown type at run time is skipped and reported, once.** The data comes from outside; a CMS can ship a type this build does not know.
- **Blocks have no logic of their own**, which is why they are private files here and not packages. `product-rail` is the one that fetches: it turns a collection key into products through the catalog, and links every card to `paths.goods(id)`. It serves three sections - 降價好貨 (vertical cards), momo 店取 and 今日暢銷榜 (horizontal cards; the latter on a tinted band with a badge, both from the data). Banners are images, never links.
- **The page owns its width and background** (full-width grey, white 1220px bands); the layout around it only says where the page goes.
- **Reporting a failed load is not done here**: the app's query cache reports every failed query once. The page shows the state (`role="status"`, `role="alert"`).

- **May depend on:** `feature`, `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only.
