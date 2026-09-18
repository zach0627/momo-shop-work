開始與 AI / Agents 協作開發。
時間將以：
First Commit 至最後 Commit
或第一個 Commit 後約 120 分鐘內的 Commits
作為主要參考。


## 逐步的步驟
先請AI列出實做步驟

> 依據：Phase 1 架構 v2。共 **13 步 = 13 個 commit**（+ P2 加分項）。每一步都是「可獨立驗證、可獨立 review、commit 後 main 永遠是綠的」。
> 架構設計（為什麼這樣切、依賴規則、檔案架構）看 Phase 1；這裡只放「怎麼一步一步做出來」。

### 協作規則（Human ↔ Agent）

每一步固定走這個迴圈，Agent 不跳步、不偷做下一步：

1. **Agent 實作**：有 TDD 項目的先寫測試 → 確認紅燈（且是因為正確的理由紅）→ 寫最小實作 → 綠燈。
2. **Agent 驗證**：跑該步的「驗證」指令，貼出實際輸出（失敗就照實說，不粉飾）。
3. **Agent 回報**：變更檔案清單 + 驗證結果 + 有沒有偏離設計（有的話說明原因）。
4. **你 review**：看該步的「Review 重點」。OK → Agent commit；不 OK → 修到 OK 才 commit。
5. **Commit**：Conventional Commits + `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`。

- 想一次多做幾步：你可以說「連做到 Step N」，Agent 會每步照樣驗證 + commit，但只在 Step N 停下來回報。
- 設計有變動：先改 Phase 1 筆記 / `docs/architecture.md`，再改 code（設計文件永遠是 source of truth）。
- **每步 commit 後**，Agent 在本頁最下方的「完成項目」追加一行：`Step N｜完成了什麼｜commit hash`（讓下一個 session 的 AI 也知道做到哪）。
- 同時在 repo 的 `docs/agent-workflow.md` 追加一行（做了什麼 / 你糾正了什麼）→ 對應考題的「Agent 協作效率評估」。

### 總覽

| 狀態 | Step | 產出 | Commit | TDD | 可砍 |
|---|---|---|---|---|---|
| ✅ | 1 | Nx workspace + `shop` app 可 build | `chore: scaffold nx workspace` | — | ✗ |
| ✅ | 2 | 10 libs + tags + boundary lint | `chore: add domain libs and module boundary rules` | — | ✗ |
| ✅ | 3 | architecture.md + ADR ×6 + agent-workflow.md + CLAUDE.md + 邊界驗證工具 + OpenSpec | `docs: add architecture and ADRs` | — | ✗ |
| ✅ | 4 ★ | Walking skeleton：兩條路由走得通（+ 兩層 design token） | `feat(shop): walking skeleton with routing and shell` | paths、AppLink | ✗ |
| ✅ | 5 ★ | **Layout**：TopBar(fixed→compact) + Header + 分類展開 + Footer（原 Step 7，提前） | 依內容拆分 | 分類展開、搜尋框、compact | ✗ |
| ⬜ | 6 | 素材 + fixtures + catalog/data-access | `feat(catalog): mock repository, fixtures and query hooks` | #3 | ✗ |
| ⬜ | 7 | shared util / ui | `feat(shared): price formatting and core ui components` | #1 #2 | ✗ |
| ⬜ | 8 ★ | 首頁 config-driven + 6 blocks | `feat(home): config-driven section renderer and blocks` | #5 | ✗ |
| ⬜ | 9 | 你可能會喜歡：3 列 + 看更多 | `feat(recommendation): paginated grid with load more` | #4 | ✗ |
| ⬜ | 10 ★ | 商品詳情頁（純展示） | `feat(goods): display-only goods detail page` | #8 | ✗ |
| ⬜ | 11 | 限時搶購：倒數 + 2 列輪播 | `feat(flash-sale): countdown and two-row carousel` | #7 | ✓ |
| ⬜ | 12 | 今日暢銷榜 | `feat(ranking): best sellers with rank badge` | — | ✓ |
| ⬜ | 13 ★ | README + CI | `docs: readme with tradeoffs and roadmap` / `ci: nx affected` | — | README ✗ / CI ✓ |
| ⬜ | P2 | Playwright / SectionBoundary / Skeleton / 部署 | 各自一個 commit | — | ✓ |

> ★ = 里程碑，建議至少在這四步停下來看畫面。不可砍的路徑是 Step 1–10 + 13；Step 11 / 12 若最後沒做，要在 README 的 Known Gaps 照實寫明。

---

### Step 1 — Nx scaffold ✅

**目標**：空資料夾 → 可 build、可 test 的 Nx + React + Vite workspace。
- [x] 在 `D:\repo` 以 `create-nx-workspace` 建立（preset react-monorepo、app 名 `shop`、bundler vite、vitest、pnpm、不開 Nx Cloud、`--skipGit`）；確切 flags 以當下 Nx 版本為準。若因 `momo-shop-work` 已存在而失敗 → 建在暫存名稱再把內容搬進去。
  - ↳ **實際做法不同**：Nx 23 的 `react-monorepo` preset 會下載官方示範電商範本並忽略 flags → 改用 `--template=empty` + `@nx/react:app` generator（`--minimal`、無 router）。
- [x] `git init -b main`；確認 `.gitignore` 含 `node_modules` `dist` `.nx`。
- [x] TypeScript `strict: true`；`package.json` 加 `engines.node`。
  - ↳ `strict` 在 Step 1 就有；**`engines.node` 當時漏做**，於規格複查時補上（連同 `packageManager`），值依 Vite 8 的實際要求 `^20.19.0 || >=22.12.0`。
