# 設計 Token

顏色、字級、圓角、陰影都不寫死在元件裡，而是走兩層 token。來源檔在 [`packages/shared/ui/src/styles/`](../packages/shared/ui/src/styles)。

## 兩層結構

| 層            | 檔案                   | 回答的問題                                                                    | 誰可以用                           |
| ------------- | ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| **Primitive** | `tokens.primitive.css` | 我們**有哪些**顏色 —— 純調色盤，名稱不帶用途（`--momo-magenta-600`）          | 只有 semantic 層。元件**不可以**用 |
| **Semantic**  | `tokens.semantic.css`  | 這個顏色**用在哪裡**（`--color-brand`、`--color-price`、`--color-ink-muted`） | 元件唯一能用的一層                 |

為什麼要兩層：

- **品牌改色**只改 primitive 的一行，所有指向它的 semantic token 一起變。
- **換主題**（深色模式、活動檔期換色）只覆寫 semantic 層，元件完全不用動。
- 同一個色碼可以有兩種用途而不互相綁死：`--color-brand` 與 `--color-action-primary` 現在都指向 `--momo-magenta-600`，但日後「直接購買」要換色時不會連帶改到 logo。

### 怎麼保證元件不會繞過 token

靠結構，不靠自律：

1. **Primitive 刻意不放在 `@theme` 裡**，只是 `:root` 上的一般 CSS 變數，所以 Tailwind 不會為它們產生 utility —— 根本沒有 `text-momo-magenta-600` 可以用。
2. **Tailwind 預設的色盤與字級被關掉**（`--color-*: initial; --text-*: initial;`），所以 `text-pink-600`、`bg-white`、`text-sm` 在這個專案裡不存在。
3. 已用建置產物驗證：產出的 CSS 含有 `.text-brand`、`.bg-footer`、`.max-w-shop` 等 semantic utility，`--color-brand` 的值是 `var(--momo-magenta-600)`，且不含 `--color-pink-600`、`--color-neutral-900`、`--text-sm`。

仍然擋不住的是 Tailwind 的任意值語法（`text-[#d62872]`）。目前靠 review；要工具化的話可以加一條 lint 規則禁止 className 裡出現 `[#`。

## 數值怎麼來的

**不是看截圖估的。** 以瀏覽器開啟真實網站（桌機版面、1440px 寬），用 `getComputedStyle` 讀出元素實際套用的樣式，時間為 2026-09-18。來源頁面：首頁 `/main/Main.jsp` 與一個商品詳情頁 `/product/15642257`。

過程中得知的事實：

- 真實網站以 **Next.js + Tailwind CSS** 建置（頁面有 `next-route-announcer`；class 是 Tailwind utility）。字體是它建置當時 Tailwind 的 sans 堆疊（`ui-sans-serif, system-ui, sans-serif, …`），基礎字級 16px / 行高 24px。Tailwind 4.3 已經改了自己的預設堆疊，所以本專案把量到的值釘成 token（`--font-sans`），而不是繼承工具的預設；已在 dev server 上確認 `body` 的 `font-family` 與真站相同。
- 首頁區塊是**虛擬化渲染**的：只有捲到視窗內才掛上 DOM。
- 字級是一套奇數階梯，真站自己叫它 `ec-*`（`text-ec-sm` = 13px、`text-ec-xl` = 19px、`text-ec-2xl` = 21px）。本專案沿用這個命名以便對照，並補齊沒有名字的階。
- 品牌色在真站的 token 名稱是 `mo` / `momo-pink`；深色文字是 `momo-neutralStrong`。
- 頂部列是 `position: fixed`（不是 sticky）、`z-index: 200`。

### 顏色

