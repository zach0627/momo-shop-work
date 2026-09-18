# ADR-0004：首頁 config-driven

狀態：已採用

## 背景

momo 首頁由上到下有 13 個業務區塊。從素材檔名（`bt_7_701_01_e71` = block 701 / element 71）可以看出真實網站是 CMS 區塊制：行銷人員調整版位，不需要工程師發版。

## 決策

首頁由一份資料 `HomeSection[]`（discriminated union）驅動。`SectionRenderer` 透過一張型別化的 registry 把 `type` 對到元件。

- 沒有邏輯的純版面區塊，收斂成 6 種通用 block（hero、banner-carousel、banner-grid、shortcut-bar、notice、product-rail），留在 `home/page`。
- 有自己邏輯 / 資料 / 重用性的區塊（限時搶購、暢銷榜、你可能會喜歡）是獨立的 feature lib，registry 只是把它們掛上去。

## 理由

- 13 個區塊只需要 9 種 renderer；調整順序、上下架區塊都只改資料。
- registry 用 mapped type：union 新增型別卻沒寫 renderer 會在**編譯期**報錯。
- 執行期遇到未知的 type（後端先上了新區塊）→ 不渲染並回報，頁面不壞。這是 API 與前端分開發版時必要的容錯。

## 代價

- 多一層間接：要找「降價好貨長什麼樣」得先看 layout 資料，再找對應的 block。
- 通用 block 的 props（`perView`、`columns`）會隨需求變多。當某個區塊需要的特例超過 2–3 個，就該把它從通用 block 升級成自己的 feature，而不是繼續加 props。

## 演進觸發條件

接 CMS API 時：只換 `home/data-access` 的 repository 實作，`HomeSection` 型別就是與 CMS 的契約。
