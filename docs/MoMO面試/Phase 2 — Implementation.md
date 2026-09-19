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

> **路徑與用詞（2026-09-19 起）**：`libs/` 已改為 `packages/`，package 內部也沒有 `src/lib/` 這一層了（ADR-0008）。下面已完成的步驟保留當時的寫法，以「↳」註記差異；**還沒做的步驟一律照新的規範**：
> - 新的 package 放在 `packages/<scope>/<name>`；generator 產生 `src/lib/` 的話攤平成 `src/`。
> - `src/` import 了外部套件 → 在**該 package** 的 `package.json` 宣告，版本寫 `catalog:`；新的套件先加進 `pnpm-workspace.yaml` 的 `catalog`。不要加到根目錄。
> - 要從別的 package 拿 TypeScript 以外的東西（樣式、測試工具）→ 加到對方的 `exports`，不用相對路徑。
> - 每一步的驗證都多跑 `pnpm verify:boundaries`（它會確認依賴宣告的檢查真的有在運作）。

| 狀態 | Step | 產出 | Commit | TDD | 可砍 |
|---|---|---|---|---|---|
| ✅ | 1 | Nx workspace + `shop` app 可 build | `chore: scaffold nx workspace` | — | ✗ |
| ✅ | 2 | 10 個 package（當時叫 libs）+ tags + boundary lint | `chore: add domain libs and module boundary rules` | — | ✗ |
| ✅ | 3 | architecture.md + ADR ×6 + agent-workflow.md + CLAUDE.md + 邊界驗證工具 + OpenSpec | `docs: add architecture and ADRs` | — | ✗ |
| ✅ | 4 ★ | Walking skeleton：兩條路由走得通（+ 兩層 design token） | `feat(shop): walking skeleton with routing and shell` | paths、AppLink | ✗ |
| ✅ | 5 ★ | **Layout**：TopBar(fixed→compact) + Header + 分類展開 + Footer（原 Step 7，提前） | 依內容拆分 | 分類展開、搜尋框、compact | ✗ |
| ✅ | 6 | 素材 + fixtures + catalog/data-access | `feat(catalog): mock repository, fixtures and query hooks` | #3 | ✗ |
| ✅ | 7 | shared util / ui | `feat(shared): price formatting and core ui components` | #1 #2 | ✗ |
| ✅ | 8 ★ | 首頁 config-driven + 6 blocks | `feat(home): config-driven section renderer and blocks` | #5 | ✗ |
| ✅ | 9 | 你可能會喜歡：3 列 + 看更多 | `feat(recommendation): paginated grid with load more` | #4 | ✗ |
| ✅ | 10 ★ | 商品詳情頁（純展示） | `feat(goods): display-only goods detail page` | #8 | ✗ |
| ✅ | 11 | 限時搶購：倒數 + 2 列輪播 | `feat(flash-sale): countdown and two-row carousel` | #7 | ✓ |
| ✅ | 12 | 今日暢銷榜（橫式商品卡，沒有名次）—— 是 `product-rail` 的一筆設定，不是 package | `feat(home): best sellers as one more product rail` | — | ✓ |
| ✅ | 13 ★ | README + CI | `docs: readme with tradeoffs and roadmap` / `ci: nx affected` | — | README ✗ / CI ✓ |
| ✅ | P2 | Playwright / SectionBoundary / Skeleton / 部署（GitHub Pages） | 各自一個 commit | SectionBoundary、Skeleton | ✓ |

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
  - ↳ 這 10 個當時建立在 `libs/` 底下、程式碼在 `src/lib/`；之後整個搬到 `packages/` 並拿掉 `src/lib/`（ADR-0008）。
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
  - ↳ 當時 `styles.css` 以相對路徑 import 那份 theme；之後改為 `@import '@momo/shared-ui/theme.css'`，由 `@momo/shared-ui` 的 `exports` 公開（ADR-0008）。
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
### Step 6 — 素材 + Catalog 資料層 ✅

**目標**：所有商品資料的單一來源 + 可抽換的 repository。
- [x] 素材 `D:\repo\momo素材` → `apps/shop/public/assets/`（依 Phase 1 §7 的 slug 對照；只搬用得到的）。
  - ↳ 寫成工具 `tools/import-assets.mjs`，對照表就是素材出處的紀錄。**全部都搬**（共 7.8 MB，每個區塊都用得到），含第一次盤點漏掉的巢狀資料夾 `主要活動/今日大牌`。以內容雜湊對帳：203 個來源檔案，202 個複製、1 個重複下載略過。Step 5 手動搬的 logo 與 footer 圖也改由同一支工具產生，內容不變。
- [x] `tools/gen-fixtures.mjs`：掃 `public/assets` → `products.generated.ts`（id 取自檔名、名稱 / 價格決定性產生、不用亂數）；`collections.ts`、`categories.ts`（40 個分類，第一項為「首頁」—— **從 layout lib 的私有清單搬過來**，`AppLayout` 改讀 `useCategories`）。
  - ↳ 122 件商品、5 個集合；`--check` 在檔案過期時失敗（`pnpm verify:fixtures`）。
  - ↳ **同一個商品 id 會出現在多個區塊的素材裡** → 一份商品表，集合只存 id（`collections.generated.ts`）。「首頁與詳情頁同名同價」因此是結構上保證的。
  - ↳ **`categories.ts` 改為手寫**：分類是從真站讀來的，沒有素材可以產生它。
  - ↳ **moPro 不產生商品**：那個資料夾是整張做好的促銷磚（品牌、品名、價格印在圖上），不是商品照 → Step 8 改用 `banner-carousel`。
  - ↳ 同一張圖常在多個區塊各給一份 → gallery 依內容去重；品牌刻意用虛構的。
- [x] models：`Product`、`FlashSaleItem`、`Category`、`Page<T>`。
  - ↳ `Category` 只有 `id` 與 `name`：面板的五種底色是「第幾列」決定的，屬於 layout，不進 domain model。
- [x] **TDD #3**：`createMockCatalogRepository({ now, latencyMs })`
  - [x] `getProduct`：存在 → 商品；不存在 → `null`
  - [x] `getCollection`：未知 key → `[]`
  - [x] `getRecommendations`：`nextOffset` 正確；最後一頁 → `null`
  - [x] `getFlashSale`：`endsAt` 跟著注入的 `now`
  - ↳ 多一個 `data` 選項：邏輯測試注入小而可控的資料，不依賴真 fixture；另一組測試對真資料檢查規格寫明的數字（55 件、40 個分類、同名同價、限搶價低於原價）。
  - ↳ 紅燈：對空實作 17 個 spec 中 14 個因斷言失敗；另外 3 個是「查不到」的情況，空實作剛好滿足，它們要等實作存在才有意義（防止查不到時 throw）。分頁另外補了「恰好滿的最後一頁」與「超出範圍」兩種邊界。
- [x] `CatalogRepositoryProvider` + `useCatalogRepository`；6 個 query hooks；`query-keys.ts`。
  - ↳ `useRecommendations` 回傳攤平的清單、`hasMore` 與隨時可呼叫的 `loadMore`，元件不需要知道分頁怎麼運作；先對空實作紅燈（3 個）。
  - [x] `catalog/data-access` 會 import `react` 與 `@tanstack/react-query` → 在**它自己的** `package.json` 宣告，版本寫 `catalog:`（兩者都已在 catalog 裡）。
- [x] `testing.ts` 次要入口：`createFakeCatalogRepository` + 測試用 wrapper。以 `exports` 的 `"./testing"` 公開（`@momo/catalog-data-access/testing`），並確認 TypeScript 與 Vitest 都解析得到。
  - ↳ `shop/layout` 的 spec 從這個入口 import，型別檢查與測試都通過；build 後確認測試工具不在 app 的 bundle 內。
- [x] `app/providers.tsx` 注入 mock repository（composition root）。
  - ↳ 延遲 150 ms，讓載入狀態看得到。
- [x] `shop/layout` 宣告對 `@momo/catalog-data-access` 的依賴（`workspace:*` → `pnpm install` → `pnpm nx sync`），並確認 `pnpm-lock.yaml` 的 importer；`scope:shop` → `scope:catalog` 已在放行清單內。
  - ↳ `AppLayout` 改讀 `useCategories`，外框立刻渲染、分類到了再補上；layout 私有的 40 筆清單刪除。`CategoryNav` 依「第幾列」決定色調（每列 9 個）。兩個新 spec 先紅燈。

