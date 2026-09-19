// Secondary entry point: '@momo/shared-ui/testing'.
// Kept out of the main entry so test helpers never reach the app bundle.

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
 * Gives jsdom what the carousel library reaches for. Any spec that mounts a
 * `Carousel` - directly or through a page - needs it; this package owns the
 * library, so it owns the shim too.
 *
 * embla constructs ResizeObserver and IntersectionObserver without checking
 * that they exist, and calls `matchMedia` on the element's own window
 * (`ownerDocument.defaultView`, which is not `globalThis` under Vitest) even
 * when no breakpoints are set.
 *
 * Returns a function that removes whatever was added. Call it from
 * `beforeAll`, or once from a Vitest setup file.
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
    // Not `name in target`: the property can exist and still be undefined.
    if (typeof target[name] === 'function') continue;
    Object.defineProperty(target, name, { configurable: true, value });
    added.push([target, name]);
  }
  return () => {
    for (const [target, name] of added) Reflect.deleteProperty(target, name);
  };
}