- [x] 刪掉 scaffold 的歡迎頁樣板（`nx-welcome`）。
  - ↳ 用 `--minimal` 產生，樣板從未出現；另外清掉了範本附帶的約 70 個無關檔案。

**驗證**：`pnpm nx build shop`、`pnpm nx test shop`
**Review 重點**：目錄是否乾淨、沒有多餘樣板。
**退路**：超過 10 分鐘仍卡住 → 改單一 Vite app（Phase 1 §9）。
**Commit**：`chore: scaffold nx workspace (react 19 + vite + vitest)`

### Step 2 — 10 libs + 依賴規則 ✅

**目標**：架構的「骨架與法律」先到位，之後每一行 code 都受 lint 約束。
- [x] 用 `@nx/react:lib` 產生 10 個 lib（路徑、import alias、tags 依 Phase 1 §3 / §4）：
  `shared/ui` `shared/util` `catalog/data-access` `catalog/feature-recommendation` `home/data-access` `home/feature-flash-sale` `home/feature-ranking` `home/page` `goods/page` `shop/layout`
  - ↳ `shared/util` 是純函式，改用 `@nx/js:lib`；其餘 9 個用 `@nx/react:lib`。10 個 lib 的 tags 逐一核對過。
  - ↳ 最後一個 lib 建立時叫 `shell/feature`，之後兩度改名，現為 `shop/layout`（`type:layout`、`scope:shop`）。原因見完成紀錄。
- [x] `apps/shop` 標 `type:app`。
- [x] `eslint.config.mjs`：`@nx/enforce-module-boundaries` 的 `depConstraints`（type 6 條 + scope 5 條）。
  - ↳ 之後新增 `type:layout` 一層，現為 **type 7 條** + scope 5 條；`scope:layout` 改名為 `scope:shop`。
- [x] `no-restricted-imports`：`libs/**` 禁 `react-router`；`libs/shared/ui` 以外禁 `embla-carousel-react`。
  - ↳ 實作為「預設全禁、單點放行」：根設定兩個都禁，`apps/shop` 與 `shared/ui` 在自己的 eslint 設定放行。
- [x] 每個 lib 的 `index.ts` 只留最小 stub。
  - ↳ **3 個 feature lib 的 placeholder container 沒做**，延到 Step 8（registry 真的需要時）—— 已移到 Step 8 的清單。
- [x] **負向驗證**：暫時在 `home/feature-ranking` import `home/feature-flash-sale` → 確認 lint **報錯** → 還原。（證明規則真的有在擋）
  - ↳ 實際測了 5 種違規 + 2 個對照組；規格複查時又補測 2 種深層引用（相對路徑由 lint 擋、套件名稱加內部路徑由型別檢查擋）。

**驗證**：`pnpm nx run-many -t lint test`、`pnpm nx graph`（看依賴圖）
**Review 重點**：tags 是否與 Phase 1 §3 的表一致；負向驗證的錯誤訊息。
**Commit**：`chore: add domain libs and module boundary rules`

### Step 3 — 設計文件進 repo ✅

**目標**：設計先於實作，留在 git history 裡給面試官看。
- [x] `docs/architecture.md`：Phase 1 筆記 v2 整理版（含 mermaid 依賴圖）。
  - ↳ 另加了架構復盤後的「lib 粒度準則與拆分觸發條件」。
- [x] `docs/adr/0001~0005-*.md`：每份 = Context / Decision / Consequences / 演進觸發條件（短）。
  - ↳ 多一份 ADR-0006（domain 依賴地圖），每份都有「代價」一節。
- [x] `docs/agent-workflow.md`：協作規則 + **設計階段你糾正 Agent 的 3 次紀錄**（① 詳情頁不做互動 ② 首頁區塊要拆 feature ③ shared/ui 的 Rule of Two）+ v1→v2 自我審查的 8 點。
  - ↳ 糾正紀錄現為 4 次（加上架構復盤）；另有 Agent 出錯與事故紀錄。
- [x] （計畫外）專案自己的 `CLAUDE.md`、README 的 Tradeoffs、`tools/verify-boundaries.mjs`、修正過期的 lockfile、`package.json` 的 `engines`。
- [x] （計畫外）OpenSpec：`openspec/config.yaml`、主規格 `module-boundaries`、change `build-storefront-pages`（proposal / 5 份 spec / design / tasks）；`openspec validate --all --strict` 通過。

**驗證**：Markdown 連結 / mermaid 可渲染。
**Review 重點**：ADR 的 tradeoff 說法是否是你面試時願意講的版本。
**Commit**：`docs: add architecture, ADRs and agent workflow log`

### Step 4 ★ — Walking skeleton ✅

**目標**：最薄的一條端到端：`/` 與 `/goods/:goodsId` 都走得通，外面包著 layout。之後每一步都只是「把空殼填滿」。
- [x] **跨專案依賴的做法（這一步第一次出現）**：要 import 另一個 lib 的專案，先在自己的 `package.json` 宣告 `"@momo/<lib>": "workspace:*"` → `pnpm install` → `pnpm nx sync`。三個動作缺一不可（規格複查時實測：未宣告的 workspace 套件不會被解析到）。
  - ↳ `apps/shop` 宣告 5 個、`shop/layout`（當時名為 `shell/feature`）宣告 2 個；`nx sync` 寫入兩份 tsconfig 的 references。
