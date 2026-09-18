# ADR-0002：單一 app + domain packages（Nx）

狀態：已採用

## 背景

需要一個能表達「系統怎麼演進」的結構。候選方案：(a) 單一 Vite app、以資料夾分層；(b) Nx 單一 app + packages；(c) Nx 多個 app。

## 決策

Nx monorepo，**一個** app（`apps/shop`）當薄殼，程式碼放在依 domain 與職責切分的 packages，依賴方向以 `@nx/enforce-module-boundaries` 強制。

## 理由

- 邊界由工具強制而不是靠 code review 記得。
- `nx affected` 與快取以 package 為單位：改結帳不會重測首頁。
- packages 已依 domain 切好，日後要把某個 domain 抽成獨立 app 時成本低。

不做多 app：目前沒有第二個需要獨立部署、獨立 owner 的路由群。為了「看起來像 monorepo」而多開 app 是過度設計。

## 代價（照實說）

**以目前 2 個頁面的規模，這個結構是偏重的。** 10 個 package 約帶來 80 個設定檔，換到的邊界在這個規模下用資料夾 + `eslint-plugin-boundaries` 也做得到。

如果這是一個真實的、只有 2 頁的專案，我會從方案 (a) 開始，等出現第二個團隊或建置時間變成問題再抽 package。這裡選 (b) 是因為題目明確把「系統演進」與「可維護性」放在功能完成度之前，而這個結構是用來回答「變成 30 頁、5 個團隊時怎麼辦」的。

另一個實際成本：Nx 的專案圖計算與 plugin 啟動在慢速磁碟上很有感（見 `agent-workflow.md` 的環境備註）。

## 演進觸發條件

- 不同團隊負責不同路由群（例：`/live`、`/discover`、商家後台）→ 拆成多個 app，共用同一批 packages。
- 需要獨立部署或獨立發版節奏 → Module Federation 或獨立 repo。
- 刷卡 / 付款：信用卡表單屬於 PCI-DSS 範圍，實務上要隔離成獨立 app 或使用金流商的 hosted fields。`payment` 自成一個 scope，抽離成本低。
