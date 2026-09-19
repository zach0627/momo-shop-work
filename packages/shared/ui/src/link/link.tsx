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

/** 讓 app 決定連結怎麼導頁：packages 一律用 AppLink，app 注入 router 的 Link；沒有 provider 時是一般的 <a>。 */
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
