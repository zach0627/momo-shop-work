# Design

> 動機見 `proposal.md` 的 Why；可觀察的行為見 `specs/`。這份文件說明**怎麼做、為什麼選這個做法、放棄了什麼**。
> 完整的架構文件在 `docs/architecture.md`，每個重大決策的背景與代價在 `docs/adr/`。本文只摘要與規格實作直接相關的部分，並指向原文。

## Context

### 專案的出發點

- **題目**：純前端重建 momo 電商，全程 Mock Data、不呼叫真實 API。建議路由至少一條（`/`、`/goods/...` 等）。
- **評分重點**：問題拆解與系統演進能力、tradeoff 思考、交付品質、Agent 協作與監督能力 —— 明確寫著「不需追求完整商業功能或 UI 精緻度」。
- **交付方式**：公開的 GitHub repo，README 與 commit history 都是評分的一部分。要以「長期維護者」而不是「功能實作者」的角度撰寫。

這三點決定了整個專案的取向：**用 2 個頁面的實作，展示一套在 30 個頁面、5 個團隊時仍能運作的結構**，並誠實說明這在 2 頁時是偏重的。

### 目前的狀態

- Nx 23 workspace（pnpm workspaces + TypeScript project references）、1 個 app + 10 個 lib，皆已建立但內容為空殼。
- 依賴規則已由 lint 強制，並經負向驗證（5 個違規探針全部被擋）與 `pnpm verify:boundaries` 確認套用到每個專案。這些已實作的約束寫在主規格 `openspec/specs/module-boundaries/`，本 change 在它的約束下實作、不修改它。
- 專案之間目前沒有任何依賴（libs 都是空的）。本 change 的第一步會產生第一批跨專案 import。
- 目標畫面的截圖在 `docs/pictures/`，依頁面由上到下編號。

### 限制

- 開發機資源有限（2018 年筆電、CPU 常滿載），Nx / Vitest 指令慢；驗證一律 `--parallel=1`。見 `docs/agent-workflow.md` §6。
- 詳情頁依需求是**展示用**，三顆按鈕不綁行為。這是需求，不是技術限制。

## Goals / Non-Goals

**Goals:**

- 依賴方向由工具強制，違反時 lint 失敗，而不是靠 review。
- 框架（router、輪播）的耦合各自集中在一個專案，替換時只改一處。
- 首頁版位是資料，調整順序與上下架不改元件。
- 資料來源可替換：mock → 真實 API 只改 composition root。
- 有邏輯的程式碼有測試，且測試不依賴真實 fixture 的內容與筆數。

**Non-Goals:**

- SSR / SEO / LCP 最佳化（SPA 的代價，見 Decision 1）。
- 全域 client state（盤點後為 0，見 Decision 4）。
- 像素級還原、RWD、動畫。
- 純版面區塊的單元測試（刻意的取捨，見 Risks）。

## Decisions

### 1. SPA（Vite）而非 Next

**選擇**：React 19 + Vite 的 SPA，React Router 8 library mode，route 層級 lazy load。

**為什麼**：mock-only 的 demo 沒有 SEO 需求；靜態檔案丟到任何靜態主機就能看。Next App Router 會引入 RSC / client boundary 的決策，這些決策在沒有真實資料來源時無法驗證，只會消耗時間。

**放棄的方案**：Next.js —— 正式環境的電商幾乎一定是 SSR，這點在 ADR-0001 照實記錄為代價。

**保留遷移路徑的方式**：router 只准出現在 `apps/shop`（lint 強制）；libs 以 props 接收路由參數；連結透過 `AppLink`，實際的 Link 元件由 app 注入。遷移時優先考慮 React Router framework mode（同一套 router）。→ `docs/adr/0001-spa-over-next.md`

### 2. Nx 單一 app + 依 domain 切分的 libs

