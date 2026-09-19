import { HOME_LAYOUT } from '../fixtures/home-layout';
import type { HomeSection } from '../models/home-section';
import type { HomeRepository } from './home-repository';

export interface MockHomeOptions {
  /** Defaults to the real home page. Tests pass a few sections of their own. */
  layout?: HomeSection[];
  /** Simulated network delay, so the loading state is visible in the app. */
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
