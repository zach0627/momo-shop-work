import { useParams } from 'react-router';

import { GoodsDetailPage } from '@momo/goods-page';

// Reading the URL happens here, in the app. The page package receives a prop.
export function Component() {
  const { goodsId = '' } = useParams<{ goodsId: string }>();
  return <GoodsDetailPage goodsId={goodsId} />;
}
