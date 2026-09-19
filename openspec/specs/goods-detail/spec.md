# goods-detail Specification

## Purpose

定義商品詳情頁 `/goods/:goodsId` 顯示的內容，以及「這是展示用頁面、動作按鈕不綁行為」這項刻意的範圍限制。

## Requirements

### Requirement: 顯示商品內容

詳情頁 SHALL 依網址中的 `goodsId` 顯示對應商品：左側為商品圖，右側為商品標題、商品說明（條列）與價格。

#### Scenario: 商品存在

- **WHEN** 使用者開啟 `/goods/<存在的 goodsId>`
- **THEN** 頁面顯示該商品的圖片、標題、條列式商品說明與售價

#### Scenario: 與首頁卡片為同一件商品

- **WHEN** 使用者從首頁點擊某張商品卡進入詳情頁
- **THEN** 詳情頁的標題與售價和該商品卡一致

### Requirement: 顯示三顆動作按鈕

詳情頁 SHALL 在商品資訊下方顯示三顆按鈕：「直接購買」「放入購物車」「加入追蹤」。

#### Scenario: 按鈕存在

- **WHEN** 使用者開啟任一存在的商品詳情頁
- **THEN** 頁面上可以找到名稱分別為「直接購買」「放入購物車」「加入追蹤」的三顆按鈕

### Requirement: 動作按鈕不綁任何行為

詳情頁是展示用頁面。三顆動作按鈕 MUST NOT 導頁、MUST NOT 改變頁面狀態（例如購物車數量或追蹤狀態）、MUST NOT 發出任何請求。

這是刻意的範圍限制，不是未完成的功能。購物車與結帳屬於未來的 domain（見 `docs/adr/0006-domain-dependency-map.md`）。

#### Scenario: 點擊「直接購買」

- **WHEN** 使用者點擊「直接購買」
- **THEN** 網址不改變、頁面內容不改變

#### Scenario: 點擊「放入購物車」

- **WHEN** 使用者點擊「放入購物車」
- **THEN** 網址不改變、頁面上沒有任何數量或狀態變化

#### Scenario: 點擊「加入追蹤」

- **WHEN** 使用者點擊「加入追蹤」
- **THEN** 網址不改變、按鈕的外觀與文字不改變

### Requirement: 商品不存在時顯示提示

`goodsId` 找不到對應商品時，詳情頁 SHALL 顯示「找不到商品」的提示，並 MUST 保留外框與回首頁的途徑。

#### Scenario: 開啟不存在的商品

- **WHEN** 使用者開啟 `/goods/<不存在的 goodsId>`
- **THEN** 頁面顯示「找不到商品」的提示、不顯示三顆動作按鈕，且 logo 仍可連回首頁