- [x] 安裝：`react-router`、`@tanstack/react-query`、`tailwindcss` + `@tailwindcss/vite`。
  - ↳ **裝到的是 React Router 8（不是 v7）**。先讀實際安裝版本的型別定義確認 API 還在才動手；v8 要求 Node `>=22.22.0`，`engines` 隨之收緊。
- [x] **TDD**：`shared/util/paths.ts` — `paths.home()`、`paths.goods(id)`、route pattern。
  - ↳ 6 個測試。紅燈時發現「path 符合 pattern」的測試在兩邊都是空字串時會通過 → 補上 pattern 必須以 `/` 開頭的斷言。
- [x] **TDD**：`shared/ui/link` — `AppLink` 預設渲染 `<a href>`；有 `LinkProvider` 時改用注入的元件。
- [x] `shared/ui/styles/theme.css`：`@theme` tokens（品牌粉、價格紅、容器寬 1220px）；`apps/shop/src/styles.css` import + `@source` 掃 libs。
  - ↳ **大幅超出原計畫**：改為 Primitive / Semantic 兩層 token，數值從真實網站的計算樣式量出（見下方完成紀錄）。
- [x] `apps/shop`：`providers.tsx`（QueryClient + LinkProvider）、`router.tsx`（lazy routes、路徑取自 `paths`）、`router-link.tsx`、3 個 route 檔。
  - ↳ 路由測試 4 個 + App smoke 1 個，對應 spec `app-layout`「每個頁面都有共用外框」「Logo 連回首頁」。
- [x] `shop/layout`（當時名為 `shell/feature`）：`AppLayout` 空殼（Header / Footer 先放文字）。
- [x] `home/page`、`goods/page`：placeholder（goods 顯示收到的 `goodsId`）。
- [x] （計畫外）app 與 9 個 React lib 的 tsconfig 補上 DOM 型別庫 —— generator 漏掉的，只有 `typecheck` 抓得到。

**驗證**：`pnpm nx run-many -t lint test` + `pnpm nx build shop` + 開 dev server 手動走 `/`、`/goods/123`、`/nope`（404）
**Review 重點**：`react-router` 是否只出現在 `apps/shop`；Tailwind token 有沒有生效。
**Commit**：`feat(shop): walking skeleton with routing, providers and shell`

### Step 5 ★ — Layout：TopBar / Header / 分類 / Footer ✅

> **順序調整**：這一步原本排在 Step 7（資料層與共用元件之後）。layout 是每一頁的骨架，也是 Phase 1 最先描述的東西（「header scroll 保留區塊」「滑到下面要有 footer」），所以提前到 walking skeleton 之後。原 Step 5、6 順延為 Step 6、7；Step 8 之後不變。
> lib 改過兩次名：`shell/feature` → `layout/feature` → **`shop/layout`**（`@momo/shop-layout`、`type:layout`、`scope:shop`，元件仍是 `AppLayout`）。第二次同時把 layout 升為正式的一層：與 `page` 同層、可以組合 feature、只有 app 能依賴它。

**目標**：所有頁面共用、跨頁保留的外框。對照截圖 `01`–`04`、`15`、`16`；數值用從真站量到的 token。
- [x] 量測真站「選擇分類」展開面板的樣式（膠囊的底色、字色、圓角、間距 —— 目前還沒量），加進 token 與 `docs/design-tokens.md`。
- [x] 素材：先只搬 logo 與 footer 用到的圖到 `apps/shop/public/assets/`（其餘素材留給 Step 6）。資產路徑一律用**相對於文件 base** 的寫法（`assets/...`，靠 `index.html` 的 `<base href>` 解析），libs 不需要知道部署的子路徑。
- [x] **TDD**：`ui/category-nav` — 橫向分類列（17px / 600，「首頁」為作用中：品牌色 + 3px 底線）；點箭頭展開「選擇分類」面板列出全部分類；`aria-expanded` 正確；再點收合。（規格 `app-layout`「分類導覽可展開與收合」）
  - 分類清單先放在本 lib 私有的 `model/`（40 個）；Step 6 資料層完成後搬進 catalog fixtures，`AppLayout` 改讀 `useCategories`。`CategoryNav` 本身只吃 props，屆時不用改。
- [x] **TDD**：`ui/search-box` — 可輸入；送出時 `preventDefault`，不導頁。（規格「搜尋框為展示用」）
- [x] **TDD**：`AppLayout` 的 compact 行為 — 主 header 離開視窗 → TopBar 出現搜尋框；回到視窗 → 恢復。用替身 `IntersectionObserver` 驅動（jsdom 沒有內建）。（規格「頂部列在捲動時保留並轉為 compact」）
- [x] `ui/top-bar`：**`position: fixed`**（真站是 fixed 不是 sticky）、高 40px、背景 `surface-muted`、底線 1px `line-strong`、文字 13px；版面要為它預留 41px。除了「回首頁」以外的項目都是純文字（沒有對應頁面）。
- [x] `ui/main-header`：logo（連回首頁）+ 搜尋框 + 熱搜關鍵字列。右側三張活動小圖沒有素材 → 不做，記入 Known Gaps。
- [x] `ui/footer`：背景 `footer`、內容寬 1220px；防詐騙提醒框（3px `footer-accent-line`、圓角 8px）；六欄連結（標題 19px / 700 `footer-accent`、連結 13px 白字，皆為純文字）。
- [x] 以上全部為 lib 私有，`index.ts` 只匯出 `AppLayout`；移除本 lib 的 `passWithNoTests`。
- [x] （計畫外，Human review 後）查證 Nx 對 layout 的放法並比較三種方案 → 維持現在的位置，寫成 ADR-0007。
- [x] （計畫外，Human review 後）**layout 升為 `type:layout` 一層**，lib 搬到 `libs/shop/layout`。先用探針確認改規則前 layout→feature 會被擋（紅燈），改規則後通過；page→layout、feature→layout、`scope:shop`→`scope:home` 被擋；app→layout 通過。