| Semantic token       | 值              | 在真站的哪裡量到                                                  |
| -------------------- | --------------- | ----------------------------------------------------------------- |
| `brand`              | `#d62872`       | 分類列作用中項目的文字與 3px 底線、熱搜關鍵字、「降價好貨」的價格 |
| `action-primary`     | `#d62872`       | 詳情頁「直接購買」按鈕背景                                        |
| `action-cart`        | `#1c6fbc`       | 詳情頁「放入購物車」按鈕背景                                      |
| `action-neutral`     | `#cccccc`       | 詳情頁「加入追蹤」按鈕背景                                        |
| `on-action`          | `#ffffff`       | 三顆按鈕的文字、搜尋按鈕文字、footer 連結                         |
| `price`              | `#db2777`       | 店取、暢銷榜、moPro、「你可能會喜歡」的價格                       |
| `sale`               | `#dd2222`       | 限時搶購的價格、「限搶價」標籤、促銷文字                          |
| `countdown`          | `#ff4c76`       | 限時搶購倒數數字的底色（28×28、圓角 4px、白字 16px 粗體）         |
| `ink-strong`         | `#222222`       | 限時搶購標題列文字                                                |
| `ink-emphasis`       | `#262626`       | 詳情頁的說明文字（15px / 22.5px、weight 500）                     |
| `ink`                | `#404040`       | 商品名稱、分類列項目、頂部列連結、詳情頁標題與欄位標籤            |
| `ink-meta`           | `#454545`       | 「總銷量>5萬」                                                    |
| `ink-label`          | `#888888`       | 詳情頁「促銷價」標籤、劃線價                                      |
| `ink-muted`          | `#999999`       | 商品卡的劃線原價、詳情頁的品號                                    |
| `ink-subtle`         | `#b3b3b3`       | 「你可能會喜歡」的劃線原價                                        |
| `breadcrumb-root`    | `#bb7711`       | 詳情頁麵包屑的「Home」                                            |
| `line`               | `#e5e5e5`       | 「降價好貨」商品卡框線                                            |
| `line-soft`          | `#f0f0f0`       | 限時搶購商品卡框線                                                |
| `line-strong`        | `#cccccc`       | 頂部列的底線                                                      |
| `control`            | `#515151`       | 搜尋框的 2px 邊框與搜尋按鈕背景                                   |
| `surface-muted`      | `#f2f2f2`       | 頂部列背景                                                        |
| `footer`             | `#09355d`       | footer 背景                                                       |
| `footer-accent`      | `#53d6df`       | footer 欄位標題、防詐騙提醒的文字                                 |
| `footer-accent-line` | `#a9eaef`       | 防詐騙提醒的 3px 框線                                             |
| `ink-title`          | `#1f2937`       | 展開的分類面板標題「選擇分類」                                    |
| `ink-icon`           | `#4b5563`       | 分類列展開按鈕的箭頭                                              |
| `surface-control`    | `#fafafa`       | 分類列展開按鈕的底色（36 × 40px）                                 |
| `category-sky`       | `#e1eff6` @ 50% | 分類面板第 1 列的膠囊（限時搶購 … 電腦/組件）                     |
| `category-lavender`  | `#e6e6f9` @ 50% | 第 2 列（3C週邊 … 個人清潔）                                      |
| `category-rose`      | `#f2d7de` @ 40% | 第 3 列（日用/紙品 … 戶外）                                       |
| `category-mint`      | `#e2f8e2` @ 50% | 第 4 列（車類 … 生活超市）                                        |
| `category-peach`     | `#ffe9cc` @ 50% | 第 5 列（跨境好物 … 品牌旗艦館）                                  |

詳情頁的價格量到的是 `#d62672`，與品牌色 `#d62872` 只差一個色階，視為同一個顏色（`brand`），不另立 token。

分類膠囊的底色在真站是**半透明**的（
gba(225, 239, 246, 0.5) 這種寫法）疊在白色面板上。token 保留這個結構：primitive 存不透明的色碼，semantic 用 color-mix(in srgb, <primitive> 50%, transparent) 加上透明度，而不是另外算出一個混合後的色碼 —— 面板底色日後改變時，膠囊的視覺關係仍然正確。在 dev server 上量到的結果與真站相同（color(srgb 0.88 0.94 0.96 / 0.5)）。

### 字級

| Token         | 大小 / 行高 | 用在哪裡                                                                            |
| ------------- | ----------- | ----------------------------------------------------------------------------------- |
| `ec-2xs`      | 11 / 16     | 「限搶價」、銷量                                                                    |
| `ec-sm`       | 13 / 18     | 頂部列、熱搜關鍵字、劃線原價、剩餘組數、欄位標籤、品號                              |
| `ec-base`     | 15 / 20     | 商品名稱、促銷文字、搜尋按鈕、詳情頁說明                                            |
| `ec-md`       | 16 / 24     | 動作按鈕、搜尋輸入框                                                                |
| `ec-lg`       | 17 / 25.5   | 分類列項目（weight 600）                                                            |
| `ec-xl`       | 19 / 25     | 詳情頁商品標題（weight 700）、推薦區價格、footer 標題、倒數標籤                     |
| `ec-2xl`      | 21 / 26     | 商品列的價格                                                                        |
| `ec-3xl`      | 23 / 28.75  | 限時搶購價格                                                                        |
| `ec-4xl`      | 25 / 37.5   | 詳情頁價格                                                                          |
| `panel-title` | 18 / 28     | 「選擇分類」（weight 700）—— 全站唯一的偶數字級，所以依用途命名而不放進 `ec-*` 階梯 |
| `ec-title`    | 24 / 32     | 區塊標題 —— **未實測，見下**                                                        |

