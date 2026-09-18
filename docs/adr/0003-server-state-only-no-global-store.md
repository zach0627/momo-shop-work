# ADR-0003：只有 TanStack Query，沒有全域 store

狀態：已採用

## 背景

電商專案通常一開始就會裝 Redux 或 Zustand。但本專案的兩個頁面都是展示用：詳情頁的三顆按鈕依需求**不綁任何行為**，沒有購物車、沒有登入。

## 決策

- Server state：TanStack Query v5。
- Client state：**不安裝任何全域 store**。分類展開、輪播位置、「看更多」都是元件自己的 local state。

## 理由

- 盤點後，全域 client state 的數量是 0。為了不存在的狀態安裝 store，是把「以後可能需要」當成現在的需求。
- Server state 與 client state 是兩種不同的問題（快取、失效、重試 vs. 使用者互動），不應該用同一個工具處理。即使日後加了 store，商品資料也不該放進去。
- TanStack Query 讓 mock 與真 API 有相同的契約（loading / error / cache）。「看更多」用 `useInfiniteQuery`，對應真實的分頁 API。

## 代價

出現第一個跨頁面的 client state 時，需要補上 store 與它的 Provider。

## 演進觸發條件與路徑

1. 出現購物車或會員 → 在**該 domain 的 data-access lib**（例：`cart/data-access`）引入輕量 store。
2. 購物車 × 優惠券 × 結帳這類跨 domain、有複雜狀態轉移的流程 → 改用 **Redux Toolkit**（可預測的狀態轉移、時間旅行除錯、middleware）。

讓抽換不痛的前提：**state 一律包在 data-access 的 hooks 後面**。feature 只呼叫 `useCart()`，不知道後面是 Zustand 還是 RTK，所以換實作時 feature 不用改。
