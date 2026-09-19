# app-layout Specification

## Purpose

定義每個頁面共用的外框：頂部列、主 header、分類導覽與 footer，以及它們在捲動與互動時的可觀察行為。

## Requirements

### Requirement: 每個頁面都有共用外框

系統 SHALL 在每一條路由（包含找不到的路徑）都顯示同一組外框：頂部列、主 header、分類導覽、頁面內容、footer，順序由上到下。

#### Scenario: 首頁顯示外框

- **WHEN** 使用者開啟 `/`
- **THEN** 頁面依序出現頂部列、主 header、分類導覽、首頁內容、footer

#### Scenario: 商品詳情頁顯示同一組外框

- **WHEN** 使用者開啟 `/goods/<任一 goodsId>`
- **THEN** 頁面出現與首頁相同的頂部列、主 header、分類導覽與 footer

#### Scenario: 不存在的路徑仍有外框

- **WHEN** 使用者開啟一個沒有定義的路徑
- **THEN** 頁面顯示「找不到頁面」的內容，且外框完整

### Requirement: 頂部列在捲動時保留並轉為 compact

頂部列 SHALL 在頁面捲動時固定在視窗頂端。當主 header 捲出視窗後，頂部列 MUST 轉為 compact 樣式並顯示搜尋框；主 header 回到視窗內時 MUST 恢復原狀。

#### Scenario: 捲動後頂部列仍可見

- **WHEN** 使用者往下捲動超過主 header 的高度
- **THEN** 頂部列仍固定在視窗頂端，並顯示搜尋框

#### Scenario: 捲回頂端時恢復

- **WHEN** 使用者捲回頁面頂端，主 header 重新出現在視窗內
- **THEN** 頂部列恢復為未捲動時的樣式

### Requirement: 分類導覽可展開與收合

分類導覽 SHALL 顯示一列橫向分類。使用者操作展開控制項時 MUST 顯示「選擇分類」面板列出全部分類；再次操作 MUST 收合。展開控制項 MUST 以 `aria-expanded` 反映目前狀態。

#### Scenario: 展開分類面板

- **WHEN** 分類面板為收合狀態，使用者點擊展開控制項
- **THEN** 顯示列出全部分類的面板，且控制項的 `aria-expanded` 為 `true`

#### Scenario: 收合分類面板

- **WHEN** 分類面板為展開狀態，使用者再次點擊展開控制項
- **THEN** 面板隱藏，且控制項的 `aria-expanded` 為 `false`

### Requirement: Logo 連回首頁

主 header 的 logo SHALL 是連回 `/` 的連結。

#### Scenario: 從詳情頁點 logo

- **WHEN** 使用者在商品詳情頁點擊 logo
- **THEN** 導向首頁 `/`

### Requirement: 搜尋框為展示用

搜尋框 SHALL 可以輸入文字，但 MUST NOT 觸發搜尋或導頁。

#### Scenario: 送出搜尋

- **WHEN** 使用者在搜尋框輸入文字並按下搜尋
- **THEN** 頁面與網址都不改變
