開始與 AI / Agents 協作開發。
時間將以：
First Commit 至最後 Commit
或第一個 Commit 後約 120 分鐘內的 Commits
作為主要參考。


## 逐步的步驟
先請AI列出實做步驟

> 依據：Phase 1 架構 v2。共 **13 步 = 13 個 commit**（+ P2 加分項）。每一步都是「可獨立驗證、可獨立 review、commit 後 main 永遠是綠的」。
> 架構設計（為什麼這樣切、依賴規則、檔案架構）看 Phase 1；這裡只放「怎麼一步一步做出來」。
> ⚠ 依本頁開頭的計時規則：**Step 1 的 commit = 計時開始，commit 前會先跟你確認。**

### 協作規則（Human ↔ Agent）

每一步固定走這個迴圈，Agent 不跳步、不偷做下一步：

1. **Agent 實作**：有 TDD 項目的先寫測試 → 確認紅燈（且是因為正確的理由紅）→ 寫最小實作 → 綠燈。
2. **Agent 驗證**：跑該步的「驗證」指令，貼出實際輸出（失敗就照實說，不粉飾）。
3. **Agent 回報**：變更檔案清單 + 驗證結果 + 有沒有偏離設計（有的話說明原因）。
4. **你 review**：看該步的「Review 重點」。OK → Agent commit；不 OK → 修到 OK 才 commit。
5. **Commit**：Conventional Commits + `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`。

- 想省時間：你可以說「連做到 Step N」，Agent 會每步照樣驗證 + commit，但只在 Step N 停下來回報。
- 設計有變動：先改 Phase 1 筆記 / `docs/architecture.md`，再改 code（設計文件永遠是 source of truth）。
- **每步 commit 後**，Agent 在本頁最下方的「完成項目」追加一行：`Step N｜完成了什麼｜commit hash｜完成時間`（讓下一個 session 的 AI 也知道做到哪）。
- 同時在 repo 的 `docs/agent-workflow.md` 追加一行（做了什麼 / 你糾正了什麼）→ 對應考題的「Agent 協作效率評估」。

### 總覽

| Step | 產出 | Commit | TDD | 預估 | 可砍 |
|---|---|---|---|---|---|
| 1 | Nx workspace + `shop` app 可 build | `chore: scaffold nx workspace` | — | 6m | ✗ |
| 2 | 10 libs + tags + boundary lint | `chore: add domain libs and module boundary rules` | — | 8m | ✗ |
| 3 | architecture.md + ADR ×5 + agent-workflow.md | `docs: add architecture and ADRs` | — | 3m | ✗ |
| 4 ★ | Walking skeleton：兩條路由走得通 | `feat(shop): walking skeleton with routing and shell` | paths、AppLink | 7m | ✗ |
| 5 | 素材 + fixtures + catalog/data-access | `feat(catalog): mock repository, fixtures and query hooks` | #3 | 8m | ✗ |
| 6 | shared util / ui | `feat(shared): price formatting and core ui components` | #1 #2 | 8m | ✗ |
| 7 | Header(sticky) + 分類展開 + Footer | `feat(shell): sticky header, category nav and footer` | #6 | 7m | ✗ |
| 8 ★ | 首頁 config-driven + 6 blocks | `feat(home): config-driven section renderer and blocks` | #5 | 10m | ✗ |
| 9 | 你可能會喜歡：3 列 + 看更多 | `feat(recommendation): paginated grid with load more` | #4 | 5m | ✗ |
| 10 ★ | 商品詳情頁（純展示） | `feat(goods): display-only goods detail page` | #8 | 5m | ✗ |
| 11 | 限時搶購：倒數 + 2 列輪播 | `feat(flash-sale): countdown and two-row carousel` | #7 | 6m | ✓ |
| 12 | 今日暢銷榜 | `feat(ranking): best sellers with rank badge` | — | 3m | ✓ |
| 13 ★ | README + CI | `docs: readme with tradeoffs and roadmap` / `ci: nx affected` | — | 6m | README ✗ / CI ✓ |
| P2 | Playwright / SectionBoundary / Skeleton / 部署 | 各自一個 commit | — | 有剩才做 | ✓ |

