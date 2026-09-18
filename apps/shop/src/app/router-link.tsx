import { Link } from 'react-router';

import type { AppLinkProps } from '@momo/shared-ui';

/** Adapts the router's Link to the link contract the packages render through. */
export function RouterLink({ href, ...rest }: AppLinkProps) {
  return <Link to={href} {...rest} />;
}
