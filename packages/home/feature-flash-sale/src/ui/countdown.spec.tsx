import { act, render, screen } from '@testing-library/react';

import { Countdown } from './countdown';

const END = '2026-09-19T15:00:00.000Z';
const shown = () => screen.getByRole('timer').textContent;

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 規格 home-page：倒數更新（02:19:23 → 經過 1 秒 → 02:19:22）
  it('shows the time left and counts down every second', () => {
    vi.setSystemTime(new Date('2026-09-19T12:40:37.000Z'));
    render(<Countdown endsAt={END} />);
    expect(shown()).toBe('02:19:23');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(shown()).toBe('02:19:22');

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(shown()).toBe('02:18:22');
  });

  // 規格 home-page：活動已結束 → 停在 00:00:00
  it('stops at 00:00:00 and never goes negative', () => {
    vi.setSystemTime(new Date('2026-09-19T14:59:58.000Z'));
    render(<Countdown endsAt={END} />);
    expect(shown()).toBe('00:00:02');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(shown()).toBe('00:00:00');
    // 到零之後不再有計時器在跑
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows 00:00:00 at once when the sale is already over', () => {
    vi.setSystemTime(new Date('2026-09-20T00:00:00.000Z'));
    render(<Countdown endsAt={END} />);

    expect(shown()).toBe('00:00:00');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops its timer when it unmounts', () => {
    vi.setSystemTime(new Date('2026-09-19T12:00:00.000Z'));
    const { unmount } = render(<Countdown endsAt={END} />);
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
