// Runs before every spec of the app (vite.config.mts: test.setupFiles).
// The app's specs mount real pages, and the home page mounts carousels.
import { installCarouselTestEnvironment } from '@momo/shared-ui/testing';

installCarouselTestEnvironment();
