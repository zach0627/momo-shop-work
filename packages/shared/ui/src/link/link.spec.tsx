import { render, screen } from '@testing-library/react';

import { AppLink, LinkProvider, type AppLinkProps } from './link';

describe('AppLink', () => {
  it('renders a plain anchor when no link component is provided', () => {
    render(
      <AppLink href="/goods/15687497" className="card">
        iPhone
      </AppLink>,
    );

    const link = screen.getByRole('link', { name: 'iPhone' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/goods/15687497');
    expect(link.getAttribute('class')).toBe('card');
    expect(link.hasAttribute('data-injected')).toBe(false);
  });

  it('renders through the component injected by LinkProvider', () => {
    // Stands in for the router's Link, which the app injects at the
    // composition root. This package must never import a router itself.
    function InjectedLink({ href, children, ...rest }: AppLinkProps) {
      return (
        <a href={href} data-injected="true" {...rest}>
          {children}
        </a>
      );
    }

    render(
      <LinkProvider component={InjectedLink}>
        <AppLink href="/" className="logo">
          momo
        </AppLink>
      </LinkProvider>,
    );

    const link = screen.getByRole('link', { name: 'momo' });
    expect(link.getAttribute('data-injected')).toBe('true');
    expect(link.getAttribute('href')).toBe('/');
    expect(link.getAttribute('class')).toBe('logo');
  });
});
