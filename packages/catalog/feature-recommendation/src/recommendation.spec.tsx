import { act, fireEvent, render, screen } from '@testing-library/react';

import type { CatalogRepository, Product } from '@momo/catalog-data-access';
import {
  CatalogTestProvider,
  createFakeCatalogRepository,
} from '@momo/catalog-data-access/testing';

import { Recommendation } from './recommendation';

const makeProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, index) => {
    const id = String(1000 + index);
    return {
      id,
      name: `推薦商品 ${index + 1}`,
      imageUrl: `${id}.webp`,
      images: [`${id}.webp`],
      price: 100 + index,
      description: [],
    };
  });

/** Pages through `all` the way a real API would. */
function pagingRepository(all: Product[]) {
  const getRecommendations = vi.fn<CatalogRepository['getRecommendations']>(
    async ({ offset, limit }) => {
      const end = offset + limit;
      return {
        items: all.slice(offset, end),
        nextOffset: end < all.length ? end : null,
      };
    },
  );
  return {
    repository: createFakeCatalogRepository({ getRecommendations }),
    getRecommendations,
  };
}

function renderWith(repository: CatalogRepository) {
  return render(
    <CatalogTestProvider repository={repository}>
      <Recommendation lead="你可能會" title="喜歡!" />
    </CatalogTestProvider>,
  );
}

const shownNames = () =>
  screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent);
const loadMoreButton = () => screen.queryByRole('button', { name: '看更多' });
const clickLoadMore = () =>
  fireEvent.click(screen.getByRole('button', { name: /看更多|載入中/ }));

describe('Recommendation', () => {
  // spec product-recommendation: 初始顯示 3 列 / 推薦商品足夠
  it('shows the first 3 rows of 5 and offers more when there is more', async () => {
    const all = makeProducts(55);
    const { repository, getRecommendations } = pagingRepository(all);

    renderWith(repository);

    await screen.findByText('推薦商品 15');
    expect(shownNames()).toEqual(all.slice(0, 15).map((p) => p.name));
    expect(loadMoreButton()).not.toBeNull();
    expect(getRecommendations).toHaveBeenCalledWith({ offset: 0, limit: 15 });
  });

  // spec: 推薦商品不足一頁 / 推薦商品恰好一頁
  it.each([10, 15])(
    'shows all %d products and no button when that is all there is',
    async (count) => {
      const { repository } = pagingRepository(makeProducts(count));

      renderWith(repository);

      await screen.findByText(`推薦商品 ${count}`);
      expect(shownNames()).toHaveLength(count);
      expect(loadMoreButton()).toBeNull();
    },
  );

  // spec: 看更多會再載入 3 列 / 載入下一批
  it('appends the next 3 rows and leaves the first ones where they were', async () => {
    const all = makeProducts(55);
    const { repository } = pagingRepository(all);
    renderWith(repository);
    await screen.findByText('推薦商品 15');

    clickLoadMore();

    await screen.findByText('推薦商品 30');
    expect(shownNames()).toEqual(all.slice(0, 30).map((p) => p.name));
  });

  // spec: 全部載完後按鈕消失 / 載入最後一批 (55 = 15 + 15 + 15 + 10)
  it('removes the button once the last, shorter batch is shown', async () => {
    const { repository } = pagingRepository(makeProducts(55));
    renderWith(repository);
    await screen.findByText('推薦商品 15');

    for (const lastOfBatch of [30, 45, 55]) {
      clickLoadMore();
      await screen.findByText(`推薦商品 ${lastOfBatch}`);
    }

    expect(shownNames()).toHaveLength(55);
    expect(loadMoreButton()).toBeNull();
  });

  // spec: 載入中重複點擊
  it('loads one batch when the button is clicked again while loading', async () => {
    const all = makeProducts(55);
    let releaseSecondBatch: () => void = () => undefined;
    const getRecommendations = vi.fn<CatalogRepository['getRecommendations']>(
      async ({ offset, limit }) => {
        if (offset > 0) {
          await new Promise<void>((resolve) => {
            releaseSecondBatch = resolve;
          });
        }
        const end = offset + limit;
        return { items: all.slice(offset, end), nextOffset: end };
      },
    );
    renderWith(createFakeCatalogRepository({ getRecommendations }));
    await screen.findByText('推薦商品 15');

    clickLoadMore();
    clickLoadMore();
    clickLoadMore();
    await act(async () => releaseSecondBatch());

    await screen.findByText('推薦商品 30');
    expect(shownNames()).toHaveLength(30);
    expect(new Set(shownNames()).size).toBe(30);
    // The first batch and one second batch - not three.
    expect(getRecommendations).toHaveBeenCalledTimes(2);
  });

  // spec: 推薦商品可點擊
  it('links every product to its detail page', async () => {
    const { repository } = pagingRepository(makeProducts(3));

    renderWith(repository);

    await screen.findByText('推薦商品 3');
    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('href')),
    ).toEqual(['/goods/1000', '/goods/1001', '/goods/1002']);
  });

  it('is a section named by its title, with the lighter lead', async () => {
    const { repository } = pagingRepository(makeProducts(3));

    renderWith(repository);

    expect(
      await screen.findByRole('region', { name: '你可能會喜歡!' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: '你可能會喜歡!' }),
    ).toBeTruthy();
  });

  // Not in the spec, but a button that fails must not cost the user what is
  // already on screen - and asking again is the obvious way to retry.
  it('keeps what is shown when a later batch fails, and can be asked again', async () => {
    const all = makeProducts(30);
    let failNext = true;
    const getRecommendations = vi.fn<CatalogRepository['getRecommendations']>(
      async ({ offset, limit }) => {
        if (offset > 0 && failNext) {
          failNext = false;
          throw new Error('network');
        }
        const end = offset + limit;
        return {
          items: all.slice(offset, end),
          nextOffset: end < all.length ? end : null,
        };
      },
    );
    renderWith(createFakeCatalogRepository({ getRecommendations }));
    await screen.findByText('推薦商品 15');

    clickLoadMore();
    await vi.waitFor(() => expect(getRecommendations).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('button', { name: '看更多' })).toBeTruthy();
    expect(shownNames()).toHaveLength(15);

    clickLoadMore();
    await screen.findByText('推薦商品 30');
    expect(loadMoreButton()).toBeNull();
  });

  it('leaves the page when nothing could be loaded at all', async () => {
    const getRecommendations = vi.fn<CatalogRepository['getRecommendations']>(
      async () => {
        throw new Error('network');
      },
    );
    const { container } = renderWith(
      createFakeCatalogRepository({ getRecommendations }),
    );

    await vi.waitFor(() => expect(getRecommendations).toHaveBeenCalled());
    await vi.waitFor(() => expect(container.textContent).toBe(''));
  });
});
