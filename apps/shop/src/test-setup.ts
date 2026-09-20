// app 的 spec 會掛載真的頁面（含輪播），先補上 jsdom 缺的 API
import { configure } from '@testing-library/dom';

import { installCarouselTestEnvironment } from '@momo/shared-ui/testing';

installCarouselTestEnvironment();

// 這裡的 spec 是整合測試：真的路由（頁面是延遲載入的）+ repository 的 150ms 模擬延遲。
// findBy 預設只等 1 秒，機器忙的時候不夠（實測點進詳情頁要 1.2 秒），會變成與程式無關的紅燈。
configure({ asyncUtilTimeout: 5000 });