**選擇**：一個薄殼 app，程式碼放在 10 個 lib，每個 lib 帶 `type:`（層級）與 `scope:`（domain）兩個標籤，依賴規則由 `@nx/enforce-module-boundaries` 強制。

**為什麼**：邊界由工具強制；`nx affected` 與快取以 lib 為單位；日後把某個 domain 抽成獨立 app 的成本低。

**放棄的方案**：

- 單一 Vite app + 資料夾分層 + `eslint-plugin-boundaries` —— **以 2 頁的規模這其實更合適**，設定少一個數量級。選 Nx 是因為題目把「系統演進」放在功能完成度之前。這個代價寫在 README 的 Tradeoffs。
- 多個 app —— 目前沒有第二個需要獨立部署或獨立 owner 的路由群。

→ `docs/adr/0002-single-app-with-domain-libs.md`

### 3. 分層：新增 `type:page` 作為唯一的組合層

**選擇**：`app → layout / page → feature → ui / data-access → util`。`feature ✗ feature`；只有 `layout` 與 `page` 能同時 import 多個 feature。`layout`（跨頁保留的外框）與 `page` 同層：由 router 巢狀組合，彼此不 import。

**為什麼**：首頁要組合限時搶購、暢銷榜、你可能會喜歡三個 feature，但 feature 之間不能互相依賴。若沒有 page 層，只能讓其中一個 feature 依賴其他 feature，規則就破了。

**放棄的方案**：把首頁所有區塊放在同一個 `home/feature` —— 設計討論時被 Human 指出問題：「你可能會喜歡」在真實網站的詳情頁也會出現，埋在 `home` 裡 `goods` 就拿不到。

### 4. 只有 TanStack Query，不裝全域 store

**選擇**：server state 用 TanStack Query；client state 全部是元件的 local state。

**為什麼**：盤點後全域 client state 為 0 —— 詳情頁按鈕不綁行為、沒有購物車、沒有登入。「以後可能需要」不是現在的需求。「看更多」用 `useInfiniteQuery`，與真實的分頁 API 同契約。

**演進路徑**：出現購物車 → 在 `cart/data-access` 引入輕量 store；跨 domain 流程複雜（購物車 × 優惠券 × 結帳）→ Redux Toolkit。前提是 state 一律包在 data-access 的 hooks 後面，換實作時 feature 不用改。→ `docs/adr/0003-server-state-only-no-global-store.md`

### 5. 首頁 config-driven：9 種 renderer 對應 15 筆設定

**選擇**：`HomeSection` 是 discriminated union；`SectionRenderer` 透過型別化的 registry 對應 `type → Component`。

- 沒有邏輯的區塊收斂成 6 種通用 block，留在 `home/page`。
- 有自己邏輯 / 資料 / 重用性的 3 個區塊是獨立的 feature lib。
- registry 以 mapped type 定義：union 新增型別卻沒寫 renderer → **編譯期報錯**。
- 執行期遇到未知型別 → 不渲染、回報錯誤事件（對應 spec `home-page` 的「未知的區塊型別不影響頁面」）。

**為什麼**：素材檔名（`bt_7_701_01_e71` = block 701 / element 71）顯示真實網站是 CMS 區塊制。前端與 CMS 分開發版時，未知型別的容錯是必要的。

**放棄的方案**：13 個區塊各寫一個元件、在 JSX 裡依序排列 —— 調整版位要改 code，也無法表達「CMS 驅動」這件事。→ `docs/adr/0004-config-driven-home-page.md`

### 6. Repository interface + Context 注入，而非 MSW

**選擇**：每個 data-access lib 定義 repository interface 與 mock 實作，以 React Context 注入；用哪個實作由 `apps/shop` 的 providers 決定。

```
UI → query hooks → useCatalogRepository() → CatalogRepository（interface）
                                              ├─ createMockCatalogRepository({ now, latencyMs })  ← 現在
                                              └─ createHttpCatalogRepository({ baseUrl })         ← 以後
```

**為什麼**：