**驗證**：`pnpm nx run-many -t lint test typecheck`（無快取）+ `pnpm nx build shop` + `pnpm verify:boundaries`；dev server 上實際捲動確認 TopBar 保留並轉 compact、分類面板可展開；**切到 `/goods/:id` 確認 TopBar 與 footer 仍在**；用 `getComputedStyle` 抽查數值與真站一致。
**Review 重點**：與截圖 `01`–`04`、`15` 的差異；商品詳情頁是否保留同一組外框。
**Commit**：依內容拆分（token、各元件、文件），每個 commit 單獨為綠。
### Step 6 — 素材 + Catalog 資料層

**目標**：所有商品資料的單一來源 + 可抽換的 repository。
- [ ] 素材 `D:\repo\momo素材` → `apps/shop/public/assets/`（依 Phase 1 §7 的 slug 對照；只搬用得到的）。
- [ ] `tools/gen-fixtures.mjs`：掃 `public/assets` → `products.generated.ts`（id 取自檔名、名稱 / 價格決定性產生、不用亂數）；`collections.ts`、`categories.ts`（40 個分類，第一項為「首頁」—— **從 layout lib 的私有清單搬過來**，`AppLayout` 改讀 `useCategories`）。
- [ ] models：`Product`、`FlashSaleItem`、`Category`、`Page<T>`。
- [ ] **TDD #3**：`createMockCatalogRepository({ now, latencyMs })`
  - [ ] `getProduct`：存在 → 商品；不存在 → `null`
  - [ ] `getCollection`：未知 key → `[]`
  - [ ] `getRecommendations`：`nextOffset` 正確；最後一頁 → `null`
  - [ ] `getFlashSale`：`endsAt` 跟著注入的 `now`
- [ ] `CatalogRepositoryProvider` + `useCatalogRepository`；6 個 query hooks；`query-keys.ts`。
- [ ] `testing.ts` 次要入口：`createFakeCatalogRepository` + 測試用 wrapper。
- [ ] `app/providers.tsx` 注入 mock repository（composition root）。
- [ ] `shop/layout` 宣告對 `@momo/catalog-data-access` 的依賴（`workspace:*` → `pnpm install` → `pnpm nx sync`），並確認 `pnpm-lock.yaml` 的 importer；`scope:shop` → `scope:catalog` 已在放行清單內。

**驗證**：`pnpm nx test catalog-data-access`、`pnpm nx lint catalog-data-access`
**Review 重點**：`CatalogRepository` interface 是不是你心中「真 API 會長的樣子」；repo 體積（圖片總大小）。
**Commit**：`feat(catalog): mock repository, generated fixtures and query hooks`

### Step 7 — Shared util / ui

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

### Step 8 ★ — 首頁 config-driven

**目標**：13 個業務區塊由 `HomeSection[]` 驅動渲染。
- [ ] `home/data-access`：`HomeSection` union、`Banner`、`Shortcut`；`home-layout.ts`（15 筆設定）；`HomeRepository` + Provider + `useHomeLayout`；app 注入。
- [ ] `shared/util/telemetry.ts`：`reportError` / `track`，sink 可替換（同時接到 `app/providers` 的 QueryClient `onError` → 滿足 Rule of Two）。
- [ ] **TDD #5**：`SectionRenderer`
  - [ ] 依 `type` 渲染對應元件
  - [ ] 未知 `type` → 不渲染、不 throw、呼叫 `reportError`
- [ ] `registry.ts`：mapped type（漏寫 renderer → 編譯錯誤）；3 個 feature lib 各建立一個 placeholder container（從 Step 2 移過來的項目），registry 先指向它們。
- [ ] 6 個私有 blocks：`hero`、`banner-carousel`、`banner-grid`、`shortcut-bar`、`notice`、`product-rail`（商品卡連到 `paths.goods(id)`）。
- [ ] `HomePage`：`useHomeLayout` → loading / error / `<SectionRenderer>`。

**驗證**：`pnpm nx run-many -t lint test` + `pnpm nx build shop` + dev server 對照截圖由上到下檢查；點降價好貨的商品 → 進到 `/goods/:id`
**Review 重點**：調換 `home-layout.ts` 兩行順序，畫面順序是否跟著變（證明 config-driven）。
**Commit**：`feat(home): config-driven section renderer and cms blocks`

### Step 9 — 你可能會喜歡

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

### Step 10 ★ — 商品詳情頁（純展示）

**目標**：左商品圖、右 title + 商品說明、下方三顆按鈕、Footer。**不做任何互動。**
- [ ] **TDD #8**
  - [ ] 商品存在 → title、商品說明（條列）、價格、`直接購買` `放入購物車` `加入追蹤` 三顆按鈕都在
  - [ ] 商品不存在 → `goods-not-found`
- [ ] 私有 `ui/`：`goods-gallery`（主圖）、`goods-info`、`goods-actions`（**無 onClick**）、`goods-not-found`。
- [ ] `GoodsDetailPage({ goodsId })`；`goods.route.tsx` 負責 `useParams → props`。