> **誠實的時間評估**：不可砍的路徑（1–10 + 13）約 **73 分鐘**，全部做完約 **82 分鐘**，還沒算你 review 的時間。如果只剩 60 分鐘：Step 10 做完就直接跳 Step 13（README 不可省，它是評分項），11 / 12 放棄並在 README 的 Known Gaps 寫明。★ = 里程碑，建議至少在這四步停下來看畫面。

---

### Step 1 — Nx scaffold　`6m`

**目標**：空資料夾 → 可 build、可 test 的 Nx + React + Vite workspace。
- [ ] 在 `D:\repo` 以 `create-nx-workspace` 建立（preset react-monorepo、app 名 `shop`、bundler vite、vitest、pnpm、不開 Nx Cloud、`--skipGit`）；確切 flags 以當下 Nx 版本為準。若因 `momo-shop-work` 已存在而失敗 → 建在暫存名稱再把內容搬進去。
- [ ] `git init -b main`；確認 `.gitignore` 含 `node_modules` `dist` `.nx`。
- [ ] TypeScript `strict: true`；`package.json` 加 `engines.node`。
- [ ] 刪掉 scaffold 的歡迎頁樣板（`nx-welcome`）。

**驗證**：`pnpm nx build shop`、`pnpm nx test shop`
**Review 重點**：目錄是否乾淨、沒有多餘樣板。
**退路**：超過 10 分鐘仍卡住 → 改單一 Vite app（Phase 1 §9）。
**Commit**：`chore: scaffold nx workspace (react 19 + vite + vitest)`　⚠ 計時開始

### Step 2 — 10 libs + 依賴規則　`8m`

**目標**：架構的「骨架與法律」先到位，之後每一行 code 都受 lint 約束。
- [ ] 用 `@nx/react:lib` 產生 10 個 lib（路徑、import alias、tags 依 Phase 1 §3 / §4）：
  `shared/ui` `shared/util` `catalog/data-access` `catalog/feature-recommendation` `home/data-access` `home/feature-flash-sale` `home/feature-ranking` `home/page` `goods/page` `shell/feature`
- [ ] `apps/shop` 標 `type:app`。
- [ ] `eslint.config.mjs`：`@nx/enforce-module-boundaries` 的 `depConstraints`（type 6 條 + scope 5 條）。
- [ ] `no-restricted-imports`：`libs/**` 禁 `react-router`；`libs/shared/ui` 以外禁 `embla-carousel-react`。
- [ ] 每個 lib 的 `index.ts` 只留最小 stub（3 個 feature lib 先匯出 placeholder container，讓 Step 8 的 registry 編得過）。
- [ ] **負向驗證**：暫時在 `home/feature-ranking` import `home/feature-flash-sale` → 確認 lint **報錯** → 還原。（證明規則真的有在擋）

**驗證**：`pnpm nx run-many -t lint test`、`pnpm nx graph`（看依賴圖）
**Review 重點**：tags 是否與 Phase 1 §3 的表一致；負向驗證的錯誤訊息。
**Commit**：`chore: add domain libs and module boundary rules`

### Step 3 — 設計文件進 repo　`3m`

**目標**：設計先於實作，留在 git history 裡給面試官看。
- [ ] `docs/architecture.md`：Phase 1 筆記 v2 整理版（含 mermaid 依賴圖）。
- [ ] `docs/adr/0001~0005-*.md`：每份 = Context / Decision / Consequences / 演進觸發條件（短）。
- [ ] `docs/agent-workflow.md`：協作規則 + **設計階段你糾正 Agent 的 3 次紀錄**（① 詳情頁不做互動 ② 首頁區塊要拆 feature ③ shared/ui 的 Rule of Two）+ v1→v2 自我審查的 8 點。

**驗證**：Markdown 連結 / mermaid 可渲染。
**Review 重點**：ADR 的 tradeoff 說法是否是你面試時願意講的版本。
**Commit**：`docs: add architecture, ADRs and agent workflow log`

### Step 4 ★ — Walking skeleton　`7m`

