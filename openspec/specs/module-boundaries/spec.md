# module-boundaries Specification

## Purpose

定義專案結構的工程約束，以及它們如何被自動驗證。這些約束讓系統在規模變大時仍維持單向依賴、框架可替換、共用程式碼不失控；違反時必須由工具擋下，而不是依賴 code review 記得。

這份規格描述的是**已經實作並驗證過**的現況：每一條「會被擋下」的行為，都曾放入違規樣本確認真的被擋（紀錄見 `docs/agent-workflow.md`）。

## Requirements

### Requirement: 依賴方向是單向的

每個專案 SHALL 屬於恰好一種層級：app、layout、page、feature、ui、data-access、util。依賴 MUST 只朝下層：app → layout / page → feature → ui / data-access → util。feature 之間與 data-access 之間 MUST NOT 互相依賴；只有 layout 與 page 可以組合多個 feature。

layout 與 page 是同一層的兩種角色：layout 是跨頁保留的外框，page 是換入外框的內容。兩者由 app 的路由巢狀組合，彼此 MUST NOT 互相依賴；只有 app 可以依賴 layout。

因為層級是嚴格排序的（同層之間不允許依賴），任何循環依賴都必然違反其中一條層級規則，所以依賴圖保持無環。

#### Scenario: feature 依賴另一個 feature

- **WHEN** 一個 feature 專案 import 另一個 feature 專案
- **THEN** lint 失敗，錯誤指出 feature 只能依賴 ui、data-access、util

#### Scenario: ui 依賴 data-access

- **WHEN** 一個 ui 專案 import 一個 data-access 專案
- **THEN** lint 失敗，錯誤指出 ui 只能依賴 ui、util

#### Scenario: page 組合 feature

- **WHEN** 一個 page 專案 import 一個 feature 專案
- **THEN** lint 通過

#### Scenario: layout 組合 feature

- **WHEN** 一個 layout 專案 import 一個它的 domain 允許依賴的 feature 專案
- **THEN** lint 通過

#### Scenario: page 依賴 layout

- **WHEN** 一個 page 專案 import 一個 layout 專案
- **THEN** lint 失敗，錯誤指出 page 只能依賴 feature、ui、data-access、util

#### Scenario: feature 依賴 layout

- **WHEN** 一個 feature 專案 import 一個 layout 專案
- **THEN** lint 失敗，錯誤指出 feature 只能依賴 ui、data-access、util

### Requirement: Domain 之間的依賴受限

每個 package SHALL 屬於恰好一個 domain（scope）。一個 domain MUST 只能依賴 `docs/architecture.md` §3 的 scope 表所列的 domain。lint 設定中的 scope 規則 MUST 與該表一致。

新增 domain 之間的放行屬於設計決定，治理方式見 `docs/adr/0006-domain-dependency-map.md`。

#### Scenario: 跨 domain 違規

- **WHEN** 商品詳情（goods）的專案 import 首頁（home）的專案
- **THEN** lint 失敗，錯誤指出 goods 只能依賴 goods、catalog、shared

#### Scenario: lint 設定與文件一致

- **WHEN** 比對 lint 設定中每個 scope 可依賴的清單與 `docs/architecture.md` §3 的 scope 表
- **THEN** 兩者完全相同

### Requirement: 框架耦合只存在於一處

路由套件 SHALL 只能在 app 專案中被 import；輪播套件 SHALL 只能在共用 ui 專案中被 import。其他專案 import 它們時 MUST 被 lint 擋下，且錯誤訊息 MUST 說明正確的做法。

#### Scenario: package 直接使用路由套件

- **WHEN** 任何 package import 路由套件
- **THEN** lint 失敗，錯誤指出應以 props 接收路由參數、以共用的連結元件導頁

#### Scenario: 共用 ui 以外的專案使用輪播套件

- **WHEN** 共用 ui 以外的任何專案 import 輪播套件
- **THEN** lint 失敗，錯誤指出應使用共用 ui 提供的輪播元件

#### Scenario: app 使用路由套件

- **WHEN** app 專案 import 路由套件
- **THEN** lint 通過

### Requirement: 只能透過公開入口使用一個 package

一個 package 對外 SHALL 只提供其公開入口匯出的內容。其他專案 MUST NOT 引用 package 內部的檔案，不論是透過相對路徑或是套件名稱加上內部路徑。

#### Scenario: 以相對路徑引用另一個專案的檔案

- **WHEN** 一個專案以相對路徑 import 另一個專案內的檔案
- **THEN** lint 失敗，錯誤指出專案之間必須以套件名稱引用

#### Scenario: 以套件名稱加內部路徑引用

