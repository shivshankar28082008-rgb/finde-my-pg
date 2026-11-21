import type { LocationArea, PGListing, PropertyType } from '../types/pg';

export const ADMIN_PANEL_ID = '8969288';
export const BOOTSTRAPPED_ADMIN_EMAIL = 'shivshankar28082008@gmail.com';

export type AdminGenderCategory =
  | 'Boys'
  | 'Girls'
  | 'Co-living'
  | 'Not Specified';

export interface AdminPGFormInput {
  name: string;
  area: LocationArea;
  city: 'Phagwara' | 'Jalandhar';
  address: string;
  propertyType: PropertyType;
  genderCategory: AdminGenderCategory;
  phone: string;
  ratingCount: string;
  website: string;
  image: string;
  featured: boolean;
  recentlyAdded: boolean;
}

export interface AdminPGValidationErrors {
  name?: string;
  address?: string;
  image?: string;
  phone?: string;
  website?: string;
  ratingCount?: string;
}

export interface FirestorePGDoc {
  id: string;
  slug: string;
  name: string;
  area: LocationArea;
  city: 'Phagwara' | 'Jalandhar';
  state: string;
  address: string;
  propertyType: PropertyType;
  genderCategory: AdminGenderCategory;
  phone?: string;
  ratingCount?: number;
  website?: string;
  image: string;
  featured: boolean;
  recentlyAdded: boolean;
  addedOrder: number;
  isPublished: boolean;
  createdByUid: string;
}

export function verifyAdminPanelId(input: string): boolean {
  return input.trim() === ADMIN_PANEL_ID;
}

export function slugifyPGName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 110);
  return slug.length >= 2 ? slug : `pg-${Date.now().toString().slice(-6)}`;
}

export function isValidImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length < 8 || trimmed.length > 1000) return false;
  if (trimmed.startsWith('/assets/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateAdminPGForm(
  input: AdminPGFormInput,
): AdminPGValidationErrors {
  const errors: AdminPGValidationErrors = {};
  const name = input.name.trim();
  const address = input.address.trim();
  const image = input.image.trim();
  const phone = input.phone.trim();
  const website = input.website.trim();
  const ratingRaw = input.ratingCount.trim();

  if (name.length < 2 || name.length > 120) {
    errors.name = 'PG name must be between 2 and 120 characters.';
  }

  if (address.length < 5 || address.length > 320) {
    errors.address = 'Full Google Maps address must be between 5 and 320 characters.';
  }

  if (!isValidImageUrl(image)) {
    errors.image =
      'Provide a valid real photo URL starting with https:// (max 1000 characters).';
  }

  if (phone.length > 32) {
    errors.phone = 'Phone number must be 32 characters or fewer.';
  } else if (phone.length > 0 && phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Enter a valid phone number or leave it blank.';
  }

  if (website.length > 300) {
    errors.website = 'Website URL must be 300 characters or fewer.';
  } else if (website.length > 0) {
    try {
      const parsed = new URL(website);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        errors.website = 'Website URL must start with https:// or http://';
      }
    } catch {
      errors.website = 'Enter a valid website URL or leave it blank.';
    }
  }

  if (ratingRaw.length > 0) {
    const num = Number(ratingRaw);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0 || num > 100000) {
      errors.ratingCount = 'Rating count must be a whole number (0–100,000).';
    }
  }

  return errors;
}

export function mapGenderCategoryToListingFields(
  category: AdminGenderCategory,
): Pick<PGListing, 'genderLabel' | 'supportedGenders'> {
  switch (category) {
    case 'Boys':
      return { genderLabel: 'Boys', supportedGenders: ['Boys'] };
    case 'Girls':
      return { genderLabel: 'Girls', supportedGenders: ['Girls'] };
    case 'Co-living':
      return {
        genderLabel: 'Co-living (Boys & Girls)',
        supportedGenders: ['Boys', 'Girls', 'Co-living'],
      };
    case 'Not Specified':
    default:
      return { genderLabel: undefined, supportedGenders: [] };
  }
}

export function mapListingToGenderCategory(pg: PGListing): AdminGenderCategory {
  if (pg.genderLabel === 'Boys') return 'Boys';
  if (pg.genderLabel === 'Girls') return 'Girls';
  if (pg.genderLabel === 'Co-living (Boys & Girls)') return 'Co-living';
  return 'Not Specified';
}

export function formatAreaLabel(area: LocationArea): string {
  if (area === 'Law Gate') return 'Law Gate / LPU Area';
  return area;
}

export function firestoreDocToPGListing(docData: FirestorePGDoc): PGListing {
  const genderFields = mapGenderCategoryToListingFields(docData.genderCategory);
  return {
    id: docData.id,
    slug: docData.slug,
    name: docData.name,
    area: docData.area,
    areaLabel: formatAreaLabel(docData.area),
    city: docData.city,
    address: docData.address,
    propertyType: docData.propertyType,
    genderLabel: genderFields.genderLabel,
    supportedGenders: genderFields.supportedGenders,
    phone: docData.phone || undefined,
    ratingCount:
      typeof docData.ratingCount === 'number' ? docData.ratingCount : undefined,
    website: docData.website || undefined,
    image: docData.image,
    featured: docData.featured,
    recentlyAdded: docData.recentlyAdded,
    addedOrder: docData.addedOrder,
  };
}

export function mergeListingsWithSeed(
  seedListings: PGListing[],
  cloudListings: PGListing[],
): PGListing[] {
  if (cloudListings.length === 0) {
    return seedListings;
  }
  const byId = new Map<string, PGListing>();
  for (const seed of seedListings) {
    byId.set(seed.id, seed);
  }
  for (const cloud of cloudListings) {
    byId.set(cloud.id, cloud);
  }
  return Array.from(byId.values()).sort((a, b) => b.addedOrder - a.addedOrder);
}
