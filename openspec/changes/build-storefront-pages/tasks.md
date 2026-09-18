# Tasks

> 與 `docs/MoMO面試/Phase 2 — Implementation.md` 的 13 個步驟一一對應（組號 = Step 編號）。改動大的步驟會拆成多個 commit，每個 commit 單獨為綠。
> 規格見 `specs/`（本 change 新增的行為）與主規格 `openspec/specs/module-boundaries/`（所有任務都必須遵守的既有約束），做法見 `design.md`。有邏輯的任務先寫 spec、確認紅燈且理由正確，再實作到綠燈。

## 1. Workspace（Step 1）

- [x] 1.1 建立 Nx 23 workspace（pnpm workspaces + TS project references）並安裝 `@nx/react`；清掉範本附帶的無關檔案；驗證：`git status` 只剩自己說得清楚的檔案
- [x] 1.2 產生 `shop` app（React 19 + Vite + Vitest）；驗證：`nx run-many -t lint test typecheck build` 全綠（無快取），App spec 先紅後綠
- [x] 1.3 根 `package.json` 宣告 `packageManager` 與 `engines.node`（取相依套件中最嚴格的實際要求：React Router 8 的 `>=22.22.0`）；驗證：`pnpm install --frozen-lockfile` 成功

## 2. Packages 與依賴規則（Step 2）

- [x] 2.1 產生 10 個 package 並加上 `type:` 與 `scope:` 標籤；驗證：逐一核對 10 個 `package.json` 的 `nx.tags` 為兩個獨立字串
- [x] 2.2 設定 `depConstraints`（6 條 type + 5 條 scope）與 `no-restricted-imports`（router 只放行 `apps/shop`、embla 只放行 `shared/ui`）；驗證：5 個違規探針全部被 lint 擋下、2 個對照組通過（主規格 `module-boundaries`）

## 3. 設計文件、驗證工具與規格（Step 3）

- [x] 3.1 撰寫 `docs/architecture.md`、ADR 0001–0006、`docs/agent-workflow.md`、`CLAUDE.md`、README（含照實的 Tradeoffs）；驗證：文件內相對連結可開啟
- [x] 3.2 新增 `tools/verify-boundaries.mjs`（`pnpm verify:boundaries`）；驗證：全部符合時 exit 0，故意把一個 package 的標籤改壞時 exit 1 並指出該 package（主規格 `module-boundaries`「約束本身被自動驗證」）
- [x] 3.3 補齊 `pnpm-lock.yaml` 的 workspace importer；驗證：在沒有 `node_modules` 的乾淨環境 `pnpm install --frozen-lockfile` 成功（主規格「全新環境可以重現安裝」）
- [x] 3.4 建立 OpenSpec：`config.yaml`（專案脈絡與撰寫規則）、主規格 `module-boundaries`（已實作的約束）、本 change 的 proposal / 5 份 spec / design / tasks；驗證：`openspec validate --all --strict` 通過
- [x] 3.5 補驗主規格中「只能透過公開入口使用一個 package」：相對路徑引用被 lint 擋下、套件名稱加內部路徑被型別檢查擋下（TS2307）；驗證：兩個探針的實際輸出記錄在 `docs/agent-workflow.md`，探針已移除

## 4. Walking skeleton（Step 4）

- [x] 4.0 建立跨專案依賴的做法：要 import 另一個 package 的專案，先在自己的 `package.json` 宣告 `"@momo/<package>": "workspace:*"`，執行 `pnpm install` 與 `nx sync`；驗證：`nx sync:check` 通過、lockfile 的 importer 有對應的依賴
- [x] 4.1 安裝 `react-router`、`@tanstack/react-query`、`tailwindcss`、`@tailwindcss/vite`；驗證：`pnpm install` 成功且 lockfile 有更新
- [x] 4.2 TDD：`shared/util` 的 `paths`（`paths.home()`、`paths.goods(id)`、route pattern）；驗證：spec 先紅後綠，並移除該 package 的 `passWithNoTests`
- [x] 4.3 TDD：`shared/ui` 的 `AppLink` —— 預設渲染 `<a href>`，有 `LinkProvider` 時改用注入的元件；驗證：兩個情境的 spec 皆通過，並移除該 package 的 `passWithNoTests`
- [x] 4.4 `shared/ui/styles/theme.css` 的 `@theme` tokens（品牌粉、價格紅、容器寬 1220px），app 的 `styles.css` 引入並以 `@source` 掃描 packages；驗證：dev server 上 token 生效
- [x] 4.5 `apps/shop` 的 providers、router（lazy routes、路徑取自 `paths`）、router-link adapter、3 個 route 檔；驗證：`/`、`/goods/123`、`/nope` 皆可開啟，`/nope` 顯示找不到頁面（spec `app-layout`「每個頁面都有共用外框」）
- [x] 4.6 `shop/layout`（當時名為 `shell/feature`）的 `AppLayout` 空殼，`home/page` 與 `goods/page` 的 placeholder（goods 顯示收到的 `goodsId`）；驗證：`pnpm verify:boundaries` 出現第一批依賴且 0 違規
- [x] 4.7 以瀏覽器量測真實網站（首頁與商品詳情頁）的計算樣式，建立兩層 design token（`tokens.primitive.css` / `tokens.semantic.css`）並關閉 Tailwind 預設色盤與字級；驗證：建置產物含 semantic utility、`--color-brand` 指向 primitive、不含 `--color-pink-600` 與 `--text-sm`；dev server 上量到 logo `#d62872`、footer `#09355d`、內容寬 1220px、字體堆疊與真站一致；對照表記錄於 `docs/design-tokens.md`
- [x] 4.8 補上 generator 漏掉的 DOM 型別庫：app 與 9 個 React package 的 tsconfig 設 `package: [es2022, dom, dom.iterable]`；驗證：`typecheck` 從失敗（TS2812：`HTMLElement` 沒有 `getAttribute`）變為通過