**驗證**：`pnpm nx test goods-page` + dev server：從首頁任一商品卡點進來；直接開 `/goods/不存在`
**Review 重點**：三顆按鈕點了什麼都不會發生（符合 Phase 1 規則）。
**Commit**：`feat(goods): display-only goods detail page`

> **檢查點**：此時「你要求的兩個頁面」都已完成。

### Step 11 — 限時搶購　（可砍）

- [ ] **TDD #7**：`model/get-remaining(endsAt, now)`（含過期歸零）、`model/chunk`；fake timers 下 `countdown` 顯示正確。
- [ ] 私有 `ui/`：`flash-sale-header`（粉底 + 倒數）、`countdown`、`stock-left`、`grab-badge`；每張 slide = 10 件（5 × 2）。
- [ ] registry 換成真的元件。

**驗證**：`pnpm nx test home-feature-flash-sale` + dev server 看倒數有在跳
**Commit**：`feat(flash-sale): countdown and two-row product carousel`

### Step 12 — 今日暢銷榜　（可砍）

- [ ] `ranking.tsx` + 私有 `ui/rank-badge`（透過 `ProductCard` 的 `topBadge` slot）；registry 換成真的元件。

**驗證**：`pnpm nx test home-feature-ranking`、dev server
**Commit**：`feat(ranking): best sellers with rank badge`

### Step 13 ★ — README + CI

**目標**：把自己當成這個系統的長期維護者來寫。
- [ ] `README.md`：如何啟動 / 測試；架構一頁摘要（連到 `docs/`）；**Tradeoffs**；**與真實網站的差異（Known Gaps）**；**後續演進**（multi-app、SSR、RTK、CMS API、MSW）；Agent 協作方式與效率分析（連到 `agent-workflow.md`）。
- [ ] 沒做完的步驟照實寫進 Known Gaps（不假裝有做）。
- [ ] `.github/workflows/ci.yml`：`pnpm nx affected -t lint test build`（可砍）。

**驗證**：`pnpm nx run-many -t lint test build` 全綠；照 README 的指令從零跑一次
**Commit**：`docs: readme with tradeoffs, known gaps and roadmap`、`ci: run nx affected on push`

### P2 — 加分項（各自獨立 commit）

- [ ] `test(e2e)`：Playwright smoke — 首頁 → 點商品卡 → 詳情頁 title 可見。
- [ ] `feat(home)`：`SectionBoundary`（react-error-boundary）— 單一區塊失敗不拖垮整頁 + `reportError`。
- [ ] `feat(shared)`：`Skeleton` loading 狀態。
- [ ] `chore(deploy)`：靜態部署（Cloudflare Pages / GitHub Pages）+ README 放網址。


## 完成項目
裡面要包含完成甚麼,讓AI 可以知道我們已經做完了

> Repo：https://github.com/zach0627/momo-shop-work （public）

