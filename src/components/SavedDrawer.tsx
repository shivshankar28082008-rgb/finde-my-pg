import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, Heart, MapPin, Trash2, X } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useFirebaseData } from '../context/FirebaseDataContext';
import { formatPGZoneMeta } from '../utils/pgFilters';
import { SafeImage } from './SafeImage';

export function SavedDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    savedIds,
    recentlyViewedIds,
    toggleSaved,
    clearRecent,
  } = usePreferences();
  const { getByIds } = useFirebaseData();
  const [activeTab, setActiveTab] = useState<'saved' | 'recent'>('saved');

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const savedListings = getByIds(savedIds);
  const recentListings = getByIds(recentlyViewedIds);
  const activeItems = activeTab === 'saved' ? savedListings : recentListings;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Saved and recently viewed PGs"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close saved stays drawer"
            onClick={closeDrawer}
            className="fixed inset-0 bg-[#0B1533]/50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="relative w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col border-l border-[#DDE3F0]"
          >
            <div className="px-6 py-5 border-b border-[#DDE3F0] flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0B1533]">
                  Your Shortlist
                </h2>
                <p className="text-xs text-[#4C5876] mt-0.5">
                  Saved locally in this browser
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close drawer"
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#4C5876] hover:text-[#0B1533] hover:bg-[#F5F7FC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Tab Controls */}
            <div className="px-6 pt-4 pb-3">
              <div
                role="tablist"
                aria-label="Shortlist view"
                className="grid grid-cols-2 gap-1 p-1 bg-[#ECEFF8] rounded-lg"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'saved'}
                  onClick={() => setActiveTab('saved')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'saved'
                      ? 'bg-[#FFFFFF] text-[#0B1533] shadow-xs'
                      : 'text-[#4C5876] hover:text-[#0B1533]'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Saved ({savedListings.length})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'recent'}
                  onClick={() => setActiveTab('recent')}
                  className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'recent'
                      ? 'bg-[#FFFFFF] text-[#0B1533] shadow-xs'
                      : 'text-[#4C5876] hover:text-[#0B1533]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recently Viewed ({recentListings.length})</span>
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              {activeItems.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-display text-base font-semibold text-[#0B1533]">
                    {activeTab === 'saved'
                      ? 'No saved PGs yet'
                      : 'No recently viewed PGs'}
                  </p>
                  <p className="text-sm text-[#4C5876] mt-2 max-w-xs mx-auto leading-relaxed">
                    {activeTab === 'saved'
                      ? 'Tap the heart button on any listing card to shortlist stays for side-by-side comparison.'
                      : 'Open any PG details page and it will appear here for quick access.'}
                  </p>
                  <Link
                    to="/explore"
                    onClick={closeDrawer}
                    className="mt-5 inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] rounded-lg transition-all"
                  >
                    Explore All 10 PGs
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-[#ECEFF8]">
                  {activeItems.map((pg) => (
                    <li key={pg.id} className="py-4 flex items-start gap-3.5">
                      <Link
                        to={`/pg/${pg.slug}`}
                        onClick={closeDrawer}
                        className="w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-[#DDE3F0]"
                      >
                        <SafeImage
                          src={pg.image}
                          alt={pg.name}
                          fallbackTitle={pg.name}
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#1D4ED8] font-semibold">
                          {formatPGZoneMeta(pg)}
                        </div>
                        <Link
                          to={`/pg/${pg.slug}`}
                          onClick={closeDrawer}
                          className="font-display text-sm font-bold text-[#0B1533] hover:text-[#1D4ED8] transition-colors block truncate mt-0.5"
                        >
                          {pg.name}
                        </Link>
                        <p className="text-xs text-[#4C5876] flex items-center gap-1 mt-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{pg.address}</span>
                        </p>
                      </div>
                      {activeTab === 'saved' && (
                        <button
                          type="button"
                          onClick={() => toggleSaved(pg.id)}
                          aria-label={`Remove ${pg.name} from saved stays`}
                          className="p-2 rounded-lg text-[#4C5876] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-[#DDE3F0] bg-[#F5F7FC] flex items-center justify-between gap-3">
              {activeTab === 'saved' && savedListings.length > 0 ? (
                <Link
                  to="/explore?saved=1"
                  onClick={closeDrawer}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] rounded-lg transition-all"
                >
                  Filter Saved on Explore ({savedListings.length})
                </Link>
              ) : activeTab === 'recent' && recentListings.length > 0 ? (
                <button
                  type="button"
                  onClick={clearRecent}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-[#0B1533] bg-[#FFFFFF] border border-[#DDE3F0] hover:bg-[#ECEFF8] rounded-lg transition-colors cursor-pointer"
                >
                  Clear Recently Viewed
                </button>
              ) : (
                <Link
                  to="/explore"
                  onClick={closeDrawer}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] rounded-lg transition-all"
                >
                  Browse All PGs
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
