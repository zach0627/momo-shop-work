可與 AI / Agents 討論：
架構方向
Workflow Planning
Implementation Strategy

**規則**
我們為了MOMO考試因此做出demo頁面,請先不要思考或者擅自亂做往下的動作
我們目的為做出首頁展示頁面與如果是商品就開放點擊,進到good detail頁面,good detail 頁面也是展示用因此不可以擅作主張往下做,例如我們有直接購買但不可以真的點擊直接購買可以進到購買頁面。
## 初步內容解析
### 首頁:
https://www.momoshop.com.tw/main/Main.jsp?mdiv=1099800000-bt_0_243_01-bt_0_243_01_e1&ctype=B
![首頁頂部：Header、分類列、主要活動、官方優惠](../pictures/01-home-top.png)
可以選擇分類，下面為點擊展開後的分類
![分類列點擊展開後的「選擇分類」面板](../pictures/02-category-panel-expanded.png)
本身這塊為header scroll保留區塊,當我往下滾動時這一塊要保留
![捲動時要保留的 TopBar 區塊](../pictures/03-topbar-sticky-region.png)

滾動時樣式,可以看到他被保留了
![捲動後被保留的 compact TopBar（含搜尋框）](../pictures/04-topbar-compact-on-scroll.png)
我們首頁整體順序
header 包含還有momo logo
以及往下的種類可展開圖
下面的主要活動
![主要活動輪播 + 今日大牌](../pictures/05-main-events.png)
官方優惠
![官方優惠](../pictures/06-official-deals.png)

往下繼續滑動
降價好貨
![降價好貨](../pictures/07-price-drop.png)

再往下滑區塊
品牌折扣
詐騙發票提醒
![品牌折扣與詐騙發票提醒](../pictures/08-brand-discount-and-fraud-notice.png)

再往下區塊
官方旗艦名店
![官方旗艦名店](../pictures/09-flagship-stores.png)
再往下
momo店取
momo信用卡優惠
猜你想搜
![momo 店取、信用卡優惠、猜你想搜](../pictures/10-store-pickup-card-offers-search.png)

限時搶購
![限時搶購](../pictures/11-flash-sale.png)

今日暢銷榜
moPro訂閱享會員專屬價
![今日暢銷榜與 moPro 會員專屬價](../pictures/12-best-sellers-and-mopro.png)

你可能會喜歡
![你可能會喜歡](../pictures/13-you-may-like.png)
因為裡面內容太多滾到一定程度後,下面會看到有個看更多,就可以點擊後出現更多商品了
![你可能會喜歡底部的「看更多」](../pictures/14-you-may-like-load-more.png)

我們先設定假設3列就要出現看更多了
首頁最下面的Footer,偏深藍色那個區塊
![首頁最下方的深藍色 Footer](../pictures/15-footer.png)

### goods detail 頁面
https://www.momoshop.com.tw/product/15687497?Area=search&mdiv=403&oid=1_1&cid=index&kw=iPhone+18+Pro&ecTagNos=

![商品詳情頁全貌](../pictures/16-goods-detail-full.png)
由於時間不夠,我們首頁做完後優先做出這個頁面的這個畫面即可其餘可選擇性暫時忽略,左邊有商品圖右邊有描述,描述要有title 還有商品說明即可,下面要有直接購買與放入購物車與加入追蹤的button
![商品詳情頁：本次要實作的畫面](../pictures/17-goods-detail-target.png)
滑到下面要有footer

我有個素材區域,後續作出repo可以從素材區域搬遷需要且對應的內容到專案當中
素材目前區域位置:
D:\repo\momo素材

## AI 回饋我們要設計的架構:

> 版本：**v2**（2026-09-18，經自我審查後定案）｜實作 repo：`D:\repo\momo-shop-work`
> 本段會同步成 repo 的 `docs/architecture.md` 與 `docs/adr/*`，給面試官看。

