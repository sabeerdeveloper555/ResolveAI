// Centralized, typed query-key factory.
// All query keys live here so cache lookups and prefix invalidations stay
// consistent as new server-backed resources are added in later phases.

export const queryKeys = {
  // Health is a fixed endpoint with no parameters, so a static tuple is enough.
  health: ['health', 'api'] as const,
};
