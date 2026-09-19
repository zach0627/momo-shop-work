# 給在這個 repo 工作的 Agent

先讀 [`docs/architecture.md`](./docs/architecture.md)。這份檔案只列**不能違反的規則**與**怎麼驗證自己做對了**。

**行為規格在 OpenSpec**：`openspec/specs/<capability>/spec.md` 是系統現在必須滿足的行為；每個 `#### Scenario` 都有對應的測試。**改行為之前先改規格**：用 `openspec new change "<name>"` 開一個變更（delta spec、design、tasks），完成 `tasks.md` 的任務後立刻把 `- [ ]` 改成 `- [x]`，做完用 `/opsx:archive` 歸檔、併入主規格。每次都跑 `openspec validate --all --strict`。建出這兩個頁面的那一次變更已歸檔在 `openspec/changes/archive/2026-09-20-build-storefront-pages/`，設計決策與逐項的驗證紀錄在那裡。

## 不能違反的規則

1. **設計先於實作。** 設計有變動時先改 `docs/architecture.md`（必要時加 ADR），再改 code。不要讓文件與 code 脫鉤。
2. **不要擴張範圍。** 詳情頁是展示用，三顆按鈕不綁任何行為；搜尋框是展示用；Banner 不可點。需求以 `docs/MoMO面試/` 的筆記為準，沒寫的就不要做。
3. **依賴方向：** `app → layout / page → feature → ui / data-access → util`。`feature ✗ feature`、`data-access ✗ data-access`。只有 `layout` 與 `page` 可以組合多個 feature；兩者同層、互不依賴，只有 app 能依賴 `layout`。
4. **`react-router` 只准出現在 `apps/shop`；`embla` 只准出現在 `packages/shared/ui`。** packages 以 props 接收路由參數，連結一律用 `@momo/shared-ui` 的 `AppLink`。
5. **Rule of Two：** 被 ≥2 個專案使用的東西才能放進 `shared/ui`、`shared/util`。只有自己用的放在該 package 的 `ui/`（展示）或 `model/`（邏輯），且不要從 `index.ts` 匯出。
6. **`shared/ui` 不認識 domain model。** 元件宣告自己需要的最小形狀，不要 import 任何 data-access。
7. **不要為了讓 lint 通過而修改 `eslint.config.mjs` 的 `depConstraints` 或新增 scope 放行。** 遇到 boundary 錯誤代表設計需要討論。新增 scope 放行必須先修改 [ADR-0006](./docs/adr/0006-domain-dependency-map.md)。
8. **顏色、字級、圓角、陰影只能用 semantic token**（`text-brand`、`bg-footer`、`text-ec-sm`、`rounded-card`…）。不可寫死色碼、不可用任意值語法（`text-[#d62872]`）、不可直接使用 primitive（`--momo-*`）。需要新的顏色時：先到真實網站量出數值 → 加進 `tokens.primitive.css` → 在 `tokens.semantic.css` 給它一個用途 → 記錄到 `docs/design-tokens.md`。Tailwind 預設的色盤與字級已被關閉，`text-pink-600`、`text-sm` 不存在。
9. **UI 只透過 query hooks 取得資料**，不要直接 import fixtures 或 repository 實作。
10. **每個專案都是 pnpm package，照 package 的規矩來**（[ADR-0008](./docs/adr/0008-packages-not-libs.md)）：
    - `src/` import 了哪個外部套件，就在自己的 `package.json` 的 `dependencies` 宣告它，版本寫 `catalog:`；實際版本只寫在 `pnpm-workspace.yaml` 的 `catalog`。不要把執行期依賴加到根目錄。測試與建置工具才留在根目錄。
    - 別的 package 的東西只能透過它的 `exports` 取得，**CSS 也一樣**（`@import '@momo/shared-ui/theme.css'`）。不要用相對路徑伸進別的 package；要公開新的入口就加到對方的 `exports`。
    - package 內部沒有 `src/lib/`：`src/index.ts`、`src/<name>.tsx`、`src/ui/`、`src/model/`。generator 產生 `src/lib/` 的話把它攤平。

## 做事的方式

