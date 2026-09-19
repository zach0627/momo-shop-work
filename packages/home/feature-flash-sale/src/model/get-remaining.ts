export interface Remaining {
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
}

const OVER: Remaining = { hours: 0, minutes: 0, seconds: 0, isOver: true };

/** 距離 endsAt 還剩多久。過期或日期無法解析時一律回傳 0，不會出現負值。 */
export function getRemaining(endsAt: string, now: number): Remaining {
  const left = new Date(endsAt).getTime() - now;
  // NaN 的比較永遠是 false，所以要分開判斷
  if (Number.isNaN(left) || left <= 0) return OVER;

  const totalSeconds = Math.floor(left / 1000);
  return {
    // 不進位成「天」：超過 24 小時就顯示 27:00:00
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOver: false,
  };
}
