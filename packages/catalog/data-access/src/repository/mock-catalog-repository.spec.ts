import type { Product } from '../models/product';
import {
  createMockCatalogRepository,
  type CatalogData,
} from './mock-catalog-repository';

function product(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    name: `Product ${id}`,
    imageUrl: `assets/${id}.webp`,
    images: [`assets/${id}.webp`],
    price: 100,
    description: ['line'],
    ...overrides,
  };
}

// 7 recommendations: two full pages of 3 and a last page of 1
const data: CatalogData = {
  products: [
    ...['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'].map((id) => product(id)),
    product('f1', { price: 80, originalPrice: 120 }),
    product('b1'),
  ],
  collections: {
    recommendations: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'],
    'flash-sale': ['f1'],
    'best-sellers': ['b1', 'r2'],
    'price-drop': ['r3', 'r1'],
  },
  flashSaleExtras: { f1: { promoText: '限時下殺', stockLeft: 12 } },
  categories: [
    { id: 'home', name: '首頁' },
    { id: 'appliances', name: '家電' },
  ],
};

const NOW = new Date('2026-01-15T10:00:00.000Z');
const repository = createMockCatalogRepository({
  data,
  now: () => NOW,
  latencyMs: 0,
});

describe('createMockCatalogRepository', () => {
  describe('getProduct', () => {
    it('returns the product with that id', async () => {
      await expect(repository.getProduct('r2')).resolves.toEqual(product('r2'));
    });

    it('resolves to null for an unknown id instead of throwing', async () => {
      await expect(repository.getProduct('nope')).resolves.toBeNull();
    });
  });

  describe('getCollection', () => {
    it('returns the products of a collection in the order of its ids', async () => {
      const items = await repository.getCollection('price-drop');
      expect(items.map((p) => p.id)).toEqual(['r3', 'r1']);
    });

    it('resolves to an empty list for an unknown key', async () => {
      await expect(repository.getCollection('nope')).resolves.toEqual([]);
    });
  });

  describe('getRecommendations', () => {
    it('returns the requested slice and the offset of the next page', async () => {
      const page = await repository.getRecommendations({ offset: 3, limit: 3 });
      expect(page.items.map((p) => p.id)).toEqual(['r4', 'r5', 'r6']);
      expect(page.nextOffset).toBe(6);
    });

    it('has no next offset on the last, shorter page', async () => {
      const page = await repository.getRecommendations({ offset: 6, limit: 3 });
      expect(page.items.map((p) => p.id)).toEqual(['r7']);
      expect(page.nextOffset).toBeNull();
    });

    it('has no next offset when the last page is exactly full', async () => {
      const page = await repository.getRecommendations({ offset: 4, limit: 3 });
      expect(page.items.map((p) => p.id)).toEqual(['r5', 'r6', 'r7']);
      expect(page.nextOffset).toBeNull();
    });

    it('returns an empty last page when the offset is past the end', async () => {
      const page = await repository.getRecommendations({ offset: 9, limit: 3 });
      expect(page).toEqual({ items: [], nextOffset: null });
    });
  });

  describe('getFlashSale', () => {
    it('ends a fixed time after the injected "now", not at a fixed date', async () => {
      const early = createMockCatalogRepository({
        data,
        latencyMs: 0,
        flashSaleHours: 3,
        now: () => new Date('2026-01-15T10:00:00.000Z'),
      });
      const late = createMockCatalogRepository({
        data,
        latencyMs: 0,
        flashSaleHours: 3,
        now: () => new Date('2031-06-01T00:30:00.000Z'),
      });

      expect((await early.getFlashSale()).endsAt).toBe(
        '2026-01-15T13:00:00.000Z',
      );
      expect((await late.getFlashSale()).endsAt).toBe(
        '2031-06-01T03:30:00.000Z',
      );
    });

    it('adds the promotion text and the stock left to each product', async () => {
      const { items } = await repository.getFlashSale();
      expect(items).toEqual([
        {
          ...product('f1', { price: 80, originalPrice: 120 }),
          promoText: '限時下殺',
          stockLeft: 12,
        },
      ]);
    });
  });

  it('getRanking returns the best sellers in order', async () => {
    const items = await repository.getRanking();
    expect(items.map((p) => p.id)).toEqual(['b1', 'r2']);
  });

  it('getCategories returns the categories in order', async () => {
    await expect(repository.getCategories()).resolves.toEqual(data.categories);
  });

  it('waits for the configured latency before answering', async () => {
    vi.useFakeTimers();
    try {
      const slow = createMockCatalogRepository({ data, latencyMs: 200 });
      let settled = false;
      const pending = slow.getProduct('r1').then(() => (settled = true));

      await vi.advanceTimersByTimeAsync(199);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await pending;
      expect(settled).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

// The numbers the specification states about the real data.
describe('the generated fixtures', () => {
  const real = createMockCatalogRepository({ latencyMs: 0, now: () => NOW });

  it('has 55 recommendations: offset 15 gives items 16-30, offset 45 the last 10', async () => {
    const all = await real.getCollection('recommendations');
    expect(all).toHaveLength(55);

    const middle = await real.getRecommendations({ offset: 15, limit: 15 });
    expect(middle.items).toEqual(all.slice(15, 30));
    expect(middle.nextOffset).toBe(30);

    const last = await real.getRecommendations({ offset: 45, limit: 15 });
    expect(last.items).toEqual(all.slice(45, 55));
    expect(last.nextOffset).toBeNull();
  });

  it('has 40 categories and the first one is 首頁', async () => {
    const categories = await real.getCategories();
    expect(categories).toHaveLength(40);
    expect(categories[0]).toEqual({ id: 'home', name: '首頁' });
    expect(new Set(categories.map((c) => c.id)).size).toBe(40);
  });

  it('can look up every product shown on the home page, with the same name and price', async () => {
    const keys = ['price-drop', 'store-pickup', 'flash-sale', 'best-sellers'];
    const shown = [
      ...(await Promise.all(keys.map((key) => real.getCollection(key)))).flat(),
      ...(await real.getCollection('recommendations')),
    ];
    expect(shown.length).toBeGreaterThan(100);

    for (const item of shown) {
      const found = await real.getProduct(item.id);
      expect(found).toMatchObject({ name: item.name, price: item.price });
    }
  });

  it('sells every flash sale product below its original price', async () => {
    const { items, endsAt } = await real.getFlashSale();
    expect(items.length).toBeGreaterThan(0);
    expect(new Date(endsAt).getTime()).toBeGreaterThan(NOW.getTime());
    for (const item of items) {
      expect(item.price).toBeLessThan(item.originalPrice);
      expect(item.promoText).not.toBe('');
      expect(item.stockLeft).toBeGreaterThan(0);
    }
  });
});