**驗證**：`pnpm nx test catalog-data-access`、`pnpm nx lint catalog-data-access`
**Review 重點**：`CatalogRepository` interface 是不是你心中「真 API 會長的樣子」；repo 體積（圖片總大小）。
**Commit**：`feat(catalog): mock repository, generated fixtures and query hooks`
  - ↳ 實際拆成 6 個 commit（素材 → models 與 fixtures → repository → hooks 與測試入口 → app 與 layout 接上 → 文件），每個單獨為綠。

### Step 7 — Shared util / ui ✅

> **對照真站得到的事實（2026-09-19，桌機版 DOM）**，`ProductCard` 要照這個做：
> - 商品卡有**兩種版型**：直式（圖在上）—— 降價好貨 131×238、圖 128×128；限時搶購 230×386、圖 208×208。橫式（圖在左）—— momo 店取與今日暢銷榜都是 335×174、圖 140×140。
> - 兩種版型都可以帶一行**紅色促銷文字**（橫式 13px `#dd2222`；限時搶購 15px / 700）。
> - 價格：數字 21px / 700（限時搶購 23px）、前面的 `$` 13px；降價好貨用品牌色 `#d62872`，店取與暢銷榜用 `#db2777`，限時搶購用 `#dd2222`。原價 13px 劃線灰色。名稱 15px `#404040`。這些和現有的 token 一致。
> - 區塊標題在真站上是一張 1220×70 的圖，素材裡沒有 → `SectionHeader` 用文字，字級是估計值。

**目標**：通過 Rule of Two 的共用元件，全部不認識 domain model。
- [x] 安裝 `embla-carousel-react`。
  - ↳ 8.6.0（支援 React 19）。版本寫在 `pnpm-workspace.yaml` 的 catalog，`shared/ui` 以 `catalog:` 宣告。**分兩次安裝**：`@nx/dependency-checks` 會擋「宣告了卻沒用到」的依賴，所以 embla 和 `Carousel` 在同一個 commit 才加進來，每個 commit 才能單獨為綠。
- [x] **TDD #1**：`formatPrice`（`49900 → "49,900"`、`0`）。
  - ↳ locale 固定為 `en-US`（千分位不跟著機器走）、小數四捨五入；`$` 不在裡面 —— 它放哪、多大是設計決定（真站的 `$` 是 13px，數字是 21px）。紅燈：對 `String(amount)`，3 個需要千分位或進位的情境失敗；`999` 與 `0` 本來就不需要千分位，通過是對的。
- [x] **TDD #2**：`PriceTag`（售價；有 `originalPrice` 才出現劃線價）。
  - ↳ 多了 `tone`（`price` / `brand`）、`size`（sm 19px / md 21px）、`stacked`（原價放下面：降價好貨；放旁邊：橫式商品卡、推薦區）—— 都是從真站量到的。
  - ↳ 劃線價是 `<del>`，前面有視覺隱藏的「原價」（多數螢幕閱讀器不會念出 `<del>`）。**原價必須高於售價才顯示**：domain 有這個保證，但 `shared/ui` 不認識 domain，而「比售價低的劃線價」會被讀成漲價。
  - ↳ 真站的劃線原價依區塊用了三種幾乎一樣的灰（`#999` / `#9ca3af` / `#b3b3b3`）；這裡一個角色一個 token（`ink-muted`）。
  - ↳ `shared/ui` 因此宣告對 `@momo/shared-util` 的 workspace 依賴（→ `pnpm install` → `nx sync`，lockfile 的 importer 已確認）。
- [x] **TDD #2**：`ProductCard`（`ProductCardItem` 最小形狀；名稱 / 圖 / 價格；`href` 落在連結上；slots：`promoText` `footer`）。
  - ↳ **Step 7 修訂：沒做 `topBadge` 與 `priceLabel`。** `topBadge` 原本唯一的使用者是名次徽章，而它不存在；動工前重看截圖，限時搶購的「搶」在卡片底部那一列、不在圖上。`priceLabel`（「限搶價」）、浮起的外框、紅色 23px 價格只屬於限時搶購（Step 11，可砍），跟著它一起加。
  - ↳ 多了三個**視覺**選項：`layout`（`vertical` / `horizontal`）、`frame`（`outlined` / `plain`）、`priceTag`（轉給 `PriceTag` 的外觀設定）。不是業務 variant —— 沒有 `variant="flash-sale"`。
  - ↳ `href` 由呼叫端用 `paths.goods(id)` 組好傳入，`shared/ui` 不認識路由，`ProductCardItem` 也不需要 `id`。連結走 `AppLink`（有一個 spec 確認它用的是 app 注入的 link）。
  - ↳ `footer` 渲染在連結**外面**（feature 可能放按鈕，按鈕放在連結裡是無效的 HTML）；圖的 `alt=""`（名稱就在同一個連結裡，寫 alt 會被念兩次）。
  - ↳ 有一個 spec 把帶著多餘欄位的 domain 物件直接傳入，由 `typecheck` 把關「`Product` 不用轉換就能傳」。紅燈 10 / 10。
- [x] `Carousel`（embla 包裝：prev / next / dots / `perView`）、`SectionHeader`。
  - ↳ `Carousel`：另有 `label`（必填，無障礙名稱）、`gap`、`loop`；`perView` 可以是小數（真站的降價好貨約 8.45 張，最後一張露出一部分）；一次翻一整頁；無處可翻的箭頭停用；只有一頁時不顯示圓點；圓點 4px 高但按鈕有 padding，點得到。
  - ↳ **箭頭與圓點到真站量過**，加為 token：`carousel-arrow`（黑 30%，hover 40%）、`carousel-dot`（`#ededed`），目前頁用 `brand`；尺寸記在 `design-tokens.md`。
  - ↳ **測試分兩份**：jsdom 不做排版，真的 embla 永遠只有一頁，所以包裝邏輯對一個「會換頁的假 embla API」測（11 個）；另一份用真的 embla 只測掛載得起來（2 個）。後者第一次執行就抓到我的錯誤假設：我以為沒設 breakpoints 就不會碰 `matchMedia`，實際上 embla 無條件執行 `[].map(ownerWindow.matchMedia)`。
  - ↳ `SectionHeader`：`<h2>`，`lead`（前半淺色：「降價」+「好貨」，念起來仍是一個標題）、`title`、`icon`。真站的標題是圖，字級仍是估計值。
- [x] `index.ts` 只匯出上述公開 API。

**驗證**：`pnpm nx test shared-ui shared-util`、`pnpm nx lint shared-ui`
**Review 重點**：`shared/ui` 有沒有 import 任何 data-access（不該有）；`ProductCard` 的 props 是否夠用又不過度。
**Commit**：`feat(shared): price formatting and core ui components`
  - ↳ 實際拆成 5 個 commit（`formatPrice` → `PriceTag` → `ProductCard` → `Carousel` + `SectionHeader` → 文件）。

### Step 8 ★ — 首頁 config-driven ✅

> **Step 6 的發現**：moPro 的素材是整張做好的促銷磚，不是商品照 → `home-layout.ts` 裡它是 `banner-carousel`，不是 `product-rail`。`主要活動/today-brand/` 是 hero 右側「今日大牌」的圖。

**目標**：13 個業務區塊由 `HomeSection[]` 驅動渲染。
- [x] （Step 7 留下的決定）`Product` 加選填的 `promoText`，產生器為 momo 店取與今日暢銷榜的商品填入（122 件中 18 件）。要不要顯示由商品列決定：橫式卡片顯示、直式不顯示。
- [x] `home/data-access`：`HomeSection` union、`Banner`、`Shortcut`；`home-layout.ts`（15 筆設定）；`HomeRepository` + Provider + `useHomeLayout`；app 注入。
  - ↳ 和 catalog 同一個形狀（interface → mock → Context → hook → `./testing` 入口）；8 個 spec 先全紅。
  - ↳ **版位資料多了版面數值**：`Banner` 的 `width` / `height`（瀏覽器先留位置）、`SectionTitle { lead?, text }`、carousel 的 `label` / `perView` / `gap`、grid 的 `label` / `columns`、商品列的 `card` / `perView`。讓一個 `banner-carousel` 撐起 5 個區塊的代價。
  - ↳ **動工前到真站量過每個區塊**：內容寬 1188px（區帶 1220、padding 16）；hero 327×444.8 間距 12；圖示 148.5、8 張；品牌磚 218.9×364.8、5.43 張；信用卡 250×125、4.75 張；猜你想搜 186×234 間距 10、6.11 張。
  - ↳ **品牌折扣與猜你想搜是輪播**，不是計畫寫的 grid（截圖上有箭頭與圓點）。
  - ↳ 猜你想搜的 9 個關鍵字：前 6 個照目標截圖，逐張看圖對上檔名；後 3 個截圖上被切掉，依圖片內容命名（「哈利波特」後來發現真站當天也有）。
  - ↳ 「今日大牌」素材只有四格中的一格；banner 的 alt 是「區塊名 + 序號」（圖上的字沒有逐張抄寫）→ 都列入 Known Gaps。
  - ↳ app 多一個 spec：版位資料指到的 60 多張圖都存在於 `public/`。它第一次跑就是綠的，所以先故意打錯一個路徑確認它真的會失敗。
