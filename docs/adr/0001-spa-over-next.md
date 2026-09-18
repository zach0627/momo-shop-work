# ADR-0001：SPA（Vite）而非 Next

狀態：已採用

## 背景

題目是純前端、Mock Data、無真實 API。交付物要讓審閱者能直接打開看。真實的電商首頁與商品頁則高度依賴 SEO 與 LCP，正式環境幾乎一定是 SSR / streaming。

實測（2026-09-18）：momo 真實網站是以 **Next.js + Tailwind CSS** 建置的（頁面含 `next-route-announcer`，class 為 Tailwind utility），印證了「正式環境的電商是 SSR」這個前提。

## 決策

用 React + Vite 做 SPA，路由用 React Router 8 的 library mode（`createBrowserRouter`），route 層級 lazy load。

## 理由

- Mock-only 的 demo 沒有 SEO 需求；靜態檔案丟到任何靜態主機就能看，沒有 server 要維運。
- Next App Router 會引入 RSC / client boundary 的決策，這些決策在沒有真實資料來源時無法被驗證，只會消耗時間。

## 代價

- 首屏是空白 HTML + JS，沒有 SSR 的 LCP 與 SEO。
- 這個選擇**不適合**直接上正式環境的電商。

## 如何保留遷移路徑

遷移成本被刻意壓低，靠的是三條已經由 lint 強制的規則：

1. `react-router` 只准出現在 `apps/shop`。packages 拿到的是 props（例：`goodsId`），不是 `useParams`。
2. 連結透過 `@momo/shared-ui` 的 `AppLink`；實際的 Link 元件由 app 注入。換成 `next/link` 只改一處。
3. 資料走 TanStack Query，它本身支援 SSR hydration。

## 演進觸發條件

需要 SEO 或 LCP 成為指標時：優先考慮 React Router 的 framework mode（同一套 router，改動最小），其次才是 Next。
