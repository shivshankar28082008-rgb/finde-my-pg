import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  MapPin,
  Navigation,
  Phone,
  Star,
} from 'lucide-react';
import type { PGListing } from '../types/pg';
import { usePreferences } from '../context/PreferencesContext';
import {
  buildGoogleMapsUrl,
  buildTelUrl,
  formatPGZoneMeta,
} from '../utils/pgFilters';
import { SafeImage } from './SafeImage';
import { Tilt3DCard } from './Tilt3DCard';

interface PGCardProps {
  pg: PGListing;
}

export function PGCard({ pg }: PGCardProps) {
  const { isSaved, toggleSaved } = usePreferences();
  const saved = isSaved(pg.id);
  const mapsUrl = buildGoogleMapsUrl(pg.address);
  const zoneMeta = formatPGZoneMeta(pg);

  return (
    <Tilt3DCard maxTilt={5}>
      <article
        data-testid={`pg-card-${pg.slug}`}
        className="group h-full bg-[#FFFFFF] border border-[#DDE3F0] rounded-xl overflow-hidden flex flex-col shadow-xs hover:shadow-xl hover:border-[#B6C4E8] transition-all duration-300"
      >
        {/* 4:3 Real Property Image Lead */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#ECEFF8]">
          <Link
            to={`/pg/${pg.slug}`}
            aria-label={`View details for ${pg.name}`}
            className="block w-full h-full"
          >
            <SafeImage
              src={pg.image}
              alt={`${pg.name} in ${zoneMeta}`}
              fallbackTitle={pg.name}
              className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          </Link>

          {/* Accessible Favourite Toggle */}
          <button
            type="button"
            onClick={() => toggleSaved(pg.id)}
            aria-label={
              saved
                ? `Remove ${pg.name} from saved stays`
                : `Save ${pg.name} to favourites`
            }
            aria-pressed={saved}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              saved
                ? 'bg-[#6D28D9] text-white scale-105'
                : 'bg-white/95 text-[#0B1533] hover:bg-white hover:scale-105'
            }`}
          >
            <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Content Block */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Clean Unboxed Typographic Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#4C5876]">
            <span className="font-semibold text-[#1D4ED8]">{pg.area}</span>
            <span aria-hidden="true">·</span>
            <span>{pg.area === pg.city ? 'Punjab' : pg.city}</span>
            <span aria-hidden="true">·</span>
            <span>{pg.propertyType}</span>
            {pg.genderLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#6D28D9] font-medium">
                  {pg.genderLabel}
                </span>
              </>
            )}
          </div>

          {/* Title & Review Count */}
          <div className="mt-2 flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-bold leading-snug text-[#0B1533]">
              <Link
                to={`/pg/${pg.slug}`}
                className="hover:text-[#1D4ED8] transition-colors"
              >
                {pg.name}
              </Link>
            </h3>

            {typeof pg.ratingCount === 'number' && (
              <span
                className="inline-flex items-center gap-1 text-xs font-mono tabular-nums text-[#B45309] shrink-0 pt-1"
                title={`${pg.ratingCount} Google ratings`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{pg.ratingCount} ratings</span>
              </span>
            )}
          </div>

          {/* Full Google Maps Address */}
          <p className="mt-2.5 text-sm text-[#4C5876] leading-relaxed flex items-start gap-2">
            <MapPin
              className="w-4 h-4 mt-0.5 text-[#1D4ED8] shrink-0"
              strokeWidth={1.75}
            />
            <span className="line-clamp-2">{pg.address}</span>
          </p>

          {/* Contact Info (never fabricated) */}
          <div className="mt-3 pt-3 border-t border-[#ECEFF8] flex items-center justify-between text-xs text-[#4C5876]">
            {pg.phone ? (
              <span className="font-mono tabular-nums text-[#0B1533] font-semibold">
                {pg.phone}
              </span>
            ) : (
              <span className="text-[#4C5876]">Contact PG for details</span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-1 flex flex-wrap items-center gap-2 mt-auto">
            <Link
              to={`/pg/${pg.slug}`}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] rounded-lg transition-all whitespace-nowrap shadow-xs"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get directions to ${pg.name}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#0B1533] bg-[#F5F7FC] hover:bg-[#ECEFF8] border border-[#DDE3F0] rounded-lg transition-colors whitespace-nowrap"
            >
              <Navigation className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Directions</span>
            </a>

            {pg.phone && (
              <a
                href={buildTelUrl(pg.phone)}
                aria-label={`Call ${pg.name} at ${pg.phone}`}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#1D4ED8] bg-[#EEF3FF] hover:bg-[#DCE7FF] rounded-lg transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            )}
          </div>
        </div>
      </article>
    </Tilt3DCard>
  );
}