| Step | 完成了什麼 | Commit |
|---|---|---|
| 1a | 空的 Nx 23 workspace（pnpm workspaces + TS project references）+ `@nx/react`；清掉範本附帶的約 70 個無關檔案；scope 改 `@momo`；建立 public repo 並 push | `0f64f2d` |
| 1b | `shop` app（React 19 + Vite + Vitest，minimal、無 router）；測試改為同層 `*.spec.tsx`；`.gitattributes` 統一 LF；`lint / test / typecheck / build` 全綠（無快取） | `07e0bcc` |
| — | 規劃筆記（本資料夾）複製進 repo `docs/MoMO面試/` | `b88ee0e` |
| — | 17 張真站截圖進 `docs/pictures/`（依頁面順序重新命名）；repo 內 Phase 1 的圖片改為 GitHub 可渲染的標準語法；2 張登入狀態截圖的帳號姓名已在複本上遮蓋（vault 原圖未動） | `a42640b` |
| 2 | 10 個 lib（`@nx/react:lib` ×9、`@nx/js:lib` ×1）+ tags；`depConstraints`（type 6 條 + scope 5 條）；`no-restricted-imports`（預設全禁，`apps/shop` 放行 router、`shared/ui` 放行 embla）；各 lib README 改寫為職責說明；移除用不到的 `.babelrc` 與範例碼 | `4e44054` |
| — | 移除計畫中所有時間紀錄與時間預估；記錄「專案維持在 D: 槽」的決定 | `d4cfdd3` |
| 3 | `docs/architecture.md`、ADR ×6（新增 0006：domain 依賴地圖）、`docs/agent-workflow.md`、專案自己的 `CLAUDE.md`、README（含照實寫的 Tradeoffs）；`tools/verify-boundaries.mjs` + `pnpm verify:boundaries`；9 個 lib 補上 `"private": true` | `b414f2e` |
| — | 修正過期的 `pnpm-lock.yaml`（缺 8 個 lib 的 importer 條目 → 全新 clone 的 `--frozen-lockfile` 會失敗）；在乾淨環境驗證通過 | `43bff8d` |
| — | 修正環境診斷：瓶頸是 CPU + 記憶體，不只是硬碟 | `944076e` |
| — | **OpenSpec**：`openspec/changes/build-storefront-pages/` —— proposal（為什麼做）、6 個 capability 的 spec（32 條 requirement、54 個 scenario）、design（專案設置原因 + 11 個設計決策與放棄的方案）、tasks（46 項，對應本頁 13 步，Step 1–3 已勾選）；`openspec validate --strict` 通過 | `3cf7593` |
| — | **OpenSpec 複查與修正**：① 補測並改寫一條沒驗證過且寫錯的規格（深層引用：相對路徑由 lint 擋、套件名稱加內部路徑由型別檢查擋）；② `config.yaml` 補上專案脈絡與撰寫規則（先前說了要做卻沒做）；③ 已實作的 `module-boundaries` 移到主規格 `openspec/specs/`；④ 一個無法測試的 scenario 改為可比對的形式；⑤ 補缺漏：限時搶購卡片內容、首頁載入中 / 失敗狀態、推薦恰好一頁、分類清單（40 個）；⑥ 補做 Step 1 漏掉的 `engines.node`；⑦ 本頁 Step 1–3 逐項核對後打勾 | `0c28e6b` |
| 4 | **Walking skeleton**：`/`、`/goods/:goodsId`、找不到頁面三條路由走得通，外面包著 layout；`paths`（URL 單一來源）與 `AppLink`（由 app 注入 router 的 Link）走 TDD；composition root（QueryClient + LinkProvider）；第一批跨專案依賴（7 條，0 違規）。**兩層 design token**：數值從真實網站量出，關閉 Tailwind 預設色盤。拆成 6 個 commit，**每一個都匯出到乾淨環境單獨驗證為綠** | `c589060` `240e2f1` `ab34cea` `ae1bd4d` `d6aca28` `3628bdd` |
| — | **`shell` 改名為 `layout`**（lib、套件名、scope tag、元件、規格 capability）；`architecture.md` 補上 Layout 一節（layout route 的機制、跨頁保留哪些部分、如何加第二種 layout）。起因：Human 指出「看起來我們沒有設計 layout」—— layout 其實存在且有測試，但命名、文件與順序三個缺口讓它看不出來 | `ef285aa` |
| — | **步驟重新編排**：Layout 由 Step 7 提前為 Step 5（它是每一頁的骨架）；原 Step 5、6 順延為 6、7；`tasks.md` 同步重新編號 | `4140d12` |
| 5 | **Layout**：`fixed` 的 TopBar（捲動後轉 compact 顯示搜尋框）、主 header（logo + 展示用搜尋框 + 熱搜關鍵字）、可展開的分類列（40 個分類、五種色調）、footer（防詐騙提醒框 + 六欄 + QR code）。三份 spec 共 11 個測試（TDD）。分類面板的樣式從真站量出並進入兩層 token。拆成 5 個 commit，中間的 3 個都匯出到乾淨環境單獨驗證為綠 | `8063454` `fc73d14` `0d2a0ef` `4678d8e` `3e8caf5` |
| — | **全專案健檢**（Human 回報編輯器在 `tsconfig.app.json` 顯示 not found）：85 個 tsconfig 引用全部存在；直接驅動 tsserver（TS 6.0.3 與 5.9.3）取得編輯器層級的診斷 → 0 個，並以故意寫壞的 tsconfig 確認這個檢查抓得到 `TS6053 … not found`；歷史上每個 commit 的引用也都存在。磁碟上的狀態沒有問題，研判是編輯器留著改名當下的過期診斷。順帶發現並修正：本機外掛的狀態資料夾 `.omc/` 沒有被 ignore | `5142b29` |
| — | **Layout 升為正式的一層**：`libs/layout/feature` → `libs/shop/layout`（`@momo/shop-layout`）；新增 `type:layout`（與 `page` 同層、可組合 feature、只有 app 能依賴）；`scope:layout` 改名為 `scope:shop`；ADR-0006 改寫，並記錄為什麼推翻原本「外框不能依賴 feature」那句話；主規格 `module-boundaries` 新增 3 個 scenario。起因：Human 質疑「layout 裡面卻有 feature，這是好的設計嗎？」 | `5966dcf` `d815c11` `6bb5b32` |
| — | **layout 該放哪：查證與定案（ADR-0007）**。Human 連續追問：放 `apps/shop/src/layouts` 會不會比較好？Nx 以往怎麼放？是不是該叫 `feature-shell`？查證 Nx 文件、`nrwl/react-template`、`nrwl/nx-examples` 與 feature-shell 模式後，比較三種放法，**維持 `libs/shop/layout`，不搬程式**。`architecture.md` §3 註明 `page` 與 `layout` 是我們在 Nx 四種 type 之上自訂的延伸；README 的取捨表新增這一項 | 見 git log |

**Step 1 與原計畫的偏離（之後寫進 `docs/agent-workflow.md`）**
- Nx 23 的 `react-monorepo` preset 會下載官方示範電商範本且忽略 flags → 不採用，改「空 workspace + generator」。
- `--workspaces=false` 無效 → 採 Nx 現行標準（pnpm workspaces + project references）；`@momo/*` alias 由各 lib 的 package name 提供，Phase 1 設計不受影響。**Step 2 產生 lib 時 tags 寫在各 lib 的 `package.json` → `nx.tags`。**
- pnpm 12 預設擋 postinstall → `allowBuilds` 只明確核准 `nx`、`@swc/core`。
- 環境備註：此機器上每次 `pnpm nx …` 約 20–60 秒、裝依賴約 3 分鐘；`NX_DAEMON=false` 可避免卡住。

**Step 2 驗證結果**
- 基準：11 個專案 × `lint / test / typecheck` = 33 個 task 全綠（無快取）。
- **負向驗證（規則真的會擋）**：放入 5 個故意違規的探針檔 → 5 個全部被 lint 擋下（feature→feature、ui→data-access、scope:goods→scope:home、lib 內 import `react-router`、`shared/ui` 以外 import `embla`）；2 個對照組（page→feature、`apps/shop` import router）正確通過。探針檔已全數移除。