- [x] `shared/util/telemetry.ts`：`reportError`，sink 可替換（同時接到 `app/providers` 的 QueryClient `onError` → 滿足 Rule of Two）。
  - ↳ **沒做 `track`**：沒有呼叫者。
  - ↳ `reportError` 永遠不 throw（sink 自己壞掉時也一樣）。「不 throw」那個 spec 對空實作空洞通過 → 補上「sink 有被呼叫」的斷言，**這次在寫實作之前**就對「什麼都不做」的版本跑過：4 / 4 紅。
  - ↳ app 的 `createQueryClient()`：`QueryCache.onError` 對每個失敗的查詢回報一次、帶 query key。**錯誤回報因此不在 `HomePage` 裡** —— 兩邊都報會重複。
- [x] **TDD #5**：`SectionRenderer`
  - [x] 依 `type` 渲染對應元件
  - [x] 未知 `type` → 不渲染、不 throw、呼叫 `reportError`
  - ↳ registry 由 props 傳入，測試用「每種 type 一行」的假元件，不必掛任何 provider。5 個 spec 先全紅。
  - ↳ 回報放在 effect、以未知區塊的清單為 key：**一次**，不是每次 render 一次（有 spec）。查表用 `Object.hasOwn` —— `registry['constructor']` 在每個物件上都存在（有 spec）。
- [x] `registry.ts`：mapped type（漏寫 renderer → 編譯錯誤）；3 個 feature package 各建立一個 placeholder container（從 Step 2 移過來的項目），registry 先指向它們。
  - ↳ 實際驗證：暫時在 union 加入 `video-wall` → `TS2741: Property '"video-wall"' is missing ... in type 'SectionRegistry'`；還原後通過。
  - ↳ feature 只收 `{ title, lead? }`：`catalog/feature-recommendation` 是 `scope:catalog`，不能 import `scope:home` 的型別。registry 用轉接函式從 section 取出。
- [x] 6 個私有 blocks：`hero`、`banner-carousel`、`banner-grid`、`shortcut-bar`、`notice`、`product-rail`（商品卡連到 `paths.goods(id)`）。
  - ↳ 商品列載入失敗時自己消失、不拖垮整頁；載入中先保留高度。
  - ↳ **layout 的 `<main>` 不再決定頁面寬度**：首頁是滿版灰底 + 1220px 白色區帶，放不進原本的「1220px + padding」。寬度與底色改由各頁自己決定（單獨一個 commit，三個既有頁面畫面不變）。
  - ↳ **`Carousel` 由 region 改為 group**：每個輪播都在一個同名的區塊裡，形成同名的巢狀 landmark。是 app 的整合測試抓到的（「找到多個名為主要活動的 region」），不是讀程式碼看出來的。
  - ↳ 輪播的測試環境補丁搬到 `@momo/shared-ui/testing`（shared-ui、home-page、app 三處要用）。
- [x] `HomePage`：`useHomeLayout` → loading / error / `<SectionRenderer>`。
  - ↳ 載入中 `role=status`、失敗 `role=alert`；4 個 spec 先對 placeholder 全紅。沒有做「重試」按鈕 —— 規格沒要求。

**驗證**：`pnpm nx run-many -t lint test` + `pnpm nx build shop` + dev server 對照截圖由上到下檢查；點降價好貨的商品 → 進到 `/goods/:id`
**Review 重點**：調換 `home-layout.ts` 兩行順序，畫面順序是否跟著變（證明 config-driven）。
**Commit**：`feat(home): config-driven section renderer and cms blocks`
  - ↳ 實際拆成 10 個 commit（商品的促銷文字 → `reportError` → home/data-access → app 注入與錯誤回報 → feature placeholders → `SectionRenderer` → layout 的容器 → 測試環境入口 → `Carousel` 的角色 → blocks 與 `HomePage`），外加文件。

### Step 9 — 你可能會喜歡 ✅

**目標**：3 列後出現「看更多」，點擊再載入 3 列，載完按鈕消失。
- [x] `model/page-size.ts`：`ROWS_PER_LOAD(3) × COLUMNS(5) = 15`。
- [x] **TDD #4**（注入 fake repo，例如 7 筆、每頁 3 筆）
  - [x] 初始只顯示第 1 頁
  - [x] 點「看更多」→ 數量增加
  - [x] 最後一頁載完 →「看更多」消失
  - ↳ **用的是規格自己的數字**（55 / 10 / 恰好 15 件、每批 15），不是「7 筆、每頁 3 筆」：頁面大小是 feature 內部的常數，不為了測試開 prop。fake repository 照 `offset` / `limit` 切資料，規格的 scenario 一條對一條寫成測試。
  - ↳ 10 個 spec，9 個先對 placeholder 紅燈；第 10 個（區塊以標題命名）placeholder 本來就滿足，是回歸保護。
  - ↳ **「載入中重複點擊」的 spec 抓到資料層的 bug**：預期 repository 被呼叫 2 次，實際 4 次。Step 6 的 `useRecommendations` 靠 render 當下的 `isFetchingNextPage` 防重複，但連點發生在 React 重新 render 之前，closure 裡還是 `false`；而 `fetchNextPage` 預設會取消進行中的請求重來。改為 `fetchNextPage({ cancelRefetch: false })`，並在 hook 層級補 spec（修正前同樣紅燈）。單獨一個 commit。
  - ↳ 多兩個規格以外的失敗情境：完全載不到 → 區塊不顯示；後面的批次失敗 → 已顯示的保留、按鈕保留（再按一次就是重試）。
- [x] `ui/recommendation-grid`、`ui/load-more-button`（私有）；`recommendation.tsx` 用 `useRecommendations`（`useInfiniteQuery`）。
  - ↳ 按鈕載入中顯示「載入中…」、用 `aria-disabled` 而不是 `disabled`：`disabled` 會讓鍵盤焦點消失，每載一批就要重新找位置。
  - ↳ 新商品接在同一個以 id 為 key 的清單後面，已顯示的不移動、不重新掛載。
  - ↳ 商品卡：`frame="plain"`、價格 19px。沒有星等、標籤、總銷量 —— 資料模型沒有這些欄位，列入 Known Gaps。
  - ↳ 移除沒有使用者的 `ink-subtle` token（Step 7 的承諾）。
- [x] `home/page` registry 換成真的元件。
  - ↳ 不用換：Step 8 起 registry 就指向這個 package 的 placeholder，這一步只替換 package 的內容，首頁一行都沒改。

**驗證**：`pnpm nx test catalog-feature-recommendation` + dev server：55 件 → 15 / 30 / 45 / 55
**Review 重點**：`LoadMoreButton` 確實留在 feature 私有 `ui/`，沒有跑到 shared。
**Commit**：`feat(recommendation): paginated product grid with load more`
  - ↳ 實際是 2 個 commit（資料層的修正 → feature），外加文件。

### Step 10 ★ — 商品詳情頁（純展示） ✅

**目標**：左商品圖、右 title + 商品說明、下方三顆按鈕、Footer。**不做任何互動。**
- [x] **TDD #8**
  - [x] 商品存在 → title、商品說明（條列）、價格、`直接購買` `放入購物車` `加入追蹤` 三顆按鈕都在
  - [x] 商品不存在 → `goods-not-found`
  - ↳ 10 個 spec 先對 placeholder 全紅。除了上面兩項，還有：有市售價才顯示劃線價、載入中（`role=status`）、載入失敗（`role=alert`）、跟著 `goodsId` prop 變。
  - ↳ **「按鈕什麼都不做」有測試守著**：三顆按鈕各點兩次，比較點擊前後的頁面 HTML、網址、history 長度與 repository 被呼叫的次數，全部不變。展示用是決定、不是沒做完 —— 之後有人要接上行為，得先改這個 spec，也就是得是刻意的。
