import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  Check,
  ClipboardList,
  Compass,
  Copy,
  ExternalLink,
  Globe,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  Star,
  X,
} from 'lucide-react';
import { TOUR_GUIDE_FEE_INR } from '../data/pgListings';
import { useFirebaseData } from '../context/FirebaseDataContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  buildGoogleMapsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
} from '../utils/pgFilters';
import { SafeImage } from '../components/SafeImage';
import { EnquiryForm } from '../components/EnquiryForm';
import { PGCard } from '../components/PGCard';
import { Tilt3DCard } from '../components/Tilt3DCard';

export function PGDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug, getRelatedByArea } = useFirebaseData();
  const pg = slug ? getBySlug(slug) : undefined;
  const { isSaved, toggleSaved, recordView, openTourModal } = usePreferences();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<'idle' | 'copied'>('idle');
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    setLightboxOpen(false);
    if (pg) {
      recordView(pg.id);
    }
  }, [pg, recordView]);

  if (!pg) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-[#0B1533]">
          Property Not Found
        </h1>
        <p className="mt-3 text-sm text-[#4C5876]">
          The PG listing you are looking for is not in our current directory.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore PGs</span>
        </Link>
      </div>
    );
  }

  const saved = isSaved(pg.id);
  const mapsUrl = buildGoogleMapsUrl(pg.address);
  const relatedPGs = getRelatedByArea(pg, 3);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${pg.name} — Find My PG`,
      text: `Check out ${pg.name} in ${pg.areaLabel}, ${pg.city}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // Fall back to clipboard copy
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback('copied');
      window.setTimeout(() => setShareFeedback('idle'), 2500);
    } catch {
      setShareFeedback('copied');
      window.setTimeout(() => setShareFeedback('idle'), 2500);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(pg.address);
      setAddressCopied(true);
      window.setTimeout(() => setAddressCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-[1280px] mx-auto px-5 sm:px-8 py-8 sm:py-10"
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs text-[#4C5876]"
      >
        <Link to="/" className="hover:text-[#0B1533] transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/explore" className="hover:text-[#0B1533] transition-colors">
          Explore PGs
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/explore?location=${encodeURIComponent(pg.area)}`}
          className="hover:text-[#0B1533] transition-colors"
        >
          {pg.area}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#0B1533] font-semibold truncate">{pg.name}</span>
      </nav>

      {/* Title Bar */}
      <div className="mt-5 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DDE3F0]">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#4C5876]">
            <span className="font-semibold text-[#1D4ED8]">{pg.areaLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{pg.area === pg.city ? 'Punjab' : pg.city}</span>
            <span aria-hidden="true">·</span>
            <span>{pg.propertyType}</span>
            {pg.genderLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#6D28D9] font-semibold">
                  {pg.genderLabel}
                </span>
              </>
            )}
          </div>

          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1533]">
            {pg.name}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#4C5876]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1D4ED8] shrink-0" />
              <span>{pg.address}</span>
            </span>
            {typeof pg.ratingCount === 'number' && (
              <span className="inline-flex items-center gap-1 font-mono text-xs tabular-nums text-[#B45309] font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{pg.ratingCount} ratings on Google</span>
              </span>
            )}
          </div>
        </div>

        {/* Top Utility Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => toggleSaved(pg.id)}
            aria-pressed={saved}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
              saved
                ? 'bg-[#6D28D9] text-white border-[#6D28D9]'
                : 'bg-[#FFFFFF] text-[#0B1533] border-[#DDE3F0] hover:bg-[#F5F7FC]'
            }`}
          >
            <Heart className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} />
            <span>{saved ? 'Saved' : 'Save PG'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0B1533] bg-[#FFFFFF] border border-[#DDE3F0] hover:bg-[#F5F7FC] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {shareFeedback === 'copied' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 100% Real Property Photograph + Verified Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Interactive 3D Real Property Photo Showcase */}
          <Tilt3DCard maxTilt={4}>
            <div className="relative aspect-[16/11] rounded-2xl overflow-hidden border border-[#DDE3F0] bg-[#ECEFF8] shadow-md">
              <SafeImage
                src={pg.image}
                alt={`${pg.name} real property photograph`}
                loading="eager"
                fallbackTitle={pg.name}
              />
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Open full-size property photograph"
                className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B1533] bg-white/95 hover:bg-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Photo</span>
              </button>
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-md bg-[#0B1533]/85 text-white text-xs font-medium">
                {pg.name} — Real Property Photo
              </div>
            </div>
          </Tilt3DCard>

          {/* Available Information Specification Table */}
          <section className="bg-[#FFFFFF] border border-[#DDE3F0] rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1D4ED8]" />
              <h2 className="font-display text-xl font-bold text-[#0B1533]">
                Available Property Information
              </h2>
            </div>

            <dl className="mt-5 divide-y divide-[#ECEFF8] text-sm">
              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#4C5876] font-medium">Property Name</dt>
                <dd className="sm:col-span-2 text-[#0B1533] font-semibold">
                  {pg.name}
                </dd>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#4C5876] font-medium">Location Area</dt>
                <dd className="sm:col-span-2 text-[#0B1533]">
                  {pg.area === pg.city
                    ? `${pg.areaLabel}, Punjab`
                    : `${pg.areaLabel}, ${pg.city}`}
                </dd>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#4C5876] font-medium">Category</dt>
                <dd className="sm:col-span-2 text-[#0B1533]">
                  {pg.propertyType}
                </dd>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#4C5876] font-medium">
                  Occupancy / Gender
                </dt>
                <dd className="sm:col-span-2 text-[#0B1533]">
                  {pg.genderLabel ?? 'Contact PG for details'}
                </dd>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#4C5876] font-medium">Complete Address</dt>
                <dd className="sm:col-span-2 text-[#0B1533] space-y-2">
                  <p className="leading-relaxed">{pg.address}</p>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:text-[#1539A8] cursor-pointer"
                  >
                    {addressCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Address copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy full address</span>
                      </>
                    )}
                  </button>
                </dd>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#4C5876] font-medium">Contact Number</dt>
                <dd className="sm:col-span-2">
                  {pg.phone ? (
                    <a
                      href={buildTelUrl(pg.phone)}
                      className="font-mono tabular-nums font-semibold text-[#1D4ED8] hover:underline"
                    >
                      {pg.phone}
                    </a>
                  ) : (
                    <span className="text-[#4C5876]">
                      Contact PG for details
                    </span>
                  )}
                </dd>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#4C5876] font-medium">
                  Google Rating Count
                </dt>
                <dd className="sm:col-span-2 font-mono tabular-nums text-[#0B1533]">
                  {typeof pg.ratingCount === 'number'
                    ? `${pg.ratingCount} ratings`
                    : 'Contact PG for details'}
                </dd>
              </div>

              <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-[#4C5876] font-medium">
                  Rent, Facilities &amp; Availability
                </dt>
                <dd className="sm:col-span-2 text-[#4C5876]">
                  Contact PG for details
                </dd>
              </div>
            </dl>

            {/* Official External Links if provided */}
            {(pg.website || pg.bookingForm) && (
              <div className="mt-6 pt-5 border-t border-[#ECEFF8] flex flex-wrap gap-3">
                {pg.website && (
                  <a
                    href={pg.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B1533] bg-[#F5F7FC] hover:bg-[#ECEFF8] border border-[#DDE3F0] rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Official Property Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#4C5876]" />
                  </a>
                )}

                {pg.bookingForm && (
                  <a
                    href={pg.bookingForm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] rounded-lg transition-all"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Open Official Booking Form</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </section>

          {/* Google Maps Location Block */}
          <section className="bg-[#FFFFFF] border border-[#DDE3F0] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-[#0B1533]">
                Navigate via Google Maps
              </h2>
              <p className="text-sm text-[#4C5876] leading-relaxed">
                {pg.address}
              </p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B1533] hover:bg-[#172554] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </section>
        </div>

        {/* Right Sticky Column: Direct Contact + Tour Guide ₹99 + Enquiry Form */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#DDE3F0] rounded-2xl p-6 space-y-5 shadow-xs">
            <div>
              <p className="text-xs font-semibold text-[#6D28D9]">
                Direct Property Actions
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-[#0B1533]">
                Connect with {pg.name}
              </h2>
            </div>

            {pg.phone ? (
              <div className="space-y-2.5">
                <a
                  href={buildTelUrl(pg.phone)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] rounded-xl transition-all shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now · {pg.phone}</span>
                </a>

                <a
                  href={buildWhatsAppUrl(pg.phone, pg.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#1D4ED8] bg-[#EEF3FF] hover:bg-[#DCE7FF] rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#0B1533] bg-[#F5F7FC] hover:bg-[#ECEFF8] border border-[#DDE3F0] rounded-xl transition-colors"
                >
                  <Navigation className="w-4 h-4 text-[#1D4ED8]" />
                  <span>Get Google Maps Directions</span>
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#F5F7FC] border border-[#DDE3F0] text-sm text-[#4C5876]">
                  Phone number is not listed for this property. Visit in person
                  using Google Maps directions, book our Tour Guide, or leave an
                  enquiry below.
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B1533] hover:bg-[#172554] rounded-xl transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Google Maps Directions</span>
                </a>
              </div>
            )}

            {/* Tour Guide ₹99 Card for this PG */}
            <div className="p-4 rounded-xl bg-[#F3EFFF] border border-[#DDD3FD] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-[#0B1533]">
                  Want a Personal Tour Guide?
                </span>
                <span className="font-mono text-xs font-bold text-[#6D28D9]">
                  ₹{TOUR_GUIDE_FEE_INR}
                </span>
              </div>
              <p className="text-xs text-[#4C5876] leading-relaxed">
                Our Find My PG team will guide you to {pg.name} and nearby
                stays in {pg.area} in person.
              </p>
              <button
                type="button"
                onClick={() =>
                  openTourModal({ area: pg.area, pgName: pg.name })
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#6D28D9] hover:bg-[#5B21B6] rounded-lg transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Book Team Tour Guide · Pay ₹{TOUR_GUIDE_FEE_INR} QR</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#ECEFF8]">
              <EnquiryForm
                pgId={pg.id}
                pgName={pg.name}
                pgPhone={pg.phone}
                heading="Property Enquiry"
                subheading="Leave your contact details and questions about this PG."
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Nearby / Related PGs */}
      {relatedPGs.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#DDE3F0]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#6D28D9]">
                Continue Exploring
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#0B1533]">
                More Stays Around {pg.area}
              </h2>
            </div>
            <Link
              to={`/explore?location=${encodeURIComponent(pg.area)}`}
              className="text-sm font-semibold text-[#1D4ED8] hover:text-[#1539A8]"
            >
              View all in {pg.area}
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPGs.map((item) => (
              <PGCard key={item.id} pg={item} />
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Full-size view of ${pg.name}`}
          className="fixed inset-0 z-50 bg-[#0B1533]/92 flex items-center justify-center p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close photo lightbox"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl w-full space-y-3">
            <img
              src={pg.image}
              alt={`${pg.name} real property photograph`}
              referrerPolicy="no-referrer"
              className="w-full max-h-[78vh] object-contain rounded-xl bg-[#0B1533]"
            />
            <p className="text-center text-sm text-white/85">
              {pg.name} — {pg.address}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
