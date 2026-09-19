# Proposal

## Why

部署在 GitHub Pages 上的 demo 打開後，圖片要等很久才出現。量測後確認主因是檔案大小：素材是 momo 的原圖（最寬 1000px），商品卡卻只顯示 128–225px，首頁 157 張圖合計 6,842 KB；GitHub Pages 是單純的靜態主機，不會替我們縮圖，而且每個還沒被它的 CDN 快取的檔案，都要約 0.45 秒才開始傳。

**這是為了 GitHub Pages 上的展示所做的優化**，不是正式環境的圖片方案：正式環境的圖片應該由圖片 CDN 依裝置即時產生，這個專案沒有、也不需要。

## What Changes

- 素材匯入時，商品圖產生兩個尺寸：商品卡用的（這件商品出現過的最大卡片的兩倍）與詳情頁用的（最長邊 880px，詳情頁顯示 440px）。一律不放大。
- 猜你想搜的圖縮到 372px（原圖 1000px、顯示 186px）。
- 原圖不再放進網站。
- 商品卡顯示小的那一張，詳情頁顯示大的那一張。

## Capabilities

### New Capabilities

- `image-delivery`：網站提供的圖片解析度 —— 不比畫面需要的大太多，也不比畫面需要的小。

### Modified Capabilities

（無。首頁與詳情頁顯示什麼內容沒有改變，只有圖片檔案的解析度與大小。）

## Non-goals

- **正式環境的圖片方案**：依裝置寬度與像素密度提供多種尺寸（`srcset`）、AVIF、圖片 CDN。GitHub Pages 做不到即時縮圖，而 demo 的卡片寬度是固定的，一種尺寸就夠。
- **banner 類的圖**：主要活動、品牌折扣、信用卡、moPro 等都在顯示尺寸的 2.5 倍以內，這次不動（合計約 2.6 MB，仍是首頁最大的一塊）。
- **模擬的 API 延遲**：兩次各 150ms 的延遲是為了展示載入狀態，保留。
- **延遲載入（lazy loading）的策略**：不變。

## Impact

- `tools/import-assets.mjs`（縮圖）、`tools/gen-fixtures.mjs`（卡片用小圖、詳情頁用大圖）、`apps/shop/public/assets`（商品圖與猜你想搜重新產生）。
- 商品資料的 `imageUrl` 改指向小圖、`images` 是大圖；詳情頁改用 `images` 的第一張。資料形狀不變。
- 新增開發依賴 `sharp`（只給匯入工具用，不進 bundle）。