> [!note] v2 之後的三次修訂（2026-09-18 ~ 19，都是 Human 質疑後才改的，下文已一併更新）
> 1. 全站外框的 lib 由 `shell` 改名為 `layout`：「shell library」在 Nx 社群另有所指，而這個 lib 就是一般所說的 layout。
> 2. `layout/feature` → **`shop/layout`**，並新增 **`type:layout`** 一層。路徑的寫法是 `<誰的>/<哪一種>`，「layout」是種類而不是擁有者；而且外框與 `page` 同層（只有 router 會 import 它、它包住 page），標成 `feature` 會讓它無法組合別的 domain 的 feature。是否該改放 `apps/shop/src/layouts` 或改用 Nx 的 `feature-shell`，查證後維持原位置（ADR-0007）。
> 3. **`libs/` → `packages/`**，而且不只是改名（ADR-0008）：每個專案本來就是 pnpm workspace package，所以照 package 的規矩來 —— 保留依 domain 分組、拿掉 package 內部的 `src/lib/`、樣式也只能透過 `exports` 取得、`src/` import 什麼就在自己的 `package.json` 宣告什麼（版本由 pnpm catalog 統一，`@nx/dependency-checks` 強制）。

> [!note] v1 → v2 自我審查修正了什麼
> 1. `shared/ui` 不認識 domain model：`ProductCard` 只宣告最小形狀 `ProductCardItem`，`Product` 靠 structural typing 傳入（v1 照寫會變成 ui → data-access 違規依賴）。
> 2. 補上 `paths`（URL 單一來源），避免各 feature 手寫 `/goods/${id}`。
> 3. Repository 改由 **Context 注入**，composition root 在 `app/providers.tsx`（v1 是 hooks 直接 import singleton，測試只能吃真 fixture）。
> 4. `telemetry` 從 P1 提到 P0（TDD #5 依賴它，v1 優先序自相矛盾）。
> 5. 限時搶購 `endsAt` 不寫死在 fixture：mock repository 注入 `now()`。
> 6. 交付順序改 **walking skeleton 先行**；goods detail 排在 flash-sale / ranking 之前（前者不可砍、後者可砍）。
> 7. design tokens 從 app 移到 `shared/ui/styles/theme.css`（token 屬於 design system）。
> 8. 用字：13 個業務區塊 = 15 筆 section 設定；Rule of Two 計數單位是 project（package 或 app）。

### 0. 範圍（Scope）— 先講不做什麼

| 做 | 不做（寫進 README 的 Known Gaps） |
|---|---|
| `/` 首頁：Header(sticky) → 分類(可展開) → 13 個業務區塊 → Footer | 搜尋功能（搜尋框純展示）、`/search` `/live` `/discover` |
| `/goods/:goodsId`：左商品圖、右 title + 商品說明、下方三顆按鈕、Footer | **詳情頁任何互動**：直接購買 / 放入購物車 / 加入追蹤 皆**只渲染、不綁行為** |
| **只有商品卡可點** → 進詳情頁 | Banner 不可點（沒有對應頁面）；右側浮動欄、登入、購物車、結帳 |
| 「你可能會喜歡」3 列後出現「看更多」 | RWD（Desktop-first，固定容器寬 1220px，同 momo 桌機版）；商品名稱/價格為生成的假資料 |

### 1. 設計原則（所有決策都回到這 5 條）

1. **依賴方向單向且由 lint 強制**：`app → layout / page → feature → ui / data-access → util`，不是靠自律。
2. **切 package 的準則**：「有自己的邏輯 / 自己的資料 / 首頁以外會被重用」才獨立成 feature package；純 CMS 圖片區塊不拆（避免空殼 package）。
   - **Rule of Two（共用門檻）**：元件 / 函式**被 ≥2 個 project（package 或 app）使用**才能進 `shared/ui`、`shared/util`。只有自己用的，一律放該 package 自己的 `ui/`（展示）或 `model/`（邏輯、hooks），且**不從 `index.ts` 匯出**（= package 私有）。
   - **升級路徑**：feature 私有 → 出現第 2 個使用者 → 只在同 domain 共用升到 `packages/<scope>/ui`，跨 domain 才升到 `shared/ui`。
   - **由工具強制**：Nx boundary rule 禁止 deep import（只能走 `index.ts`）+ 禁止 feature ✗ feature，想偷用別人的私有元件會直接 lint error。
   - feature / page package 內部統一結構：`<name>.tsx`（container：抓資料 + 組合）｜`ui/`（私有展示）｜`model/`（私有邏輯）｜`index.ts` 只匯出 container。
