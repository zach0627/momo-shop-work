import { Fragment } from 'react';

import { useCountdown } from '../model/use-countdown';

const pad = (value: number) => String(value).padStart(2, '0');

/** 「時:分:秒」三個數字方塊。只有這個元件每秒重新渲染，不會帶動整個區塊。 */
export function Countdown({ endsAt }: { endsAt: string }) {
  const { hours, minutes, seconds } = useCountdown(endsAt);

  return (
    // role="timer" 預設不會每秒朗讀，螢幕閱讀器使用者不會被打擾
    <span role="timer" aria-label="距離結束" className="flex items-center">
      {[hours, minutes, seconds].map((value, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="text-ec-md text-ink mx-1">:</span>}
          <span className="bg-countdown text-ec-md text-on-action rounded-tile flex size-7 items-center justify-center font-bold">
            {pad(value)}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
