// Models
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

// The seam: an interface, the mock behind it, and the context that injects it
export type { HomeRepository } from './repository/home-repository';
export {
  createMockHomeRepository,
  type MockHomeOptions,
} from './repository/mock-home-repository';
export {
  HomeRepositoryProvider,
  useHomeRepository,
} from './repository/home-repository-context';

// What UI code uses
export { useHomeLayout } from './hooks/use-home-layout';
export { homeKeys } from './query-keys';
