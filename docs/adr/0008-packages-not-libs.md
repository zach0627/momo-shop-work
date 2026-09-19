# ADR-0008：`packages/` 而非 `libs/`，以及 package 的結構與依賴宣告

狀態：已採用

## 背景

Human review 時指出：「`libs` 裡每一個資料夾都有 `package.json`，這樣應該叫 `packages`；libs 通常不包含 `package.json`。」並要求：如果改成 `packages`，就要符合 pnpm 與 Nx 對 package 的結構規範，**不能只是把資料夾改名**。

這個觀察對了一半，而對的那一半很重要：

- **舊版 Nx** 的 lib 只有 `project.json`，`@scope/lib` 靠 `tsconfig.base.json` 的 `paths` 解析 —— 那時的 libs 確實沒有 `package.json`。
- **Nx 20 之後**的標準設定是 package manager workspaces + TypeScript project references。`@momo/shared-ui` 能被 import，是因為 pnpm 依它的 `package.json` 建立連結。這不是本專案的選擇：Nx 23 的 generator 已經不接受舊模式（見 `agent-workflow.md` Step 1 的偏離紀錄）。

所以每個專案都有 `package.json` 是必然的。問題變成：既然它們都是 package，有沒有照 package 的規矩來？

### 查證到的慣例

| 來源                        | 說法                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Nx 文件（Folder Structure） | `libs/` 或 `packages/` 都可以，是慣例不是規定。flat layout 用 `packages/`；grouped layout 用 `apps/` + `libs/` 並在裡面分組                |
| Nx 的 pnpm workspaces 指南  | 範例是 `apps/*` + `packages/*`；外部依賴寫在**各 package** 的 `package.json`；同 workspace 用 `workspace:` 協定；版本用 **catalog** 統一   |
| Nx 官方 React 範本          | `apps/` + `packages/shop/*`、`packages/shared/*`（在 `packages/` 底下分組）                                                                |
| pnpm 文件                   | package 只能存取宣告在自己 `package.json` 裡的依賴                                                                                         |
| Turborepo 文件              | `apps/` + `packages/`；可以用 `packages/group/*` 分組，但分組那一層不能有 `package.json`、不能用 `**`；`exports` 是其他 package 的唯一入口 |

### 對照之後的差距

符合的：`workspace:*`、全部 `private`、名稱有 `@momo/` 前綴、`exports` 只公開 `.`、分組層沒有 `package.json`、glob 不用 `**`。

不符合的有三項，都不是改資料夾名稱能解決的：

1. **外部依賴沒有宣告在各自的 package。** package import 了 `react` 卻沒有宣告，能運作是因為 Node 往上層找到根目錄的 `node_modules` —— 這是 phantom dependency，與 pnpm 的設計相反。
2. **package 內部有 `src/lib/`。** 這是 Nx generator 的習慣（Nx 自己的範本也還留著）。在 npm 生態裡 `lib/` 傳統上指編譯後的產物，package 的慣例是 `src/` → `dist/`。
3. **樣式以相對路徑伸進別的 package。** `apps/shop/src/styles.css` 寫的是 `../../../libs/shared/ui/src/styles/theme.css`。TypeScript 的深層引用有 lint 與 `exports` 兩道關卡，CSS 漏了 —— ESLint 不讀 CSS。

## 決策

1. 資料夾改名為 `packages/`，**保留依 domain 分組**：`packages/<scope>/<name>`，glob 為 `packages/*/*`。
2. 拿掉 `src/lib/` 這一層：`src/index.ts`（公開 API）、`src/<name>.tsx`、`src/ui/`、`src/model/`。
3. **`exports` 是唯一的入口，不分檔案種類**：`@momo/shared-ui` 以 `./theme.css` 公開設計 token。
4. **import 什麼就宣告什麼**：`src/` 用到的外部套件寫在該 package 的 `dependencies`，版本一律 `catalog:`，實際版本只寫在 `pnpm-workspace.yaml`。以 `@nx/dependency-checks` 強制。
5. **共用工具留在根目錄**：測試與建置工具只宣告在根目錄；spec 檔與設定檔不在第 4 點的範圍內。
6. 文件裡的單位名詞改為「package」。`lib` 只保留在 Nx 的專有名詞：generator 名稱、`tsconfig.lib.json`（`nx.json` 與 `nx sync` 依賴這個檔名，Nx 的 packages 範本也沿用）、Nx 專案類型。

