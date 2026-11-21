import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Compass } from 'lucide-react';
import {
  BRAND_LOGO_URL,
  PG_LISTINGS,
  TOUR_GUIDE_FEE_INR,
} from '../data/pgListings';
import { usePreferences } from '../context/PreferencesContext';
import { SafeImage } from '../components/SafeImage';
import { Tilt3DCard } from '../components/Tilt3DCard';

export function AboutPage() {
  const { openTourModal } = usePreferences();
  const showcaseStays = [PG_LISTINGS[1], PG_LISTINGS[2], PG_LISTINGS[4], PG_LISTINGS[9]];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10 sm:py-14"
    >
      {/* Intro Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pb-14 border-b border-[#DDE3F0]">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-block bg-white border border-[#DDE3F0] rounded-xl px-4 py-2.5 shadow-xs">
            <img
              src={BRAND_LOGO_URL}
              alt="Find My PG official logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#6D28D9]">
              About Find My PG
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-[#0B1533]">
              Honest PG discovery built for students moving near campus.
            </h1>
            <p className="mt-5 text-base text-[#4C5876] leading-relaxed">
              Finding a reliable paying guest accommodation or hostel around LPU
              Law Gate, Phagwara, and Jalandhar shouldn&apos;t mean relying on
              fake stock photos or fabricated rent promises.
            </p>
            <p className="mt-4 text-base text-[#4C5876] leading-relaxed">
              Find My PG showcases real property photographs, complete street
              addresses, Google Maps directions, direct owner numbers, and an
              optional ₹{TOUR_GUIDE_FEE_INR} on-ground Tour Guide provided by
              our local team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] rounded-xl transition-all shadow-sm"
            >
              <span>Explore All PGs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => openTourModal()}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#6D28D9] bg-[#F3EFFF] hover:bg-[#E7DDFD] rounded-xl transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Book Tour Guide · ₹{TOUR_GUIDE_FEE_INR}</span>
            </button>
          </div>
        </div>

        {/* Real PG Photographs 3D Mosaic */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {showcaseStays.map((pg) => (
            <Tilt3DCard key={pg.id} maxTilt={6}>
              <Link
                to={`/pg/${pg.slug}`}
                className="group relative block aspect-[4/3] rounded-2xl overflow-hidden border border-[#DDE3F0] shadow-sm"
              >
                <SafeImage
                  src={pg.image}
                  alt={pg.name}
                  fallbackTitle={pg.name}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1533]/90 via-[#0B1533]/40 to-transparent p-3.5">
                  <p className="text-[11px] font-mono text-[#93C5FD]">
                    {pg.area}
                  </p>
                  <p className="font-display text-sm font-bold text-white truncate">
                    {pg.name}
                  </p>
                </div>
              </Link>
            </Tilt3DCard>
          ))}
        </div>
      </div>

      {/* Editorial Principles */}
      <section className="pt-14">
        <p className="text-xs font-semibold text-[#6D28D9]">Our Standards</p>
        <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-[#0B1533]">
          Why Students Trust Find My PG
        </h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-t border-[#0B1533]/15 pt-5">
            <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
              01
            </span>
            <h3 className="mt-2 font-display text-lg font-bold text-[#0B1533]">
              Real Photos &amp; Zero Fabricated Pricing
            </h3>
            <p className="mt-2 text-sm text-[#4C5876] leading-relaxed">
              Every listing uses authentic photographs. Where rent, facilities,
              or phone details are not published online, we display
              &ldquo;Contact PG for details&rdquo; truthfully.
            </p>
          </div>

          <div className="border-t border-[#0B1533]/15 pt-5">
            <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
              02
            </span>
            <h3 className="mt-2 font-display text-lg font-bold text-[#0B1533]">
              Exact Google Maps Navigation
            </h3>
            <p className="mt-2 text-sm text-[#4C5876] leading-relaxed">
              Every property opens directly in Google Maps using its complete
              registered street address across Law Gate, Phagwara, and
              Jalandhar.
            </p>
          </div>

          <div className="border-t border-[#0B1533]/15 pt-5">
            <span className="font-mono text-xs font-semibold text-[#6D28D9]">
              03
            </span>
            <h3 className="mt-2 font-display text-lg font-bold text-[#0B1533]">
              Optional ₹{TOUR_GUIDE_FEE_INR} Team Tour Guide
            </h3>
            <p className="mt-2 text-sm text-[#4C5876] leading-relaxed">
              Want personal help touring multiple PGs in one visit? Our Find My
              PG team provides an on-ground Tour Guide for a flat ₹
              {TOUR_GUIDE_FEE_INR} charge.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
