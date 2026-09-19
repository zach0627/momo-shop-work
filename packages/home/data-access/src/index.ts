// 型別
export type {
  Banner,
  BannerCarouselSection,
  BannerGridSection,
  FlashSaleSection,
  HeroSection,
  HomeSection,
  HomeSectionType,
  NoticeSection,
  ProductRailSection,
  RankingSection,
  RecommendationSection,
  SectionTitle,
  Shortcut,
  ShortcutBarSection,
} from './models/home-section';

// Repository：介面、mock、注入用的 Context
export type { HomeRepository } from './repository/home-repository';
export {
  createMockHomeRepository,
  type MockHomeOptions,
} from './repository/mock-home-repository';
export {
  HomeRepositoryProvider,
  useHomeRepository,
} from './repository/home-repository-context';

// 給 UI 用的 hook
export { useHomeLayout } from './hooks/use-home-layout';
export { homeKeys } from './query-keys';