3. **首頁是資料驅動（config-driven）**：區塊順序與內容來自 `HomeSection[]`，不是寫死在 JSX。
4. **框架耦合集中在一處**（皆以 `no-restricted-imports` 強制）：`react-router` 只准出現在 `apps/shop`；`embla-carousel-react` 只准出現在 `shared/ui`。換 Next / 換輪播套件只改一處。
5. **資料走 Repository 接縫 + Context 注入**：UI 只認 hooks，hooks 只認 repository interface；用哪個實作由 composition root（`app/providers.tsx`）決定。mock → 真 API 只改那一行。
   - 連帶規則：**`shared/ui` 不認識 domain model**。ui 元件只宣告自己需要的最小形狀（例：`ProductCardItem`），domain 的 `Product` 靠 TS structural typing 直接傳入，雙方零 import。

### 2. 技術選型

| 面向 | 選擇 | 為什麼 | 放棄的方案 |
|---|---|---|---|
| Monorepo | **Nx**（pnpm） | `enforce-module-boundaries` + tags 強制分層；`nx affected` 給 CI | 單一 Vite app（退路，見 §9） |
| 框架 | **React 19 + TypeScript strict + Vite** | 靜態部署、面試官開網址即看 | **Next**：mock-only 無 SEO 需求、RSC 邊界決策吃時間 → ADR-0001 記錄演進 |
| 路由 | **React Router v7**（library mode + lazy route） | route-level code splitting；日後可升 framework mode 做 SSR | TanStack Router（團隊熟悉度低） |
| Server state | **TanStack Query v5** | loading / error / cache 與真 API 同契約；`useInfiniteQuery` 做「看更多」 | 直接 import fixture（之後換 API 要改全部元件） |
| Client state | **目前不裝任何 store** | 兩頁皆展示用，全域 client state = 0；展開 / 輪播用 local state | Zustand / RTK → ADR-0003：出現購物車再上輕量 store，跨 domain 流程變複雜再換 **Redux Toolkit** |
| 樣式 | **Tailwind CSS v4**（`@theme` design tokens） | 與 Agent 協作最快；token 集中（momo 粉 / 價格紅） | CSS Modules（慢）、UI kit（與 momo 視覺差太多） |
| 輪播 | **embla-carousel-react** | headless、體積小；包在 `shared/ui` 內可抽換 | Swiper（重、樣式侵入） |
| 單元測試 | **Vitest + Testing Library + user-event** | Nx 原生支援；TDD 主力 | Jest |
| E2E（P2） | **Playwright**（`@nx/playwright`） | 一條 smoke：首頁 → 點商品 → 詳情頁 | Cypress |
| 錯誤隔離（P1） | **react-error-boundary** | 單一區塊掛掉不拖垮整頁 + 回報 telemetry | 手寫 class |
| CI（P1） | GitHub Actions：`nx affected -t lint test build` | Delivery thinking | — |

### 3. 分層與依賴規則（Nx tags）

```mermaid
graph TD
  APP[apps/shop<br/>type:app] --> PAGE[home/page · goods/page<br/>type:page]
  APP --> LAYOUT[shop/layout<br/>type:layout]
  PAGE --> FEAT[feature-flash-sale · feature-ranking<br/>feature-recommendation<br/>type:feature]
  PAGE --> UI
  PAGE --> DA
  FEAT --> UI[shared/ui<br/>type:ui]
  FEAT --> DA[catalog/data-access · home/data-access<br/>type:data-access]
  LAYOUT --> FEAT
  LAYOUT --> UI
  LAYOUT --> DA
  UI --> UTIL[shared/util<br/>type:util]
  DA --> UTIL
```

