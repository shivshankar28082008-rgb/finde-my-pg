import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFirebaseData } from '../context/FirebaseDataContext';
import { usePreferences } from '../context/PreferencesContext';
import type {
  GenderFilter,
  LocationArea,
  PGFilterState,
  PropertyTypeFilter,
  SortOption,
} from '../types/pg';
import {
  DEFAULT_FILTERS,
  filterAndSortPGs,
  hasActiveFilters,
} from '../utils/pgFilters';
import { PGCard } from '../components/PGCard';
import { PGCardSkeleton } from '../components/PGCardSkeleton';

const LOCATION_OPTIONS: Array<'All' | LocationArea> = [
  'All',
  'Law Gate',
  'Phagwara',
  'Jalandhar',
];

const GENDER_OPTIONS: GenderFilter[] = ['All', 'Boys', 'Girls', 'Co-living'];

const PROPERTY_TYPE_OPTIONS: PropertyTypeFilter[] = [
  'All',
  'PG Accommodation',
  'Hostel',
  'Apartment PG',
  'PG Room',
];

function parseFiltersFromParams(params: URLSearchParams): PGFilterState {
  const loc = params.get('location');
  const location: 'All' | LocationArea =
    loc === 'Law Gate' || loc === 'Phagwara' || loc === 'Jalandhar'
      ? loc
      : 'All';

  const cityParam = params.get('city');
  const city: 'All' | 'Phagwara' | 'Jalandhar' =
    cityParam === 'Phagwara' || cityParam === 'Jalandhar' ? cityParam : 'All';

  const genderParam = params.get('gender');
  const gender: GenderFilter =
    genderParam === 'Boys' ||
    genderParam === 'Girls' ||
    genderParam === 'Co-living'
      ? genderParam
      : 'All';

  const typeParam = params.get('type');
  const propertyType: PropertyTypeFilter =
    typeParam === 'PG Accommodation' ||
    typeParam === 'Hostel' ||
    typeParam === 'Apartment PG' ||
    typeParam === 'PG Room'
      ? typeParam
      : 'All';

  const sortParam = params.get('sort');
  const sortBy: SortOption =
    sortParam === 'name-asc' ||
    sortParam === 'name-desc' ||
    sortParam === 'reviews-desc'
      ? sortParam
      : 'featured';

  return {
    query: params.get('q') ?? '',
    location,
    city,
    gender,
    propertyType,
    sortBy,
    savedOnly: params.get('saved') === '1',
  };
}

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { savedIds } = usePreferences();
  const [filters, setFilters] = useState<PGFilterState>(() =>
    parseFiltersFromParams(searchParams),
  );
  const [isLoading, setIsLoading] = useState(true);

  const { listings: allListings } = useFirebaseData();

  // Brief realistic loading transition when arriving on Explore
  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 140);
    return () => window.clearTimeout(timer);
  }, []);

  // Keep state synced when external links update URL params (e.g. from Drawer or Header)
  useEffect(() => {
    setFilters(parseFiltersFromParams(searchParams));
  }, [searchParams]);

  const updateFilters = (patch: Partial<PGFilterState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);

    const params = new URLSearchParams();
    if (next.query.trim()) params.set('q', next.query.trim());
    if (next.location !== 'All') params.set('location', next.location);
    if (next.city !== 'All') params.set('city', next.city);
    if (next.gender !== 'All') params.set('gender', next.gender);
    if (next.propertyType !== 'All') params.set('type', next.propertyType);
    if (next.sortBy !== 'featured') params.set('sort', next.sortBy);
    if (next.savedOnly) params.set('saved', '1');
    setSearchParams(params, { replace: true });
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({}, { replace: true });
  };

  const filteredListings = useMemo(
    () => filterAndSortPGs(allListings, filters, savedIds),
    [allListings, filters, savedIds],
  );

  const filtersAreActive = hasActiveFilters(filters);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10 sm:py-12"
    >
      {/* Page Header */}
      <div className="pb-8 border-b border-[#E2E8F5]">
        <p className="text-xs font-semibold tracking-wide uppercase text-[#1D4ED8]">
          PG &amp; Hostel Directory
        </p>
        <div className="mt-1.5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1533]">
              Explore Verified PGs
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#52607D] max-w-2xl">
              Search by property name or street address, filter by location,
              city, occupancy category, or property type, and compare stays
              across Law Gate, Phagwara, and Jalandhar.
            </p>
          </div>
          <p
            data-testid="results-count"
            className="font-mono text-sm tabular-nums text-[#0B1533] shrink-0"
          >
            Showing <span className="font-semibold text-[#1D4ED8]">{filteredListings.length}</span>{' '}
            of {allListings.length} stays
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <section
        aria-label="Filter and sort PG listings"
        className="mt-6 bg-[#FFFFFF] border border-[#E2E8F5] rounded-2xl p-4 sm:p-5 space-y-4 shadow-[0_8px_28px_-14px_rgba(11,21,51,0.12)]"
      >
        {/* Row 1: Search Input + Location Segmented Control */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <label htmlFor="explore-search-input" className="sr-only">
              Search PG by name or location
            </label>
            <Search className="w-4 h-4 text-[#52607D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="explore-search-input"
              type="text"
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              placeholder="Search PG name, Simar Enclave, Model Town, Phagwara..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] placeholder:text-[#6B7A99] focus:bg-white focus:border-[#1D4ED8] transition-colors"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => updateFilters({ query: '' })}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#52607D] hover:text-[#0B1533] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location Area Segmented Control */}
          <div
            role="group"
            aria-label="Filter by location area"
            className="flex items-center gap-1 p-1 bg-[#EDF1FA] rounded-lg overflow-x-auto"
          >
            {LOCATION_OPTIONS.map((loc) => {
              const active = filters.location === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => updateFilters({ location: loc })}
                  aria-pressed={active}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#FFFFFF] text-[#1D4ED8] shadow-xs'
                      : 'text-[#52607D] hover:text-[#0B1533]'
                  }`}
                >
                  {loc === 'All' ? 'All Areas' : loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: City, Gender, Property Type, Sort, Saved Toggle & Reset */}
        <div className="pt-3 border-t border-[#EDF1FA] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* City Select */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-city"
              className="block text-xs font-medium text-[#52607D] mb-1"
            >
              City
            </label>
            <div className="relative">
              <select
                id="filter-city"
                value={filters.city}
                onChange={(e) =>
                  updateFilters({
                    city: e.target.value as PGFilterState['city'],
                  })
                }
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
              >
                <option value="All">All Cities</option>
                <option value="Phagwara">Phagwara</option>
                <option value="Jalandhar">Jalandhar</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#52607D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Gender Select */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-gender"
              className="block text-xs font-medium text-[#52607D] mb-1"
            >
              Gender
            </label>
            <div className="relative">
              <select
                id="filter-gender"
                value={filters.gender}
                onChange={(e) =>
                  updateFilters({ gender: e.target.value as GenderFilter })
                }
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All' ? 'All Categories' : option}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#52607D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Property Type Select */}
          <div className="lg:col-span-3">
            <label
              htmlFor="filter-property-type"
              className="block text-xs font-medium text-[#52607D] mb-1"
            >
              Property Type
            </label>
            <div className="relative">
              <select
                id="filter-property-type"
                value={filters.propertyType}
                onChange={(e) =>
                  updateFilters({
                    propertyType: e.target.value as PropertyTypeFilter,
                  })
                }
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
              >
                {PROPERTY_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Property Types' : type}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#52607D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sort Select */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-sort"
              className="block text-xs font-medium text-[#52607D] mb-1"
            >
              Sort By
            </label>
            <div className="relative">
              <select
                id="filter-sort"
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilters({ sortBy: e.target.value as SortOption })
                }
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="reviews-desc">Most Reviewed</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#52607D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Saved Only + Reset */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateFilters({ savedOnly: !filters.savedOnly })}
              aria-pressed={filters.savedOnly}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                filters.savedOnly
                  ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                  : 'bg-[#F5F7FC] text-[#0B1533] border-[#D4DDF0] hover:bg-[#EDF1FA]'
              }`}
            >
              <Heart
                className="w-3.5 h-3.5"
                fill={filters.savedOnly ? 'currentColor' : 'none'}
              />
              <span>Saved ({savedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={resetAllFilters}
              disabled={!filtersAreActive}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0B1533] bg-[#FFFFFF] border border-[#D4DDF0] hover:bg-[#F5F7FC] disabled:opacity-45 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* Subtle Disclosure Note for Gender Filter */}
      {filters.gender !== 'All' && (
        <p className="mt-4 text-xs text-[#52607D]">
          Showing properties whose official listing explicitly specifies{' '}
          <span className="font-semibold text-[#0B1533]">{filters.gender}</span>{' '}
          accommodation. Other stays do not publish gender restrictions
          online—contact those PGs directly to confirm.
        </p>
      )}

      {/* Results Grid */}
      <section aria-label="PG search results" className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <PGCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div
            data-testid="empty-search-state"
            className="bg-[#FFFFFF] border border-[#E2E8F5] rounded-2xl px-6 py-16 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#1D4ED8] flex items-center justify-center mx-auto">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-[#0B1533]">
              No matching PGs found
            </h2>
            <p className="mt-2 text-sm text-[#52607D] max-w-md mx-auto leading-relaxed">
              We could not find any stays matching your current search or filter
              combination. Reset your filters to browse all {allListings.length}{' '}
              listed properties across Law Gate, Phagwara, and Jalandhar.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div
            data-testid="pg-results-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredListings.map((pg) => (
              <PGCard key={pg.id} pg={pg} />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
