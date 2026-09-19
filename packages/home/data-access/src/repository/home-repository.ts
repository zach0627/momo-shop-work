import type { HomeSection } from '../models/home-section';

/** 首頁版位資料的來源。現在是 fixture，之後可以換成 CMS API。 */
export interface HomeRepository {
  /** 首頁由上到下的區塊。 */
  getLayout(): Promise<HomeSection[]>;
}
