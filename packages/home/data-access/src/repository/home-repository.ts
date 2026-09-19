import type { HomeSection } from '../models/home-section';

/**
 * The seam between the home page and wherever its layout comes from. Today
 * that is a fixture; a CMS API would be another implementation of this.
 */
export interface HomeRepository {
  /** The sections of the home page, top to bottom. */
  getLayout(): Promise<HomeSection[]>;
}
