# Proposal

## Why

本專案是 momo 電商的前端重建練習：以純前端與 Mock Data 做出首頁與商品詳情頁，不呼叫任何真實 API。評估的重點是**系統設計、可維護性與工程判斷**，而不是功能完整度或 UI 精緻度。

因此需要一份「行為契約」與程式碼並存：目標畫面有 13 個業務區塊、兩條路由，若只用截圖與口頭描述，很難判斷實作是否符合預期、哪些是刻意不做的。這份 change 把**可觀察的行為**寫成規格，讓日後對照時有明確依據 —— 包含展示用頁面「刻意不做互動」這類最容易被誤解為未完成的決定。

## What Changes

- 新增全站外框：sticky 頂部列（捲動後轉為 compact）、可展開的分類導覽、footer。
- 新增首頁 `/`：由一份版位資料驅動 13 個業務區塊（15 筆設定），區塊型別未知時降級而不壞頁。
- 新增商品詳情頁 `/goods/:goodsId`：商品圖、標題與說明、三顆動作按鈕。**三顆按鈕只渲染、不綁行為**（展示用）。
- 新增「你可能會喜歡」：初始 3 列，點「看更多」續載，全部載完後按鈕消失。
- 新增商品目錄的資料契約：以 repository interface 為接縫，提供 mock 實作與決定性 fixture。
- 明確的非目標：搜尋功能、購物車、結帳、登入、RWD、banner 可點。

工程約束（分層依賴方向、框架耦合的單點放行、共用門檻）**不在這個 change 裡**：它們已經實作並驗證過，屬於現況，寫在主規格 `openspec/specs/module-boundaries/`。這個 change 的所有實作都必須在那份規格的約束下進行，但不修改它的任何 requirement。

## Capabilities

### New Capabilities

- `app-layout`: 全站共用外框的行為 —— 頂部列在捲動時的保留與變形、分類面板的展開與收合、footer。
- `home-page`: 首頁的區塊組成、順序來源、以及遇到未知區塊型別時的降級行為。
- `goods-detail`: 商品詳情頁的內容、商品不存在時的處理，以及「展示用、不綁行為」這項約束。
- `product-recommendation`: 「你可能會喜歡」的分頁載入與「看更多」的出現與消失條件。
- `product-catalog`: 商品資料的對外契約 —— 查詢結果、找不到時的回應、分頁語意、分類清單、限時搶購的時間基準。

### Modified Capabilities

<!-- 無。既有的 `module-boundaries` 不修改任何 requirement，所以不需要 delta。 -->

## Impact

- **新增**：`apps/shop` 的路由與 composition root；10 個 lib 的實作內容（目前皆為空殼）。
- **既有**：不改動已建立的分層與 lint 規則（主規格 `module-boundaries`）。這個 change 會第一次在專案之間產生真正的依賴，`pnpm verify:boundaries` 從此有實質的東西可檢查。
- **相依套件**：React Router 8、TanStack Query v5、Tailwind CSS v4（已安裝）；embla-carousel（尚未安裝）。React Router 8 要求 Node `>=22.22.0`，`package.json` 的 `engines` 以此為準。
- **文件**：與 `docs/architecture.md`、`docs/adr/` 並存 —— ADR 記錄「為什麼選這個方案」，本 change 的規格記錄「系統該有什麼可觀察的行為」。
- **不影響**：無真實後端、無資料庫、無使用者資料；全部為靜態部署。
