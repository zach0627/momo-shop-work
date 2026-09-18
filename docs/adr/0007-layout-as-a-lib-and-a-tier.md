# ADR-0007：全站 layout 放在 lib，並作為自訂的一層

狀態：已採用

## 背景

全站 layout（header、內容區、footer 的外框）該放在哪裡，在 Human review 時被連續質疑了四次，Agent 的建議也換了三次（過程見 [`agent-workflow.md`](../agent-workflow.md)）。這份 ADR 記下比較過的方案與最後的理由，讓這個問題不必再從頭討論。

用詞：**layout** 是外框，包含 **header**（頂部列、主 header、分類列）、內容區與 **footer**。header 與 footer 是 layout 的零件，不是與 layout 並列的東西。

### Nx 怎麼做（查證過的事實）

| 來源                                                           | 規模                 | layout 外框               | header / footer 零件           |
| -------------------------------------------------------------- | -------------------- | ------------------------- | ------------------------------ |
| Nx 團隊目前的 React 範本 `nrwl/react-template`                 | 1 個 app             | 在 app（`app.tsx`）       | 也在 app                       |
| Nx 官方範例 `nrwl/nx-examples`                                 | 2 個 app             | 在 app，兩個 app 各寫一份 | header 在 `libs/shared/header` |
| Nrwl《Enterprise Angular Monorepo Patterns》的 `feature-shell` | 同一個應用出多個版本 | 在 lib，**連同路由表**    | 在 lib                         |

- Nx 文件只列四種 type：feature、ui、data-access、util，並說 app 應該縮減到只剩接線。它沒有規定 layout 要放哪。
- Nx 官方範例的規則和我們一樣不允許 feature 依賴 feature。
- `feature-shell` 的定義是**擁有頂層路由**的 lib，存在的理由是「同一個應用要出 web、mobile、desktop 多個版本，路由不想複製」。Nx 文件範例樹裡的 `libs/booking/feature-shell` 是某個 domain 的路由進入點，對應到我們的 `page`，不是 layout。

## 比較過的方案

**A. 整個 layout 放 lib：`libs/shop/layout`，`type:layout`（採用）**
app 的 router 只有一條 layout route 指向 `AppLayout`。

**B. 外框放 app、零件放 lib：`apps/shop/src/layouts/app-layout.tsx` + 一個匯出 header 與 footer 的 feature lib**
最接近 `nx-examples`。

**C. 改用 `feature-shell`：路由表與 layout 一起搬進 lib**
app 只剩啟動。

| 面向                         | A                                 | B                                      | C                                 |
| ---------------------------- | --------------------------------- | -------------------------------------- | --------------------------------- |
| 規則數                       | 12                                | 11                                     | 12（一樣需要 `type:shell`）       |
| app 只有接線                 | 是                                | 多 12 行排版                           | 是                                |
| 路由層級的組合都受 lint 約束 | 是（`page` 與 `layout` 都在 lib） | 不對稱：page 在 lib、layout 外框在 app | 是                                |
| `react-router` 只出現在 app  | 守住                              | 守住                                   | **守不住** —— 與 ADR-0001 衝突    |
| 放進別的 domain 的 feature   | 直接 import                       | 由 app 以插槽 prop 傳入                | 直接 import                       |
| 第二個 app 重用 header       | `index.ts` 多匯出一行             | 已經可以                               | shell 是 app 專屬，零件仍要另外抽 |
| 零件 lib 的命名              | —                                 | 一個 lib 放兩樣東西，名字很難取得自然  | —                                 |

## 決策

採用 A，並明確承認兩件事：

1. **`type:page` 與 `type:layout` 都是我們在 Nx 四種 type 之上自訂的延伸。** 兩者合起來是「路由層級的組合」這一層：`layout` 是跨頁保留的外框，`page` 是換入外框的內容，由 app 的 router 巢狀組合、彼此不 import —— 與 Next.js 的 `layout.tsx` / `page.tsx` 是同一種關係。
2. A 與 B 的實質差距很小：有邏輯的程式碼（狀態、IntersectionObserver、分類、測試）在兩個方案裡都留在 lib，差別只有約 12 行排版 JSX 放在哪，以及一條規則。

## 理由

- **與專案的主軸一致**：app 是 workspace 裡唯一不受邊界規則約束的專案，所以它只放接線；會長大的程式碼都放在受 lint 約束的 lib。page 只有 app 一個使用者也是 lib，layout 沒有理由例外。
- **語意與位置對得上**：`libs/shop/layout` 讀起來就是「店面的 layout」。方案 B 的零件 lib 取不出自然的名字，這本身是一個訊號。
- **C 解決的不是我們會遇到的問題**：ADR-0002 預期的多 app 是「不同團隊負責不同的路由群」，要共用的是 header 與 footer，不是整張路由表；而且把路由搬進 lib 會讓 ADR-0001 的 Next 遷移路徑失效（Next 的路由一定在 app 裡）。
- **B 較好的兩項都補得起來**：第二個 app 要重用 header 時，A 只要從 `index.ts` 多匯出；規則少一條的好處，在已經有 `type:page` 這個自訂 type 的前提下並不大。

## 代價

- 多一條型別規則，而且 `layout` 這一層目前只約束一個 lib。
- 熟悉 Nx 的讀者不會認得 `type:layout`，需要讀這份 ADR 或 `architecture.md` §3。

## 演進觸發條件

- **同一個應用要出多個平台版本**（例：web 與 React Native 共用同一套路由）→ 改用 `feature-shell`（方案 C），並重新評估 ADR-0001。
- **出現第二個 app 且只需要 header 或 footer 其中之一** → 從 `libs/shop/layout` 的 `index.ts` 匯出零件；若兩者的變動頻率明顯不同，再拆成兩個 lib。
- **出現第二種 layout**（例：結帳流程的精簡外框）→ 新增 `libs/checkout/layout`，在 router 多掛一條 layout route。現有的 layout 與頁面都不用改。
