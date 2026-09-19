import { fireEvent, render, screen } from '@testing-library/react';

import { SearchBox } from './search-box';

// 規格 app-layout：搜尋框為展示用
describe('SearchBox', () => {
  it('accepts text', () => {
    render(<SearchBox />);
    const input = screen.getByRole('searchbox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'iPhone 18 Pro' } });

    expect(input.value).toBe('iPhone 18 Pro');
  });

  it('does not navigate when submitted: the submit event is cancelled', () => {
    render(<SearchBox />);
    const form = screen.getByRole('search');

    // handler 呼叫了 preventDefault() 時，fireEvent 會回傳 false
    const notCancelled = fireEvent.submit(form);

    expect(notCancelled).toBe(false);
  });

  it('has a submit button labelled 搜尋', () => {
    render(<SearchBox />);

    const button = screen.getByRole('button', { name: '搜尋' });

    expect(button.getAttribute('type')).toBe('submit');
  });
});
