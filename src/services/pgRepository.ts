import { LOCATION_HUBS, PG_LISTINGS } from '../data/pgListings';
import type { LocationArea, LocationHub, PGListing } from '../types/pg';

/**
 * Modular data repository abstraction.
 * Currently backed by local structured records in src/data/pgListings.ts
 * and shaped for a direct swap to Firebase Firestore collection queries.
 */
export const pgRepository = {
  getAllSync(): PGListing[] {
    return PG_LISTINGS;
  },

  async fetchAll(): Promise<PGListing[]> {
    return Promise.resolve(PG_LISTINGS);
  },

  getBySlug(slug: string): PGListing | undefined {
    return PG_LISTINGS.find((pg) => pg.slug === slug);
  },

  getByIds(ids: string[]): PGListing[] {
    const byId = new Map(PG_LISTINGS.map((pg) => [pg.id, pg]));
    return ids
      .map((id) => byId.get(id))
      .filter((item): item is PGListing => Boolean(item));
  },

  getFeatured(): PGListing[] {
    return PG_LISTINGS.filter((pg) => pg.featured);
  },

  getRecentlyAdded(): PGListing[] {
    return [...PG_LISTINGS]
      .filter((pg) => pg.recentlyAdded)
      .sort((a, b) => b.addedOrder - a.addedOrder);
  },

  getRelatedByArea(current: PGListing, limit = 3): PGListing[] {
    const sameArea = PG_LISTINGS.filter(
      (pg) => pg.id !== current.id && pg.area === current.area,
    );
    if (sameArea.length >= limit) {
      return sameArea.slice(0, limit);
    }
    const others = PG_LISTINGS.filter(
      (pg) => pg.id !== current.id && pg.area !== current.area,
    );
    return [...sameArea, ...others].slice(0, limit);
  },

  getLocationHubs(): Array<LocationHub & { count: number; listings: PGListing[] }> {
    return LOCATION_HUBS.map((hub) => {
      const listings = PG_LISTINGS.filter((pg) => pg.area === hub.area);
      return {
        ...hub,
        count: listings.length,
        listings,
      };
    });
  },

  getCountByArea(area: LocationArea): number {
    return PG_LISTINGS.filter((pg) => pg.area === area).length;
  },
};