## 理由

- **分組而非攤平**：攤平（`packages/shop-layout`）的好處是資料夾名等於 package 名。但依 domain 分組是這個專案應付規模成長的方式 —— CODEOWNERS、ADR-0006 的 domain 地圖都直接對應到資料夾 —— 而且 Nx 官方範本與 Turborepo 都支援在 `packages/` 底下分組。
- **catalog 而非各寫各的版本**：每個 package 自己宣告依賴，會帶來「同一個套件出現多個版本」的風險；對 React 來說，兩份實體會直接壞掉。catalog 同時滿足兩件事：package 明確宣告、整個 workspace 一個版本。實測只安裝了一份 `react@19.3.0`，每個宣告它的 package 都連到同一個實體。
- **由工具強制**：和邊界規則同一個理由 —— 靠 review 記得的規則會腐化。
- **工具留在根目錄**：若連 `vitest`、`@testing-library/react` 都下放，每個 package 會多出一整段一模一樣的 `devDependencies`，而它們從不隨 package 而不同。

## 代價與已知的盲點

- `@nx/dependency-checks` **只看得到明寫的 import**。只寫 JSX、沒有 `import … from 'react'` 的 package 會被誤判為沒用到 react，所以這種 package 要在自己的 eslint 設定對 react 放行；放行之後，它少宣告 react 時工具也看不出來（探針 P5 證實）。寫下這份 ADR 時是 `home/page` 與 `goods/page`；它們與 `home/feature-flash-sale` 有了明寫的 import 之後已把放行拿掉。目前只剩 `catalog/feature-recommendation`（它確實沒有任何 `import … from 'react'`）；另一個 `home/feature-ranking` 在 Step 12 整個移除了。
- 這條規則在專案沒有對應的 target 時**靜默地什麼都不檢查**。預設值 `['build']` 只有 app 有，所以改用 `typecheck`，並由 `verify-boundaries` 檢查「規則開著，而且專案真的有那個 target」。
- 一律忽略 `tslib`：`tsconfig.base.json` 開了 `importHelpers`，規則因此假設編譯產物需要它；但這些 package 只輸出型別宣告、原始碼由 Vite 轉譯，實際上沒有任何東西 import 它。
- 資料夾路徑與 package 名稱仍是兩套寫法（`packages/shop/layout` ↔ `@momo/shop-layout`），這是選擇分組的代價。
- `tsconfig.lib.json` 這個檔名留著，和「沒有 lib」的說法不一致。改掉它要同時改 `nx.json` 的 plugin 設定並放棄 generator 的預設值，不值得。

## 驗證

- 每一步的 JS 與 CSS 產物雜湊都與改動前相同，行為沒有變。
- 樣式的入口：未宣告 export 時 build 失敗（`"./theme.css" is not exported`）；未公開的路徑 `src/styles/tokens.semantic.css` 仍然失敗。
- 依賴宣告的 5 個探針：沒宣告 react（擋）、沒宣告 workspace package（擋）、宣告了卻沒用（擋）、空的 package 開始 import react（擋）、只寫 JSX 的 package 拿掉 react（通過 —— 上述盲點）。
- `verify-boundaries` 的自我測試：把 `buildTargets` 改回 `['build']` → 10 個問題、exit 1。
- 全新環境的 `pnpm install --frozen-lockfile` 通過。

## 演進觸發條件

- **要把某個 package 發佈到 registry**（例：design system 給其他產品用）→ 該 package 需要真正的 build、`dist/` 與版本號，`react` 改為 `peerDependencies`；`private` 拿掉。
- **package 數量多到 `packages/*/*` 兩層不夠分**（例：一個 domain 底下再分子領域）→ 改為明列各組的 glob（`packages/home/*`…），不要改用 `**`。
- **`@nx/dependency-checks` 支援隱含的 JSX runtime** → 拿掉剩下的 package 對 react 的放行。
