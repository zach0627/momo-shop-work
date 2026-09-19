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
      'best-sellers:ranking',
      'mopro:banner-carousel',
      'recommendations:recommendation',
    ]);
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