### 元件尺寸與框線

| 元件             | 量到的值                                                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 頂部列           | 高 40px（含底線 41px）、`fixed`、背景 `surface-muted`、底線 1px `line-strong`、文字 13px                                                                                                |
| 搜尋框           | 高 36px、2px `control` 邊框、左側膠囊圓角；按鈕背景 `control`、白字 15px / 600、右側膠囊圓角                                                                                            |
| 分類列           | 項目 17px / 600、高 37px、間距 16px；作用中：`brand` 文字 + 3px `brand` 底線                                                                                                            |
| 分類列的展開按鈕 | 36 × 40px、背景 `surface-control`、箭頭 `ink-icon`                                                                                                                                      |
| 「選擇分類」面板 | `absolute`、接在分類列正下方、寬 1220px、白底、下方圓角 12px、陰影 `0 2px 8px rgb(0 0 0 / 0.08)`；內部 9 欄 × 124px 的 grid、間距 10px、padding 12px；共 40 個分類（9 + 9 + 9 + 9 + 4） |
| 分類膠囊         | 124 × 44px、圓角 22px、padding 12px 16px、15px / 20px `ink-strong`、置中、過長以 `…` 截斷；作用中（首頁）：白底 + 1px `brand` 框線 + `brand` 文字                                       |
| 降價好貨商品卡   | 1px `line`、圓角 8px、`shadow-card`；名稱 15px `ink`；`$` 13px / 500；價格 21px / 700 `brand`；原價 13px `ink-muted` 劃線                                                               |
| 限時搶購商品卡   | 1px `line-soft`、圓角 8px、`shadow-card-raised`、padding 10px；促銷 15px / 700 `sale`；價格 23px / 700 `sale`；剩餘組數 13px / 700 `ink`                                                |
| 推薦商品卡       | 無框線、圓角 4px；價格 19px / 700 `price`；原價 13px `ink-subtle`；銷量 11px `ink-meta`                                                                                                 |
| 詳情頁動作按鈕   | 160 × 40px、**直角（0px）**、16px / 600 白字                                                                                                                                            |
| Footer           | 背景 `footer`、內容寬 1220px、上方 padding 50px；標題 19px / 700 `footer-accent`；連結 13px 白色；防詐騙提醒 3px `footer-accent-line` 框線、圓角 8px、padding 14px                      |
| 內容容器         | 1220px（`max-w-shop`）                                                                                                                                                                  |

## 沒有量到的

| 項目                                                               | 原因                                                                                                                                | 目前的做法                                                                 |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 區塊標題（「降價好貨」「今日暢銷榜」…）的字級與雙色                | 在可讀取的 DOM 裡找不到這些文字，推測位於跨來源的 iframe 內，瀏覽器的同源政策不允許讀取                                             | 依截圖估計為 24px，前半淺灰、後半深色。token 標註為「未實測」              |
| hover / focus 狀態的顏色                                           | 只量了靜態樣式                                                                                                                      | 做到互動元件時再量                                                         |
| 限時搶購標題列的粉色底                                             | 同上，找不到對應元素                                                                                                                | 做限時搶購時再量                                                           |
| footer 背景、footer 標題、防詐騙提醒框線、倒數數字底色的**透明度** | 量這四個值時用的轉換函式會把 alpha 丟掉（後來量分類膠囊時才發現）。想重新核對時瀏覽器面板處於隱藏狀態，虛擬化的區塊沒有掛載，讀不到 | 從截圖看 footer 是實色，影響很小；token 先視為不透明，做限時搶購時一併複核 |
| 主 header 右側的三張活動小圖                                       | 素材資料夾裡沒有這三張圖                                                                                                            | 不做，列入 Known Gaps                                                      |

估計值在 `tokens.semantic.css` 裡都有註解標明，之後量到就直接更新 token，元件不用改。