| `type:` | 可依賴 | 職責 |
|---|---|---|
| `app` | layout, page, feature, ui, data-access, util | 薄殼 + **composition root**：router、providers、注入 Link 與 repository 實作 |
| `layout` | feature, ui, data-access, util | 跨頁保留的外框。與 `page` 同層：由 router 巢狀組合，**layout ✗ page、page ✗ layout**；只有 `app` 能依賴它 |
| `page` | feature, ui, data-access, util | 組合多個 feature 成一頁（**只有 `layout` 與 `page` 能同時 import 多個 feature**） |
| `feature` | ui, data-access, util | 有邏輯的業務區塊（smart component）；**feature ✗ feature** |
| `ui` | ui, util | 純展示元件；不碰資料、不碰 router、不認識 domain model |
| `data-access` | util | 型別、repository interface + 實作、query hooks、fixtures；**data-access ✗ data-access** |
| `util` | util | 純函式 |

- `scope:` 規則：`home → home, catalog, shared`｜`goods → goods, catalog, shared`｜`shop → shop, catalog, shared`｜`catalog → catalog, shared`｜`shared → shared`
- Import alias：`@momo/shared-ui`｜`@momo/shared-util`｜`@momo/catalog-data-access`｜`@momo/catalog-feature-recommendation`｜`@momo/home-data-access`｜`@momo/home-feature-flash-sale`｜`@momo/home-feature-ranking`｜`@momo/home-page`｜`@momo/goods-page`｜`@momo/shop-layout`

### 4. 檔案架構（1 app + 10 packages）

> `home/data-access` 與 `catalog/data-access` 分開的原因：首頁版位（CMS）與商品目錄（Catalog）在真實電商是兩個不同的後端來源，混在一起之後最難拆。兩者只靠 `collection` 字串 key 鬆耦合，互不 import。

