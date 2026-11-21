import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Compass, Heart, Menu, X } from 'lucide-react';
import { BRAND_LOGO_URL, TOUR_GUIDE_FEE_INR } from '../data/pgListings';
import { usePreferences } from '../context/PreferencesContext';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Explore PGs', to: '/explore' },
  { label: 'Locations', to: '/locations' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Admin', to: '/admin' },
];

export function Header() {
  const { savedIds, openDrawer, openTourModal } = usePreferences();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DDE3F0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-[68px] sm:h-[78px] flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Official Brand Logo */}
        <Link
          to="/"
          aria-label="Find My PG Home"
          className="inline-flex items-center shrink-0 whitespace-nowrap focus-visible:rounded-lg"
        >
          <img
            src={BRAND_LOGO_URL}
            alt="Find My PG — Find Your Perfect Stay Near Your Campus"
            className="h-11 sm:h-14 w-auto object-contain"
          />
        </Link>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative text-sm font-semibold whitespace-nowrap shrink-0 py-1 transition-colors ${
                  isActive
                    ? 'text-[#1D4ED8]'
                    : 'text-[#4C5876] hover:text-[#0B1533]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="absolute inset-x-0 -bottom-[2px] h-0.5 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Primary Actions (Saved + Tour Guide ₹99) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open saved stays (${savedIds.length} saved)`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-[#0B1533] bg-[#F5F7FC] hover:bg-[#ECEFF8] border border-[#DDE3F0] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${savedIds.length > 0 ? 'text-[#6D28D9]' : 'text-[#4C5876]'}`}
              fill={savedIds.length > 0 ? 'currentColor' : 'none'}
            />
            <span className="hidden sm:inline">Saved</span>
            <span className="font-mono text-xs tabular-nums text-[#4C5876]">
              ({savedIds.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => openTourModal()}
            aria-label={`Book Tour Guide for ₹${TOUR_GUIDE_FEE_INR}`}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] rounded-lg shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Tour Guide · ₹{TOUR_GUIDE_FEE_INR}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={mobileMenuOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#0B1533] hover:bg-[#F5F7FC] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            aria-label="Mobile navigation"
            className="lg:hidden border-t border-[#DDE3F0] bg-[#FFFFFF] px-5 py-4 shadow-lg"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-3.5 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#EEF3FF] text-[#1D4ED8]'
                          : 'text-[#0B1533] hover:bg-[#F5F7FC]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