- [x] 私有 `ui/`：`goods-gallery`（主圖）、`goods-info`、`goods-actions`（**無 onClick**）、`goods-not-found`。
  - ↳ 整個 `goods-page` 的原始碼裡沒有任何 `onClick`（已 grep 確認）。理由寫在 `goods-actions.tsx` 的註解裡。
  - ↳ 只有主圖：縮圖切換與放大鏡是互動。沒有相關商品、付款 / 配送資訊、麵包屑、「你可能會喜歡」—— 你的筆記寫的是「左邊商品圖、右邊 title 與商品說明、下面三顆按鈕即可，其餘可忽略」。都列入 Known Gaps。
  - ↳ 價格照真站詳情頁的寫法（「促銷價 50,200 元」，沒有 `$`），所以沒有重用商品卡的 `PriceTag`。主圖的 alt 是商品名稱（在這一頁它是內容）。
  - ↳ 移除沒有使用者的 `breadcrumb-root`、`ink-meta` token（對應的麵包屑與總銷量決定不做）；數值保留在 `design-tokens.md` 的文字裡。
- [x] `GoodsDetailPage({ goodsId })`；`goods.route.tsx` 負責 `useParams → props`。
  - ↳ route 從 walking skeleton 起就是這樣，不用改。
  - ↳ **app 的整合測試裡寫死的 `/goods/15687497` 其實不在 fixture 裡**（那是規格範例的數字）。placeholder 只會把 id 印出來，所以一直是綠的。改為向注入的 mock repository 要一件真的商品，並新增兩個整合測試：首頁卡片 → 詳情頁同名同價；不存在的商品仍保留外框與回首頁的途徑。

**驗證**：`pnpm nx test goods-page` + dev server：從首頁任一商品卡點進來；直接開 `/goods/不存在`
**Review 重點**：三顆按鈕點了什麼都不會發生（符合 Phase 1 規則）。
**Commit**：`feat(goods): display-only goods detail page`
  - ↳ 1 個 commit，外加文件（含移除兩個 token）。

> **檢查點**：此時「你要求的兩個頁面」都已完成。

### Step 11 — 限時搶購　（可砍） ✅

- [x] **TDD #7**：`model/get-remaining(endsAt, now)`（含過期歸零）、`model/chunk`；fake timers 下 `countdown` 顯示正確。
  - ↳ 15 個 spec 中 14 個先紅（第 15 個「空清單沒有頁」，回傳 `[]` 的空實作剛好滿足）。規格的數字照用：02:19:23 過 1 秒 → 02:19:22；已結束 → 00:00:00。
  - ↳ 歸零的情況有三種：已過期、剛好到點、結束時間無法解析（`NaN` 不能漏到畫面上）。小時不進位成天：真站只有時：分：秒三格。
  - ↳ `use-countdown` 每次 tick **重新讀時鐘**，不是減一：背景分頁會延後 `setInterval`，用減的會漂移。到零就停掉計時器。
- [x] 私有 `ui/`：`flash-sale-header`（粉底 + 倒數）、`countdown`、`stock-left`、`grab-badge`；每張 slide = 10 件（5 × 2）。
  - ↳ **`stock-left` 與 `grab-badge` 合成一個 `card-footer`**：兩者各只有幾行，永遠一起出現在卡片底部同一列。「搶」是裝飾（`aria-hidden`）：整張卡片就是連結。
  - ↳ 每秒只有 `Countdown` 重新 render，不是 29 張商品卡。`role="timer"`，螢幕閱讀器不會每秒唸一次。
  - ↳ **標題列在真站是一整張圖**（`bt_7_713_01_e9.png`，1220×70），素材裡沒有 → 用文字、Heroicons 的火焰與 token 重現；粉色底 `#ffd9e5` 從目標截圖取樣，token 的說明寫明來源。「倒數」與數字方塊是真的 DOM，為實測值。
  - ↳ **回頭補 `shared/ui`**（Step 7 說好「跟著第一個使用者加」的三個選項）：`PriceTag` 的 `tone="sale"`、`size="lg"`、`label`（「限搶價」；有標籤時 `$` 跟著用 11px 粗體，真站量到的）；`ProductCard` 的 `frame="raised"`；token `surface-sale`、`surface-stock`。`label` 的 spec 先紅。
  - ↳ 規格以外多了兩個情境：載入失敗、沒有商品 → 區塊不顯示（和推薦區同一個原則）。
- [x] registry 換成真的元件。
  - ↳ registry 從 Step 8 起就指向這個 package（placeholder 佔著位置），所以 `home/page` 一行都沒改；只更新了 `section-registry.tsx` 與 `home-layout.ts` 的中文註解。

**驗證**：`pnpm nx test home-feature-flash-sale` + dev server 看倒數有在跳
**Commit**：`feat(flash-sale): countdown and two-row product carousel`
  - ↳ 2 個 commit（先 `shared/ui` 的選項，再 feature），外加文件。
  - ↳ **收尾逐項核對時找到一個漏掉的**：這個 package 現在有明寫的 `import … from 'react'`（`use-countdown`、`countdown`），eslint 設定裡「只寫 JSX 所以對 react 放行」的例外與那行註解已經不成立。比照 `home/page`、`goods/page` 移除；移除後 lint 仍通過（表示規則真的看得到 import），`verify:boundaries` 0 違規。ADR-0008 裡過期的放行清單一併更新。

### Step 12 — 今日暢銷榜　（可砍） ✅

- [x] ~~`ranking.tsx`：以橫式商品卡呈現 `getRanking()` 的商品（含促銷文字）；registry 換成真的元件。~~ → 改為 `product-rail` 的一筆版位設定（Human 選方案 A）。
  - ↳ **Human 在動工後要求先到真站確認切法**（第 12 次糾正）。真站的 DOM：今日暢銷榜與 momo 店取的標題圖是 `bt_7_777_01` / `bt_7_777_02` —— momo 自己的 CMS 把它們當成**同一種區塊**；商品卡的 class 字串完全相同（335×174、1px `#d9d9d9`、圓角 8px、padding 16px）；區帶同為 294px。差別只有資料：標題、商品、以及**每個區塊容器都會收到的 inline 背景色**（其他是白色，這裡 `#f6e8eb`）。對照組：限時搶購（713）、你可能會喜歡（712）各有自己的 DOM，仍是 feature。→ 方案 A 成立。
  - ↳ 真站帶來兩個只看截圖看不到的修正：(1) 粉色底是**版位資料的欄位**（`background`，CSS 顏色），不是元件變體、也不是 token —— 它是 CMS 隨檔期給的內容；(2) 橫式商品卡的框線是 `#d9d9d9`、沒有陰影（新的 `frame="bordered"`），momo 店取從 Step 8 起一直沿用直式卡的樣式，一併修正。
  - ↳ 標題旁的「即時更新」：`SectionTitle.badge` → `SectionHeader` 的 `badge`。放在 h2 外面，區塊仍然叫「今日暢銷榜」。顏色 `#f73f64` 取樣自目標截圖（真站的標題列是一張圖）。
  - ↳ **移除沒有使用者的東西**：`ranking` 型別（9 → 8 種）與 registry 項目、`packages/home/feature-ranking`（package 10 → 9 個）、`getRanking()` / `useRanking` / query key（在 mock 裡它就是 `getCollection('best-sellers')`）。
  - ↳ TDD：版位 fixture 2 個、底色與標籤 1 個、`SectionHeader` 標籤 1 個、app 層整合 1 個先紅。頁面層「順序相同、沒有名次」一寫就綠（既有 block 本來就做得到），改用**變異測試**確認會紅：順序反過來 → 紅；卡片上印名次 → 紅。
  - ↳ 量測時發現並修正 Step 8 的間距誤差：有標題的區塊，真站是標題列下方 16px、圓點列下方沒有額外留白（原本相反）。
  - ↳ **原本寫的 `ui/rank-badge` 已移除**：真站與目標截圖上都沒有名次，那是規劃時自己加的。
  - ↳ **動工前先決定**：它已經沒有自己的邏輯，是否還需要獨立的 `home/feature-ranking` package，或改為 `product-rail` 的一種版型（`architecture.md` §5：沒有邏輯的區塊不拆）。

