# momo-shop-work

Mocking momoshop —— 以純前端重建 momo 電商的首頁與商品詳情頁。全程使用 Mock Data，不呼叫任何真實 API。

> **狀態：進行中。** 目前完成 workspace、10 個 domain package 與由 lint 強制的依賴規則、設計文件、ADR 與行為規格（OpenSpec）、全站 layout、素材與商品資料層（mock repository + query hooks）、共用元件（`PriceTag`、兩種版型的 `ProductCard`、`Carousel`、`SectionHeader`）、**由版位資料驅動的首頁**（15 筆設定、6 種通用 block；商品卡可點進詳情頁）。「你可能會喜歡」每次載入 3 列、載完後「看更多」消失。**商品詳情頁**（展示用：主圖、標題、說明、價格與三顆不綁行為的按鈕；商品不存在時顯示提示）。需求要求的兩個頁面都已完成；限時搶購與今日暢銷榜目前是佔位區塊。頁面實作依 [`tasks.md`](./openspec/changes/build-storefront-pages/tasks.md) 進行，已勾選的項目即已完成。

## 先看這幾份

| 文件                                                                                    | 內容                                                                                                                                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`openspec/specs/module-boundaries/`](./openspec/specs/module-boundaries)               | **現行規格**（OpenSpec）：已實作並驗證過的工程約束 —— 依賴方向、框架耦合的單點放行、package 的公開入口、可重現的安裝。每一條「會被擋下」都放過違規樣本確認   |
| [`openspec/changes/build-storefront-pages/`](./openspec/changes/build-storefront-pages) | **待實作的行為規格**：5 個 capability、每個 scenario 都能直接轉成測試；`design.md` 說明專案設置原因與每個設計決策及放棄的方案；`tasks.md` 是可勾選的實作進度 |
| [`openspec/config.yaml`](./openspec/config.yaml)                                        | 專案脈絡（為什麼存在、為什麼這樣設置、不能破的規則）—— 會被帶進之後每一份規格的撰寫指示                                                                      |
| [`docs/architecture.md`](./docs/architecture.md)                                        | 系統怎麼切、為什麼這樣切、規模變大時怎麼管                                                                                                                   |
| [`docs/design-tokens.md`](./docs/design-tokens.md)                                      | 兩層 design token（Primitive / Semantic）；每個顏色、字級、框線的數值都是從真實網站的計算樣式**量出來的**，並記錄在哪裡量到、哪些沒量到                      |
| [`docs/adr/`](./docs/adr)                                                               | 8 個決策：背景、理由、**代價**、演進觸發條件                                                                                                                 |
| [`docs/agent-workflow.md`](./docs/agent-workflow.md)                                    | Human ↔ Agent 怎麼協作；Human 糾正了 Agent 什麼；Agent 在哪裡出錯                                                                                            |
| [`docs/MoMO面試/`](./docs/MoMO面試)                                                     | 原始的需求解析、設計筆記與逐步計畫                                                                                                                           |
| [`docs/pictures/`](./docs/pictures)                                                     | 目標畫面（真實網站）的截圖，依頁面由上到下編號                                                                                                               |

## 技術選型

Nx（pnpm workspaces）· React 19 · TypeScript strict · Vite · Vitest + Testing Library
已引入：React Router 8（library mode）· TanStack Query v5 · Tailwind CSS v4（兩層 design token）· embla-carousel 8（只准 `shared/ui` import）

刻意**沒有**安裝全域 store：兩個頁面都是展示用，盤點後全域 client state 為 0（[ADR-0003](./docs/adr/0003-server-state-only-no-global-store.md)）。

## 架構一頁摘要

```
app → layout / page → feature → ui / data-access → util
```

- 一個薄殼 app + 10 個依 domain 與職責切分的 package。依賴方向由 `@nx/enforce-module-boundaries` 強制（7 條 type 規則 + 5 條 scope 規則），不靠自律。
- 只有 `layout`（跨頁保留的外框）與 `page` 能組合多個 feature；`feature ✗ feature`。兩者同層，由 router 巢狀組合、互不 import —— 和 Next.js 的 `layout.tsx` / `page.tsx` 是同一種關係。
- `react-router` 只准出現在 `apps/shop`、`embla` 只准出現在 `packages/shared/ui`（`no-restricted-imports`，預設全禁、單點放行）。
- **Rule of Two**：被 ≥2 個專案使用的東西才能進 `shared/*`；其餘留在各 package 私有的 `ui/`、`model/`。
- 首頁由 `HomeSection[]` 驅動（config-driven）；資料走 Repository interface + Context 注入。

