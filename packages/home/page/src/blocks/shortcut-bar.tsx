import type { ShortcutBarSection } from '@momo/home-data-access';

import { SectionFrame } from '../ui/section-frame';

/** 圓形捷徑（秒殺、簽到…）。文字印在圖上，所以 alt 就是標籤；不可點。 */
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
