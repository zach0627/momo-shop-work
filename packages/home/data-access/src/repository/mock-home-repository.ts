import { HOME_LAYOUT } from '../fixtures/home-layout';
import type { HomeSection } from '../models/home-section';
import type { HomeRepository } from './home-repository';

export interface MockHomeOptions {
  /** 預設為真的首頁；測試可傳入自己的幾個區塊。 */
  layout?: HomeSection[];
  /** 模擬網路延遲（ms）。 */
  latencyMs?: number;
}

export function createMockHomeRepository({
  layout = HOME_LAYOUT,
  latencyMs = 0,
}: MockHomeOptions = {}): HomeRepository {
  return {
    getLayout: () =>
      new Promise((resolve) => setTimeout(() => resolve(layout), latencyMs)),
  };
}
