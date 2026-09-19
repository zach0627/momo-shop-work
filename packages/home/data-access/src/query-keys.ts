/** 這個 package 所有的 query key。 */
export const homeKeys = {
  all: ['home'] as const,
  layout: () => ['home', 'layout'] as const,
};