這些規則**被驗證過真的會擋**：建立時放入 5 個故意違規的探針檔，全部被 lint 擋下，2 個合法的對照組通過。

## Tradeoffs —— 照實說

**以目前 2 個頁面的規模，這個結構是偏重的。**

10 個 package 帶來約 80 個設定檔。它換到的邊界，在這個規模下用單一 Vite app + 資料夾分層 + `eslint-plugin-boundaries` 也做得到，而且設定少一個數量級。

層級也是：7 種 `type:` 裡，`layout` 這一層目前只約束一個 package。它存在的理由（外框日後要能組合別的 domain 的 feature）在只有一種外框、沒有購物車的現在還用不到。

如果這是一個真實的、只有 2 頁的專案，**我不會從這裡開始**。我會從單一 app 開始，等出現第二個團隊、或建置與測試時間變成問題時，再把 domain 抽成 package。

這裡選擇 Nx + domain packages，是因為題目明確把「系統演進」與「可維護性」放在功能完成度之前。這個結構要回答的問題是「變成 30 頁、5 個團隊時怎麼辦」：

- 成長方式是**新增 scope**（`cart`、`checkout`、`payment`、`brand`、`member`…），而不是養大既有的 package —— 現有的 10 個 package 不需要修改。
- Domain 之間的依賴方向有一張明確、無環、需要審查才能修改的地圖（[ADR-0006](./docs/adr/0006-domain-dependency-map.md)）。

它也有已知的弱點，寫在 [`architecture.md` §5](./docs/architecture.md)：`catalog/data-access` 是最可能先變肥的 package、`shared/ui` 長大後會讓 `nx affected` 失去意義、scope 放行清單會隨時間腐化。每一項都寫了拆分的觸發條件。

其他取捨：

| 決策                                                  | 換到什麼                                                                                | 付出什麼                                                                                                                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SPA 而非 Next                                         | 靜態部署、沒有 server、沒有 RSC 邊界的決策                                              | 沒有 SSR 的 SEO 與 LCP —— 不適合直接上正式環境的電商（[ADR-0001](./docs/adr/0001-spa-over-next.md)）                                                            |
| 首頁 config-driven                                    | 13 個區塊只需要 9 種 renderer；調整版位只改資料                                         | 多一層間接；通用 block 的 props 會膨脹（[ADR-0004](./docs/adr/0004-config-driven-home-page.md)）                                                                |
| Repository + Context 而非 MSW                         | 接縫在 TypeScript interface 上；測試可注入小的 fake                                     | 不驗證 HTTP 細節（[ADR-0005](./docs/adr/0005-repository-seam-with-context-injection.md)）                                                                       |
| 整個 layout 放 package，而非 `apps/shop/src/layouts`  | app 只有接線；路由層級的組合（page、layout）都受 lint 約束                              | 多一條自訂的型別規則，而且和 Nx 官方範例的放法不同（[ADR-0007](./docs/adr/0007-layout-as-a-lib-and-a-tier.md)）                                                 |
| 每個 package 宣告自己的依賴，版本用 pnpm catalog 統一 | package 不靠根目錄偷渡依賴；整個 workspace 只有一份 React；少宣告、多宣告都由 lint 擋下 | 檢查工具只看得到明寫的 import，只寫 JSX 的 package 要單點放行；而且它在設定不對時會靜默地不檢查，得另外驗證（[ADR-0008](./docs/adr/0008-packages-not-libs.md)） |
| 共用元件的選項跟著第一個使用者出現，不預留            | `ProductCard` 的每個 prop 都說得出誰在用；計畫裡的 `topBadge` 因為查無使用者而沒做      | 限時搶購需要的三個選項（「限搶價」標籤、浮起的外框、紅色 23px 價格）要等做到它時再回頭改 `shared/ui`（`design.md` 第 10 點）                                    |
| 輪播的換頁邏輯對假的 embla API 測試                   | jsdom 不做排版也測得到包裝邏輯；另有一個 spec 用真的 embla 掛載，套件升級改名時會被發現 | 「真的會捲動」沒有自動化測試，只在瀏覽器手動驗證過                                                                                                              |
| TDD 只打有邏輯的地方                                  | 測試數量少、每個都有意義                                                                | 純版面區塊沒有單元測試保護                                                                                                                                      |

## Known Gaps

