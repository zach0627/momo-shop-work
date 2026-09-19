// 第二個入口 '@momo/shared-ui/testing'：測試工具不會進到 app 的 bundle

class ObserverStub {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}

/**
 * 補上 jsdom 缺少、但 embla 會用到的 API；任何會掛載 Carousel 的 spec 都要先呼叫。
 * embla 不檢查就直接 new ResizeObserver / IntersectionObserver，
 * 並從元素自己的 window（不是 globalThis）呼叫 matchMedia。
 * 回傳的函式會移除這次補上的東西。
 */
export function installCarouselTestEnvironment(): () => void {
  const ownerWindow = document.defaultView as unknown as Record<
    string,
    unknown
  >;
  const globals = globalThis as unknown as Record<string, unknown>;
  const additions: Array<[Record<string, unknown>, string, unknown]> = [
    [globals, 'ResizeObserver', ObserverStub],
    [globals, 'IntersectionObserver', ObserverStub],
    [
      ownerWindow,
      'matchMedia',
      () => ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    ],
  ];

  const added: Array<[Record<string, unknown>, string]> = [];
  for (const [target, name, value] of additions) {
    // 不能用 name in target：屬性可能存在但值是 undefined
    if (typeof target[name] === 'function') continue;
    Object.defineProperty(target, name, { configurable: true, value });
    added.push([target, name]);
  }
  return () => {
    for (const [target, name] of added) Reflect.deleteProperty(target, name);
  };
}