## 5. Layout（Step 5）

> 原本排在共用元件之後。layout 是每一頁的骨架，所以提前到 walking skeleton 之後；原第 5、6 組順延為第 6、7 組。

- [x] 5.1 量測真實網站「選擇分類」展開面板的樣式（膠囊底色、字色、圓角、間距），加入兩層 token 並記錄到 `docs/design-tokens.md`；驗證：建置產物含新的 semantic utility
- [x] 5.2 搬移 layout 需要的素材（logo、footer 用圖）到 `apps/shop/public/assets/`，資產路徑採相對於文件 base 的寫法（`assets/...`）；驗證：dev server 上圖片在 `/` 與 `/goods/:id` 都載入成功
- [x] 5.3 TDD：`category-nav` —— 橫向分類列、「首頁」為作用中、展開 / 收合「選擇分類」面板；分類清單暫放本 package 私有的 `model/`；驗證：spec 檢查 `aria-expanded` 的兩個狀態與面板列出全部分類（spec `app-layout`「分類導覽可展開與收合」），並移除本 package 的 `passWithNoTests`
- [x] 5.4 TDD：`search-box` —— 可輸入、送出時不導頁；驗證：spec 確認 submit 事件被 `preventDefault`（spec `app-layout`「搜尋框為展示用」）
- [x] 5.5 TDD：`AppLayout` 的 compact 行為 —— 主 header 離開視窗時頂部列出現搜尋框、回到視窗時恢復；以替身 `IntersectionObserver` 驅動；驗證：spec 通過（spec `app-layout`「頂部列在捲動時保留並轉為 compact」）
- [x] 5.6 `top-bar`（`position: fixed`、高 40px，版面預留空間）、`main-header`（logo 連回首頁 + 搜尋框 + 熱搜關鍵字）、`footer`（防詐騙提醒框 + 六欄連結）；全部為 package 私有，`index.ts` 只匯出 `AppLayout`；驗證：dev server 實際捲動確認頂部列保留並轉 compact；切到 `/goods/:id` 外框仍在；以 `getComputedStyle` 抽查數值與真站一致；與截圖 `01`–`04`、`15` 對照
- [x] 5.7 （計畫外，Human review 後）外框升為 `type:layout` 一層並搬到 `libs/shop/layout`；`scope:layout` 改名為 `scope:shop`；驗證：5 個探針 —— 改規則前 layout→feature 被擋、改規則後通過；page→layout、feature→layout、`scope:shop`→`scope:home` 被擋；app→layout 通過（主規格 `module-boundaries`「依賴方向是單向的」新增的 3 個 scenario）；`pnpm verify:boundaries` 12 條規則、0 違規
- [x] 5.8 （計畫外，Human review 後）查證 Nx 對 layout 的放法（官方文件、`nrwl/react-template`、`nrwl/nx-examples`、`feature-shell` 模式），比較三種方案後維持 `libs/shop/layout`；寫成 `docs/adr/0007-layout-as-a-lib-and-a-tier.md`，並在 `architecture.md` §3 註明 `page` 與 `layout` 是自訂的 type；驗證：文件內相對連結可開啟
- [x] 5.9 （計畫外，Human review 後）`libs/` 改為 `packages/`，並照 pnpm 與 Nx 對 package 的慣例調整：保留依 domain 分組、拿掉 `src/lib/` 這一層、設計 token 的樣式改由 `@momo/shared-ui` 的 `exports` 公開、執行期依賴下放到各 package 並以 pnpm catalog 統一版本、以 `@nx/dependency-checks` 強制；驗證：每一步的 JS 與 CSS 產物雜湊不變；樣式入口的兩個探針與依賴宣告的 5 個探針（主規格 `module-boundaries`「package 宣告自己使用的依賴」與新增的樣式 scenario）；`verify-boundaries` 對「規則開著卻沒作用」的自我測試回報 10 個問題；C: 複本的 `--frozen-lockfile` 安裝通過；寫成 `docs/adr/0008-packages-not-libs.md`