- 有邏輯的程式碼走 TDD：先寫 spec → 確認它因為正確的理由失敗 → 最小實作 → 通過。純版面不寫單元測試。
- 測試檔 `*.spec.ts(x)` 與原始碼同層。某個 package 加入第一個 spec 時，把它 vite / vitest 設定裡的 `passWithNoTests` 拿掉。
- 新增 package 用 generator，tags 要加引號（PowerShell 會把逗號當陣列）：`"--tags=type:feature,scope:home"`。產生後**核對 `package.json` 的 `nx.tags` 是兩個獨立的字串**。
- 一個專案要 import 另一個 package 時，三個動作缺一不可：在自己的 `package.json` 宣告 `"@momo/<package>": "workspace:*"` → `pnpm install` → `pnpm nx sync`。之後跑 `pnpm verify:boundaries`。
- `@nx/dependency-checks` 回報「沒用到 react」而該 package 只寫 JSX 時，在**它自己的** eslint 設定加 `dependencyChecks(['react'])`，不要改根設定。改了這條規則的設定後一定要跑 `pnpm verify:boundaries` —— 它會靜默地什麼都不檢查。
- 驗證關卡 `lint` 與 `typecheck` 都要跑：相對路徑的跨專案引用由 lint 擋，套件名稱加內部路徑的深層引用由型別檢查擋。
- 新增 package 後確認 `pnpm-lock.yaml` 的 `importers` 有它的條目（`packages/<scope>/<name>: {}`）。pnpm 12 不會自動補，少了的話本機正常、但全新 clone 的 `pnpm install --frozen-lockfile` 會失敗。
- `*.generated.ts` 不要手改：改 `tools/gen-fixtures.mjs` 後跑 `pnpm gen:fixtures`，提交前 `pnpm verify:fixtures` 要通過。新增素材一律經過 `tools/import-assets.mjs`（把對照加進去），不要手動複製 —— 它會在有檔案沒被交代時失敗。
- 測試 UI 時用 `@momo/catalog-data-access/testing`、`@momo/home-data-access/testing` 的 fake repository 注入小而可控的資料，不要依賴真 fixture 的內容或筆數。
- 任何會掛載 `Carousel` 的 spec（直接或透過頁面）都要先呼叫 `@momo/shared-ui/testing` 的 `installCarouselTestEnvironment()`：jsdom 沒有 embla 需要的 API。app 已經放在 `src/test-setup.ts`。
- 測試優先用角色與名稱查詢（`getByRole('region', { name })`），不要用 `data-testid`：同名的巢狀 landmark 就是這樣被抓到的。
- **只斷言「某個東西不存在」的測試，要同時斷言一個「存在」**，並且對空實作跑過一次確認它會紅。否則元件整個消失它也會通過。
- 首頁新增區塊：只是圖 → 在 `home-layout.ts` 加一筆既有 type 的設定；需要新的呈現方式 → 在 `HomeSection` union 加 type，`typecheck` 會指出 registry 少了哪一個；有自己的邏輯或資料 → 新的 feature package。
- 失敗的查詢由 app 的 `QueryCache` 統一回報（`apps/shop/src/app/query-client.ts`），頁面與 hook 不要自己再呼叫 `reportError` 報同一件事。
- **程式碼註解：繁體中文、簡短（以一行為主，最多兩三行）。** 只在這些情況寫：
  - 對照資訊：registry、設定表、token 用在哪裡（例：`section-registry.tsx` 每一項是首頁的哪一塊）。
  - 不直覺的流程或陷阱：為什麼用 `hasOwn`、`cancelRefetch: false`、`aria-disabled`。
  - 重要或難懂的函式：一句話說它做什麼。
  - spec 裡對應到哪一條規格：`// 規格 home-page：…`。
  - **不要寫**：設計沿革、取捨的論述、誰在用它、怎麼驗證的 —— 那些屬於 `docs/`、ADR 與 commit message。看程式碼就知道的事也不要寫。
- **首頁的區塊動工前，先到真實網站讀它的 DOM，不只看截圖**：它和哪個既有區塊是同一種 CMS 區塊（標題圖的 `bt_7_<型別>_<序號>`、卡片的 class）、哪些差異其實是資料。今日暢銷榜就是這樣從一個 package 變成一筆設定的。
- **放到背景的指令要有預期的完成時間，超過就去查**（行程還在嗎、輸出檔還在長嗎），不要只等完成通知。在這台機器上擷取 `nx` 的輸出時一律設 `NX_DAEMON=false`：常駐的 daemon 會繼承輸出管線，指令做完了管線也不會結束。
- **會改變 build 產物的環境變數，要加進 `nx.json` 的 `sharedGlobals`**（目前有 `BASE_PATH`）。否則 Nx 會從快取還原另一種設定的產物，而且不會警告。
- 改 `ProductCard` 的版面時，一起改 `ProductCardSkeleton`（`shared/ui/src/skeleton`）並在瀏覽器量載入前後的區塊高度：佔位比真卡片矮或高，版面就會跳。
- E2E 在 `apps/shop/e2e`（`pnpm nx e2e shop`），對 build 產物跑。路徑一律寫相對於 baseURL 的 `./…`，它也要能對子路徑的 build 跑（`BASE_PATH=/momo-shop-work/`）。只放 jsdom 驗不到的東西。
- **回報成功的檢查，要確認它真的檢查了東西。** 結果快得或整齊得不合理就去讀原始輸出（CI 的第一次綠燈是 `No tasks were run`）。
- 每個 commit 都要是綠的，使用 Conventional Commits。

## 驗證

```bash
pnpm nx run-many -t lint test typecheck
pnpm nx build shop
```

提交前的驗證關卡加 `--skip-nx-cache`。回報時貼出實際輸出；失敗就照實說，不要只看 exit code —— 讀錯誤訊息，分辨是程式碼的問題還是環境的問題。

**負向驗證（探針）也一樣**：「被擋下」必須是被你要驗證的那條規則擋下。實際發生過：探針連續兩輪回報被擋，一次是 pnpm 因為 `package.json` 與 lockfile 不一致而拒絕執行，一次是執行檔路徑寫錯。要確認輸出裡出現那條規則的名稱。要讓修改過的 `package.json` 打到 ESLint，用 `.\node_modules\.bin\nx` 直接執行，不要透過 `pnpm`。

慢速磁碟上若遇到 plugin 載入失敗或 Vitest worker 逾時，見 `docs/agent-workflow.md` §6 的參數。

## 回報與紀錄

每完成一個步驟，在 `docs/agent-workflow.md` 記錄偏離計畫的地方與原因。被 Human 糾正、或自己出錯時也要記 —— 那是這份文件最有價值的部分。
