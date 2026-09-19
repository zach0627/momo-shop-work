import { act, renderHook, waitFor } from '@testing-library/react';

import type { Product } from '../models/product';
import { useCatalogRepository } from '../repository/catalog-repository-context';
import { CatalogTestProvider, createFakeCatalogRepository } from '../testing';
import { useCategories } from './use-categories';
import { useFlashSale } from './use-flash-sale';
import { useProduct } from './use-product';
import { useProductCollection } from './use-product-collection';
import { useRanking } from './use-ranking';
import { useRecommendations } from './use-recommendations';

const product = (id: string): Product => ({
  id,
  name: `Product ${id}`,
  imageUrl: `assets/${id}.webp`,
  images: [`assets/${id}.webp`],
  price: 100,
  description: [],
});

function wrapperFor(
  overrides: Parameters<typeof createFakeCatalogRepository>[0],
) {
  const repository = createFakeCatalogRepository(overrides);
  return {
    repository,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <CatalogTestProvider repository={repository}>
        {children}
      </CatalogTestProvider>
    ),
  };
}

describe('useCatalogRepository', () => {
  it('returns the injected repository', () => {
    const { repository, wrapper } = wrapperFor({});
    const { result } = renderHook(() => useCatalogRepository(), { wrapper });
    expect(result.current).toBe(repository);
  });

  it('says what is missing when there is no provider', () => {
    // React 會印出 render 錯誤，讓測試輸出保持乾淨
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => renderHook(() => useCatalogRepository())).toThrow(
        /CatalogRepositoryProvider/,
      );
    } finally {
      spy.mockRestore();
    }
  });
});

describe('query hooks', () => {
  it('useProduct loads one product and asks the repository for that id', async () => {
    const getProduct = vi.fn(async () => product('42'));
    const { wrapper } = wrapperFor({ getProduct });

    const { result } = renderHook(() => useProduct('42'), { wrapper });

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual(product('42')));
    expect(getProduct).toHaveBeenCalledWith('42');
  });

  it('useProduct succeeds with null when the product does not exist', async () => {
    const { wrapper } = wrapperFor({ getProduct: async () => null });

    const { result } = renderHook(() => useProduct('nope'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('useProductCollection loads a collection by key', async () => {
    const getCollection = vi.fn(async () => [product('a'), product('b')]);
    const { wrapper } = wrapperFor({ getCollection });

    const { result } = renderHook(() => useProductCollection('price-drop'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(getCollection).toHaveBeenCalledWith('price-drop');
  });

  it('useFlashSale, useRanking and useCategories each read their own method', async () => {
    const { wrapper } = wrapperFor({
      getFlashSale: async () => ({
        endsAt: '2026-01-01T00:00:00.000Z',
        items: [],
      }),
      getRanking: async () => [product('top')],
      getCategories: async () => [{ id: 'home', name: '首頁' }],
    });

    const { result } = renderHook(
      () => ({
        flashSale: useFlashSale(),
        ranking: useRanking(),
        categories: useCategories(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.flashSale.data?.endsAt).toBe(
        '2026-01-01T00:00:00.000Z',
      );
      expect(result.current.ranking.data).toEqual([product('top')]);
      expect(result.current.categories.data).toEqual([
        { id: 'home', name: '首頁' },
      ]);
    });
  });
});

describe('useRecommendations', () => {
  const all = ['r1', 'r2', 'r3', 'r4', 'r5'].map(product);
  const getRecommendations = vi.fn(
    async ({ offset, limit }: { offset: number; limit: number }) => ({
      items: all.slice(offset, offset + limit),
      nextOffset: offset + limit < all.length ? offset + limit : null,
    }),
  );

  // 大括號不能省：Vitest 會把 beforeEach 的回傳值當清理函式執行，而 mockClear() 回傳 mock 本身
  beforeEach(() => {
    getRecommendations.mockClear();
  });

  it('starts with the first page', async () => {
    const { wrapper } = wrapperFor({ getRecommendations });

    const { result } = renderHook(() => useRecommendations(2), { wrapper });

    await waitFor(() => expect(result.current.items).toEqual(all.slice(0, 2)));
    expect(getRecommendations).toHaveBeenCalledWith({ offset: 0, limit: 2 });
    expect(result.current.hasMore).toBe(true);
  });

  it('appends the next page on loadMore, until there is nothing left', async () => {
    const { wrapper } = wrapperFor({ getRecommendations });
    const { result } = renderHook(() => useRecommendations(2), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toEqual(all.slice(0, 4)));
    expect(getRecommendations).toHaveBeenLastCalledWith({
      offset: 2,
      limit: 2,
    });
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toEqual(all));
    expect(result.current.hasMore).toBe(false);
  });

  // 連點發生在 React 重新 render 之前，同一個 loadMore 會被再呼叫一次
  it('asks for a page once when loadMore is called again before it arrives', async () => {
    const { wrapper } = wrapperFor({ getRecommendations });
    const { result } = renderHook(() => useRecommendations(2), { wrapper });
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    const loadMore = result.current.loadMore;

    act(() => {
      loadMore();
      loadMore();
      loadMore();
    });

    await waitFor(() => expect(result.current.items).toEqual(all.slice(0, 4)));
    // 第一頁 + 一次第二頁
    expect(getRecommendations).toHaveBeenCalledTimes(2);
  });

  it('does not ask again once the last page is loaded', async () => {
    const { wrapper } = wrapperFor({ getRecommendations });
    const { result } = renderHook(() => useRecommendations(5), { wrapper });
    await waitFor(() => expect(result.current.items).toEqual(all));
    expect(result.current.hasMore).toBe(false);

    act(() => result.current.loadMore());

    expect(getRecommendations).toHaveBeenCalledTimes(1);
  });
});