```
momo-shop-work/
├─ apps/shop/                              type:app
│  ├─ public/assets/                       素材（資料夾改英文 slug，見 §7）
│  └─ src/
│     ├─ main.tsx
│     ├─ styles.css                        @import tailwind + shared/ui theme.css；@source 掃 packages
│     └─ app/
│        ├─ app.tsx
│        ├─ providers.tsx                  ★ composition root：QueryClient(+onError→telemetry)
│        │                                   + CatalogRepositoryProvider(mock) + HomeRepositoryProvider(mock) + LinkProvider
│        ├─ router.tsx                     ★ 全專案唯一 import react-router 的地方；路徑取自 shared/util paths
│        ├─ router-link.tsx                RR <Link> → shared/ui LinkProvider 的 adapter
│        └─ routes/  home.route.tsx · goods.route.tsx(useParams → props) · not-found.route.tsx
│
├─ packages/shared/ui/                         type:ui  scope:shared   ★ 只收「≥2 個 project 在用」的元件
│  └─ src/
│     ├─ styles/theme.css                  @theme design tokens（品牌粉、價格紅、容器寬、圓角）
│     ├─ link/            LinkProvider + AppLink（預設 <a>）      使用者：ProductCard / layout / home blocks
│     ├─ product-card/    ProductCardItem 型別 + 基底卡片（直式 / 橫式）+ slots（promoText / footer）—— Step 7 修訂：原規劃的 topBadge、priceLabel 沒有使用者，沒做；限時搶購需要時再加
│     │                                                           使用者：home product-rail / flash-sale / ranking / recommendation
│     ├─ price-tag/       售價 + 劃線原價                          使用者：ProductCard / goods-info
│     ├─ carousel/        ★ 唯一 import embla（prev / next / dots / perView）
│     │                                                           使用者：home hero·banner-carousel·product-rail / flash-sale
│     ├─ section-header/                                          使用者：home blocks / ranking / recommendation
│     └─ skeleton/        (P1)                                    使用者：home / recommendation / goods
│
├─ packages/shared/util/                       type:util  scope:shared   ★ 同樣套 Rule of Two
│  └─ src/
│     ├─ format-price.ts     使用者：PriceTag / goods-info
│     ├─ paths.ts            URL 單一來源：paths.home()、paths.goods(id)、pattern 給 router      使用者：app router / 4 個商品區塊
│     └─ telemetry.ts        reportError，sink 可替換（預設 console）；Step 8 修訂：track 沒有呼叫者，沒做                    使用者：home SectionRenderer / app providers
│
├─ packages/catalog/data-access/               type:data-access  scope:catalog
│  └─ src/
│     ├─ index.ts
│     ├─ testing.ts                        次要入口（`exports` 的 `./testing`）：createFakeCatalogRepository + 測試用 Provider wrapper
│     ├─ models/          product.ts · flash-sale.ts · category.ts · page.ts（Page<T>{ items, nextOffset }）
│     ├─ repository/      catalog-repository.ts（interface）
│     │                   mock-catalog-repository.ts（createMockCatalogRepository({ now, latencyMs })）
│     │                   catalog-repository-context.tsx（Provider + useCatalogRepository）
│     ├─ fixtures/        products.generated.ts · collections.ts · categories.ts
│     ├─ hooks/           use-product · use-product-collection · use-recommendations（infinite）
│     │                   use-flash-sale · use-ranking · use-categories
│     └─ query-keys.ts
├─ packages/catalog/feature-recommendation/    type:feature  scope:catalog   你可能會喜歡（詳情頁日後可重用 → 放 catalog 不放 home）
│  └─ src/
│     ├─ recommendation.tsx               container：useRecommendations + 組合
│     ├─ ui/     recommendation-grid.tsx · load-more-button.tsx              ← 私有
│     └─ model/  page-size.ts（ROWS_PER_LOAD 3 × COLUMNS 5 = 15）
│
├─ packages/home/data-access/                  type:data-access  scope:home
│  └─ src/  models/home-section.ts（HomeSection union · Banner · Shortcut）
│               repository/ home-repository.ts · mock-home-repository.ts · home-repository-context.tsx
│               fixtures/home-layout.ts · hooks/use-home-layout.ts
├─ packages/home/feature-flash-sale/           type:feature  scope:home   限時搶購
│  └─ src/
│     ├─ flash-sale.tsx                   container：useFlashSale；每張 slide = 10 件（5 × 2 grid）
│     ├─ ui/     countdown.tsx · flash-sale-header.tsx · stock-left.tsx · grab-badge.tsx   ← 私有
│     └─ model/  get-remaining.ts（純函式）· use-countdown.ts · chunk.ts
├─ packages/home/feature-ranking/              type:feature  scope:home   今日暢銷榜
│  └─ src/  ranking.tsx                                                      （原規劃的 ui/rank-badge 已移除：真站與截圖上都沒有名次）
├─ packages/home/page/                         type:page  scope:home
│  └─ src/
│     ├─ home-page.tsx                    useHomeLayout → <SectionRenderer sections />
│     ├─ section-renderer/  section-renderer.tsx（純：吃 sections props）· registry.ts · section-boundary.tsx(P1)
│     └─ blocks/            hero · banner-carousel · banner-grid · shortcut-bar · notice · product-rail   ← 全部 page 私有
│                           （product-rail = SectionHeader + Carousel + ProductCard + useProductCollection）
│
├─ packages/goods/page/                        type:page  scope:goods
│  └─ src/  goods-detail-page.tsx（props: goodsId；useProduct）
│               ui/ goods-gallery · goods-info · goods-actions（純展示，無 handler）· goods-not-found   ← 私有
│
├─ packages/shop/layout/                       type:layout  scope:shop
│  └─ src/  app-layout.tsx（Header + children + Footer）
│               ui/    top-bar（sticky；捲動後 compact 顯示搜尋框）· main-header（logo + 搜尋框展示）
│                      category-nav（橫向分類 + 展開「選擇分類」面板）· footer                       ← 私有
│               model/ use-compact-header.ts（IntersectionObserver）
│
├─ tools/gen-fixtures.mjs                  掃 public/assets → 產生 products.generated.ts（決定性，不用亂數）
├─ docs/  architecture.md · adr/0001~0005 · agent-workflow.md
├─ .github/workflows/ci.yml                (P1)
├─ eslint.config.mjs                       depConstraints + no-restricted-imports 在這
└─ README.md
```

