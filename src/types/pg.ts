export type LocationArea = 'Law Gate' | 'Phagwara' | 'Jalandhar';

export type GenderFilter = 'All' | 'Boys' | 'Girls' | 'Co-living';

export type PropertyType =
  | 'PG Accommodation'
  | 'Hostel'
  | 'Apartment PG'
  | 'PG Room';

export type PropertyTypeFilter = 'All' | PropertyType;

export type SortOption = 'featured' | 'name-asc' | 'name-desc' | 'reviews-desc';

export interface PGListing {
  id: string;
  slug: string;
  name: string;
  area: LocationArea;
  areaLabel: string;
  city: 'Phagwara' | 'Jalandhar';
  address: string;
  propertyType: PropertyType;
  /**
   * Explicitly stated occupancy category derived strictly from the listing title.
   * Undefined when not provided in the source record (UI renders "Contact PG for details").
   */
  genderLabel?: 'Boys' | 'Girls' | 'Co-living (Boys & Girls)';
  supportedGenders: Array<'Boys' | 'Girls' | 'Co-living'>;
  phone?: string;
  ratingCount?: number;
  website?: string;
  bookingForm?: string;
  image: string;
  featured: boolean;
  recentlyAdded: boolean;
  addedOrder: number;
}

export interface LocationHub {
  area: LocationArea;
  displayTitle: string;
  subtitle: string;
  description: string;
  mapQuery: string;
  image: string;
}

export interface PGFilterState {
  query: string;
  location: 'All' | LocationArea;
  city: 'All' | 'Phagwara' | 'Jalandhar';
  gender: GenderFilter;
  propertyType: PropertyTypeFilter;
  sortBy: SortOption;
  savedOnly: boolean;
}

export interface EnquiryFormInput {
  name: string;
  phone: string;
  email: string;
  message: string;
  pgId?: string;
  pgName?: string;
}

export interface EnquiryRecord extends EnquiryFormInput {
  id: string;
  createdAt: string;
}

export interface EnquiryValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
}

export interface TourGuideBookingInput {
  name: string;
  phone: string;
  area: LocationArea;
  preferredDate: string;
  utrNumber: string;
  pgName?: string;
  notes?: string;
}

export interface TourGuideBookingRecord extends TourGuideBookingInput {
  id: string;
  feeInr: number;
  createdAt: string;
}

export interface TourGuideValidationErrors {
  name?: string;
  phone?: string;
  preferredDate?: string;
  utrNumber?: string;
}

