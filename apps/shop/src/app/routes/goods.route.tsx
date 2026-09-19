import { useParams } from 'react-router';

import { GoodsDetailPage } from '@momo/goods-page';

// 讀網址是 app 的事，頁面只收 props
export function Component() {
  const { goodsId = '' } = useParams<{ goodsId: string }>();
  return <GoodsDetailPage goodsId={goodsId} />;
}
