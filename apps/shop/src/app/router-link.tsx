import { Link } from 'react-router';

import type { AppLinkProps } from '@momo/shared-ui';

/** 把 router 的 Link 轉成各 package 使用的 AppLink 介面。 */
export function RouterLink({ href, ...rest }: AppLinkProps) {
  return <Link to={href} {...rest} />;
}