**目標**：最薄的一條端到端：`/` 與 `/goods/:goodsId` 都走得通，外面包著 shell。之後每一步都只是「把空殼填滿」。
- [ ] 安裝：`react-router`、`@tanstack/react-query`、`tailwindcss` + `@tailwindcss/vite`。
- [ ] **TDD**：`shared/util/paths.ts` — `paths.home()`、`paths.goods(id)`、route pattern。
- [ ] **TDD**：`shared/ui/link` — `AppLink` 預設渲染 `<a href>`；有 `LinkProvider` 時改用注入的元件。
- [ ] `shared/ui/styles/theme.css`：`@theme` tokens（品牌粉、價格紅、容器寬 1220px）；`apps/shop/src/styles.css` import + `@source` 掃 libs。
- [ ] `apps/shop`：`providers.tsx`（QueryClient + LinkProvider）、`router.tsx`（lazy routes、路徑取自 `paths`）、`router-link.tsx`、3 個 route 檔。
- [ ] `shell/feature`：`ShellLayout` 空殼（Header / Footer 先放文字）。
- [ ] `home/page`、`goods/page`：placeholder（goods 顯示收到的 `goodsId`）。

**驗證**：`pnpm nx run-many -t lint test` + `pnpm nx build shop` + 開 dev server 手動走 `/`、`/goods/123`、`/nope`（404）
**Review 重點**：`react-router` 是否只出現在 `apps/shop`；Tailwind token 有沒有生效。
**Commit**：`feat(shop): walking skeleton with routing, providers and shell`

### Step 5 — 素材 + Catalog 資料層　`8m`

**目標**：所有商品資料的單一來源 + 可抽換的 repository。
- [ ] 素材 `D:\repo\momo素材` → `apps/shop/public/assets/`（依 Phase 1 §7 的 slug 對照；只搬用得到的）。
- [ ] `tools/gen-fixtures.mjs`：掃 `public/assets` → `products.generated.ts`（id 取自檔名、名稱 / 價格決定性產生、不用亂數）；`collections.ts`、`categories.ts`（分類取自截圖的 41 個）。
- [ ] models：`Product`、`FlashSaleItem`、`Category`、`Page<T>`。
- [ ] **TDD #3**：`createMockCatalogRepository({ now, latencyMs })`
  - [ ] `getProduct`：存在 → 商品；不存在 → `null`
  - [ ] `getCollection`：未知 key → `[]`
  - [ ] `getRecommendations`：`nextOffset` 正確；最後一頁 → `null`
  - [ ] `getFlashSale`：`endsAt` 跟著注入的 `now`
- [ ] `CatalogRepositoryProvider` + `useCatalogRepository`；6 個 query hooks；`query-keys.ts`。
- [ ] `testing.ts` 次要入口：`createFakeCatalogRepository` + 測試用 wrapper。
- [ ] `app/providers.tsx` 注入 mock repository（composition root）。

**驗證**：`pnpm nx test catalog-data-access`、`pnpm nx lint catalog-data-access`
**Review 重點**：`CatalogRepository` interface 是不是你心中「真 API 會長的樣子」；repo 體積（圖片總大小）。
**Commit**：`feat(catalog): mock repository, generated fixtures and query hooks`

### Step 6 — Shared util / ui　`8m`

**目標**：通過 Rule of Two 的共用元件，全部不認識 domain model。
- [ ] 安裝 `embla-carousel-react`。
- [ ] **TDD #1**：`formatPrice`（`49900 → "49,900"`、`0`）。
- [ ] **TDD #2**：`PriceTag`（售價；有 `originalPrice` 才出現劃線價）。
- [ ] **TDD #2**：`ProductCard`（`ProductCardItem` 最小形狀；名稱 / 圖 / 價格；`href` 落在連結上；slots：`topBadge` `promoText` `footer` `priceLabel`）。
- [ ] `Carousel`（embla 包裝：prev / next / dots / `perView`）、`SectionHeader`。
- [ ] `index.ts` 只匯出上述公開 API。

**驗證**：`pnpm nx test shared-ui shared-util`、`pnpm nx lint shared-ui`
**Review 重點**：`shared/ui` 有沒有 import 任何 data-access（不該有）；`ProductCard` 的 props 是否夠用又不過度。
**Commit**：`feat(shared): price formatting and core ui components`

### Step 7 — Shell：Header / 分類 / Footer　`7m`

**目標**：所有頁面共用的外框，對照截圖 1–4。
- [ ] `ui/top-bar`：`position: sticky`；主 header 捲出畫面後進入 compact（出現搜尋框）— `model/use-compact-header`（IntersectionObserver）。
- [ ] `ui/main-header`：logo（連回首頁）+ 搜尋框（**純展示**）+ 右側活動圖。
- [ ] **TDD #6**：`ui/category-nav` — 橫向分類列；點箭頭展開「選擇分類」面板；`aria-expanded` 正確；再點收合。資料來自 `useCategories`。
- [ ] `ui/footer`：深藍區塊（素材 `footer/`）。
- [ ] 以上全部為 lib 私有，`index.ts` 只匯出 `ShellLayout`。