- **WHEN** 一個專案以「套件名稱 + 內部路徑」import 另一個 package 未公開的檔案
- **THEN** 型別檢查失敗，回報找不到該模組（package 只公開它的入口）

#### Scenario: 樣式經由公開入口引用

- **WHEN** app 的樣式以套件名稱引用共用 ui 公開的樣式入口
- **THEN** 建置成功

#### Scenario: 引用未公開的樣式檔

- **WHEN** 一個專案的樣式以套件名稱加內部路徑，引用另一個 package 未公開的樣式檔
- **THEN** 建置失敗，錯誤指出該路徑沒有被公開

### Requirement: package 宣告自己使用的依賴

每個專案 SHALL 在自己的清單中宣告其原始碼 import 的所有外部套件與 workspace package，MUST NOT 依賴根目錄替它提供。宣告了卻沒有使用的依賴 MUST 同樣被回報。同一個外部套件在整個 workspace MUST 只有一個版本。

測試檔與工具設定檔不在此限：測試與建置工具由根目錄統一提供。

已知的限制：檢查只認得明寫的 import。只寫 JSX 而沒有明寫 import react 的 package，需要在自己的設定中對 react 放行；放行之後，它漏宣告 react 時不會被發現。

#### Scenario: 使用了卻沒有宣告

- **WHEN** 一個 package 的原始碼 import 一個外部套件，而它的清單沒有宣告該套件
- **THEN** lint 失敗，錯誤指出缺少哪個套件

#### Scenario: 沒有宣告 workspace package

- **WHEN** 一個專案 import 另一個 workspace package，而它的清單沒有宣告該 package
- **THEN** lint 失敗，錯誤指出缺少哪個 package

#### Scenario: 宣告了卻沒有使用

- **WHEN** 一個 package 的清單宣告了一個它的原始碼沒有 import 的套件
- **THEN** lint 失敗，錯誤指出哪個套件沒有被使用

#### Scenario: 整個 workspace 只有一個版本

- **WHEN** 檢視安裝結果中 react 的實體數量
- **THEN** 只有一份，且每個宣告它的專案都連結到同一份

### Requirement: 共用 package 只收被多處使用的程式碼

元件或函式 SHALL 在被兩個以上的專案使用時，才能放進共用 package。只有一個使用者的，MUST 留在該專案內且不從公開入口匯出。

這一條由 review 把關而非工具強制；公開入口的限制（上一條）讓「偷用別人的私有元件」不可能發生，所以需要共用時只能走升級這條路。

#### Scenario: 只有一個使用者的元件

- **WHEN** 檢視一個只被單一 feature 使用的元件
- **THEN** 它位於該 feature 的私有資料夾，且不在該 feature 的公開入口中

### Requirement: 共用 ui 不認識 domain 資料型別

共用 ui 專案 SHALL 只宣告自己需要的最小資料形狀，MUST NOT import 任何 domain 的資料型別。

#### Scenario: 傳入 domain 商品資料

- **WHEN** feature 把 domain 的商品資料傳給共用的商品卡
- **THEN** 型別檢查通過，且共用 ui 專案內沒有任何對 data-access 專案的 import

### Requirement: 約束本身被自動驗證

系統 SHALL 提供一個可重複執行的檢查，確認：每個專案的標籤格式正確且不會被發佈、每個專案實際套用的 lint 設定都啟用了依賴規則、框架放行只發生在指定的專案、依賴宣告的檢查對每個專案都真的在運作、以及專案依賴圖的每一條依賴都符合規則。任何一項不符時 MUST 以非零狀態結束並指出是哪個專案。

標籤寫壞的 package 會靜默地不受任何規則約束，而 lint 依然通過 —— 這是這項檢查存在的原因。

#### Scenario: 標籤寫壞

- **WHEN** 某個 package 的標籤格式錯誤（例如兩個標籤被合併成一個字串）
- **THEN** 檢查以非零狀態結束，並指出該 package 與錯誤內容

#### Scenario: 依賴宣告的檢查開著卻沒有作用

- **WHEN** 依賴宣告的檢查被設定成比對某個專案所沒有的工作目標
- **THEN** 檢查以非零狀態結束，並指出該專案的依賴宣告沒有被檢查

#### Scenario: 全部符合

- **WHEN** 所有專案的標籤與設定都正確
- **THEN** 檢查以零狀態結束，並列出專案數、規則數與依賴數

### Requirement: 全新環境可以重現安裝

專案 SHALL 能在沒有任何既有安裝產物的環境中，以鎖定版本的方式安裝成功。

#### Scenario: 乾淨環境的鎖定安裝

- **WHEN** 在全新 clone、沒有 `node_modules` 的環境執行鎖定版本的安裝
- **THEN** 安裝成功，且不需要修改 lockfile
