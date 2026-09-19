import type { ShortcutBarSection } from '@momo/home-data-access';

import { SectionFrame } from '../ui/section-frame';

/**
 * The round shortcut icons (秒殺, 簽到 ...). The label is part of the artwork,
 * so it is the image's alt rather than text beside it. Not links: where
 * they lead is out of scope.
 */
export function ShortcutBar({ section }: { section: ShortcutBarSection }) {
  return (
    <SectionFrame label="快捷入口">
      <ul className="flex gap-5">
        {section.items.map((item) => (
          <li key={item.id}>
            <img
              src={item.iconUrl}
              alt={item.label}
              width={108}
              height={108}
              loading="lazy"
              className="size-24"
            />
          </li>
        ))}
      </ul>
    </SectionFrame>
  );
}