**驗證**：`pnpm nx test shell-feature` + dev server 手動捲動確認 sticky / compact
**Review 重點**：與截圖的差異；捲動時是否只保留 TopBar。
**Commit**：`feat(shell): sticky header, expandable category nav and footer`

### Step 8 ★ — 首頁 config-driven　`10m`

**目標**：13 個業務區塊由 `HomeSection[]` 驅動渲染。
- [ ] `home/data-access`：`HomeSection` union、`Banner`、`Shortcut`；`home-layout.ts`（15 筆設定）；`HomeRepository` + Provider + `useHomeLayout`；app 注入。
- [ ] `shared/util/telemetry.ts`：`reportError` / `track`，sink 可替換（同時接到 `app/providers` 的 QueryClient `onError` → 滿足 Rule of Two）。
- [ ] **TDD #5**：`SectionRenderer`
  - [ ] 依 `type` 渲染對應元件
  - [ ] 未知 `type` → 不渲染、不 throw、呼叫 `reportError`
- [ ] `registry.ts`：mapped type（漏寫 renderer → 編譯錯誤）；3 個 feature type 先指向 Step 2 的 placeholder。
- [ ] 6 個私有 blocks：`hero`、`banner-carousel`、`banner-grid`、`shortcut-bar`、`notice`、`product-rail`（商品卡連到 `paths.goods(id)`）。
- [ ] `HomePage`：`useHomeLayout` → loading / error / `<SectionRenderer>`。

**驗證**：`pnpm nx run-many -t lint test` + `pnpm nx build shop` + dev server 對照截圖由上到下檢查；點降價好貨的商品 → 進到 `/goods/:id`
**Review 重點**：調換 `home-layout.ts` 兩行順序，畫面順序是否跟著變（證明 config-driven）。
**Commit**：`feat(home): config-driven section renderer and cms blocks`

### Step 9 — 你可能會喜歡　`5m`

**目標**：3 列後出現「看更多」，點擊再載入 3 列，載完按鈕消失。
- [ ] `model/page-size.ts`：`ROWS_PER_LOAD(3) × COLUMNS(5) = 15`。
- [ ] **TDD #4**（注入 fake repo，例如 7 筆、每頁 3 筆）
  - [ ] 初始只顯示第 1 頁
  - [ ] 點「看更多」→ 數量增加
  - [ ] 最後一頁載完 →「看更多」消失
- [ ] `ui/recommendation-grid`、`ui/load-more-button`（私有）；`recommendation.tsx` 用 `useRecommendations`（`useInfiniteQuery`）。
- [ ] `home/page` registry 換成真的元件。

**驗證**：`pnpm nx test catalog-feature-recommendation` + dev server：55 件 → 15 / 30 / 45 / 55
**Review 重點**：`LoadMoreButton` 確實留在 feature 私有 `ui/`，沒有跑到 shared。
**Commit**：`feat(recommendation): paginated product grid with load more`

### Step 10 ★ — 商品詳情頁（純展示）　`5m`

**目標**：左商品圖、右 title + 商品說明、下方三顆按鈕、Footer。**不做任何互動。**
- [ ] **TDD #8**
  - [ ] 商品存在 → title、商品說明（條列）、價格、`直接購買` `放入購物車` `加入追蹤` 三顆按鈕都在
  - [ ] 商品不存在 → `goods-not-found`
- [ ] 私有 `ui/`：`goods-gallery`（主圖）、`goods-info`、`goods-actions`（**無 onClick**）、`goods-not-found`。
- [ ] `GoodsDetailPage({ goodsId })`；`goods.route.tsx` 負責 `useParams → props`。

**驗證**：`pnpm nx test goods-page` + dev server：從首頁任一商品卡點進來；直接開 `/goods/不存在`
**Review 重點**：三顆按鈕點了什麼都不會發生（符合 Phase 1 規則）。
**Commit**：`feat(goods): display-only goods detail page`

> ⏱ **檢查點**：此時「你要求的兩個頁面」都已完成。看剩餘時間決定做 11 / 12 還是直接跳 13。

