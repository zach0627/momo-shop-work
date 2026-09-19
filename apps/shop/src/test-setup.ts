// app 的 spec 會掛載真的頁面（含輪播），先補上 jsdom 缺的 API
import { installCarouselTestEnvironment } from '@momo/shared-ui/testing';

installCarouselTestEnvironment();
