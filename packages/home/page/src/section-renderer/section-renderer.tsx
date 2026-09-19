import { Fragment, useEffect, type ComponentType } from 'react';

import type { HomeSection } from '@momo/home-data-access';
import { reportError } from '@momo/shared-util';

import type { SectionRegistry } from './registry';
import { SectionBoundary } from './section-boundary';

export interface SectionRendererProps {
  sections: HomeSection[];
  registry: SectionRegistry;
}

/** 用 hasOwn 不用 in：registry['constructor'] 在每個物件上都存在。 */
const isKnown = (registry: SectionRegistry, section: HomeSection) =>
  Object.hasOwn(registry, section.type);

/** 依資料由上到下渲染首頁（自己不抓資料）。不認識的 type、或渲染時拋錯的區塊：略過、回報一次，其餘照常。 */
export function SectionRenderer({ sections, registry }: SectionRendererProps) {
  const unknown = sections.filter((section) => !isKnown(registry, section));
  // 用字串當 effect 的依賴：內容相同的新陣列不會重複回報
  const unknownKey = JSON.stringify(
    unknown.map((section) => [section.id, section.type]),
  );

  useEffect(() => {
    const entries: Array<[string, string]> = JSON.parse(unknownKey);
    for (const [sectionId, sectionType] of entries) {
      reportError(new Error(`Unknown home section type: ${sectionType}`), {
        sectionId,
        sectionType,
      });
    }
  }, [unknownKey]);

  return (
    <>
      {sections.map((section) => {
        if (!isKnown(registry, section)) return null;
        // 以 union 當索引會遺失「type ↔ 元件」的對應，所以在這裡轉型一次
        const Section = registry[section.type] as ComponentType<{
          section: HomeSection;
        }>;
        return (
          <Fragment key={section.id}>
            <SectionBoundary section={section}>
              <Section section={section} />
            </SectionBoundary>
            {/* 真站只有少數區塊下方有 16px 的灰色間隔，其餘緊貼 */}
            {section.gapAfter && (
              <div aria-hidden="true" data-section-gap="" className="h-4" />
            )}
          </Fragment>
        );
      })}
    </>
  );
}
