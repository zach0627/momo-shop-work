# Tasks

> 起因：Human 對照真站截圖，指出官方優惠這一段長得不像。以真站（2026-09-20）為準。

## 1. 量測與規格

- [x] 1.1 在真站（1440 × 900）讀 DOM 量測官方優惠三塊與整頁的區塊間隔；驗證：量測值見 design 的表格。**過程中的錯**：第一次想用「秒殺」文字找共同容器，失敗 —— 這些字是印在圖上的；改用圖片的網址與位置定位
- [x] 1.2 proposal、spec delta（熱搜排行、區塊間隔由版位資料決定）、design

## 2. 測試先行

- [x] 2.1 版位資料：下方留間隔的區塊正好是詐騙提醒、momo 店取、信用卡加碼、限時搶購；熱搜 9 個，依名次，上升與新上榜的標示正確
- [x] 2.2 元件：區塊渲染只在標示的區塊後面留一個間隔；捷徑列依序顯示名次、關鍵字、熱度，上升與新上榜有文字；熱搜沒有任何連結；沒有熱搜時不顯示清單
- [x] 2.3 對舊實作跑：5 個紅燈，理由都正確（版位資料沒有間隔的標示、沒有熱搜；捷徑列沒有排行、找不到清單）

## 3. 實作

- [x] 3.1 `home/data-access`：`gapAfter`、`HotSearch`、`hotSearches`；版位資料照真站標示間隔，熱搜照目標截圖
- [x] 3.2 `home/page`：`PageSurface` 拿掉 `gap-4`；`SectionRenderer` 依 `gapAfter` 放間隔；`SectionFrame` 的 `endsWithDots`（輪播、商品列）；`ShortcutBar` 改為兩欄
- [x] 3.3 `shared/ui`：名次圓圈、新上榜、關鍵字、分隔線的顏色與 12px 字級

## 4. 驗證

- [x] 4.1 `home-data-access`、`home-page`、`shared-ui`、`shop` 的 lint / test / typecheck 全綠
- [x] 4.2 瀏覽器（1440 × 900）逐項量測，和真站一致（design 的表格）：官方優惠圖示 192.5、捷徑＋熱搜 136、三塊之間 0；整頁的 16px 間隔正好 4 個，位置正確；console 沒有錯誤。熱度的灰與熱搜的圓角刻意沿用既有 token（design §6）
- [x] 4.3 完整關卡：10 個專案 lint / test / typecheck（184 個測試）、build、E2E 3 / 3、`format:check`、`verify:boundaries`（0 違規）、`verify:fixtures`、`openspec validate --all --strict` 全綠
- [x] 4.4 部署後在正式站量（commit `f000372`，CI 的 verify 與 deploy 都成功）：和本機相同 —— 圖示輪播 192.5、捷徑＋熱搜 136、分隔線在 x = 610、熱搜一項 188.3 × 32（間距 6）、三塊之間 0、整頁 4 個 16px 間隔；熱搜沒有任何連結；這次載入沒有失敗的請求

## 5. 文件

- [x] 5.1 README Known Gaps（膠囊是素材差異；熱搜已做，內容固定、不可點）、`docs/design-tokens.md`、`docs/architecture.md` §6、`docs/agent-workflow.md`、Phase 2 筆記
