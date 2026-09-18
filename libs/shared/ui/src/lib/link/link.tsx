import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from 'react';

export interface AppLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  href: string;
  children?: ReactNode;
}

export type LinkComponent = ComponentType<AppLinkProps>;

function PlainAnchor({ href, children, ...rest }: AppLinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

const LinkContext = createContext<LinkComponent>(PlainAnchor);

/**
 * Lets the app decide how links navigate. Libs only ever render `AppLink`;
 * the app injects its router's link once, at the composition root. Without
 * a provider (unit tests, static rendering) links are plain anchors.
 */
export function LinkProvider({
  component,
  children,
}: {
  component: LinkComponent;
  children: ReactNode;
}) {
  return (
    <LinkContext.Provider value={component}>{children}</LinkContext.Provider>
  );
}

export function AppLink(props: AppLinkProps) {
  const Link = useContext(LinkContext);
  return <Link {...props} />;
}