## 6. 素材與商品資料（Step 6）

- [x] 6.1 以 `tools/import-assets.mjs` 將 `D:\repo\momo素材` 的全部素材依 slug 對照搬到 `apps/shop/public/assets/`（含巢狀的 `主要活動/今日大牌` → `home/main-events/today-brand`；9 個中文檔名改為 ASCII）；驗證：以內容雜湊對帳 —— 203 個來源檔案，202 個複製、1 個重複下載略過（與同資料夾的檔案逐位元組相同），每一份不同的內容在目的地都有相同的複本；圖片路徑無中文；共 7.8 MB
- [x] 6.2 `tools/gen-fixtures.mjs` 由素材產生 `products.generated.ts` 與 `collections.generated.ts`（122 件商品、5 個集合；名稱、價格、說明由 id 的雜湊決定，不用亂數也不讀時鐘）；`categories.ts`（40 個分類）**改為手寫**：清單是從真站讀來的，沒有素材可以產生它；驗證：連續執行兩次產出逐位元組相同，`node tools/gen-fixtures.mjs --check` 通過（spec `product-catalog`「資料是決定性的」「查詢分類清單」）
- [x] 6.3 TDD：`createMockCatalogRepository({ data, now, latencyMs, flashSaleHours })`；驗證：對空實作 17 個 spec 中 14 個因斷言失敗（其餘 3 個是「查不到」的情況，空實作剛好滿足）；實作後全過。涵蓋商品存在 / 不存在、集合順序、未知集合回空清單、分頁的中間頁 / 較短的最後一頁 / 恰好滿的最後一頁 / 超出範圍、延遲、`endsAt` 在兩個不同的注入時間點；另一組對真資料檢查規格寫明的數字（55 件推薦的兩個分頁、40 個分類、首頁每件商品都能以同名同價查到、限搶價低於原價）（spec `product-catalog`）
- [x] 6.4 `CatalogRepositoryProvider`、`useCatalogRepository`、6 個 query hooks、`query-keys.ts`；次要入口 `@momo/catalog-data-access/testing`（fake repository + `CatalogTestProvider`，以 `exports` 的 `./testing` 公開）；於 app 的 providers 注入 mock（延遲 150 ms）；本 package 在自己的 `package.json` 宣告 `react` 與 `@tanstack/react-query`（`catalog:`）；驗證：`useRecommendations` 先對空實作紅燈；`nx test catalog-data-access` 26 個通過；測試用的入口不在 app 的 bundle 內
- [x] 6.5 `shop/layout` 改讀 `useCategories`：宣告 workspace 依賴 → `pnpm install` → `pnpm nx sync`，lockfile 的 importer 已確認；刪除 package 私有的分類清單；`Category` 不帶顏色，`CategoryNav` 依「第幾列」決定色調（每列 9 個）；驗證：兩個新 spec 先紅燈；`pnpm verify:boundaries` 出現 `shop-layout -> catalog-data-access`，9 條依賴、0 違規；瀏覽器實測 40 個分類由 catalog 載入、五列的色調與透明度和 `design-tokens.md` 記錄的值相同

## 7. 共用元件（Step 7）

- [ ] 7.1 TDD：`formatPrice`（`49900 → "49,900"`、`0`）；驗證：spec 通過
- [ ] 7.2 TDD：`PriceTag` —— 有原價才顯示劃線價；驗證：兩個情境的 spec 通過（spec `home-page`「商品卡顯示售價與原價」）
- [ ] 7.3 TDD：`ProductCard`（`ProductCardItem` 最小形狀、連到 `paths.goods(id)`、slots）；驗證：spec 通過，且 `shared/ui` 內沒有任何 data-access 的 import（spec `module-boundaries`「共用 ui 不認識 domain 資料型別」）
- [ ] 7.4 安裝 `embla-carousel-react`，實作 `Carousel`（prev / next / dots / `perView`）與 `SectionHeader`；驗證：`nx lint shared-ui` 通過、其他 package import embla 時被擋

## 8. 首頁（Step 8）

