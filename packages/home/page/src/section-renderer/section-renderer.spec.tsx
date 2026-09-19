import { render, screen } from '@testing-library/react';

import type { HomeSection } from '@momo/home-data-access';
import { setTelemetrySink, type TelemetrySink } from '@momo/shared-util';

import type { SectionRegistry } from './registry';
import { SectionRenderer } from './section-renderer';

/** One tiny component per type: the test is about dispatch, not about blocks. */
const label =
  (name: string) =>
  ({ section }: { section: HomeSection }) => (
    <div data-testid="section">{`${name}:${section.id}`}</div>
  );

const registry: SectionRegistry = {
  hero: label('hero'),
  'banner-carousel': label('banner-carousel'),
  'banner-grid': label('banner-grid'),
  'shortcut-bar': label('shortcut-bar'),
  notice: label('notice'),
  'product-rail': label('product-rail'),
  'flash-sale': label('flash-sale'),
  ranking: label('ranking'),
  recommendation: label('recommendation'),
};

const flashSale: HomeSection = {
  id: 'fs',
  type: 'flash-sale',
  title: { text: '限時搶購' },
};
const ranking: HomeSection = {
  id: 'rk',
  type: 'ranking',
  title: { text: '今日暢銷榜' },
};
const rail: HomeSection = {
  id: 'pd',
  type: 'product-rail',
  title: { text: '降價好貨' },
  collection: 'price-drop',
  card: 'vertical',
  perView: 8,
};

/** What a newer CMS might send before this build knows about it. */
const unknown = (id: string, type: string) =>
  ({ id, type }) as unknown as HomeSection;

const rendered = () =>
  screen.queryAllByTestId('section').map((node) => node.textContent);

describe('SectionRenderer', () => {
  let sink: TelemetrySink;
  let restore: () => void;

  beforeEach(() => {
    sink = { error: vi.fn() };
    restore = setTelemetrySink(sink);
  });

  afterEach(() => {
    restore();
  });

  it('renders each section with the component registered for its type', () => {
    render(
      <SectionRenderer sections={[flashSale, rail]} registry={registry} />,
    );

    expect(rendered()).toEqual(['flash-sale:fs', 'product-rail:pd']);
    expect(sink.error).not.toHaveBeenCalled();
  });

  // spec home-page: 區塊順序由版位資料決定
  it('follows the order of the data, and follows it again when it changes', () => {
    const { rerender } = render(
      <SectionRenderer
        sections={[flashSale, ranking, rail]}
        registry={registry}
      />,
    );
    expect(rendered()).toEqual([
      'flash-sale:fs',
      'ranking:rk',
      'product-rail:pd',
    ]);

    rerender(
      <SectionRenderer
        sections={[ranking, flashSale, rail]}
        registry={registry}
      />,
    );
    expect(rendered()).toEqual([
      'ranking:rk',
      'flash-sale:fs',
      'product-rail:pd',
    ]);

    rerender(
      <SectionRenderer sections={[ranking, rail]} registry={registry} />,
    );
    expect(rendered()).toEqual(['ranking:rk', 'product-rail:pd']);
  });

  // spec home-page: 未知的區塊型別不影響頁面
  it('skips a section of an unknown type, keeps the rest, and reports it', () => {
    render(
      <SectionRenderer
        sections={[flashSale, unknown('vw', 'video-wall'), rail]}
        registry={registry}
      />,
    );

    expect(rendered()).toEqual(['flash-sale:fs', 'product-rail:pd']);
    expect(sink.error).toHaveBeenCalledTimes(1);
    const [error, context] = vi.mocked(sink.error).mock.calls[0];
    expect(String(error)).toContain('video-wall');
    expect(context).toEqual({ sectionId: 'vw', sectionType: 'video-wall' });
  });

  it('reports an unknown section once, not once per render', () => {
    const sections = [flashSale, unknown('vw', 'video-wall')];
    const { rerender } = render(
      <SectionRenderer sections={sections} registry={registry} />,
    );

    rerender(<SectionRenderer sections={[...sections]} registry={registry} />);
    rerender(<SectionRenderer sections={[...sections]} registry={registry} />);

    expect(rendered()).toEqual(['flash-sale:fs']);
    expect(sink.error).toHaveBeenCalledTimes(1);
  });

  // `registry['constructor']` is a function on every object. A type that
  // happens to be named like one must not be "found".
  it('treats a type named like an Object.prototype member as unknown', () => {
    render(
      <SectionRenderer
        sections={[unknown('x', 'constructor'), flashSale]}
        registry={registry}
      />,
    );

    expect(rendered()).toEqual(['flash-sale:fs']);
    expect(sink.error).toHaveBeenCalledTimes(1);
  });
});