- 元件直接 import fixture → 換 API 要改所有元件。
- MSW 要攔的是我們自己編出來的 URL，沒有真實 HTTP 契約可模擬；還多一個 service worker 的部署變數。
- Context 注入讓測試放入小而可控的 fake，不依賴 55 筆真實 fixture 的內容。
- mock 注入 `now()`：限時搶購結束時間 = 現在 + N 小時，任何一天打開都有倒數（對應 spec `product-catalog`），測試也能控制時間。

→ `docs/adr/0005-repository-seam-with-context-injection.md`

### 7. 首頁版位與商品目錄是兩個 data-access

**選擇**：`home/data-access`（版位）與 `catalog/data-access`（商品）分開，兩者只靠集合名稱字串鬆耦合、互不 import。

**為什麼**：真實電商中版位來自 CMS、商品來自商品服務，是兩個後端。混在一起之後最難拆。

### 8. 共用門檻：Rule of Two

**選擇**：被 ≥2 個專案使用的東西才能進 `shared/*`；其餘放在該 lib 的 `ui/`（展示）或 `model/`（邏輯），不從 `index.ts` 匯出。升級路徑：lib 私有 → 同 domain 共用（`libs/<scope>/ui`）→ 跨 domain 才進 `shared/ui`。

**為什麼**：`shared/ui` 是全專案都依賴的 lib，長大後任何修改都讓 `nx affected` 等於全部。設計討論時 Human 指出原案把只有一個使用者的「看更多」按鈕與倒數計時放進 shared，修正後 `shared/ui` 從 10 個元件瘦身到 6 個。

**「私有」由誰保證**（實際驗證過，不是假設）：每個 lib 的 `package.json` 的 `exports` 只公開 `.`（即 `src/index.ts`）。以「套件名稱 + 內部路徑」引用會在型別檢查失敗（TS2307）；以相對路徑跨專案引用會被 lint 擋下。兩道關卡來自不同工具，所以驗證關卡必須同時跑 `lint` 與 `typecheck`。

### 9. `shared/ui` 不認識 domain model

**選擇**：共用元件只宣告自己需要的最小形狀（例：`ProductCardItem`），domain 的 `Product` 靠 TypeScript structural typing 直接傳入。

**為什麼**：若 `ProductCard` 直接吃 `Product`，就變成 `ui → data-access`，違反自己訂的分層。這是設計 v1 → v2 自我審查時發現的問題。

### 10. 商品卡用 slots 而不是 variant

**選擇**：`ProductCard` 提供 `topBadge`、`promoText`、`footer`、`priceLabel` 等 slot。限時搶購的「最後 N 組」與「搶」、暢銷榜的名次徽章，都由各自的 feature 填入。

**為什麼**：三種卡片長得不一樣。用 `variant="flash-sale"` 會讓 `shared/ui` 知道業務概念；slot 讓裝飾留在它所屬的 feature。

### 11. 交付順序：walking skeleton 先行

**選擇**：先打通 `/` 與 `/goods/:goodsId` 兩條路由（空殼），再逐一填滿；不可砍的（首頁骨架、你可能會喜歡、詳情頁、README）排在可砍的（限時搶購、暢銷榜）之前。

**為什麼**：若按水平分層（util → ui → data → …）做，時間用完時可能連一個完整頁面都沒有。

### 12. 兩層 design token，數值從真實網站量出

**選擇**：顏色、字級、圓角、陰影走兩層 token。**Primitive**（`--momo-magenta-600`）是純調色盤，定義在 `:root`、刻意不放進 `@theme`，所以 Tailwind 不會為它產生 utility、元件用不到。**Semantic**（`--color-brand`、`--color-price`、`--text-ec-sm`）指向 primitive，是元件唯一能用的一層。Tailwind 預設的色盤與字級被關閉（`--color-*: initial; --text-*: initial;`），不是 token 的顏色與字級根本不存在。