- [ ] 8.1 `home/data-access`：`HomeSection` union、`home-layout.ts`（15 筆）、`HomeRepository`、Provider、`useHomeLayout`，於 app 注入；驗證：`nx test home-data-access` 通過
- [ ] 8.2 `shared/util` 的 `telemetry`（`reportError` / `track`，sink 可替換），接到 QueryClient 的 `onError`；驗證：spec 確認 sink 被呼叫
- [ ] 8.3 TDD：`SectionRenderer` —— 依型別渲染、未知型別不渲染且呼叫 `reportError`；驗證：spec 通過（spec `home-page`「未知的區塊型別不影響頁面」）
- [ ] 8.4 以 mapped type 定義 registry，3 個 feature 型別先指向 placeholder；驗證：暫時從 union 多加一個型別時 `typecheck` 失敗，還原後通過
- [ ] 8.5 6 個通用 block（hero、banner-carousel、banner-grid、shortcut-bar、notice、product-rail）；驗證：dev server 依截圖 01–12 由上到下對照；點降價好貨的商品導到 `/goods/:id`；banner 不可點
- [ ] 8.5a TDD：`HomePage` 的載入中與載入失敗狀態（注入會延遲 / 會失敗的 fake repository）；驗證：spec 通過（spec `home-page`「載入中與載入失敗有明確狀態」）
- [ ] 8.6 驗證 config-driven：調換 `home-layout.ts` 兩行，畫面順序跟著變；驗證完還原（spec `home-page`「區塊順序由版位資料決定」）

## 9. 你可能會喜歡（Step 9）

- [ ] 9.1 TDD（注入 fake repository）：初始 1 頁 → 點「看更多」增加 → 全部載完按鈕消失；載入中重複點擊只載一批；驗證：spec 通過（spec `product-recommendation`）
- [ ] 9.2 `ui/recommendation-grid`、`ui/load-more-button` 為 feature 私有，registry 換成真的元件；驗證：dev server 上 55 件依序顯示 15 / 30 / 45 / 55，且這兩個元件不在該 package 的 `index.ts`

## 10. 商品詳情頁（Step 10）

- [ ] 10.1 TDD：商品存在時標題、說明、價格與三顆按鈕都在；商品不存在時顯示 not-found 且沒有按鈕；驗證：spec 通過（spec `goods-detail`）
- [ ] 10.2 TDD：三顆按鈕點擊後網址與頁面內容不變；驗證：spec 通過（spec `goods-detail`「動作按鈕不綁任何行為」）
- [ ] 10.3 `goods-gallery`、`goods-info`、`goods-actions`、`goods-not-found` 為頁面私有，route 負責 `useParams → props`；驗證：從首頁任一商品卡進入，標題與售價一致

## 11. 限時搶購（Step 11，可砍）

- [ ] 11.1 TDD：`get-remaining`（含過期歸零）、`chunk`，以 fake timers 驗證倒數每秒遞減；驗證：spec 通過（spec `home-page`「限時搶購顯示倒數」）
- [ ] 11.2 私有 ui（header、countdown、stock-left、grab-badge）、每張 slide 10 件；registry 換成真的元件；驗證：spec 確認卡片顯示限搶價、劃線原價與「最後 N 組」（spec `home-page`「限時搶購商品顯示限搶價與剩餘組數」）；dev server 上倒數在跳，與截圖 `11-flash-sale.png` 對照

## 12. 今日暢銷榜（Step 12，可砍）

- [ ] 12.1 `ranking` + 私有 `rank-badge`（透過 `ProductCard` 的 `topBadge` slot）；registry 換成真的元件；驗證：第一張卡片標示第 1 名（spec `home-page`「今日暢銷榜顯示名次」）

## 13. 交付（Step 13）

- [ ] 13.1 README 更新為完成狀態：啟動方式、與真實網站的差異（Known Gaps，沒做完的照實寫）、後續演進；驗證：依 README 的指令在乾淨環境從零跑一次
- [ ] 13.2 `.github/workflows/ci.yml`：`pnpm install --frozen-lockfile`、`pnpm verify:boundaries`、`nx affected -t lint test build`（可砍）；驗證：push 後 CI 綠燈
- [ ] 13.3 最終驗證：`nx run-many -t lint test typecheck` 與 `nx build shop` 全綠、`pnpm verify:boundaries` 0 違規、`openspec validate --strict` 通過

## 14. 加分項（P2）

- [ ] 14.1 Playwright smoke：首頁 → 點商品卡 → 詳情頁標題可見；驗證：`nx e2e shop-e2e` 通過
- [ ] 14.2 `SectionBoundary`（error boundary）：單一區塊拋錯時其餘區塊仍顯示並回報；驗證：spec 讓一個 block 拋錯
- [ ] 14.3 `Skeleton` 載入狀態；驗證：以延遲的 fake repository 確認出現
- [ ] 14.4 靜態部署並在 README 放網址；驗證：網址可開啟兩條路由