**驗證**：~~`pnpm nx test home-feature-ranking`~~ `home-data-access`、`home-page`、`shop` 的 spec + dev server
**Commit**：~~`feat(ranking): best sellers as horizontal cards`~~
  - ↳ 5 個 commit：`shared/ui` 的兩個選項 → 今日暢銷榜成為一筆設定 → 移除 `ranking` 型別與 package → 移除 `getRanking` → 間距修正；外加文件。

### Step 13 ★ — README + CI ✅

**目標**：把自己當成這個系統的長期維護者來寫。
- [x] `README.md`：如何啟動 / 測試；架構一頁摘要（連到 `docs/`）；**Tradeoffs**；**與真實網站的差異（Known Gaps）**；**後續演進**（multi-app、SSR、RTK、CMS API、MSW）；Agent 協作方式與效率分析（連到 `agent-workflow.md`）。
  - ↳ 依考核要點重排：狀態（依路由）→ 快速開始 → 先看這幾份 → 架構 → Tradeoffs → Known Gaps → **驗證與可觀測性**（對應 Bonus 的 Validation / Observability）→ **Human ↔ Agent 協作與效率**（對應「Agent 協作效率評估 / 分析」與 Bonus 的 Iteration Architecture）→ **後續演進**（每個方向：觸發條件、要改哪裡、現在的結構已經幫了什麼）。
  - ↳ **效率評估不用工時**（時間紀錄依你的要求拿掉了），用數得出來的：約 80 個 commit、163 個測試、12 次糾正、31 件事故（依「誰抓到的」分類：Agent 自己檢查 11、Human 8、設計成會失敗的工具 7、測試 5）、47 項偏離。三個結論寫在 README，完整版在 `agent-workflow.md` §7。
  - ↳ 寫評估時發現並修正：上一步把第 12 次糾正插到了表格外面、還少一欄。
- [x] 沒做完的步驟照實寫進 Known Gaps（不假裝有做）。
  - ↳ Step 1–13 都做了；**P2 加分項沒有做**，寫在 README 的狀態與「後續演進」。
- [x] `.github/workflows/ci.yml`：`pnpm nx affected -t lint test build`（可砍）。
  - ↳ **第一版照計畫用 `nx affected`，第一次執行 29 秒就綠了 —— 太快，去讀 log：`No tasks were run`。** 沒有上一次成功的 CI 可比就退回 `HEAD~1`，而那個 commit 只加了 workflow 檔；這個空的綠燈還會成為之後的比較基準，等於之前的程式碼永遠不會在 CI 上跑到。改為 push 到 main 跑全部、PR 才跑 affected。這是「回報成功卻什麼都沒檢查」第四次出現，已記入 `agent-workflow.md` §4 並寫進 `CLAUDE.md`。
  - ↳ CI 另外多跑 `format:check`、`verify:boundaries`、`verify:fixtures`；`.prettierignore` 讓整個 repo 的 `prettier --check .` 通過。
  - ↳ 收尾時找到 `home/page` 早該拿掉的 `passWithNoTests`（它從 Step 8 起就有測試），已移除。
  - ↳ **全新 clone 的驗證掛了 20 分鐘，是你問了才發現的。** `run-many` 約 2 分鐘就成功，但我照 README 原樣跑、沒加 `NX_DAEMON=false`，Nx 的常駐 daemon 繼承了我擷取輸出的管線，背景工作就一直不結束，而我只是在等完成通知。已記入 `agent-workflow.md` §4（第 31 件），並在 `CLAUDE.md` 加了一條：背景指令要有預期的完成時間，超過就去查。

**驗證**：`pnpm nx run-many -t lint test build` 全綠；照 README 的指令從零跑一次
**Commit**：`docs: readme with tradeoffs, known gaps and roadmap`、`ci: run nx affected on push`
  - ↳ 實際是 5 個 commit：`.prettierignore` → CI → CI 改為 main 全跑 → `passWithNoTests` → README 與效率評估；外加這份紀錄。

### P2 — 加分項（各自獨立 commit） ✅

- [x] `test(e2e)`：Playwright smoke — 首頁 → 點商品卡 → 詳情頁 title 可見。
  - ↳ 三個測試，對 **build 出來的產物**（`vite preview`）跑：首頁卡片 → 同名的詳情頁 → logo 回首頁；商品列「下一頁」後第一張卡真的捲出視窗（jsdom 測不到）；不存在的商品。
  - ↳ 放在 `apps/shop/e2e`、是 shop 專案的 `e2e` target，**不是新專案**：`verify-boundaries` 要求每個專案都有 type 標籤與入口檔，為一個檔案新增第 8 種 type 不值得。
  - ↳ 不下載瀏覽器：本機用 Edge、CI 用 runner 內建的 Chrome。web server 以 `NX_DAEMON=false` 啟動（上次卡 20 分鐘的教訓）。
  - ↳ 第一次 2 / 3：測試沒先捲到第一屏下面的商品列就斷言它在視窗內 —— 測試的錯，不是 app 的。
- [x] `feat(home)`：`SectionBoundary`（react-error-boundary）— 單一區塊失敗不拖垮整頁 + `reportError`。
  - ↳ 先改規格：`home-page` 新增 requirement「單一區塊出錯不影響其他區塊」與兩個 scenario。兩個 spec 先紅（錯誤逃出去、整棵樹卸載）。
  - ↳ **手寫的 class，沒有用 `react-error-boundary`**：fallback 是「什麼都不渲染」，約 40 行，不為它多一個依賴。資料更新後同一個區塊會再試一次；內容沒變的是同一個物件，不會白白重試。
  - ↳ 瀏覽器：暫時讓「詐騙發票提醒」拋錯 → 其餘 14 個區塊、header、footer 都在，telemetry 收到一筆 `{ sectionId: "fraud-notice", sectionType: "notice" }`。已還原。
- [x] `feat(shared)`：`Skeleton` loading 狀態。
  - ↳ `shared/ui` 的 `Skeleton` 與 `ProductCardSkeleton`，五處使用（商品列、限時搶購、你可能會喜歡、首頁版位載入前、詳情頁）→ 符合 Rule of Two。佔位是 `aria-hidden`，載入狀態另以視覺上隱藏的 `role="status"` 告知。
  - ↳ 先改規格（scenario「區塊的商品載入中」）；全部先紅。
  - ↳ **第一版是錯的，而且 spec 全綠看不出來**：在瀏覽器量高度才發現載入中的區塊比載入後**矮**（今日暢銷榜 266 → 288、限時搶購 739 → 897），版面照樣跳。照 `ProductCard` 的行高重排、預留圓點列與「看更多」之後：位移 ≤ 3px，整頁 7010 → 7009px；詳情頁 504 → 504。測試驗的是「有佔位」，「佔位有用」要用量的。