每個 package 只透過 `src/index.ts` 對外（public API）；測試檔 `*.spec.ts(x)` 與原始碼同層。

### 5. 首頁 config-driven 設計

```ts
type Banner   = { id: string; imageUrl: string; alt: string; caption?: string };  // 不可點
type Shortcut = { id: string; iconUrl: string; label: string };

type HomeSection =
  | { id: string; type: 'hero';            banners: Banner[]; aside: { title: string; items: Banner[] } }
  | { id: string; type: 'banner-carousel'; title?: string; perView: number; banners: Banner[] }
  | { id: string; type: 'banner-grid';     title?: string; columns: number; banners: Banner[] }
  | { id: string; type: 'shortcut-bar';    items: Shortcut[] }
  | { id: string; type: 'notice';          banner: Banner }
  | { id: string; type: 'product-rail';    title: string; collection: string }  // CMS 只給 key，商品由 catalog 提供
  | { id: string; type: 'flash-sale';      title: string }   // ↓ 三個交給 feature package，自己抓資料
  | { id: string; type: 'ranking';         title: string }
  | { id: string; type: 'recommendation';  title: string };
```

- `registry.ts` 以 mapped type 綁定 `type → Component`：**union 新增型別卻沒寫 renderer → 編譯期報錯**。
- 執行期遇到未知 type（未來 API 先上新區塊）→ 不渲染 + `reportError`，頁面不壞。
- `SectionRenderer` 是純元件（吃 `sections` props），抓資料只在 `HomePage` → 好測、好搬。
- **Step 8 修訂（實作後）**：上面的型別是規劃時的樣子，實作時多了版面數值 —— `Banner` 帶原始的 `width` / `height`；標題是 `SectionTitle { lead?, text }`；`banner-carousel` 多了 `label`、`gap`；`banner-grid` 多了 `label`；`product-rail` 多了 `card`（直式 / 橫式）與 `perView`。registry 改由 props 傳入 `SectionRenderer`。錯誤回報集中在 app 的 QueryCache。現況以 `docs/architecture.md` §6 為準。
- 每個區塊外包 `SectionBoundary`（P1）：單區塊失敗不影響其他區塊。

13 個業務區塊 → 15 筆 section 設定（官方優惠拆 3 筆）：

| 首頁區塊（由上到下） | section type | 素材資料夾 |
|---|---|---|
| 主要活動 + 今日大牌 | `hero` | 主要活動 |
| 官方優惠：8 格圖示輪播 | `banner-carousel`(perView 8) | 官方優惠 |
| 官方優惠：秒殺/簽到/分次配/領券/看更多 | `shortcut-bar` | 官方優惠（符號圖） |
| 官方優惠：超大牌 左/中/右 | `banner-grid`(3) | 官方優惠（超大牌） |
| 降價好貨 | `product-rail` | 降價好貨 |
| 品牌折扣 | `banner-carousel`（**Step 8 修訂**：原寫 `banner-grid`(6)；目標截圖上有箭頭與圓點，是輪播） | 品牌折扣 |
| 詐騙發票提醒 | `notice` | 發票詐騙提醒 |
| 官方旗艦名店 | `banner-grid`(4) | 官方旗艦名店 |
| momo 店取 | `product-rail` | momo店快取 |
| 信用卡加碼優惠 | `banner-carousel` | 信用卡加碼優惠 |
| 猜你想搜 | `banner-carousel`（caption = 關鍵字；**Step 8 修訂**：同上，是輪播不是 grid） | 猜你想搜 |
| 限時搶購 | `flash-sale` → feature package | 限時搶購 |
| 今日暢銷榜 | `ranking` → feature package（**對照真站後修正**：橫式商品卡、**沒有名次徽章**；它已經沒有自己的邏輯，Step 12 動工前要決定是否還需要獨立的 package） | 今日暢銷榜 |
| moPro 會員專屬價 | `banner-carousel`（**Step 6 修正**：素材是整張做好的促銷磚，品牌、品名、價格都印在圖上 → 用圖磚呈現，不是 `product-rail`。**對照真站後補充**：真站上每張圖會連到商品頁；我們的素材沒有商品編號，所以不可點，列入 Known Gaps） | momopro… |
| 你可能會喜歡（3 列 + 看更多） | `recommendation` → feature package | 你可能會喜歡 |