### Step 11 — 限時搶購　`6m`　（可砍）

- [ ] **TDD #7**：`model/get-remaining(endsAt, now)`（含過期歸零）、`model/chunk`；fake timers 下 `countdown` 顯示正確。
- [ ] 私有 `ui/`：`flash-sale-header`（粉底 + 倒數）、`countdown`、`stock-left`、`grab-badge`；每張 slide = 10 件（5 × 2）。
- [ ] registry 換成真的元件。

**驗證**：`pnpm nx test home-feature-flash-sale` + dev server 看倒數有在跳
**Commit**：`feat(flash-sale): countdown and two-row product carousel`

### Step 12 — 今日暢銷榜　`3m`　（可砍）

- [ ] `ranking.tsx` + 私有 `ui/rank-badge`（透過 `ProductCard` 的 `topBadge` slot）；registry 換成真的元件。

**驗證**：`pnpm nx test home-feature-ranking`、dev server
**Commit**：`feat(ranking): best sellers with rank badge`

### Step 13 ★ — README + CI　`6m`

**目標**：把自己當成這個系統的長期維護者來寫。
- [ ] `README.md`：如何啟動 / 測試；架構一頁摘要（連到 `docs/`）；**Tradeoffs**；**與真實網站的差異（Known Gaps）**；**後續演進**（multi-app、SSR、RTK、CMS API、MSW）；Agent 協作方式與效率分析（連到 `agent-workflow.md`）。
- [ ] 沒做完的步驟照實寫進 Known Gaps（不假裝有做）。
- [ ] `.github/workflows/ci.yml`：`pnpm nx affected -t lint test build`（可砍）。

**驗證**：`pnpm nx run-many -t lint test build` 全綠；照 README 的指令從零跑一次
**Commit**：`docs: readme with tradeoffs, known gaps and roadmap`、`ci: run nx affected on push`

### P2 — 有剩時間才做（各自獨立 commit）

- [ ] `test(e2e)`：Playwright smoke — 首頁 → 點商品卡 → 詳情頁 title 可見。
- [ ] `feat(home)`：`SectionBoundary`（react-error-boundary）— 單一區塊失敗不拖垮整頁 + `reportError`。
- [ ] `feat(shared)`：`Skeleton` loading 狀態。
- [ ] `chore(deploy)`：靜態部署（Cloudflare Pages / GitHub Pages）+ README 放網址。


## 完成項目
裡面要包含完成甚麼以及完成時間,讓AI 可以知道我們已經做完了

> Repo：https://github.com/zach0627/momo-shop-work （public）｜**計時起點：2026-09-18 16:49（first commit `0f64f2d`）→ 120 分鐘參考線到 18:49**

| Step | 完成了什麼 | Commit | 完成時間 |
|---|---|---|---|
| 1a | 空的 Nx 23 workspace（pnpm workspaces + TS project references）+ `@nx/react`；清掉範本附帶的約 70 個無關檔案；scope 改 `@momo`；建立 public repo 並 push | `0f64f2d` | 09-18 16:49 |
| 1b | `shop` app（React 19 + Vite + Vitest，minimal、無 router）；測試改為同層 `*.spec.tsx`；`.gitattributes` 統一 LF；`lint / test / typecheck / build` 全綠（無快取） | `07e0bcc` | 09-18 16:58 |

**Step 1 與原計畫的偏離（之後寫進 `docs/agent-workflow.md`）**
- Nx 23 的 `react-monorepo` preset 會下載官方示範電商範本且忽略 flags → 不採用，改「空 workspace + generator」。
- `--workspaces=false` 無效 → 採 Nx 現行標準（pnpm workspaces + project references）；`@momo/*` alias 由各 lib 的 package name 提供，Phase 1 設計不受影響。**Step 2 產生 lib 時 tags 寫在各 lib 的 `package.json` → `nx.tags`。**
- pnpm 12 預設擋 postinstall → `allowBuilds` 只明確核准 `nx`、`@swc/core`。
- 環境備註：此機器上每次 `pnpm nx …` 約 20–60 秒、裝依賴約 3 分鐘；`NX_DAEMON=false` 可避免卡住。Step 2 起的時間預估要乘上這個係數。

**下一步：Step 2 — 10 libs + tags + boundary rules**