- [x] `chore(deploy)`：靜態部署（Cloudflare Pages / GitHub Pages）+ README 放網址。
  - ↳ 你指定 GitHub Pages、越簡單越好：同一個 workflow 裡的 `deploy` job，`verify` 綠了才跑。網址：https://zach0627.github.io/momo-shop-work/
  - ↳ 一個環境變數 `BASE_PATH` 同時決定 Vite 的 `base`、`<base href>`、router 的 basename、E2E 的 baseURL；`404.html` 複製自 `index.html`（Pages 沒有 SPA fallback）；加了 `noindex`（公開的真實品牌仿作，不該被搜尋引擎收錄）。
  - ↳ **部署前先在本機對子路徑的 build 跑 E2E，抓到一個會讓部署壞掉的問題：Nx 的快取 key 不含 `BASE_PATH`。** 要根路徑的 build 卻從快取拿到子路徑版 → 3 / 3 失敗、整頁空白。在 CI 會反過來：把根路徑版部署到子路徑，上線的是一個什麼都載不到的網站。已把它加進 `nx.json` 的 `sharedGlobals`，並在開著快取的情況下驗證三次 build。


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
| — | **layout 該放哪：查證與定案（ADR-0007）**。Human 連續追問：放 `apps/shop/src/layouts` 會不會比較好？Nx 以往怎麼放？是不是該叫 `feature-shell`？查證 Nx 文件、`nrwl/react-template`、`nrwl/nx-examples` 與 feature-shell 模式後，比較三種放法，**維持 `libs/shop/layout`，不搬程式**。`architecture.md` §3 註明 `page` 與 `layout` 是我們在 Nx 四種 type 之上自訂的延伸；README 的取捨表新增這一項 | `c87daa7` |
| — | **`libs/` → `packages/`，並照 package 的規矩調整（ADR-0008）**。Human 指出每個 lib 都有 `package.json`，應該叫 packages，而且「不能只是改名」。對照 pnpm、Nx、Turborepo 的慣例後找到三個改名解決不了的問題並修正：① 拿掉 package 內部的 `src/lib/`；② 設計 token 的樣式改由 `@momo/shared-ui` 的 `exports` 公開，app 不再以相對路徑伸進去；③ 執行期依賴下放到各 package、版本由 pnpm catalog 統一，以 `@nx/dependency-checks` 強制，`verify-boundaries` 確認這條規則真的在運作。保留依 domain 分組（`packages/<scope>/<name>`） | `1587fbb` `8e18bb0` `aab099c` `e494945` `748d08b` |
| 6 | **素材 + Catalog 資料層**：`tools/import-assets.mjs`（202 張圖、ASCII slug、以雜湊對帳）；`tools/gen-fixtures.mjs`（122 件商品、決定性、`--check`）；models 與 `CatalogRepository` interface；`createMockCatalogRepository`（注入 `data` / `now` / `latencyMs`）；Context 注入、6 個 query hooks、`query-keys`；次要入口 `@momo/catalog-data-access/testing`；app 的 composition root 注入 mock；`shop/layout` 改讀 `useCategories`。catalog 26 個測試、layout 13 個 | `cb3b680` `c2814e6` `ebb3b5f` `ec89864` `4d511e6` `52b64a0` |
| 7 | **共用元件**：`formatPrice`（shared/util）；`PriceTag`、`ProductCard`（直式 / 橫式、`outlined` / `plain`、slots `promoText` `footer`）、`Carousel`（embla 的唯一 import 點）、`SectionHeader`；輪播箭頭與圓點的 token。shared-util 11 個測試、shared-ui 33 個 | `f01a941` `3963523` `78d4130` `708324b`（+ 文件的 commit） |
| 8 | **首頁 config-driven**：`Product.promoText`；`reportError`；`home/data-access`（`HomeSection` 9 種、15 筆版位設定、repository、hook、testing 入口）；app 注入 + `QueryCache` 統一回報 + 素材存在性的 spec；3 個 feature 的 placeholder；`SectionRenderer` + `SectionRegistry`；6 個 blocks；`HomePage` 的三種狀態；layout 不再決定頁面寬度；`Carousel` 改為 group；`@momo/shared-ui/testing` | `61e8d7d` `cbd9321` `62dcdbb` `b6d6dc0` `2197f33` `4130acd` `89d5e1d` `81fdf69` `50e31e2` `0bb5896`（+ 文件的 commit） |
| 8+ | Human 要求的中文註解：`section-registry.tsx`（首頁 15 個區塊 → type 的對照表，每個項目說明是哪一塊）、`home-layout.ts`（每筆一行，應要求精簡） | `26c37c0` `3ab8ebf` |
| 9 | **你可能會喜歡**：`Recommendation`（3 列 × 5、「看更多」、載完消失、失敗時的兩種行為）；私有的 `recommendation-grid`、`load-more-button`、`page-size`；修正 `useRecommendations` 的重複請求；移除 `ink-subtle`。feature 10 個測試、catalog-data-access 29 個 | `c82ec59` `d75e1b9`（+ 文件的 commit） |
| 10 | **商品詳情頁（展示用）**：`GoodsDetailPage` 的四種狀態（載入中 / 失敗 / 找不到商品 / 頁面）；私有的 `goods-gallery`、`goods-info`、`goods-actions`（無 onClick，有 spec 守著）、`goods-not-found`；app 整合測試改用真的商品並新增兩條；移除 `breadcrumb-root`、`ink-meta`。goods-page 10 個測試、app 11 個 | `d4eba24`（+ 文件的 commit） |
| — | **程式碼註解全面改寫**（Human 第 11 次糾正）：繁體中文、以一行為主，只留對照資訊、不直覺的流程、重要或太難的函式、spec 對應的規格；設計沿革與取捨移到文件。868 行 → 418 行。規則寫進 `CLAUDE.md` | `e250c76` `d680f80` |
| 11 | **限時搶購**：`get-remaining`、`chunk`、`use-countdown`（重新讀時鐘、到零停止）；私有的 `flash-sale-header`、`countdown`、`card-footer`；每頁 2 × 5 的輪播；`shared/ui` 補上 `PriceTag` 的 `sale` / `lg` / `label` 與 `ProductCard` 的 `raised`、token `surface-sale` `surface-stock`。feature 20 個測試 | `41cbf92` `8e51f22`（+ 文件的 commit） |
| 11+ | 逐項核對 Step 11 時找到的收尾：`feature-flash-sale` 有了明寫的 `import react`，eslint 對 react 的放行與註解已不成立 → 移除；ADR-0008 過期的放行清單更新 | `935da30` `0e2fc15` |
| 12 | **今日暢銷榜**：對照真站後成為 `product-rail` 的一筆設定（`background`、標題的 `badge`）；`SectionHeader` 的 `badge`、`ProductCard` 的 `frame="bordered"`；移除 `ranking` 型別、`home/feature-ranking`（package 10 → 9）、`getRanking` / `useRanking`；有標題區塊的間距修正。home-data-access 9 個測試、home-page 11 個、app 12 個、shared-ui 35 個 | `3181acf` `37c5e0a` `e2de477` `ee99a32` `ab38102`（+ 文件的 commit） |
| 13 | **README + CI**：README 依考核要點重排（狀態、快速開始、驗證與可觀測性、協作與效率、後續演進）；`agent-workflow.md` §7 協作效率評估；CI（frozen install、format、兩個 verify、main 全跑 / PR affected）；`.prettierignore`；移除最後一個 `passWithNoTests`；`CLAUDE.md` 加兩條規則 | `3a65994` `e53d164` `8c109a0` `e695ed4` `cf6214c`（+ 這份紀錄的 commit） |
| 13a | **分頁圖示**（你給的 momo 方形標誌）：來源是 28×28 的縮圖，直接用會糊 → 照它的像素配置重畫成 `favicon.svg`（洋紅 `#f200ca` 取自字標素材），再產生 16 / 32 / 48 的 `favicon.ico` 取代 Nx 的預設圖示；spec 確認檔案存在與 `.ico` 的結構（變異測試過） | `c0c4455` |
| P2 | **四個加分項都做了**：`SectionBoundary`；`Skeleton` / `ProductCardSkeleton`（載入前後位移 ≤ 3px）；Playwright smoke（對 build 產物、3 個）；GitHub Pages 部署（`BASE_PATH`、`404.html`、`noindex`、Nx 快取 key 的修正）。173 個單元與整合測試 + 3 個 E2E | `092097a` `80cd4a2` `09a975f` `bdeef1b`（+ 文件的 commit） |

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
  - ↳ Step 11：倒數數字底色已用原始字串複核，`rgb(255, 76, 118)`、不透明。footer 的三個值仍未複核。

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

**`libs/` → `packages/`：驗證結果與過程中的錯誤**
- 拆成 5 個 commit（搬移 → 攤平 `src/lib/` → 樣式走 `exports` → 依賴宣告 → 文件與步驟）。前四個在 commit 前都跑過 11 個專案的 `lint / test / typecheck`（無快取）、`verify:boundaries` 與 `build`；**每一步的 JS 與 CSS 產物雜湊都與改動前相同**，行為沒有變。測試數量不變（6 + 2 + 11 + 5）。C: 複本的 `--frozen-lockfile` 安裝通過。
- 只安裝了一份 `react@19.3.0`，每個宣告它的 package 都連到同一個實體。
- 樣式入口：沒有宣告 export 時 build 失敗（`"./theme.css" is not exported`）；未公開的路徑仍然失敗。
- 依賴宣告的 5 個探針：沒宣告 react（擋）、沒宣告 workspace package（擋）、宣告了卻沒用（擋）、空的 package 開始 import react（擋）、只寫 JSX 的 package 拿掉 react（**通過 —— 工具的盲點，已照實寫進 ADR**）。
- Agent 一開始的建議是「保留 `libs/`、補一段文件就好」。照那樣做的話，上面三個真問題會繼續存在。
- **探針連續兩輪給出假的「被擋下」**：第一輪是 pnpm 發現 `package.json` 與 lockfile 不一致而拒絕執行，ESLint 根本沒跑；第二輪是 nx 執行檔的路徑寫錯。探針腳本只看 exit code，兩輪都印出整排 OK。改為「輸出裡必須出現那條規則的名稱才算被擋」之後，第三輪才是真的。
- **規則照預設值啟用時什麼都不檢查**：`@nx/dependency-checks` 對沒有 `build` target 的專案直接略過，10 個 package 全部沒被檢查而 lint 是綠的。啟用前先讀了規則的原始碼才發現。改用 `typecheck`，並讓 `verify-boundaries` 檢查這件事（自我測試：改回預設值 → 10 個問題）。
- 其他：Nx 是靠 `package.json` 而不是資料夾名稱判斷專案類型，改名後 10 個 package 仍是 `lib`，`verify-boundaries` 的 scope 檢查沒有失效（改名前特別確認過）。

