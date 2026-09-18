# Spec Delta

## Purpose

定義專案結構的工程約束，以及它們如何被自動驗證。這些約束讓系統在規模變大時仍維持單向依賴、框架可替換、共用程式碼不失控；違反時必須由工具擋下，而不是依賴 code review 記得。

## ADDED Requirements

### Requirement: 依賴方向是單向的

每個專案 SHALL 屬於恰好一種層級：app、page、feature、ui、data-access、util。依賴 MUST 只朝下層：app → page → feature → ui / data-access → util。同層之間，feature 之間與 data-access 之間 MUST NOT 互相依賴；只有 page 可以組合多個 feature。

#### Scenario: feature 依賴另一個 feature

- **WHEN** 一個 feature 專案 import 另一個 feature 專案
- **THEN** lint 失敗，錯誤指出 feature 只能依賴 ui、data-access、util

#### Scenario: ui 依賴 data-access

- **WHEN** 一個 ui 專案 import 一個 data-access 專案
- **THEN** lint 失敗

#### Scenario: page 組合 feature

- **WHEN** 一個 page 專案 import 一個 feature 專案
- **THEN** lint 通過

### Requirement: Domain 之間的依賴受限

每個 lib SHALL 屬於恰好一個 domain（scope）。domain 之間 MUST 只能依照已記錄的依賴地圖互相依賴，且依賴圖 MUST 保持無環。

#### Scenario: 跨 domain 違規

- **WHEN** 商品詳情（goods）的專案 import 首頁（home）的專案
- **THEN** lint 失敗，錯誤指出 goods 只能依賴 goods、catalog、shared

#### Scenario: 新增 domain 放行

- **WHEN** 有人要讓一個 domain 依賴另一個原本不允許的 domain
- **THEN** 必須先修改 `docs/adr/0006-domain-dependency-map.md` 說明理由，再修改 lint 設定

### Requirement: 框架耦合只存在於一處

路由套件 SHALL 只能在 app 專案中被 import；輪播套件 SHALL 只能在共用 ui 專案中被 import。其他專案 import 它們時 MUST 被 lint 擋下。

#### Scenario: lib 直接使用路由套件

- **WHEN** 任何 lib import 路由套件
- **THEN** lint 失敗，錯誤指出應以 props 接收路由參數、以共用的連結元件導頁

#### Scenario: app 使用路由套件

- **WHEN** app 專案 import 路由套件
- **THEN** lint 通過

### Requirement: 只能透過公開 API 使用一個 lib

一個 lib 對外 SHALL 只提供其公開入口匯出的內容。其他專案 MUST NOT 以深層路徑引用 lib 內部的檔案。

#### Scenario: 深層引用私有元件

- **WHEN** 一個專案以深層路徑 import 另一個 lib 內未公開的元件
- **THEN** lint 失敗

### Requirement: 共用 lib 只收被多處使用的程式碼

元件或函式 SHALL 在被兩個以上的專案使用時，才能放進共用 lib。只有一個使用者的，MUST 留在該專案內且不對外公開。

#### Scenario: 只有一個使用者的元件

- **WHEN** 一個元件只被「你可能會喜歡」使用
- **THEN** 它位於該 feature 的私有資料夾，且不在該 feature 的公開入口中

### Requirement: 共用 ui 不認識 domain 資料型別

共用 ui 專案 SHALL 只宣告自己需要的最小資料形狀，MUST NOT import 任何 domain 的資料型別。

#### Scenario: 傳入 domain 商品資料

- **WHEN** feature 把 domain 的商品資料傳給共用的商品卡
- **THEN** 型別檢查通過，且共用 ui 專案內沒有任何對 data-access 專案的 import

### Requirement: 約束本身被自動驗證

系統 SHALL 提供一個可重複執行的檢查，確認：每個專案的標籤格式正確、每個專案實際套用的 lint 設定都啟用了依賴規則、框架放行只發生在指定的專案、以及專案依賴圖的每一條依賴都符合規則。任何一項不符時 MUST 以非零狀態結束並指出是哪個專案。

#### Scenario: 標籤寫壞

- **WHEN** 某個 lib 的標籤格式錯誤（例如兩個標籤被合併成一個字串）
- **THEN** 檢查以非零狀態結束，並指出該 lib 與錯誤內容

#### Scenario: 全部符合

- **WHEN** 所有專案的標籤與設定都正確
- **THEN** 檢查以零狀態結束，並列出專案數、規則數與依賴數
