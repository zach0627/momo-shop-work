import { render, screen } from '@testing-library/react';

import { SectionHeader } from './section-header';

describe('SectionHeader', () => {
  it('is a level 2 heading', () => {
    render(<SectionHeader title="今日暢銷榜" />);

    expect(
      screen.getByRole('heading', { level: 2, name: '今日暢銷榜' }),
    ).toBeTruthy();
  });

  // On the live site the first words of a title are lighter ("降價" + "好貨").
  // That is styling: the heading must still read as one title.
  it('reads as one title when it has a lighter lead', () => {
    render(<SectionHeader lead="降價" title="好貨" />);

    expect(
      screen.getByRole('heading', { level: 2, name: '降價好貨' }),
    ).toBeTruthy();
  });

  it('shows an icon before the title when one is given', () => {
    render(
      <SectionHeader
        icon={<img src="store.png" alt="mo店+" />}
        title="超取$290免運無限次"
      />,
    );

    const heading = screen.getByRole('heading', { level: 2 });
    const icon = screen.getByRole('img', { name: 'mo店+' });
    expect(heading.contains(icon)).toBe(true);
    expect(heading.textContent).toBe('超取$290免運無限次');
  });
});