**Step 6 驗證結果**
- 全部 11 個專案 `lint / test / typecheck`（無快取、循序）全綠；`nx build shop` 成功；`pnpm verify:boundaries`：11 個專案、12 條規則、**9 條依賴**（新增 `shop-layout → catalog-data-access`、`shop → catalog-data-access`）、0 違規；`pnpm verify:fixtures` 通過；C: 複本的 `--frozen-lockfile` 安裝通過。
- 素材：203 個來源檔案全部有交代（202 複製、1 個重複下載略過），每一份不同的內容在目的地都有逐位元組相同的複本。
- 瀏覽器實測：分類列剛載入時 0 個、mock 延遲後 40 個（載入路徑真的有走到）；展開面板 40 個膠囊，第一個「首頁」為作用中（白底 + 品牌色框線）；五列的色調與透明度和 `design-tokens.md` 記錄的值相同（第三列 0.4、其餘 0.5）；沒有失敗的請求。
- bundle：測試用的入口不在裡面；122 筆 mock 商品資料在裡面（主 bundle 約多 55 KB）—— 這是 mock 資料的成本，真的 API 不會有。
- 過程中的錯誤：第一次盤點素材時只看了每個資料夾的第一層，漏掉 `主要活動/今日大牌`；匯入工具「每個檔案都要有交代否則 exit 1」的設計第一次執行就抓到，Human 也幾乎同時提醒要確認素材。另有一個測試自己的 bug（`beforeEach` 回傳了 mock，被 Vitest 當成清理函式執行）。

**Step 6 之後：對照真實網站（Human 要求）**
- 做法：以桌機尺寸（1440×900）載入真站 —— 面板原本只有 534px 寬，拿到的是手機版 —— 由上往下捲動讓每個區塊掛載，再用圖片網址裡的區塊代碼（素材檔名也帶同樣的代碼，例：moPro = `bt_7_703_02`）硬對出每個區塊。
- **核對無誤**：分類面板 40 個、9/9/9/9/4、一列一種色調且色值相同；區塊的相對順序；降價好貨 26 件（和素材數量相同）；momo 店取前三件商品的編號和素材完全相同；猜你想搜是「圖 + 關鍵字」；限時搶購卡片的欄位（促銷文字、限搶價、劃線原價、最後 N 組）；三種價格顏色。
- **錯的三項**（都已修正）：① moPro 在真站上每張圖都連到商品頁 ——「用圖磚呈現」對，「不是商品」錯；素材沒有商品編號所以維持不可點，列入 Known Gaps。② **今日暢銷榜沒有名次徽章**，那是自己加的，還被寫成一條行為規格。③ 區塊標題量不到不是因為「在跨來源 iframe 裡」，而是它是一張 1220×70 的背景圖。
- 新得知：商品卡有直式與橫式兩種版型（寫進 Step 7 開頭）；真站另有 3 個區塊與 2 個廣告 iframe 不在素材與截圖裡（列入 Known Gaps）。

**Step 7 驗證結果**
- 全部 11 個專案 `lint / test / typecheck`（無快取、循序）全綠；`nx build shop` 成功；`pnpm verify:boundaries`：11 個專案、12 條規則、**10 條依賴**（新增 `shared-ui → shared-util`）、0 違規；`pnpm verify:fixtures` 通過。
- 探針：讓 `home-page` import `embla-carousel-react` → lint 失敗，輸出含規則名稱 `no-restricted-imports` 與自訂訊息（另外也被 `@nx/dependency-checks` 擋了一次）；探針檔已刪除。
- 瀏覽器實測（1440×900，用一個**暫時的**探針頁渲染真的 fixtures，沒有 commit）：
  - 降價好貨：26 件商品分 4 頁；下一頁 0–8 → 8–16；點第 4 顆圓點 → 17–25 且「下一頁」停用；上一頁 → 第 3 頁。
  - 橫式商品卡高 174px，和真站相同；直式卡片 128×237（真站 130.7×238.3，差在探針頁的容器寬度）。
  - 箭頭 32×56、黑 30%，停用時 opacity 0.25；推薦格狀版型價格 19px `#db2777`、劃線價 `#999` line-through；`footer` 在連結外。
  - 點商品卡 → 同文件導頁到 `/goods/10019468`；console 沒有錯誤。
- 紅燈階段發現 5 個「不顯示 X」的 spec 對空元件空洞通過（只斷言不存在）→ 全部補上「該有的東西存在」的斷言。補完當下沒有回頭重跑紅燈，寫這份紀錄時才發現，於是補做：把兩個元件暫時換回空實作重跑，`PriceTag` 5 / 5、`Carousel` 11 / 11 全紅，再用 git 還原。
- **留給 Step 8 的事**：`home-page` 規格寫橫式商品卡「帶一行促銷文字」，但 `Product` 目前沒有 `promoText`（只有 `FlashSaleItem` 有）。`ProductCard` 的 `promoText` 是 slot，不受影響；Step 8 要決定促銷文字從哪來（建議：`Product` 加選填的 `promoText`，由 fixture 產生器填）。

**Step 8 驗證結果**
- 全部 11 個專案 `lint / test / typecheck`（無快取、循序）全綠；`nx build shop` 成功；`pnpm verify:boundaries`：11 個專案、12 條規則、**21 條依賴**、0 違規；`pnpm verify:fixtures` 通過；三個 `./testing` 入口都不在 bundle 內。
- 瀏覽器（1440px）：15 個區塊、灰底 `#f2f2f2` 上的 1220px 白色區帶；各區塊尺寸與真站實測值相符（hero 327×445、圖示 148.5、品牌磚 218.8×365、信用卡 250×125、猜你想搜 186×234 間距 196）。兩個商品列原本寬了 1–2px，已修正 `perView`（8.52 / 3.47）。
- 行為：8 個 banner 區塊點擊後網址不變（裡面沒有任何連結）；點降價好貨第一張卡 → 同文件導頁到 `/goods/1077163`；console 無錯誤。
- config-driven：調換版位資料第 5、6 筆 → 降價好貨與品牌折扣在畫面上對調，沒有動任何元件；已還原。
- **沒有完成的**：用眼睛逐段對照截圖。預覽面板在背景時截圖會錯位或逾時，版面與行為改由 DOM 讀取。需要 Human 在瀏覽器實際看一次。
- 過程中的錯誤：(1) 搬測試環境補丁時加的 `name in target` 判斷讓補丁被跳過（jsdom 的 `matchMedia` 屬性存在但值是 undefined）；(2) 同名的巢狀 landmark，由整合測試抓到。

**Step 9 驗證結果**
- 全部 11 個專案 `lint / test / typecheck`（無快取、循序）全綠；`nx build shop` 成功；`pnpm verify:boundaries`：**23 條依賴**（新增 `catalog-feature-recommendation → catalog-data-access`、`→ shared-util`）、0 違規；`pnpm verify:fixtures` 通過。
- 瀏覽器（用 Human 自己開著的 dev server，沒有另外啟動）：55 件依序 15 → 30 → 45 → 55，**每次都連點兩下**；55 件沒有重複；前 15 件的位置始終不變；載完最後一批按鈕消失；載入中按鈕顯示「載入中…」且 `aria-disabled="true"`；5 欄、每格 224.8px（真站 224）；console 無錯誤。
- `index.ts` 只匯出 `Recommendation`；`LoadMoreButton` 留在 feature 私有的 `ui/`。
- **沒有實測的**：「看更多」按鈕的樣式。真站的這個區塊要捲動到才掛載，預覽面板在背景時捲動不會觸發，量不到；依截圖估計，已記在 `design-tokens.md` 的「沒有量到的」。

