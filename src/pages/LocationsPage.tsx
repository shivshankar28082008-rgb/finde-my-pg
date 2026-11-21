import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Compass, MapPin, Navigation } from 'lucide-react';
import { useFirebaseData } from '../context/FirebaseDataContext';
import { usePreferences } from '../context/PreferencesContext';
import { TOUR_GUIDE_FEE_INR } from '../data/pgListings';
import { buildGoogleMapsUrl } from '../utils/pgFilters';
import { SafeImage } from '../components/SafeImage';

export function LocationsPage() {
  const { getLocationHubs } = useFirebaseData();
  const hubs = getLocationHubs();
  const { openTourModal } = usePreferences();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10 sm:py-12"
    >
      {/* Header */}
      <div className="pb-8 border-b border-[#E2E8F5]">
        <p className="text-xs font-semibold tracking-wide uppercase text-[#1D4ED8]">
          Location Exploration
        </p>
        <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1533]">
          Campus &amp; City Neighbourhoods
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-[#52607D] max-w-2xl leading-relaxed">
          Browse our three core student accommodation hubs—LPU Law Gate,
          Phagwara, and Jalandhar. Launch Google Maps for any zone, inspect real
          listed properties, or book our local team Tour Guide for ₹{TOUR_GUIDE_FEE_INR}.
        </p>
      </div>

      {/* Location Sections */}
      <div className="mt-10 space-y-12">
        {hubs.map((hub, index) => (
          <motion.section
            key={hub.area}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="bg-[#FFFFFF] border border-[#E2E8F5] rounded-2xl overflow-hidden shadow-[0_12px_32px_-16px_rgba(11,21,51,0.12)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-5 relative min-h-[260px]">
                <SafeImage
                  src={hub.image}
                  alt={`Real PG property in ${hub.displayTitle}`}
                  fallbackTitle={hub.displayTitle}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1533]/90 via-[#0B1533]/40 to-transparent p-6">
                  <span className="font-mono text-xs text-[#C7D2FE]">
                    0{index + 1} · {hub.count} Listed Stays
                  </span>
                  <h2 className="font-display text-2xl font-bold text-white mt-1">
                    {hub.displayTitle}
                  </h2>
                </div>
              </div>

              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6D28D9]">
                    {hub.subtitle}
                  </p>
                  <p className="mt-2.5 text-sm sm:text-base text-[#52607D] leading-relaxed">
                    {hub.description}
                  </p>

                  {/* Listings in this area */}
                  <div className="mt-6 pt-5 border-t border-[#EDF1FA]">
                    <h3 className="font-display text-sm font-semibold text-[#0B1533]">
                      PGs in {hub.displayTitle}
                    </h3>
                    <ul className="mt-3 divide-y divide-[#EDF1FA]">
                      {hub.listings.map((pg) => (
                        <li
                          key={pg.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <Link
                              to={`/pg/${pg.slug}`}
                              className="font-display text-sm font-semibold text-[#0B1533] hover:text-[#1D4ED8] transition-colors"
                            >
                              {pg.name}
                            </Link>
                            <p className="text-xs text-[#52607D] flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#1D4ED8]" />
                              <span className="truncate">{pg.address}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Link
                              to={`/pg/${pg.slug}`}
                              className="text-xs font-semibold text-[#1D4ED8] hover:text-[#6D28D9] hover:underline whitespace-nowrap"
                            >
                              View Details
                            </Link>
                            <a
                              href={buildGoogleMapsUrl(pg.address)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-[#52607D] hover:text-[#0B1533] whitespace-nowrap"
                            >
                              Directions
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#EDF1FA] flex flex-wrap items-center gap-3">
                  <Link
                    to={`/explore?location=${encodeURIComponent(hub.area)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Explore {hub.displayTitle} PGs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => openTourModal({ area: hub.area })}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:opacity-95 rounded-lg transition-opacity whitespace-nowrap cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Book {hub.area} Tour Guide · ₹{TOUR_GUIDE_FEE_INR}</span>
                  </button>
                  <a
                    href={buildGoogleMapsUrl(hub.mapQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B1533] bg-[#F5F7FC] hover:bg-[#E9EEFA] border border-[#D4DDF0] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>Open Area on Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
}
