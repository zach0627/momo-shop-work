import { useEffect, useState } from 'react';

import { getRemaining, type Remaining } from './get-remaining';

/** 每秒更新一次的倒數。到零就停止計時器，不會繼續空轉。 */
export function useCountdown(endsAt: string): Remaining {
  const [now, setNow] = useState(() => Date.now());
  const remaining = getRemaining(endsAt, now);
  const { isOver } = remaining;

  useEffect(() => {
    if (isOver) return;
    // 每次都重新讀時鐘，不是自己減 1：分頁在背景時 setInterval 會被瀏覽器延後
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOver]);

  return remaining;
}