**Step 10 驗證結果**
- 全部 11 個專案 `lint / test / typecheck`（無快取、循序）全綠；`nx build shop` 成功；`pnpm verify:boundaries`：**26 條依賴**（新增 `goods-page → catalog-data-access`、`→ shared-ui`、`→ shared-util`）、0 違規；`pnpm verify:fixtures` 通過。
- 瀏覽器（1440px）：從首頁 momo 店取的卡片「【NORDA】智慧手錶 LTE版」8,669 點進去 → 同文件導頁到 `/goods/TP00005070000393`，**標題與售價一致**。標題 19px / 700 `#404040`、價格 25px / 700 `#d62872`、主圖 440×440、三顆按鈕 160×40、直角、白字 16px / 600，底色 `#d62872` / `#1c6fbc` / `#cccccc` —— 和 Step 4 在真站量到的值相同。
- 三顆按鈕各點一次：頁面 HTML、網址、history 長度都沒變。
- `/goods/no-such-goods` →「找不到商品」、沒有按鈕、「回首頁」與 logo 都連到 `/`、footer 還在；console 無錯誤。
- **沒有用眼睛對照截圖**：預覽面板仍在背景，版面由 DOM 量測。需要 Human 在瀏覽器看一次。

> **檢查點：需求要求的兩個頁面（首頁、商品詳情頁）都已完成。** 接下來的 Step 11（限時搶購）、Step 12（今日暢銷榜）是「可砍」的，Step 13 是 README 與 CI。

**Human 的決定**：照 Agent 的建議 (a) → (b) → Step 13。

**Step 11 驗證結果**
- 全部 11 個專案 `lint / test / typecheck`（無快取、循序）全綠；`nx build shop` 成功；`pnpm verify:boundaries`：**28 條依賴**（新增 `home-feature-flash-sale → catalog-data-access`、`→ shared-util`）、0 違規；`pnpm verify:fixtures` 通過。
- 瀏覽器（1440px、真的 fixture）：倒數 2.1 秒內 02:59:55 → 02:59:53；數字方塊 28×28 `#ff4c76`；標題列 1220×70 `#ffd9e5`；29 件分成 10 / 10 / 9、3 顆圓點；卡片寬 229.6、欄距 239 —— **和真站完全相同**，框線、圓角、陰影、內距也相同。
- 下一頁 / 下一頁 / 上一頁 → 目前頁的圓點 2 → 3 → 2，最後一頁「下一頁」停用；點商品卡 → 同文件導頁到它的詳情頁；console 無錯誤。
- **和真站的差距**：卡片高 380.4（真站 386）、列距 391（真站 396），差在哪一段沒有逐項比對。列入 Known Gaps。
- **沒有驗到的**：(1) slide 實際位移 —— 預覽面板在背景，瀏覽器暫停 `requestAnimationFrame`，embla 的動畫不會前進；只驗到狀態。同一個 `Carousel` 的位移在 Step 7 面板在前景時驗過。(2) 用眼睛對照截圖 `11-flash-sale.png` —— 收尾時再試一次，面板仍在背景、截圖是空白的。**需要 Human 在瀏覽器看一次，並按一次下一頁。**
  - ↳ **Step 12 時補驗**（面板在前景）：每按一次下一頁位移 −1198px（1188 + 間距 10）、第 3 頁「下一頁」停用、上一頁回到 0；截圖與 `11-flash-sale.png` 並排對照，版面相符，看得出的差異是「搶」的形狀（真站是貼齊右下角的斜邊標籤）。
- 過程中的錯誤：量測腳本判斷目前頁時沒把 slide 的 `padding-left` 算進去；和上面的 rAF 暫停疊在一起，一開始分不出是誰的問題。已記在 `agent-workflow.md`。

**Human 的決定**：方案 A（改為 `product-rail` 的一筆設定）。動工後 Human 追加：先到 momo 首頁抓內容，再回來確認這個切法。

**Step 12 驗證結果**
- 全部 **10 個**專案 `lint / test / typecheck`（無快取、循序）全綠；`nx build shop` 成功；`pnpm verify:boundaries`：10 個專案、**26 條依賴**（少了 `home-page → home-feature-ranking` 與 `home-feature-ranking → shared-ui`）、0 違規；`pnpm verify:fixtures` 通過（best-sellers 11 件）。
- 真站（1440px）：今日暢銷榜區帶 `rgb(246, 232, 235)`、294px；卡片 335.4 × 174、每張間隔 345.4、1px `#d9d9d9`、沒有陰影；與 momo 店取同一個 class 字串。
- 自己的頁面（1440px，**面板在前景，有截圖**）：區帶同色、288px；11 張卡片 335.2 × 174、間隔 345.2、同樣的框線；標籤高 24px `#f73f64`；下一頁位移 3 張（−1036px）、上一頁回到 0；點卡片 → 同文件導頁到 `/goods/13683504`，名稱與售價（8,269）一致；首頁 15 個區塊、沒有「建置中」；console 無錯誤。
- 間距修正後的區帶高度：降價好貨 353.6（真站 352）、猜你想搜 348.1（348）、momo 店取與今日暢銷榜 288（294）。
- 截圖與 `12-best-sellers-and-mopro.png` 對照：粉色區帶、標題與紅色標籤、3.5 張橫式卡、圓點都相符。差異：商品卡沒有影片播放圖示（資料模型沒有）；標題是文字不是圖。

> **檢查點：首頁 15 個區塊與商品詳情頁都已完成。** 剩下 Step 13（README 總整理 + CI + `.prettierignore`）與 P2 加分項。

**Step 13 驗證結果**
- **三個環境都綠**：開發機（無快取、循序）；另一顆磁碟上從 GitHub 全新 clone 的空資料夾，照 README 的指令從零跑；CI（Linux、Node 24）。內容都是：10 個專案的 `lint / test / typecheck`（163 個測試）、`nx build shop`、`format:check`、`verify:boundaries`（10 個專案、26 條依賴、0 違規）、`verify:fixtures`。開發機另跑 `openspec validate --all --strict`。
- CI 的 log 確認真的跑了：`Successfully ran targets lint, test, typecheck, build for 10 projects`，約 1 分鐘。
- **沒有驗到的**：PR 的路徑（`nx affected`）與「CI 真的會紅」。兩者都要開一個故意違規的 PR，那是公開的動作，留給你決定。

> **Step 1–13 全部完成。**（寫這一行時 P2 還沒做；之後你要求直接做完，見下。）

**Human 的決定**：先把 momo 的方形標誌做成分頁圖示，commit 後直接做 P2；部署用 GitHub Pages，越簡單越好。

**P2 驗證結果**
- 全部 10 個專案 `lint / test / typecheck`（無快取、循序）全綠：173 個測試；`format:check`、`verify:boundaries`（10 個專案、26 條依賴、0 違規）、`openspec validate --all --strict` 通過。
- E2E：根路徑與子路徑（`BASE_PATH=/momo-shop-work/`）兩種 build 都 3 / 3；`tsc --listFilesOnly` 確認 typecheck 真的包含 e2e 檔。
- CI：`verify`（含 E2E）與 `deploy` 都成功；log 確認真的跑了 10 個專案與 3 個 E2E。
- 正式站 https://zach0627.github.io/momo-shop-work/：首頁 15 個區塊、倒數在跑、沒有破圖、連結都帶子路徑；直接開 `/goods/12305064`（HTTP 404、內容是 SPA）渲染出正確的商品、主圖與三顆按鈕；console 無錯誤。
- **沒有驗到的**：分頁列上圖示實際顯示的樣子（預覽工具只擷取頁面）；PR 的路徑（`nx affected`）與「CI 真的會紅」—— 仍然需要一個故意違規的 PR。

> **計畫裡的東西全部做完了**：Step 1–13、分頁圖示、P2 四項。

**下一步：由 Human 決定** —— (a) 用眼睛把正式站的兩個頁面對照截圖看一次，也看一下分頁上的圖示；(b) 要不要開一個探針 PR 驗證 CI 會紅；(c) 要不要把 OpenSpec 的 change 歸檔（`openspec archive`，會搬動 `openspec/changes/…` 的路徑，README 與文件的連結要跟著改）。