**Step 2 與原計畫的偏離**
- 3 個 feature lib 的 placeholder container 延到 Step 8 才加（registry 真的需要時）；目前所有 lib 的 `index.ts` 都是 `export {};`。
- 各 lib 的測試設定加了 `passWithNoTests: true`（空 lib 沒測試檔會被 Vitest 判失敗）。**某個 lib 加入第一個 spec 時，要把它的這行拿掉**，避免日後測試被誤刪卻沒人發現。
- 踩到的坑：PowerShell 會把 `--tags=a,b` 的逗號當陣列 → tags 變成單一字串、boundary 規則靜默失效。已修正並逐一核對 10 個 lib 的 tags。

**環境備註（重要，影響所有後續步驟的耗時）**
- 開發機：i7-8750H（2018 筆電）、16 GB RAM；專案在 **D: 槽 = 5400 轉傳統硬碟**（C: 才是 NVMe SSD），Defender 即時掃描開啟 → 每個 Nx / Vitest 指令都很慢（實測一個 0.5 秒的測試總耗時 34 秒）。與程式碼無關。
- **診斷修正**：起初歸因於傳統硬碟、預期搬到 SSD 快 5–10 倍 —— **錯了一半**。在 C: 複本實測：安裝快很多（50 秒 vs 3 分鐘），但跑測試沒有明顯變快。再量：CPU 100%、可用記憶體剩 1.5 GB（Chrome 佔大宗）。**真正的瓶頸是 CPU + 記憶體**，硬碟只是讓它更糟。→ 跑驗證前關掉不用的 Chrome 分頁會有感；一律 `--parallel=1`。
- 失敗的 Nx 指令會留下孤兒 node 行程（曾發現 7 個掛了 23–55 分鐘），指令異常結束後要檢查並清掉。
- 目前的因應：`NX_DAEMON=false` + `NX_ISOLATE_PLUGINS=false`（否則 plugin worker 會連線逾時）、`--parallel=1`（否則 Vitest worker 會逾時）。
- **決定：專案維持在 D: 槽，不搬移。** 以上述參數因應，並善用 Nx 快取（只有驗證關卡才加 `--skip-nx-cache`）。
- **C: 槽測試複本（僅供跑測試）**：`C:\Users\Zach\momo-shop-work-mirror`。**D: 是唯一的基準** —— 只在 D: 編輯與 commit；複本沒有 `.git`，無法從那裡 commit。同步方向只有 D: → C:：
  `robocopy D:\repo\momo-shop-work C:\Users\Zach\momo-shop-work-mirror /MIR /XD node_modules .nx dist .git out-tsc test-output`
  （robocopy 的 exit code 0–7 都是成功。）複本是「沒有 `node_modules` 的乾淨環境」，第一次使用就抓到 lockfile 過期的假綠燈。

**架構復盤（Step 2 之後）**
- 提問：「大量寫在 libs，日後擴充購物車、結帳、品牌頁、刷卡時 libs 不會變很肥嗎？」
- 結論：`libs/` 變大不是問題（它就是 `src/`），要防的是**單一 lib 變肥**；成長方式是新增 scope，現有 10 個 lib 不需要改。
- 承認的三個弱點：`catalog/data-access` 最可能先變肥、`shared/ui` 長大後讓 `nx affected` 失去意義、scope 放行清單會隨時間腐化 → 各自寫下拆分觸發條件（`architecture.md` §5）與 ADR-0006。
- 承認的事實：**以目前 2 頁的規模，這個結構是偏重的**；真實的 2 頁專案不會從這裡開始。已照實寫進 README 的 Tradeoffs。

**Step 3 的 module boundary 確認結果**
- `pnpm verify:boundaries`：11 個專案、11 條限制、0 個問題。每個專案實際解析出的 ESLint 設定中 boundary 規則皆為 `error`；只有 `shop` 能 import router、只有 `shared-ui` 能 import embla。
- 專案間的依賴目前是 **0 條**（libs 都還是空的），所以「符合」在現階段是必然的；真正的保障是「規則已套用到每個專案」+ Step 2 的負向驗證。之後每一步有了真的 import，這支腳本與 lint 才開始有實質的東西可擋。
- 腳本自我測試：故意把一個 lib 的 tags 改壞 → exit 1 並指出問題 → 已還原。
- 順帶抓到：9 個 React lib 的 `package.json` 缺 `"private": true`（generator 沒加）→ 已補上並納入檢查。
- 順帶清掉：先前 plugin worker 逾時留下的 7 個 Nx 孤兒行程（掛了 23–55 分鐘）。

**OpenSpec 的用法（之後每一步都照這個對照）**
- 規格：`openspec/changes/build-storefront-pages/specs/<capability>/spec.md` —— 每個 `#### Scenario` 就是一個應該存在的測試。
- 進度：`openspec/changes/build-storefront-pages/tasks.md` —— 每完成一項立刻 `- [ ]` → `- [x]`；本頁的「完成項目」繼續記 commit。
- 改行為前先改規格，並跑 `openspec validate build-storefront-pages --strict`。
- 13 步全部完成後再 archive（把 delta spec 併入 `openspec/specs/`）。

**Step 4 驗證結果**
- 全部 11 個專案 `lint / test / typecheck`（無快取、循序）33 個 task 全綠；`nx build shop` 成功，三個頁面各自成為 lazy chunk。
- `pnpm verify:boundaries`：11 個專案、11 條規則、**7 條跨專案依賴、0 違規** —— 第一次有實質的依賴可檢查。
- 瀏覽器實測（dev server）：三條路由都渲染正確；量到 logo `#d62872`、header 底線 `1px #cccccc`、內容寬 `1220px`、footer `#09355d`、內文 `#404040`、字體堆疊與真站一致。
- 建置產物檢查：semantic utility 有產生、`--color-brand` 指向 `var(--momo-magenta-600)`、Tailwind 預設色盤與字級不存在。