對照真實網站（桌機版，2026-09-19）之後確認的差異。刻意不做的項目另見 [`architecture.md`](./docs/architecture.md) §1。

| 差異                                                                                                    | 原因                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 區塊標題是文字；真站的標題是一張 1220×70 的圖                                                           | 提供的素材裡沒有標題圖。字級為依截圖的估計值                                                                                                                      |
| 「moPro 會員專屬價」的圖不可點；真站上每張圖會連到商品頁                                                | 素材的檔名沒有商品編號，圖上印的品名與價格也無法和商品資料對應。連到一個名稱與價格都不同的詳情頁，比不可點更糟                                                    |
| Banner、猜你想搜的關鍵字圖不可點；真站會連到活動頁或搜尋頁                                              | 這些頁面不在範圍內                                                                                                                                                |
| 真站另有 3 個區塊與 2 個廣告 iframe 沒有做（熱搜排行列、一組連到商品的直式圖磚、一排 610×172 的活動圖） | 它們不在提供的素材與目標截圖裡；真站的區塊會隨檔期增減                                                                                                            |
| 商品名稱、品牌與價格是產生的假資料，品牌是虛構的                                                        | 見 [`architecture.md`](./docs/architecture.md) §7                                                                                                                 |
| 「今日大牌」只有一格；真站是 2×2 共四格                                                                 | 素材只提供了四格中的一格。版位資料支援多格，補上圖就會變成 2×2                                                                                                    |
| Banner 的 `alt` 是「區塊名稱 + 序號」，不是圖片內容的描述                                               | 這些圖的文字是印在圖上的，沒有逐張抄寫。猜你想搜例外：它的 `alt` 就是關鍵字                                                                                       |
| 猜你想搜 9 個關鍵字中有 3 個是自己寫的                                                                  | 目標截圖只看得到前 6 個；後 3 個依圖片內容命名（其中「哈利波特」後來發現真站也有）                                                                                |
| 降價好貨與品牌折扣之間的「訂閱 moPro+」橫幅、官方優惠的熱搜排行、官方優惠的黃色底沒有做                 | 素材裡沒有橫幅與熱搜的資料；黃色底是截圖當天的活動檔期樣式，實測當天真站是白底                                                                                    |
| 主要活動的圓點在圖的下方；真站疊在圖上                                                                  | `Carousel` 的圓點目前只有一種位置                                                                                                                                 |
| 「你可能會喜歡」的商品卡沒有星等、評論數、標籤（速 / 折價券 / 登記）與總銷量                            | 商品資料模型沒有這些欄位；要做的話是 `Product` 加欄位、從商品卡的 `footer` slot 放進去，元件不用改                                                                |
| 「看更多」按鈕的尺寸與顏色是依截圖估的                                                                  | 真站的這個區塊要捲動才會掛載，量測時預覽面板在背景，沒有發生                                                                                                      |
| 詳情頁只有主圖，沒有縮圖列與放大鏡；沒有相關商品、付款與配送資訊、麵包屑、「你可能會喜歡」              | 需求筆記寫明詳情頁只要「左邊商品圖、右邊 title 與商品說明、下面三顆按鈕」，其餘可忽略；縮圖切換與放大屬於互動，而這一頁是展示用                                   |
| 詳情頁的三顆按鈕點了沒有反應                                                                            | **刻意的**，不是未完成：需求明訂不可往下做。購物車與結帳是未來的 domain（[ADR-0006](./docs/adr/0006-domain-dependency-map.md)），有測試確保按鈕不會被順手接上行為 |
| 主 header 右側的三張活動小圖沒有做                                                                      | 素材裡沒有這三張圖                                                                                                                                                |

## 開發

```bash
pnpm install
pnpm nx dev shop                           # 開發伺服器
pnpm nx run-many -t lint test typecheck    # 全部專案
pnpm nx build shop
pnpm nx graph                              # 看依賴圖
pnpm verify:boundaries                     # 確認依賴規則套用到每個專案、依賴圖 0 違規
pnpm verify:fixtures                       # 商品 fixtures 與素材一致（過期時失敗）；重新產生用 pnpm gen:fixtures
openspec validate build-storefront-pages --strict   # 驗證行為規格的格式
```

需要 Node `>=22.22.0`（React Router 8 的要求；本專案以 Node 24 開發與驗證）與 pnpm 12。`package.json` 的 `packageManager` 鎖定 `pnpm@12.4.2`，較舊的 pnpm 會自動切換到這個版本。
