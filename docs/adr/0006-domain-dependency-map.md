# ADR-0006：Domain 依賴地圖與 scope 放行的治理

狀態：已採用

## 背景

設計復盤時提出的問題：「程式碼大量放在 libs，日後擴充購物車、結帳、品牌頁、刷卡等很多頁面時，libs 不會變得很肥大嗎？」

結論分兩層：

- `libs/` 資料夾變大不是問題，它就是 `src/`。成長方式應該是**新增 scope**，而不是養大既有的 lib（拆分準則見 `architecture.md` §5）。
- 真正會腐化的是 **scope 的放行清單**。5 個 scope 時沒事；到 12 個 scope 時，最常見的劣化是有人遇到 lint 錯誤就「在放行清單加一個 scope」，幾年後每個 domain 都能依賴每個 domain，規則名存實亡。

## 決策

1. 「哪個 domain 可以依賴哪個 domain」以本文件的地圖為準。**新增任何 scope 放行前，必須先修改這份 ADR**，並說明為什麼這個方向的依賴是合理的。
2. 依賴圖必須保持**無環**，且 `catalog` 位於最底層（不依賴任何其他 domain）。
3. 各 domain 擁有自己的 model。跨 domain 傳遞 id 或最小形狀，不共用 model（例：購物車的 `CartLine` 存 `productId` 與下單當下的價格快照，而不是 import `catalog` 的 `Product`）。

現有的 `type:` 規則已經保證跨 domain 的依賴只會有兩種形式，不需要額外規則：

- `feature` / `page` → 對方的 `data-access`（讀資料）
- `page` → 對方的 `feature`（組合，例：首頁與詳情頁都掛 `catalog/feature-recommendation`）

`feature → feature` 與 `data-access → data-access` 不論是否跨 domain 都是 lint 錯誤。

## 地圖

實線是現況，虛線是預期的演進。

```mermaid
graph TD
  shell --> catalog
  home --> catalog
  goods --> catalog
  brand -.-> catalog
  cart -.-> catalog
  goods -.-> cart
  shell -.-> cart
  shell -.-> member
  checkout -.-> cart
  checkout -.-> payment
  checkout -.-> member
  checkout -.-> catalog
  catalog --> shared
```

| Domain     | 預期內容                                | 可依賴                                                   |
| ---------- | --------------------------------------- | -------------------------------------------------------- |
| `catalog`  | 商品、分類、推薦                        | shared                                                   |
| `home`     | 首頁版位、限時搶購、暢銷榜              | catalog, shared                                          |
| `goods`    | 商品詳情                                | catalog, shared（＋ cart：加入購物車）                   |
| `brand`    | 品牌頁                                  | catalog, shared                                          |
| `cart`     | 購物車（此時才引入 store，見 ADR-0003） | catalog, shared                                          |
| `member`   | 登入、會員資料                          | shared                                                   |
| `payment`  | 刷卡、分期                              | shared                                                   |
| `checkout` | 結帳流程                                | cart, payment, member, catalog, shared                   |
| `shell`    | 全站外框                                | catalog, shared（＋ cart 的數量徽章、member 的登入狀態） |

`shell` 是刻意的例外：它是全站的外框，本來就會讀多個 domain 的摘要資料。它只能依賴對方的 `data-access`，不能依賴 feature。

`payment` 不依賴 `checkout`、也不依賴 `cart`：付款元件不該知道自己被誰使用。這同時讓它日後能被隔離（信用卡表單屬於 PCI-DSS 範圍，見 ADR-0002）。

## 代價

新增 domain 時多一個步驟（先改 ADR）。這是刻意的摩擦：它把「加一行放行」從反射動作變成一個需要說明理由的設計決定。
