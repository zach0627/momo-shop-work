# 給在這個 repo 工作的 Agent

先讀 [`docs/architecture.md`](./docs/architecture.md)。這份檔案只列**不能違反的規則**與**怎麼驗證自己做對了**。

**行為規格在 OpenSpec**：`openspec/changes/build-storefront-pages/`。實作任何功能前，先讀對應的 `specs/<capability>/spec.md`；每個 `#### Scenario` 就是一個應該存在的測試。完成 `tasks.md` 的任務後立刻把 `- [ ]` 改成 `- [x]`。改行為之前先改規格，並跑 `openspec validate build-storefront-pages --strict`。

## 不能違反的規則

1. **設計先於實作。** 設計有變動時先改 `docs/architecture.md`（必要時加 ADR），再改 code。不要讓文件與 code 脫鉤。
2. **不要擴張範圍。** 詳情頁是展示用，三顆按鈕不綁任何行為；搜尋框是展示用；Banner 不可點。需求以 `docs/MoMO面試/` 的筆記為準，沒寫的就不要做。
3. **依賴方向：** `app → page → feature → ui / data-access → util`。`feature ✗ feature`、`data-access ✗ data-access`。只有 `page` 可以組合多個 feature。
4. **`react-router` 只准出現在 `apps/shop`；`embla` 只准出現在 `libs/shared/ui`。** libs 以 props 接收路由參數，連結一律用 `@momo/shared-ui` 的 `AppLink`。
5. **Rule of Two：** 被 ≥2 個專案使用的東西才能放進 `shared/ui`、`shared/util`。只有自己用的放在該 lib 的 `ui/`（展示）或 `model/`（邏輯），且不要從 `index.ts` 匯出。
6. **`shared/ui` 不認識 domain model。** 元件宣告自己需要的最小形狀，不要 import 任何 data-access。
7. **不要為了讓 lint 通過而修改 `eslint.config.mjs` 的 `depConstraints` 或新增 scope 放行。** 遇到 boundary 錯誤代表設計需要討論。新增 scope 放行必須先修改 [ADR-0006](./docs/adr/0006-domain-dependency-map.md)。
8. **UI 只透過 query hooks 取得資料**，不要直接 import fixtures 或 repository 實作。

## 做事的方式

- 有邏輯的程式碼走 TDD：先寫 spec → 確認它因為正確的理由失敗 → 最小實作 → 通過。純版面不寫單元測試。
- 測試檔 `*.spec.ts(x)` 與原始碼同層。某個 lib 加入第一個 spec 時，把它 vite / vitest 設定裡的 `passWithNoTests` 拿掉。
- 新增 lib 用 generator，tags 要加引號（PowerShell 會把逗號當陣列）：`"--tags=type:feature,scope:home"`。產生後**核對 `package.json` 的 `nx.tags` 是兩個獨立的字串**。
- 一個專案要 import 另一個 lib 時，三個動作缺一不可：在自己的 `package.json` 宣告 `"@momo/<lib>": "workspace:*"` → `pnpm install` → `pnpm nx sync`。之後跑 `pnpm verify:boundaries`。
- 驗證關卡 `lint` 與 `typecheck` 都要跑：相對路徑的跨專案引用由 lint 擋，套件名稱加內部路徑的深層引用由型別檢查擋。
- 新增 lib 後確認 `pnpm-lock.yaml` 的 `importers` 有它的條目（`libs/<scope>/<name>: {}`）。pnpm 12 不會自動補，少了的話本機正常、但全新 clone 的 `pnpm install --frozen-lockfile` 會失敗。
- 每個 commit 都要是綠的，使用 Conventional Commits。

## 驗證

```bash
pnpm nx run-many -t lint test typecheck
pnpm nx build shop
```

提交前的驗證關卡加 `--skip-nx-cache`。回報時貼出實際輸出；失敗就照實說，不要只看 exit code —— 讀錯誤訊息，分辨是程式碼的問題還是環境的問題。

慢速磁碟上若遇到 plugin 載入失敗或 Vitest worker 逾時，見 `docs/agent-workflow.md` §6 的參數。

## 回報與紀錄

每完成一個步驟，在 `docs/agent-workflow.md` 記錄偏離計畫的地方與原因。被 Human 糾正、或自己出錯時也要記 —— 那是這份文件最有價值的部分。
