import { render, screen } from '@testing-library/react';

import type { HomeSection } from '@momo/home-data-access';
import { setTelemetrySink, type TelemetrySink } from '@momo/shared-util';

import type { SectionRegistry } from './registry';
import { SectionRenderer } from './section-renderer';

/** 每種 type 一個極小的元件：這份測試測的是分派，不是 block。 */
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
  recommendation: label('recommendation'),
};

const flashSale: HomeSection = {
  id: 'fs',
  type: 'flash-sale',
  title: { text: '限時搶購' },
};
const recommendation: HomeSection = {
  id: 'rc',
  type: 'recommendation',
  title: { text: '你可能會喜歡' },
};
const rail: HomeSection = {
  id: 'pd',
  type: 'product-rail',
  title: { text: '降價好貨' },
  collection: 'price-drop',
  card: 'vertical',
  perView: 8,
};

/** 模擬 CMS 送來這個版本還不認識的 type。 */
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

  // 規格 home-page：區塊順序由版位資料決定
  it('follows the order of the data, and follows it again when it changes', () => {
    const { rerender } = render(
      <SectionRenderer
        sections={[flashSale, recommendation, rail]}
        registry={registry}
      />,
    );
    expect(rendered()).toEqual([
      'flash-sale:fs',
      'recommendation:rc',
      'product-rail:pd',
    ]);

    rerender(
      <SectionRenderer
        sections={[recommendation, flashSale, rail]}
        registry={registry}
      />,
    );
    expect(rendered()).toEqual([
      'recommendation:rc',
      'flash-sale:fs',
      'product-rail:pd',
    ]);

    rerender(
      <SectionRenderer sections={[recommendation, rail]} registry={registry} />,
    );
    expect(rendered()).toEqual(['recommendation:rc', 'product-rail:pd']);
  });

  // 規格 home-page：未知的區塊型別不影響頁面
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

  describe('when a section throws while rendering', () => {
    // 被 error boundary 接住的錯誤 React 仍會印到 console.error；測試裡關掉
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const Broken = () => {
      throw new Error('price is not a number');
    };

    // 規格 home-page：一個區塊渲染時拋錯
    it('drops that section, keeps the ones around it, and reports it', () => {
      render(
        <SectionRenderer
          sections={[flashSale, recommendation, rail]}
          registry={{ ...registry, recommendation: Broken }}
        />,
      );

      expect(rendered()).toEqual(['flash-sale:fs', 'product-rail:pd']);
      expect(sink.error).toHaveBeenCalledTimes(1);
      const [error, context] = vi.mocked(sink.error).mock.calls[0];
      expect(String(error)).toContain('price is not a number');
      expect(context).toEqual({
        sectionId: 'rc',
        sectionType: 'recommendation',
      });
    });

    // 規格 home-page：版位資料更新後恢復
    it('shows the section again once new data for it stops throwing', () => {
      const BrokenOnce = ({ section }: { section: HomeSection }) => {
        if (section.type === 'recommendation' && section.title.text === 'bad')
          throw new Error('bad title');
        return (
          <div data-testid="section">{`recommendation:${section.id}`}</div>
        );
      };
      const custom = { ...registry, recommendation: BrokenOnce };
      const bad: HomeSection = { ...recommendation, title: { text: 'bad' } };

      const { rerender } = render(
        <SectionRenderer sections={[flashSale, bad]} registry={custom} />,
      );
      expect(rendered()).toEqual(['flash-sale:fs']);

      rerender(
        <SectionRenderer
          sections={[flashSale, recommendation]}
          registry={custom}
        />,
      );
      expect(rendered()).toEqual(['flash-sale:fs', 'recommendation:rc']);
    });
  });

  // registry['constructor'] 在每個物件上都存在，不能因此被當成「有註冊」
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