時間不夠時的砍法：**從 `home-layout.ts` 刪一行**即可下架區塊，不用改元件。

### 6. 資料層

```ts
interface Product {
  id: string;              // 取自素材檔名：15642257_OL_m.webp → "15642257"
  name: string;
  imageUrl: string;
  images: string[];        // 詳情頁 gallery
  price: number;
  originalPrice?: number;
  description: string[];   // 詳情頁商品說明（條列）
}
interface FlashSaleItem extends Product { promoText: string; stockLeft: number }

interface CatalogRepository {
  getProduct(id: string): Promise<Product | null>;
  getCollection(key: string): Promise<Product[]>;          // 未知 key → []
  getRecommendations(p: { offset: number; limit: number }): Promise<Page<Product>>;
  getFlashSale(): Promise<{ endsAt: string; items: FlashSaleItem[] }>;
  getRanking(): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
}
```

- **DI**：`createMockCatalogRepository({ now, latencyMs })` 在 `app/providers.tsx` 建立並用 Context 注入；hooks 透過 `useCatalogRepository()` 取得。測試注入 fake repository（資料量小、可控），不依賴真 fixture。
- `getFlashSale().endsAt` = `now() + N 小時`，不寫死在 fixture（否則倒數會過期）。
- 首頁與詳情頁共用同一份 product fixture（single source of truth），所以每張商品卡都點得進詳情頁。
- fixtures 用 `.ts` + `satisfies`，型別錯在編譯期就擋下；由 `tools/gen-fixtures.mjs` 決定性產生（同輸入同輸出，diff 乾淨）。
- **Step 6 實作後的修正**：同一個商品 id 會出現在多個區塊的素材裡 → 一份商品表，集合只存 id；`Category` 只有 `id` 與 `name`（面板的色調是「第幾列」決定的，屬於 layout）；分類清單手寫（從真站讀來的，沒有素材可以產生）；`Product` 的 `images` 依內容去重；品牌刻意用虛構的。
- 促銷資料暫放 catalog；促銷邏輯變多再抽 `promotion/data-access`（寫進 ADR）。

### 7. 素材搬遷（中文資料夾 → 英文 slug，避免 URL encode 問題）

`logo→brand`｜`Footer→footer`｜`主要活動→home/main-events`（今日大牌→`today-brand`）｜`官方優惠→home/official-deals`｜`降價好貨→home/price-drop`｜`品牌折扣→home/brand-discount`｜`發票詐騙提醒→home/fraud-notice`｜`官方旗艦名店→home/flagship-stores`｜`momo店快取→home/store-pickup`｜`信用卡加碼優惠→home/card-offers`｜`猜你想搜→home/search-suggest`｜`限時搶購→home/flash-sale`｜`今日暢銷榜→home/best-sellers`｜`momopro…→home/mopro`｜`你可能會喜歡→home/recommendations`

### 8. 測試策略（TDD 只打有邏輯的地方）

