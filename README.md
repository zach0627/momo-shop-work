# momo-shop-work

Mocking momoshop —— 以純前端重建 momo 電商的首頁與商品詳情頁。全程使用 Mock Data，不呼叫任何真實 API。

> **狀態：進行中。** 目前完成 workspace、10 個 domain lib 與由 lint 強制的依賴規則、設計文件、ADR 與行為規格（OpenSpec）。頁面實作依 [`tasks.md`](./openspec/changes/build-storefront-pages/tasks.md) 進行，已勾選的項目即已完成。

## 先看這幾份

| 文件                                                                                    | 內容                                                                                                                                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`openspec/specs/module-boundaries/`](./openspec/specs/module-boundaries)               | **現行規格**（OpenSpec）：已實作並驗證過的工程約束 —— 依賴方向、框架耦合的單點放行、lib 的公開入口、可重現的安裝。每一條「會被擋下」都放過違規樣本確認       |
| [`openspec/changes/build-storefront-pages/`](./openspec/changes/build-storefront-pages) | **待實作的行為規格**：5 個 capability、每個 scenario 都能直接轉成測試；`design.md` 說明專案設置原因與每個設計決策及放棄的方案；`tasks.md` 是可勾選的實作進度 |
| [`openspec/config.yaml`](./openspec/config.yaml)                                        | 專案脈絡（為什麼存在、為什麼這樣設置、不能破的規則）—— 會被帶進之後每一份規格的撰寫指示                                                                      |
| [`docs/architecture.md`](./docs/architecture.md)                                        | 系統怎麼切、為什麼這樣切、規模變大時怎麼管                                                                                                                   |
| [`docs/design-tokens.md`](./docs/design-tokens.md)                                      | 兩層 design token（Primitive / Semantic）；每個顏色、字級、框線的數值都是從真實網站的計算樣式**量出來的**，並記錄在哪裡量到、哪些沒量到                      |
| [`docs/adr/`](./docs/adr)                                                               | 6 個決策：背景、理由、**代價**、演進觸發條件                                                                                                                 |
| [`docs/agent-workflow.md`](./docs/agent-workflow.md)                                    | Human ↔ Agent 怎麼協作；Human 糾正了 Agent 什麼；Agent 在哪裡出錯                                                                                            |
| [`docs/MoMO面試/`](./docs/MoMO面試)                                                     | 原始的需求解析、設計筆記與逐步計畫                                                                                                                           |
| [`docs/pictures/`](./docs/pictures)                                                     | 目標畫面（真實網站）的截圖，依頁面由上到下編號                                                                                                               |

## 技術選型

Nx（pnpm workspaces）· React 19 · TypeScript strict · Vite · Vitest + Testing Library
已引入：React Router 8（library mode）· TanStack Query v5 · Tailwind CSS v4（兩層 design token）　預計引入：embla-carousel

刻意**沒有**安裝全域 store：兩個頁面都是展示用，盤點後全域 client state 為 0（[ADR-0003](./docs/adr/0003-server-state-only-no-global-store.md)）。

## 架構一頁摘要

```
app → layout / page → feature → ui / data-access → util
```

- 一個薄殼 app + 10 個依 domain 與職責切分的 lib。依賴方向由 `@nx/enforce-module-boundaries` 強制（7 條 type 規則 + 5 條 scope 規則），不靠自律。
- 只有 `layout`（跨頁保留的外框）與 `page` 能組合多個 feature；`feature ✗ feature`。兩者同層，由 router 巢狀組合、互不 import —— 和 Next.js 的 `layout.tsx` / `page.tsx` 是同一種關係。
- `react-router` 只准出現在 `apps/shop`、`embla` 只准出現在 `libs/shared/ui`（`no-restricted-imports`，預設全禁、單點放行）。
- **Rule of Two**：被 ≥2 個專案使用的東西才能進 `shared/*`；其餘留在各 lib 私有的 `ui/`、`model/`。
- 首頁由 `HomeSection[]` 驅動（config-driven）；資料走 Repository interface + Context 注入。

這些規則**被驗證過真的會擋**：建立時放入 5 個故意違規的探針檔，全部被 lint 擋下，2 個合法的對照組通過。

## Tradeoffs —— 照實說

**以目前 2 個頁面的規模，這個結構是偏重的。**

10 個 lib 帶來約 80 個設定檔。它換到的邊界，在這個規模下用單一 Vite app + 資料夾分層 + `eslint-plugin-boundaries` 也做得到，而且設定少一個數量級。

層級也是：7 種 `type:` 裡，`layout` 這一層目前只約束一個 lib。它存在的理由（外框日後要能組合別的 domain 的 feature）在只有一種外框、沒有購物車的現在還用不到。

如果這是一個真實的、只有 2 頁的專案，**我不會從這裡開始**。我會從單一 app 開始，等出現第二個團隊、或建置與測試時間變成問題時，再把 domain 抽成 lib。

這裡選擇 Nx + domain libs，是因為題目明確把「系統演進」與「可維護性」放在功能完成度之前。這個結構要回答的問題是「變成 30 頁、5 個團隊時怎麼辦」：

- 成長方式是**新增 scope**（`cart`、`checkout`、`payment`、`brand`、`member`…），而不是養大既有的 lib —— 現有的 10 個 lib 不需要修改。
- Domain 之間的依賴方向有一張明確、無環、需要審查才能修改的地圖（[ADR-0006](./docs/adr/0006-domain-dependency-map.md)）。

它也有已知的弱點，寫在 [`architecture.md` §5](./docs/architecture.md)：`catalog/data-access` 是最可能先變肥的 lib、`shared/ui` 長大後會讓 `nx affected` 失去意義、scope 放行清單會隨時間腐化。每一項都寫了拆分的觸發條件。

其他取捨：

| 決策                          | 換到什麼                                            | 付出什麼                                                                                             |
| ----------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| SPA 而非 Next                 | 靜態部署、沒有 server、沒有 RSC 邊界的決策          | 沒有 SSR 的 SEO 與 LCP —— 不適合直接上正式環境的電商（[ADR-0001](./docs/adr/0001-spa-over-next.md)） |
| 首頁 config-driven            | 13 個區塊只需要 9 種 renderer；調整版位只改資料     | 多一層間接；通用 block 的 props 會膨脹（[ADR-0004](./docs/adr/0004-config-driven-home-page.md)）     |
| Repository + Context 而非 MSW | 接縫在 TypeScript interface 上；測試可注入小的 fake | 不驗證 HTTP 細節（[ADR-0005](./docs/adr/0005-repository-seam-with-context-injection.md)）            |
| TDD 只打有邏輯的地方          | 測試數量少、每個都有意義                            | 純版面區塊沒有單元測試保護                                                                           |

## 開發

```bash
pnpm install
pnpm nx dev shop                           # 開發伺服器
pnpm nx run-many -t lint test typecheck    # 全部專案
pnpm nx build shop
pnpm nx graph                              # 看依賴圖
pnpm verify:boundaries                     # 確認依賴規則套用到每個專案、依賴圖 0 違規
openspec validate build-storefront-pages --strict   # 驗證行為規格的格式
```

需要 Node `>=22.22.0`（React Router 8 的要求；本專案以 Node 24 開發與驗證）與 pnpm 12。`package.json` 的 `packageManager` 鎖定 `pnpm@12.4.2`，較舊的 pnpm 會自動切換到這個版本。
