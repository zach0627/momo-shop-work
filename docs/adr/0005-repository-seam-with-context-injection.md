# ADR-0005：Repository 接縫 + Context 注入，而非 MSW

狀態：已採用

## 背景

題目要求使用 Mock Data、不呼叫任何真實 API。需要決定 mock 放在哪一層。候選方案：(a) 元件直接 import fixture；(b) MSW 在網路層攔截；(c) Repository interface + mock 實作。

## 決策

採用 (c)。每個 data-access lib 定義一個 repository interface，提供 mock 實作，並透過 React Context 注入。用哪個實作由 composition root（`apps/shop` 的 providers）決定。

```
UI → query hooks → useCatalogRepository() → CatalogRepository (interface)
                                              ├─ createMockCatalogRepository({ now, latencyMs })   ← 現在
                                              └─ createHttpCatalogRepository({ baseUrl })          ← 以後
```

## 理由

- (a) 日後換成 API 要改所有元件。
- (b) MSW 需要 service worker，在靜態主機上多一個部署變數；而且本專案根本沒有 HTTP 契約可以模擬，MSW 攔的會是我們自己編出來的 URL。
- (c) 的接縫在 TypeScript interface 上，mock → 真 API 是「新增一個實作 + 改 providers 一行」。
- Context 注入讓測試可以放入小而可控的 fake repository，不依賴真 fixture 的內容與筆數。
- mock 實作注入 `now()`：限時搶購的結束時間是「現在 + N 小時」，不寫死在 fixture，測試也能控制時間。

## 代價

- 每個 data-access lib 多一個 interface、一個 Context、一個測試用的 helper。
- Repository 這層不會驗證 HTTP 細節（status code、headers、序列化）。

## 演進觸發條件

有了真實的 API 契約、需要做 contract test 或模擬網路錯誤時，再引入 MSW —— 它會接在 `createHttpCatalogRepository` 後面，與這個決策不衝突。
