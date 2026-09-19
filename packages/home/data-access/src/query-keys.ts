/** Every cache key of this package, in one place so they cannot collide. */
export const homeKeys = {
  all: ['home'] as const,
  layout: () => ['home', 'layout'] as const,
};