| # | 對象 | 驗證什麼 |
|---|---|---|
| 1 | `shared/util` | `formatPrice`（千分位、0）；`paths.goods(id)` |
| 2 | `ProductCard` / `PriceTag` | 名稱 / 售價 / 劃線價；`href` 正確落在連結上；slots 有渲染 |
| 3 | `mock-catalog-repository` | 找得到 / 找不到回 null；未知 collection 回 `[]`；分頁 `nextOffset` 正確、最後一頁為 null；`endsAt` 跟著注入的 `now` |
| 4 | `feature-recommendation` | 注入 fake repo：初始 1 頁 → 點「看更多」增加 → 全部載完按鈕消失 |
| 5 | `SectionRenderer` | 依 type 渲染；未知 type 不渲染且呼叫 `reportError` |
| 6 | `CategoryNav` | 展開 / 收合（`aria-expanded`） |
| 7 | `feature-flash-sale` | `get-remaining`（含過期歸零）；`chunk`；fake timers 下倒數顯示正確 |
| 8 | `GoodsDetailPage` | title / 說明 / 三顆按鈕存在；商品不存在顯示 not-found |
| P2 | Playwright | 首頁 → 點商品卡 → 詳情頁可見 |

不測：純版面區塊（banner 類）、`use-compact-header`（jsdom 無 IntersectionObserver，交給 E2E）—— 刻意的 tradeoff，寫進 README。

### 9. 交付順序與退路

Commit 切片（每片一個 commit，帶 `Co-Authored-By`）—— **walking skeleton 先行，不可砍的先做**：

1. `chore:` Nx scaffold
2. `chore:` 10 packages + tags + boundary rules + restricted imports
3. `docs:` architecture + ADR（設計先於實作，留在 git history）
4. `feat(shop):` walking skeleton — router + providers + layout 空殼 + 兩個空頁面（此時兩條路由已可走通）
5. `chore(assets):` 素材搬遷 + `gen-fixtures` + `catalog/data-access`（TDD #3）
6. `feat(shared):` util（TDD #1）+ ui：ProductCard / PriceTag / Carousel / SectionHeader / Link（TDD #2）
7. `feat(layout):` TopBar sticky / MainHeader / CategoryNav（TDD #6）/ Footer
8. `feat(home):` home/data-access + SectionRenderer（TDD #5）+ 6 個 blocks
9. `feat(recommendation):` 3 列 + 看更多（TDD #4）
10. `feat(goods):` 詳情頁（TDD #8）
11. `feat(flash-sale):` 倒數 + 2 列輪播（TDD #7）→ 12. `feat(ranking)`
13. `docs:` README（tradeoff / known gaps / 演進）+ `ci:`

- **砍功能順序（先砍 → 後砍）**：Playwright → CI → SectionBoundary / Skeleton → ranking → flash-sale → 信用卡 / 猜你想搜區塊。**不砍**：首頁骨架、recommendation、goods detail、README。
- **退路**：Nx scaffold 超過 10 分鐘仍卡住 → 改單一 Vite app，`src/libs/*` 保留同樣目錄 + `eslint-plugin-boundaries` 維持同一套依賴規則。

### 10. ADR 清單（後續演進方向）

| ADR | 決策 | 演進觸發條件 |
|---|---|---|
| 0001 | SPA（Vite）而非 Next | 需要 SEO / LCP → RR framework mode 或 Next；因 router 只在 app 層、Link 由 app 注入、資料走 Query，遷移面小 |
| 0002 | 單一 app + domain packages | `/live`、`/discover`、商家後台由不同團隊負責 → 拆 multi-app / Module Federation |
| 0003 | 只有 TanStack Query，無全域 store | 出現購物車 / 會員 → 輕量 store；購物車 × 優惠券 × 結帳跨 domain → **Redux Toolkit**；state 一律包在 data-access hooks 後面，抽換不動 feature |
| 0004 | 首頁 config-driven | 接 CMS API 時只換 `home/data-access` 的 repository 實作 |
| 0005 | Repository + Context 注入，而非 MSW | 要做 contract test / 網路層模擬時再引入 MSW |
