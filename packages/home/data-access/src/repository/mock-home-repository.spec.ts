import type { HomeSection } from '../models/home-section';
import { createMockHomeRepository } from './mock-home-repository';

const notice = (id: string): HomeSection => ({
  id,
  type: 'notice',
  banner: { id, imageUrl: `${id}.gif`, alt: id, width: 960, height: 96 },
});

describe('createMockHomeRepository', () => {
  it('returns the layout it was given, in order', async () => {
    const layout = [notice('b'), notice('a'), notice('c')];
    const repository = createMockHomeRepository({ layout });

    const sections = await repository.getLayout();

    expect(sections.map((section) => section.id)).toEqual(['b', 'a', 'c']);
  });

  it('waits for the configured latency before answering', async () => {
    vi.useFakeTimers();
    try {
      const repository = createMockHomeRepository({
        layout: [notice('a')],
        latencyMs: 150,
      });
      const settled = vi.fn();
      void repository.getLayout().then(settled);

      await vi.advanceTimersByTimeAsync(149);
      expect(settled).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(settled).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

// 規格 home-page：預設順序。圖檔是否存在由 app 的 spec 檢查
describe('the home layout fixture', () => {
  const real = createMockHomeRepository();

  it('lists the blocks of the home page in the specified order', async () => {
    const sections = await real.getLayout();

    expect(sections.map((section) => `${section.id}:${section.type}`)).toEqual([
      'main-events:hero',
      'official-deals-icons:banner-carousel',
      'official-deals-shortcuts:shortcut-bar',
      'official-deals-mega-brand:banner-grid',
      'price-drop:product-rail',
      'brand-discount:banner-carousel',
      'fraud-notice:notice',
      'flagship-stores:banner-grid',
      'store-pickup:product-rail',
      'card-offers:banner-carousel',
      'search-suggest:banner-carousel',
      'flash-sale:flash-sale',
      'best-sellers:product-rail',
      'mopro:banner-carousel',
      'recommendations:recommendation',
    ]);
  });

  // 規格 home-page：今日暢銷榜以橫式商品卡呈現。真站上它和 momo 店取是同一種區塊（bt_7_777），只差資料與底色
  it('makes the best sellers a rail of horizontal cards, like the store pickup rail', async () => {
    const sections = await real.getLayout();
    const byId = (id: string) => sections.find((section) => section.id === id);
    const bestSellers = byId('best-sellers');
    const storePickup = byId('store-pickup');

    expect(bestSellers?.type).toBe('product-rail');
    if (bestSellers?.type !== 'product-rail') return;
    if (storePickup?.type !== 'product-rail') return;
    expect(bestSellers.collection).toBe('best-sellers');
    expect(bestSellers.card).toBe('horizontal');
    expect(bestSellers.perView).toBe(storePickup.perView);
    expect(bestSellers.title).toEqual({
      text: '今日暢銷榜',
      badge: '即時更新',
    });
    expect(bestSellers.background).toBe('#f6e8eb');
  });

  // 真站實測：只有這幾個區塊下方留灰色間隔，其餘緊貼
  it('leaves a gap below exactly the sections the live page does', async () => {
    const sections = await real.getLayout();

    expect(
      sections
        .filter((section) => section.gapAfter)
        .map((section) => section.id),
    ).toEqual(['fraud-notice', 'store-pickup', 'card-offers', 'flash-sale']);
  });

  // 目標截圖上的熱搜排行，依名次
  it('ranks nine hot searches beside the shortcuts', async () => {
    const sections = await real.getLayout();
    const shortcuts = sections.find(
      (section) => section.type === 'shortcut-bar',
    );

    if (shortcuts?.type !== 'shortcut-bar') throw new Error('no shortcut bar');
    expect(shortcuts.hotSearches?.map((item) => item.keyword)).toEqual([
      '中秋禮盒',
      'on 昂跑',
      '即享券',
      '買一送一',
      'iphone 18 pro',
      '即期品',
      '電競筆電',
      'longchamp',
      'ps5',
    ]);
    expect(
      shortcuts.hotSearches
        ?.filter((item) => item.rising)
        .map((item) => item.keyword),
    ).toEqual(['iphone 18 pro', '即期品', 'longchamp']);
    expect(
      shortcuts.hotSearches
        ?.filter((item) => item.isNew)
        .map((item) => item.keyword),
    ).toEqual(['電競筆電']);
  });

  it('gives every section and every banner a unique id', async () => {
    const sections = await real.getLayout();
    const sectionIds = sections.map((section) => section.id);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);

    const bannerIds = sections.flatMap((section) => {
      if (section.type === 'hero')
        return [...section.banners, ...section.aside.items];
      if (section.type === 'banner-carousel' || section.type === 'banner-grid')
        return section.banners;
      return [];
    });
    expect(bannerIds.length).toBeGreaterThan(50);
    expect(new Set(bannerIds.map((banner) => banner.id)).size).toBe(
      bannerIds.length,
    );
  });

  it('captions every search suggestion with its keyword', async () => {
    const sections = await real.getLayout();
    const suggestions = sections.find(
      (section) => section.id === 'search-suggest',
    );

    expect(suggestions?.type).toBe('banner-carousel');
    if (suggestions?.type !== 'banner-carousel') return;
    expect(suggestions.banners).toHaveLength(9);
    for (const banner of suggestions.banners) {
      expect(banner.caption ?? '').not.toBe('');
    }
  });
});