**為什麼**：品牌改色只改 primitive 一行；換主題只覆寫 semantic，元件不動。同一個色碼可以有兩個用途而不互相綁死（`brand` 與 `action-primary` 目前都是同一個洋紅）。

**數值來源**：以瀏覽器開啟真實網站，用 `getComputedStyle` 讀出計算樣式（首頁與一個商品詳情頁，桌機版面）。最初的 token 是看截圖估的，品牌色估成 `#e6007f`、文字估成純黑 —— 實測是 `#d62872` 與 `#404040`。這是 Human 要求對照真實網站後才修正的。

**放棄的方案**：

- 單層 token（語意名稱直接對色碼）—— 最初的做法。無法在不動元件的情況下換主題，也無法表達「同色不同用途」。
- 直接用 Tailwind 預設色盤 —— 真實網站有自己的色階（`#d62872` 不在 Tailwind 色盤裡），而且預設色盤開著就等於允許繞過 token。

量不到的（區塊標題、hover 狀態）在 token 裡標明為估計值。完整對照表在 `docs/design-tokens.md`。

## Risks / Trade-offs

- **[結構以目前規模偏重：10 個 lib 約 80 個設定檔]** → 在 README 的 Tradeoffs 照實說明，並寫下「如果是真實的 2 頁專案我不會從這裡開始」。
- **[`catalog/data-access` 最可能先變肥：目前同時放商品、分類、限時搶購、暢銷榜、推薦]** → 觸發條件：出現第 2 種促銷型別或促銷有自己的後端 → 抽 `promotion/data-access`。見 `docs/architecture.md` §5。
- **[`shared/ui` 長大後 `nx affected` 失去意義]** → 觸發條件：元件超過約 15 個 → 依元件家族拆分。
- **[scope 放行清單隨時間腐化，最後誰都能依賴誰]** → 新增任何放行前必須先修改 ADR-0006；`CLAUDE.md` 明令 agent 不得為了讓 lint 通過而修改規則。
- **[標籤寫壞的 lib 會靜默地不受任何規則約束，lint 仍是綠的]** → 建立 lib 時真的發生過。`pnpm verify:boundaries` 檢查標籤格式，並已驗證會在標籤壞掉時報紅。
- **[跨專案 import 需要三個動作才會成立：宣告 `workspace:*` 依賴、`pnpm install`、`nx sync`；漏掉任何一個，型別檢查或 Nx 的同步檢查會失敗]** → pnpm 的嚴格 `node_modules` 不會讓未宣告的 workspace 套件被解析到，這其實是好事（依賴必須明說）。做法寫成 `tasks.md` 的 4.0，並列入 `CLAUDE.md`。
- **[Tailwind 的任意值語法 `text-[#d62872]` 仍能繞過 token]** → 目前靠 review 與 `CLAUDE.md` 的規則；要工具化可加一條 lint 規則禁止 className 出現 `[#`。
- **[通用 block 的 props 會隨需求膨脹]** → 某個區塊的特例超過 2–3 個時，把它升級成自己的 feature，而不是繼續加 props。
- **[純版面區塊沒有單元測試]** → 刻意的取捨：這些區塊沒有邏輯，測試只會驗證 JSX 長什麼樣。視覺正確性交給截圖對照與（P2）Playwright smoke test。
- **[Repository 層不驗證 HTTP 細節]** → 有真實 API 契約後再引入 MSW 做 contract test，接在 HTTP 實作後面，與本設計不衝突。
- **[空的 lib 設了 `passWithNoTests`，日後測試被誤刪不會被發現]** → 每個 lib 加入第一個 spec 時移除這一行，列入 `tasks.md`。

## Migration Plan

無需遷移：這是專案的第一個 change，沒有既有使用者或資料。部署為靜態檔案，回滾即重新部署前一個版本。

## Open Questions

- 部署平台（Cloudflare Pages 或 GitHub Pages）：屬於 P2，不影響規格、做法或任務拆分。