**Step 4 的設計 token（Human 要求對照真實網站後的修正）**
- 原本的顏色是看截圖估的：品牌色估成 `#e6007f`、文字估成純黑。**實測是 `#d62872` 與 `#404040`**；價格有三種顏色（`#d62872` / `#db2777` / `#dd2222`）而不是一種。
- 兩層：**Primitive**（`--momo-magenta-600`，純調色盤，不在 `@theme` 內 → 沒有 utility，元件用不到）→ **Semantic**（`--color-brand`、`--color-price`、`--text-ec-sm`，元件唯一能用的一層）。
- 過程中得知：真實網站是 **Next.js + Tailwind**；首頁區塊是虛擬化渲染；字級是奇數階梯 `ec-*`（13 / 15 / 17 / 19 / 21 / 23）；頂部列是 `fixed` 不是 sticky；詳情頁三顆按鈕是 160×40、直角。
- **沒量到的**：區塊標題（在跨來源 iframe 內讀不到，依截圖估 24px）、hover 狀態、限時搶購標題列的粉底。token 裡都標明是估計值。
- 完整對照表：repo 的 `docs/design-tokens.md`。

**Step 5 驗證結果**
- 全部 11 個專案 `lint / test / typecheck`（無快取、循序）全綠；`nx build shop` 成功；`pnpm verify:boundaries` 7 條依賴、0 違規。
- 瀏覽器實測：
  - **捲動**：TopBar 維持在頂端（`fixed`、top 0、高 41px、背景 `#f2f2f2`、底線 `1px #ccc`、z-index 200），左側捷徑收起、換成搜尋框 —— 與 Phase 1 的「滾動時樣式」截圖一致。
  - **商品詳情頁 `/goods/15642257`**：TopBar、主 header、分類列、footer 全部保留，只有中間的內容換掉。
  - **分類面板**：展開後 40 個膠囊、9 欄 × 124px、間距 10px；膠囊 124×44、圓角 22px；五種半透明底色與真站量到的值相同；作用中的「首頁」為白底 + 品牌色框線。
- 沒做的：主 header 右側三張活動小圖（沒有素材）。
- 沒複核的：footer 與倒數數字幾個顏色的透明度（量的時候轉換函式把 alpha 丟掉了；複核時瀏覽器面板是隱藏的、虛擬化區塊沒掛載）。從截圖看是實色，做限時搶購時一併確認。

**Layout 升為一層：驗證結果與過程中的錯誤**
- 拆成 3 個 commit（規則與 tags → 搬資料夾 → 文件與步驟），前兩個在 commit 前都跑過 11 個專案的 `lint / test / typecheck`（無快取）+ `verify:boundaries`；第二個另跑 `sync:check` 與 `build`。`verify:boundaries`：11 個專案、**12 條規則**、7 條依賴、0 違規。
- **Agent 向 Human 提案時說得太滿**：提案理由之一是「header 的購物車數量會是一個 feature，現在放不進來」。動手後才讀到自己寫的 ADR-0006 明載「外框只透過 `data-access` 讀摘要資料」—— 數量徽章根本不需要 feature。重新釐清後的分界：**摘要資料走 `data-access`；由別的 domain 擁有的互動元件（mini-cart、搜尋自動完成）才是 feature**，新的一層解決的是後者。結論不變，但理由要改對，已寫進 ADR。教訓：提案前先讀自己寫過的決策紀錄。
- 一個探針回報「通過」其實是探針檔沒寫進去（那個 lib 還是空殼，沒有 `src/lib/`）。沒有把它當成通過，換位置重跑後確認被擋。
- `git mv` 整個資料夾再次遇到 Permission denied（這次 dev server 已停，佔用者無法辨識）→ 改為逐檔 `git mv`，git 記錄的 rename 完全相同。
- 自己把 `CI=true` 帶進 `pnpm install`，pnpm 因此以 frozen 模式拒絕更新 lockfile → 安裝這一步不帶 `CI`。

**layout 該放哪：討論的結論與 Agent 的失誤**
- 查證到的事實：Nx 官方的兩個範例都把 layout **外框**放在 app，只把可重用的**零件**（header）抽成 lib；`feature-shell` 是「擁有頂層路由」的 lib，為的是同一個應用出多個平台版本，和我們的情境不同，而且會破壞「router 只存在於 app」（ADR-0001）。
- 結論：維持 `libs/shop/layout`。理由是 app 是唯一不受邊界規則約束的專案，所以只放接線；`page` 與 `layout` 同屬「路由層級的組合」這一層，都在 lib。與另一個方案的實質差距只有約 12 行排版 JSX 與一條規則。
- Agent 的失誤：同一個決定換了三次建議，每一輪都是先有結論再找理由，被要求查證才去讀文件與範例；引用 `nx-examples` 時把「header 零件」與「layout 外框」混為一談（Human 糾正用詞時才發現）；說錯「拆掉 `type:layout` 就全部是 Nx 標準 type」（`type:page` 本來就是自訂的）。已照實寫進 `docs/agent-workflow.md`。

**下一步：Step 6 — 素材 + fixtures + `catalog/data-access`**（分類清單會從 `shop/layout` 搬進 catalog fixtures）→ 對應 `tasks.md` 第 6 組