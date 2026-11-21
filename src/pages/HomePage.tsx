import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Compass,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { TOUR_GUIDE_FEE_INR, TOUR_GUIDE_QR_URL } from '../data/pgListings';
import { useFirebaseData } from '../context/FirebaseDataContext';
import { usePreferences } from '../context/PreferencesContext';
import { buildGoogleMapsUrl, formatPGZoneMeta } from '../utils/pgFilters';
import { Campus3DStage } from '../components/Campus3DStage';
import { PGCard } from '../components/PGCard';
import { SafeImage } from '../components/SafeImage';
import { Tilt3DCard } from '../components/Tilt3DCard';

export function HomePage() {
  const navigate = useNavigate();
  const { recentlyViewedIds, openTourModal } = usePreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const {
    listings,
    getLocationHubs,
    getFeatured,
    getRecentlyAdded,
    getByIds,
  } = useFirebaseData();

  const locationHubs = getLocationHubs();
  const featuredPGs = getFeatured();
  const recentlyAddedPGs = getRecentlyAdded();
  const recentlyViewedPGs = getByIds(recentlyViewedIds);

  const handleHeroSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedLocation !== 'All') {
      params.set('location', selectedLocation);
    }
    const qs = params.toString();
    navigate(qs ? `/explore?${qs}` : '/explore');
  };

  return (
    <div>
      {/* 3D Interactive Hero Section */}
      <section className="relative overflow-hidden border-b border-[#DDE3F0] bg-gradient-to-b from-[#FFFFFF] via-[#F5F7FC] to-[#EEF2FF]">
        {/* Subtle Ambient Background Geometry */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#6D28D9]/8 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#1D4ED8]/8 blur-3xl"
        />

        <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Dominant Column */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-[#6D28D9] tracking-wide">
                  LPU Law Gate · Phagwara · Jalandhar
                </p>

                <h1 className="mt-3.5 font-display text-[clamp(2.25rem,4.1vw,3.55rem)] font-bold leading-[1.07] tracking-tight text-[#0B1533] max-w-xl">
                  Find Your Perfect PG Near Your Campus
                </h1>

                <p className="mt-4 text-base sm:text-lg text-[#4C5876] leading-relaxed max-w-xl">
                  Discover verified PGs, hostels and affordable stays around
                  your favourite locations. Explore our interactive 3D campus
                  map, view 100% real property photos, or book a personal team
                  Tour Guide.
                </p>

                {/* Integrated Search Console */}
                <form
                  onSubmit={handleHeroSearch}
                  aria-label="Search PGs by name or location"
                  className="mt-7 bg-[#FFFFFF] border border-[#D4DCF0] rounded-2xl p-2.5 sm:p-3 shadow-md shadow-[#1D4ED8]/5"
                >
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <div className="flex-1 min-w-0 relative">
                      <label htmlFor="hero-search-input" className="sr-only">
                        Search by PG name or location
                      </label>
                      <Search className="w-4 h-4 text-[#4C5876] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="hero-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search PG name, Simar Enclave, Model Town..."
                        className="w-full pl-10 pr-3 py-3 text-sm bg-[#F5F7FC] rounded-xl border border-transparent focus:bg-white focus:border-[#1D4ED8] text-[#0B1533] placeholder:text-[#6E7A96] transition-colors"
                      />
                    </div>

                    <div className="sm:w-[168px] shrink-0 relative">
                      <label htmlFor="hero-location-select" className="sr-only">
                        Filter by location
                      </label>
                      <MapPin className="w-4 h-4 text-[#1D4ED8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        id="hero-location-select"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full appearance-none pl-9 pr-8 py-3 text-sm font-medium bg-[#F5F7FC] rounded-xl border border-transparent focus:bg-white focus:border-[#1D4ED8] text-[#0B1533] transition-colors cursor-pointer"
                      >
                        <option value="All">All Locations</option>
                        <option value="Law Gate">Law Gate</option>
                        <option value="Phagwara">Phagwara</option>
                        <option value="Jalandhar">Jalandhar</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#4C5876] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="shrink-0">
                      <button
                        type="submit"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] rounded-xl transition-all shadow-sm whitespace-nowrap cursor-pointer"
                      >
                        <span>Explore PGs</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Direct Tour Guide Quick Action */}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => openTourModal()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3EFFF] border border-[#D7CEF7] text-[#6D28D9] font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>
                      Need a PG Tour Guide? Book Our Team · ₹
                      {TOUR_GUIDE_FEE_INR}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quiet Editorial Metrics Strip */}
              <div className="mt-8 pt-6 border-t border-[#DDE3F0] grid grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#0B1533]">
                    {listings.length}
                  </p>
                  <p className="text-xs sm:text-sm text-[#4C5876] mt-0.5">
                    Real PG stays
                  </p>
                </div>
                <div>
                  <p className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#1D4ED8]">
                    03
                  </p>
                  <p className="text-xs sm:text-sm text-[#4C5876] mt-0.5">
                    3D campus &amp; city hubs
                  </p>
                </div>
                <div>
                  <p className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#6D28D9]">
                    ₹{TOUR_GUIDE_FEE_INR}
                  </p>
                  <p className="text-xs sm:text-sm text-[#4C5876] mt-0.5">
                    Guided PG tour team
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Live Interactive Three.js 3D Campus & Stay Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="lg:col-span-6"
            >
              <Campus3DStage />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Locations Section (100% Real PG Photographs + 3D Tilt) */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#6D28D9]">
              Explore by Neighbourhood
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1533]">
              Popular Locations
            </h2>
          </div>
          <Link
            to="/locations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:text-[#1539A8] transition-colors whitespace-nowrap"
          >
            <span>Explore all locations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {locationHubs.map((hub, index) => (
            <motion.div
              key={hub.area}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Tilt3DCard maxTilt={5}>
                <article className="group h-full bg-[#FFFFFF] border border-[#DDE3F0] rounded-xl overflow-hidden flex flex-col shadow-xs hover:shadow-xl hover:border-[#B6C4E8] transition-all duration-300">
                  <Link
                    to={`/explore?location=${encodeURIComponent(hub.area)}`}
                    className="relative aspect-[4/3] overflow-hidden block"
                  >
                    <SafeImage
                      src={hub.image}
                      alt={`Real PG property in ${hub.displayTitle}`}
                      fallbackTitle={hub.displayTitle}
                      className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1533]/92 via-[#0B1533]/55 to-transparent pt-14 p-5">
                      <p className="text-xs text-[#93C5FD] font-mono tabular-nums font-medium">
                        {hub.count} PG {hub.count === 1 ? 'stay' : 'stays'}
                      </p>
                      <h3 className="font-display text-xl font-bold text-white mt-0.5">
                        {hub.displayTitle}
                      </h3>
                    </div>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-xs font-semibold text-[#4C5876]">
                      {hub.subtitle}
                    </p>
                    <p className="mt-2 text-sm text-[#4C5876] leading-relaxed flex-1">
                      {hub.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[#ECEFF8] flex items-center justify-between gap-3">
                      <Link
                        to={`/explore?location=${encodeURIComponent(hub.area)}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:text-[#1539A8] transition-colors"
                      >
                        <span>View {hub.area} PGs</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <a
                        href={buildGoogleMapsUrl(hub.mapQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#4C5876] hover:text-[#0B1533] transition-colors"
                      >
                        <span>Map</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              </Tilt3DCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured PG Listings */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#6D28D9]">
              100% Real Photographs &amp; Verified Addresses
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1533]">
              Featured PG Listings
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:text-[#1539A8] transition-colors whitespace-nowrap"
          >
            <span>Browse all {listings.length} listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPGs.map((pg, idx) => (
            <motion.div
              key={pg.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: (idx % 3) * 0.06 }}
            >
              <PGCard pg={pg} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dedicated Tour Guide Service Banner (₹99 UPI QR) */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl bg-[#0B1533] text-white p-7 sm:p-10 lg:p-12 shadow-2xl"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#6D28D9]/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#1D4ED8]/35 blur-3xl"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs font-semibold text-[#93C5FD] tracking-wide">
                On-Ground Student Assistance · Law Gate, Phagwara &amp; Jalandhar
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                Need a Personal PG Tour Guide? Our Team Will Show You Around for
                ₹{TOUR_GUIDE_FEE_INR}.
              </h2>
              <p className="text-sm sm:text-base text-[#CBD5F5] leading-relaxed max-w-2xl">
                New to LPU Law Gate, Phagwara, or Jalandhar? Book a dedicated
                Find My PG team member to accompany you to shortlisted PGs,
                inspect rooms in person, and negotiate directly with owners.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#E2E8F0]">
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-[#93C5FD] shrink-0 mt-0.5" />
                  <span>Local Find My PG team guide accompanies your visit</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-[#93C5FD] shrink-0 mt-0.5" />
                  <span>Covers Law Gate, Phagwara &amp; Jalandhar stays</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#93C5FD] shrink-0 mt-0.5" />
                  <span>Flat ₹{TOUR_GUIDE_FEE_INR} UPI QR payment</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => openTourModal()}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white text-sm font-bold shadow-lg transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Open ₹{TOUR_GUIDE_FEE_INR} QR &amp; Book Tour Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive 3D QR Preview Card */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <Tilt3DCard maxTilt={8} className="w-full max-w-[260px]">
                <button
                  type="button"
                  onClick={() => openTourModal()}
                  aria-label="Open ₹99 Tour Guide UPI QR Code"
                  className="w-full text-left bg-[#162044] hover:bg-[#1C2854] border border-white/15 rounded-2xl p-4 shadow-xl transition-colors cursor-pointer"
                >
                  <div className="rounded-xl overflow-hidden bg-[#191C1E] p-2">
                    <img
                      src={TOUR_GUIDE_QR_URL}
                      alt="Preview of ₹99 Find My PG Tour Guide UPI QR Code"
                      className="w-full aspect-square object-contain rounded-lg"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">
                      Tour Guide Fee
                    </span>
                    <span className="font-mono font-bold text-[#93C5FD]">
                      ₹{TOUR_GUIDE_FEE_INR} UPI
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7B5D6] mt-1">
                    Click to open full QR &amp; schedule your visit
                  </p>
                </button>
              </Tilt3DCard>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Recently Added PGs */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#6D28D9]">
              Latest Directory Entries
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1533]">
              Recently Added PGs
            </h2>
          </div>
          <Link
            to="/explore?sort=name-asc"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:text-[#1539A8] transition-colors whitespace-nowrap"
          >
            <span>Sort full directory A–Z</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentlyAddedPGs.map((pg, idx) => (
            <motion.div
              key={pg.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: (idx % 2) * 0.07 }}
            >
              <PGCard pg={pg} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recently Viewed Strip (shown after user views any PG) */}
      {recentlyViewedPGs.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20">
          <div className="bg-[#FFFFFF] border border-[#DDE3F0] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-[#1D4ED8]" />
                <h2 className="font-display text-xl font-bold text-[#0B1533]">
                  Recently Viewed Properties
                </h2>
              </div>
              <Link
                to="/explore"
                className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1539A8]"
              >
                Explore more
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyViewedPGs.slice(0, 3).map((pg) => (
                <Link
                  key={pg.id}
                  to={`/pg/${pg.slug}`}
                  className="flex items-center gap-3.5 p-3 rounded-xl border border-[#ECEFF8] hover:border-[#B6C4E8] bg-[#F5F7FC] transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <SafeImage
                      src={pg.image}
                      alt={pg.name}
                      fallbackTitle={pg.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#1D4ED8] font-semibold">
                      {formatPGZoneMeta(pg)}
                    </p>
                    <p className="font-display text-sm font-bold text-[#0B1533] truncate mt-0.5">
                      {pg.name}
                    </p>
                    <p className="text-xs text-[#4C5876] truncate mt-0.5">
                      {pg.phone ?? 'Contact PG for details'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20">
        <div className="border-t border-[#DDE3F0] pt-14">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-[#6D28D9]">
              Straightforward Student Housing Discovery
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1533]">
              How Find My PG Works
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-t border-[#0B1533]/15 pt-5">
              <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
                01
              </span>
              <h3 className="mt-2 font-display text-lg font-bold text-[#0B1533]">
                Explore in 3D &amp; Filter Stays
              </h3>
              <p className="mt-2 text-sm text-[#4C5876] leading-relaxed">
                Inspect Law Gate, Phagwara, and Jalandhar on our interactive 3D
                campus map and filter all {listings.length} real stays by name, city, gender,
                or property type.
              </p>
            </div>

            <div className="border-t border-[#0B1533]/15 pt-5">
              <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
                02
              </span>
              <h3 className="mt-2 font-display text-lg font-bold text-[#0B1533]">
                Review Real Photos &amp; Details
              </h3>
              <p className="mt-2 text-sm text-[#4C5876] leading-relaxed">
                Every listing shows authentic property photos, exact street
                addresses, Google rating counts, and official property websites
                with zero invented numbers.
              </p>
            </div>

            <div className="border-t border-[#0B1533]/15 pt-5">
              <span className="font-mono text-xs font-semibold text-[#6D28D9]">
                03
              </span>
              <h3 className="mt-2 font-display text-lg font-bold text-[#0B1533]">
                Visit Directly or Book a ₹{TOUR_GUIDE_FEE_INR} Tour Guide
              </h3>
              <p className="mt-2 text-sm text-[#4C5876] leading-relaxed">
                Call or WhatsApp the PG owner directly, open Google Maps
                directions, or book our Find My PG team Tour Guide for ₹
                {TOUR_GUIDE_FEE_INR} to tour rooms in person.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
