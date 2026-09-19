import { useEffect, type ComponentType } from 'react';

import type { HomeSection } from '@momo/home-data-access';
import { reportError } from '@momo/shared-util';

import type { SectionRegistry } from './registry';

export interface SectionRendererProps {
  sections: HomeSection[];
  registry: SectionRegistry;
}

/** `hasOwn`, not `in`: `registry['constructor']` exists on every object. */
const isKnown = (registry: SectionRegistry, section: HomeSection) =>
  Object.hasOwn(registry, section.type);

/**
 * Renders the home page from data, top to bottom. Pure: it fetches nothing,
 * so the order of the page is exactly the order of `sections`.
 *
 * The union of section types is closed at compile time, but the data comes
 * from outside: a CMS can ship a new type before this build knows about it.
 * Such a section is skipped and reported, and the rest of the page renders.
 */
export function SectionRenderer({ sections, registry }: SectionRendererProps) {
  const unknown = sections.filter((section) => !isKnown(registry, section));
  // A string, so the effect re-runs when the unknown sections change and
  // not whenever the parent passes a new array with the same content.
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
        // The registry maps each type to a component of exactly that
        // variant; indexing by a union loses that pairing, so it is
        // restated here, once.
        const Section = registry[section.type] as ComponentType<{
          section: HomeSection;
        }>;
        return <Section key={section.id} section={section} />;
      })}
    </>
  );
}
