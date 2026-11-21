import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Mail, MapPin, Phone } from 'lucide-react';
import { BRAND_LOGO_URL, TOUR_GUIDE_FEE_INR } from '../data/pgListings';
import { usePreferences } from '../context/PreferencesContext';
import { useFirebaseData } from '../context/FirebaseDataContext';
import { buildGoogleMapsUrl } from '../utils/pgFilters';

export function Footer() {
  const { openTourModal } = usePreferences();
  const { listings } = useFirebaseData();

  const lawGateCount = listings.filter((p) => p.area === 'Law Gate').length;
  const phagwaraCount = listings.filter((p) => p.area === 'Phagwara').length;
  const jalandharCount = listings.filter((p) => p.area === 'Jalandhar').length;

  return (
    <footer className="bg-[#0B1533] text-[#D7DEF2] mt-20">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column with Official Logo */}
          <div className="md:col-span-4 space-y-4">
            <Link
              to="/"
              className="inline-block bg-white rounded-xl px-3.5 py-2 shadow-sm"
            >
              <img
                src={BRAND_LOGO_URL}
                alt="Find My PG"
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-[#A7B5D6] max-w-sm">
              Find Your Perfect Stay Near Your Campus. Discover real PGs,
              hostels, and residential stays across LPU Law Gate, Phagwara, and
              Jalandhar.
            </p>
            <button
              type="button"
              onClick={() => openTourModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Book Team Tour Guide · ₹{TOUR_GUIDE_FEE_INR}</span>
            </button>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-2 space-y-3">
            <h2 className="font-display text-sm font-semibold text-white">
              Directory
            </h2>
            <ul className="space-y-2.5 text-sm text-[#A7B5D6]">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="hover:text-white transition-colors"
                >
                  Explore All PGs
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="hover:text-white transition-colors"
                >
                  Locations
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="hover:text-white transition-colors font-medium text-[#93C5FD]"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations Column */}
          <div className="md:col-span-3 space-y-3">
            <h2 className="font-display text-sm font-semibold text-white">
              Coverage Areas
            </h2>
            <ul className="space-y-2.5 text-sm text-[#A7B5D6]">
              <li>
                <Link
                  to="/explore?location=Law+Gate"
                  className="hover:text-white transition-colors"
                >
                  LPU Law Gate ({lawGateCount} stays)
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?location=Phagwara"
                  className="hover:text-white transition-colors"
                >
                  Phagwara ({phagwaraCount} stays)
                </Link>
              </li>
              <li>
                <Link
                  to="/explore?location=Jalandhar"
                  className="hover:text-white transition-colors"
                >
                  Jalandhar ({jalandharCount} stays)
                </Link>
              </li>
              <li>
                <a
                  href={buildGoogleMapsUrl('LPU Law Gate Phagwara Punjab 144411')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>View Law Gate on Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social Column */}
          <div className="md:col-span-3 space-y-3">
            <h2 className="font-display text-sm font-semibold text-white">
              Get in Touch
            </h2>
            <ul className="space-y-2.5 text-sm text-[#A7B5D6]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-[#93C5FD] shrink-0" />
                <span>Law Gate, Phagwara &amp; Jalandhar, Punjab</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#93C5FD] shrink-0" />
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Send an enquiry online
                </Link>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#93C5FD] shrink-0" />
                <span>Direct owner numbers on each listing</span>
              </li>
            </ul>
            <div className="pt-2 flex items-center gap-4 text-xs text-[#8A9AC0]">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                X
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8A9AC0]">
          <p>© {new Date().getFullYear()} Find My PG. All rights reserved.</p>
          <p>Serving students across LPU Law Gate, Phagwara, and Jalandhar.</p>
        </div>
      </div>
    </footer>
  );
}
