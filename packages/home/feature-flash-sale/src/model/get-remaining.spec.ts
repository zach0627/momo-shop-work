import { getRemaining } from './get-remaining';

const at = (iso: string) => new Date(iso).getTime();
const END = '2026-09-19T15:00:00.000Z';

describe('getRemaining', () => {
  // 規格 home-page：限時搶購顯示倒數
  it('splits the time left into hours, minutes and seconds', () => {
    expect(getRemaining(END, at('2026-09-19T12:40:37.000Z'))).toEqual({
      hours: 2,
      minutes: 19,
      seconds: 23,
      isOver: false,
    });
  });

  it('counts a partial second as not yet elapsed', () => {
    expect(getRemaining(END, at('2026-09-19T14:59:58.100Z'))).toMatchObject({
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
  });

  it('keeps counting hours past 24 instead of introducing days', () => {
    expect(getRemaining(END, at('2026-09-18T12:00:00.000Z'))).toMatchObject({
      hours: 27,
      minutes: 0,
      seconds: 0,
    });
  });

  // 規格 home-page：活動已結束 → 00:00:00，不得出現負值
  it.each([
    ['exactly at the end', '2026-09-19T15:00:00.000Z'],
    ['one second late', '2026-09-19T15:00:01.000Z'],
    ['a day late', '2026-09-20T15:00:00.000Z'],
  ])('is zero and over %s', (_, now) => {
    expect(getRemaining(END, at(now))).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOver: true,
    });
  });

  it('treats an unreadable end time as already over', () => {
    expect(getRemaining('not a date', at(END))).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
      isOver: true,
    });
  });
});
