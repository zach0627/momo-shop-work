# home-feature-flash-sale

`type:feature · scope:home`

"限時搶購": a countdown to the end of the sale in the header bar, and the products in pages of two rows of five that the user can page through. It takes `{ title, lead? }`, not a home layout section, so it does not depend on the home page's types.

```
src/
├─ index.ts                 exports FlashSale only
├─ flash-sale.tsx           container: useFlashSale() + the pieces below
├─ model/get-remaining.ts   hours / minutes / seconds to the end; zero, never negative
├─ model/use-countdown.ts   re-reads the clock every second; stops at zero
├─ model/chunk.ts           cuts the products into pages
├─ model/page-size.ts       COLUMNS 5 × ROWS 2 = PAGE_SIZE 10
└─ ui/                      flash-sale-header · countdown · card-footer (private)
```

- **The countdown reads the clock; it does not count ticks.** A background tab delays `setInterval`, and a countdown that subtracts one per tick would drift. Hours are not turned into days: the live site has three boxes.
- **Only `Countdown` re-renders each second**, not the 29 product cards. It is a `role="timer"`, which screen readers do not announce on every change.
- **A page is a 2 × 5 grid inside one carousel slide**; paging itself is `Carousel`'s job and is tested there.
- **The card is `shared/ui`'s `ProductCard`** with visual options (`frame="raised"`, a red `lg` price with a "限搶價" label) and this package's `card-footer` in its `footer` slot. The "搶" is decoration (`aria-hidden`): the card itself is the link.
- **The header bar is rebuilt from text, an icon and tokens.** On the live site that whole bar is one image, which the provided assets do not include.
- **Failure or an empty sale:** the section leaves the page. The failure is reported by the app's query cache.
- **Specs mirror the scenarios** of spec `home-page`, with its numbers (02:19:23 → 02:19:22; 2,998 / 4,995 / 最後484組).

- **May depend on:** `ui`, `data-access`, `util` (enforced by `@nx/enforce-module-boundaries`)
- **Public API:** `src/index.ts` only. Everything under `ui/` and `model/` is private to this package.
