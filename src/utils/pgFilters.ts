import type {
  EnquiryFormInput,
  EnquiryValidationErrors,
  PGFilterState,
  PGListing,
  TourGuideBookingInput,
  TourGuideValidationErrors,
} from '../types/pg';

export const DEFAULT_FILTERS: PGFilterState = {
  query: '',
  location: 'All',
  city: 'All',
  gender: 'All',
  propertyType: 'All',
  sortBy: 'featured',
  savedOnly: false,
};

export function filterAndSortPGs(
  listings: PGListing[],
  filters: PGFilterState,
  savedIds: string[] = [],
): PGListing[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const savedSet = new Set(savedIds);

  const filtered = listings.filter((pg) => {
    if (filters.savedOnly && !savedSet.has(pg.id)) {
      return false;
    }

    if (filters.location !== 'All' && pg.area !== filters.location) {
      return false;
    }

    if (filters.city !== 'All' && pg.city !== filters.city) {
      return false;
    }

    if (
      filters.gender !== 'All' &&
      !pg.supportedGenders.includes(filters.gender)
    ) {
      return false;
    }

    if (
      filters.propertyType !== 'All' &&
      pg.propertyType !== filters.propertyType
    ) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const haystack = [
        pg.name,
        pg.address,
        pg.area,
        pg.areaLabel,
        pg.city,
        pg.propertyType,
        pg.genderLabel ?? '',
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });

  const sorted = [...filtered];
  switch (filters.sortBy) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'reviews-desc':
      sorted.sort((a, b) => (b.ratingCount ?? -1) - (a.ratingCount ?? -1));
      break;
    case 'featured':
    default:
      sorted.sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }
        return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
      });
      break;
  }

  return sorted;
}

export function buildGoogleMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address.trim(),
  )}`;
}

export function normalizeIndianPhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `91${digitsOnly.slice(1)}`;
  }
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  return digitsOnly;
}

export function buildTelUrl(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

export function buildWhatsAppUrl(phone: string, pgName: string): string {
  const normalized = normalizeIndianPhone(phone);
  const text = encodeURIComponent(
    `Hello, I found ${pgName} on Find My PG. Could you please share room details and availability?`,
  );
  return `https://wa.me/${normalized}?text=${text}`;
}

export function formatPGZoneMeta(
  pg: Pick<PGListing, 'area' | 'city'>,
): string {
  return pg.area === pg.city ? `${pg.area} · Punjab` : `${pg.area} · ${pg.city}`;
}

export function hasActiveFilters(filters: PGFilterState): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.location !== 'All' ||
    filters.city !== 'All' ||
    filters.gender !== 'All' ||
    filters.propertyType !== 'All' ||
    filters.sortBy !== 'featured' ||
    filters.savedOnly
  );
}

export function parseStoredIds(raw: string | null): string[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function toggleIdInList(list: string[], id: string): string[] {
  if (list.includes(id)) {
    return list.filter((item) => item !== id);
  }
  return [id, ...list];
}

export function pushRecentId(
  current: string[],
  id: string,
  maxItems = 6,
): string[] {
  const withoutCurrent = current.filter((item) => item !== id);
  return [id, ...withoutCurrent].slice(0, maxItems);
}

export function validateEnquiryForm(
  input: EnquiryFormInput,
): EnquiryValidationErrors {
  const errors: EnquiryValidationErrors = {};
  const trimmedName = input.name.trim();
  const trimmedPhone = input.phone.trim();
  const trimmedEmail = input.email.trim();
  const trimmedMessage = input.message.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  const phoneDigits = trimmedPhone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 13) {
    errors.phone = 'Enter a valid 10-digit phone number.';
  }

  if (
    trimmedEmail.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
  ) {
    errors.email = 'Enter a valid email address or leave it blank.';
  }

  if (trimmedMessage.length < 10) {
    errors.message = 'Please write a short message (at least 10 characters).';
  }

  return errors;
}

export function validateTourGuideForm(
  input: TourGuideBookingInput,
): TourGuideValidationErrors {
  const errors: TourGuideValidationErrors = {};

  if (input.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }

  const digits = input.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    errors.phone = 'Enter a valid 10-digit WhatsApp / mobile number.';
  }

  if (!input.preferredDate.trim()) {
    errors.preferredDate = 'Select your preferred visit date.';
  }

  if (input.utrNumber.trim().length < 6) {
    errors.utrNumber =
      'After scanning the ₹99 QR code, enter the UPI Transaction / UTR ID (min 6 characters).';
  }

  return errors;
}

