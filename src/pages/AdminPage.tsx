import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Building2,
  CheckCircle2,
  CloudUpload,
  Compass,
  Database,
  Edit3,
  ExternalLink,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { BRAND_LOGO_URL } from '../data/pgListings';
import {
  useFirebaseData,
  type EnquiryStatus,
  type TourBookingStatus,
} from '../context/FirebaseDataContext';
import { FIREBASE_PROJECT_ID } from '../firebase';
import type { LocationArea, PGListing, PropertyType } from '../types/pg';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  mapListingToGenderCategory,
  validateAdminPGForm,
  verifyAdminPanelId,
  type AdminGenderCategory,
  type AdminPGFormInput,
  type AdminPGValidationErrors,
} from '../utils/adminUtils';
import { SafeImage } from '../components/SafeImage';

const PANEL_UNLOCK_KEY = 'findmypg_admin_panel_unlocked_v1';

const EMPTY_FORM: AdminPGFormInput = {
  name: '',
  area: 'Law Gate',
  city: 'Phagwara',
  address: '',
  propertyType: 'PG Accommodation',
  genderCategory: 'Not Specified',
  phone: '',
  ratingCount: '',
  website: '',
  image: '',
  featured: false,
  recentlyAdded: true,
};

type AdminTab = 'listings' | 'tours' | 'enquiries';

export function AdminPage() {
  const {
    user,
    authReady,
    isFirebaseAdmin,
    authError,
    signInAdminWithGoogle,
    signOutAdmin,
    listings,
    cloudListingIds,
    createPGListing,
    updatePGListing,
    deletePGListing,
    seedInitialPGsToFirestore,
    cloudEnquiries,
    cloudTourBookings,
    updateEnquiryStatus,
    updateTourBookingStatus,
  } = useFirebaseData();

  const [isPanelUnlocked, setIsPanelUnlocked] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(PANEL_UNLOCK_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [panelIdInput, setPanelIdInput] = useState('');
  const [panelIdError, setPanelIdError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('listings');
  const [formState, setFormState] = useState<AdminPGFormInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<AdminPGValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const cloudIdSet = useMemo(() => new Set(cloudListingIds), [cloudListingIds]);

  const filteredListings = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((pg) =>
      `${pg.name} ${pg.area} ${pg.city} ${pg.address}`.toLowerCase().includes(q),
    );
  }, [listings, searchFilter]);

  const handlePanelUnlock = (event: FormEvent) => {
    event.preventDefault();
    if (!verifyAdminPanelId(panelIdInput)) {
      setPanelIdError(
        'Invalid Admin Panel ID. Please enter the authorized Panel ID to continue.',
      );
      return;
    }
    setPanelIdError(null);
    setPanelIdInput('');
    setIsPanelUnlocked(true);
    try {
      window.sessionStorage.setItem(PANEL_UNLOCK_KEY, '1');
    } catch {
      // Ignore storage errors
    }
  };

  const handleLockPanel = () => {
    setIsPanelUnlocked(false);
    try {
      window.sessionStorage.removeItem(PANEL_UNLOCK_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const handleAreaChange = (nextArea: LocationArea) => {
    setFormState((prev) => ({
      ...prev,
      area: nextArea,
      city: nextArea === 'Jalandhar' ? 'Jalandhar' : 'Phagwara',
    }));
  };

  const handleStartEdit = (pg: PGListing) => {
    setEditingId(pg.id);
    setFormErrors({});
    setFeedback(null);
    setFormState({
      name: pg.name,
      area: pg.area,
      city: pg.city,
      address: pg.address,
      propertyType: pg.propertyType,
      genderCategory: mapListingToGenderCategory(pg),
      phone: pg.phone ?? '',
      ratingCount:
        typeof pg.ratingCount === 'number' ? String(pg.ratingCount) : '',
      website: pg.website ?? '',
      image: pg.image,
      featured: pg.featured,
      recentlyAdded: pg.recentlyAdded,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormState(EMPTY_FORM);
    setFormErrors({});
  };

  const handlePGFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    const errors = validateAdminPGForm(formState);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    if (!isFirebaseAdmin) {
      setFeedback({
        type: 'error',
        text: `Please sign in with Google (${BOOTSTRAPPED_ADMIN_EMAIL}) above so Firebase Firestore authorizes publishing this PG.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updatePGListing(editingId, formState);
        setFeedback({
          type: 'success',
          text: `"${formState.name.trim()}" was updated in Firebase Firestore and is now live.`,
        });
        setEditingId(null);
        setFormState(EMPTY_FORM);
      } else {
        const created = await createPGListing(formState);
        setFeedback({
          type: 'success',
          text: `"${created.name}" has been published to Firebase Firestore and is now visible on Find My PG.`,
        });
        setFormState(EMPTY_FORM);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Unable to save PG listing to Firebase Firestore.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeedToCloud = async () => {
    setFeedback(null);
    if (!isFirebaseAdmin) {
      setFeedback({
        type: 'error',
        text: `Sign in with your verified Admin Google account (${BOOTSTRAPPED_ADMIN_EMAIL}) first.`,
      });
      return;
    }
    setSeeding(true);
    try {
      const count = await seedInitialPGsToFirestore();
      setFeedback({
        type: 'success',
        text:
          count > 0
            ? `Synced ${count} initial PG listings to Firebase Firestore.`
            : 'All 10 initial PG listings are already synced in Firebase Firestore.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Failed to sync listings to Firebase.',
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteListing = async (id: string, name: string) => {
    setFeedback(null);
    if (!isFirebaseAdmin) {
      setFeedback({
        type: 'error',
        text: 'Sign in with your verified Admin Google account to delete cloud listings.',
      });
      return;
    }
    try {
      await deletePGListing(id);
      setConfirmDeleteId(null);
      if (editingId === id) {
        handleCancelEdit();
      }
      setFeedback({
        type: 'success',
        text: `"${name}" was removed from Firebase Firestore.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Unable to delete PG listing from Firebase.',
      });
    }
  };

  // =========================================================================
  // GATE VIEW: Panel ID Required (8969288)
  // =========================================================================
  if (!isPanelUnlocked) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-14 sm:py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-[#FFFFFF] border border-[#DDE3F0] rounded-2xl p-7 sm:p-8 shadow-[0_18px_46px_-22px_rgba(11,21,51,0.22)]"
        >
          <div className="flex items-center justify-between gap-3 pb-5 border-b border-[#EDF1FA]">
            <img
              src={BRAND_LOGO_URL}
              alt="Find My PG"
              className="h-10 w-auto object-contain"
            />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] px-2.5 py-1 rounded-md">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </span>
          </div>

          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold text-[#0B1533]">
              Find My PG Admin Panel
            </h1>
            <p className="mt-1.5 text-sm text-[#52607D] leading-relaxed">
              Enter your authorized Admin Panel ID to manage PG listings, view
              student enquiries, and track ₹99 Tour Guide bookings in Firebase.
            </p>
          </div>

          <form onSubmit={handlePanelUnlock} noValidate className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-panel-id"
                className="block text-xs font-semibold text-[#0B1533] mb-1.5"
              >
                Admin Panel ID *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#52607D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-panel-id"
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={panelIdInput}
                  onChange={(e) => {
                    setPanelIdInput(e.target.value);
                    if (panelIdError) setPanelIdError(null);
                  }}
                  placeholder="Enter Panel ID"
                  aria-invalid={Boolean(panelIdError)}
                  className="w-full pl-10 pr-4 py-3 text-sm font-mono tracking-widest bg-[#F5F7FC] border border-[#D4DDF0] rounded-xl text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] transition-colors"
                />
              </div>
              {panelIdError && (
                <p
                  role="alert"
                  data-testid="panel-id-error"
                  className="mt-2 text-xs font-medium text-[#B91C1C]"
                >
                  {panelIdError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <p className="mt-5 pt-4 border-t border-[#EDF1FA] text-xs text-[#6B7A99] text-center">
            Connected to Firebase project{' '}
            <span className="font-mono text-[#0B1533]">{FIREBASE_PROJECT_ID}</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // UNLOCKED ADMIN DASHBOARD
  // =========================================================================
  const lawGateCount = listings.filter((p) => p.area === 'Law Gate').length;
  const phagwaraCount = listings.filter((p) => p.area === 'Phagwara').length;
  const jalandharCount = listings.filter((p) => p.area === 'Jalandhar').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="admin-dashboard"
      className="max-w-[1280px] mx-auto px-5 sm:px-8 py-8 sm:py-10 space-y-6"
    >
      {/* Top Admin Header & Firebase Cloud Auth Bar */}
      <div className="bg-[#0B1533] text-white rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#93C5FD]">
            <Database className="w-4 h-4" />
            <span>Firebase Firestore Connected · {FIREBASE_PROJECT_ID}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Find My PG Admin Panel
          </h1>
          <p className="text-xs sm:text-sm text-[#CBD5E1]">
            Publish new PG stays live to Firestore, update property details, and
            manage incoming ₹99 Tour Guide bookings &amp; student enquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!authReady ? (
            <span className="text-xs text-[#CBD5E1] px-3 py-2">
              Checking Firebase Auth...
            </span>
          ) : user ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-xs">
                <p className="font-semibold text-white">{user.email}</p>
                <p className="text-[11px] text-[#93C5FD]">
                  {isFirebaseAdmin
                    ? 'Verified Cloud Admin'
                    : 'Signed in (Non-Admin Email)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOutAdmin()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void signInAdminWithGoogle()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#6D28D9] hover:opacity-95 text-xs sm:text-sm font-semibold text-white transition-opacity cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with Google (Cloud Sync)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLockPanel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Panel</span>
          </button>
        </div>
      </div>

      {/* Auth Warning Banner if signed out or non-admin email */}
      {authError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800"
        >
          {authError}
        </div>
      )}

      {authReady && !isFirebaseAdmin && (
        <div className="p-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-[#1E3A8A] leading-relaxed">
            <strong>Firebase Write Protection Active:</strong> Panel ID verified.
            Sign in with your Admin Google account (
            <span className="font-mono font-semibold">
              {BOOTSTRAPPED_ADMIN_EMAIL}
            </span>
            ) to publish, edit, or delete PG listings directly in Firestore and
            view private student enquiries &amp; ₹99 bookings.
          </p>
          <button
            type="button"
            onClick={() => void signInAdminWithGoogle()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Connect Google Admin</span>
          </button>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F5] rounded-xl p-4">
          <p className="text-xs font-medium text-[#52607D]">Total Live PGs</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#0B1533] tabular-nums">
            {listings.length}
          </p>
          <p className="mt-0.5 text-[11px] text-[#6B7A99]">
            {cloudListingIds.length} synced in Firestore
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F5] rounded-xl p-4">
          <p className="text-xs font-medium text-[#52607D]">Area Coverage</p>
          <p className="mt-1 font-mono text-sm font-bold text-[#1D4ED8] tabular-nums">
            LG: {lawGateCount} · PHG: {phagwaraCount} · JAL: {jalandharCount}
          </p>
          <p className="mt-1 text-[11px] text-[#6B7A99]">
            Law Gate · Phagwara · Jalandhar
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F5] rounded-xl p-4">
          <p className="text-xs font-medium text-[#52607D]">
            ₹99 Tour Guide Bookings
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#6D28D9] tabular-nums">
            {cloudTourBookings.length}
          </p>
          <p className="mt-0.5 text-[11px] text-[#6B7A99]">
            Live Firestore records
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F5] rounded-xl p-4">
          <p className="text-xs font-medium text-[#52607D]">Student Enquiries</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#0B1533] tabular-nums">
            {cloudEnquiries.length}
          </p>
          <p className="mt-0.5 text-[11px] text-[#6B7A99]">
            Property &amp; contact leads
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="flex flex-wrap items-center gap-2 border-b border-[#DDE3F0] pb-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'listings'}
          onClick={() => setActiveTab('listings')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-[#1D4ED8] text-white'
              : 'bg-white text-[#52607D] border border-[#DDE3F0] hover:text-[#0B1533]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>PG Listings ({listings.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tours'}
          onClick={() => setActiveTab('tours')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'tours'
              ? 'bg-[#6D28D9] text-white'
              : 'bg-white text-[#52607D] border border-[#DDE3F0] hover:text-[#0B1533]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>₹99 Tour Bookings ({cloudTourBookings.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'enquiries'}
          onClick={() => setActiveTab('enquiries')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'enquiries'
              ? 'bg-[#0B1533] text-white'
              : 'bg-white text-[#52607D] border border-[#DDE3F0] hover:text-[#0B1533]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Enquiries ({cloudEnquiries.length})</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          data-testid="admin-feedback-banner"
          className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* TAB 1: PG LISTINGS MANAGER */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Add / Edit PG Form */}
          <section className="lg:col-span-5 bg-white border border-[#E2E8F5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#EDF1FA]">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0B1533]">
                  {editingId ? 'Edit PG Listing' : 'Add New PG Listing'}
                </h2>
                <p className="text-xs text-[#52607D] mt-0.5">
                  Leave optional fields blank if unavailable—the site shows
                  &ldquo;Contact PG for details&rdquo;.
                </p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-semibold text-[#52607D] hover:text-[#0B1533] cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <form
              onSubmit={handlePGFormSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="pg-name"
                  className="block text-xs font-semibold text-[#0B1533] mb-1"
                >
                  PG / Hostel Name *
                </label>
                <input
                  id="pg-name"
                  type="text"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Royal Horizon PG"
                  aria-invalid={Boolean(formErrors.name)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                />
                {formErrors.name && (
                  <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pg-area"
                    className="block text-xs font-semibold text-[#0B1533] mb-1"
                  >
                    Location Area *
                  </label>
                  <select
                    id="pg-area"
                    value={formState.area}
                    onChange={(e) =>
                      handleAreaChange(e.target.value as LocationArea)
                    }
                    className="w-full px-3 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
                  >
                    <option value="Law Gate">Law Gate</option>
                    <option value="Phagwara">Phagwara</option>
                    <option value="Jalandhar">Jalandhar</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pg-city"
                    className="block text-xs font-semibold text-[#0B1533] mb-1"
                  >
                    City *
                  </label>
                  <select
                    id="pg-city"
                    value={formState.city}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        city: e.target.value as 'Phagwara' | 'Jalandhar',
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
                  >
                    <option value="Phagwara">Phagwara</option>
                    <option value="Jalandhar">Jalandhar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pg-type"
                    className="block text-xs font-semibold text-[#0B1533] mb-1"
                  >
                    Property Type *
                  </label>
                  <select
                    id="pg-type"
                    value={formState.propertyType}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        propertyType: e.target.value as PropertyType,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
                  >
                    <option value="PG Accommodation">PG Accommodation</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Apartment PG">Apartment PG</option>
                    <option value="PG Room">PG Room</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pg-gender"
                    className="block text-xs font-semibold text-[#0B1533] mb-1"
                  >
                    Gender Category
                  </label>
                  <select
                    id="pg-gender"
                    value={formState.genderCategory}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        genderCategory: e.target.value as AdminGenderCategory,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
                  >
                    <option value="Not Specified">Not Specified</option>
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Co-living">Co-living (Boys &amp; Girls)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="pg-address"
                  className="block text-xs font-semibold text-[#0B1533] mb-1"
                >
                  Full Google Maps Address *
                </label>
                <textarea
                  id="pg-address"
                  rows={2}
                  value={formState.address}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Plot No., Street, Landmark, City, Punjab Pincode"
                  aria-invalid={Boolean(formErrors.address)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] resize-none"
                />
                {formErrors.address && (
                  <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pg-image"
                  className="block text-xs font-semibold text-[#0B1533] mb-1"
                >
                  Real Property Photo URL *
                </label>
                <input
                  id="pg-image"
                  type="url"
                  value={formState.image}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, image: e.target.value }))
                  }
                  placeholder="https://i.ibb.co/... or Google photo URL"
                  aria-invalid={Boolean(formErrors.image)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                />
                {formErrors.image && (
                  <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                    {formErrors.image}
                  </p>
                )}
                {formState.image.trim().startsWith('http') && (
                  <div className="mt-2 h-32 rounded-lg overflow-hidden border border-[#DDE3F0]">
                    <SafeImage
                      src={formState.image.trim()}
                      alt="PG photo preview"
                      fallbackTitle={formState.name || 'Preview'}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pg-phone"
                    className="block text-xs font-semibold text-[#0B1533] mb-1"
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    id="pg-phone"
                    type="tel"
                    value={formState.phone}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="e.g. 098765 43210"
                    aria-invalid={Boolean(formErrors.phone)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                  />
                  {formErrors.phone && (
                    <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pg-rating-count"
                    className="block text-xs font-semibold text-[#0B1533] mb-1"
                  >
                    Google Rating Count (Optional)
                  </label>
                  <input
                    id="pg-rating-count"
                    type="number"
                    min={0}
                    max={100000}
                    value={formState.ratingCount}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        ratingCount: e.target.value,
                      }))
                    }
                    placeholder="e.g. 42"
                    aria-invalid={Boolean(formErrors.ratingCount)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                  />
                  {formErrors.ratingCount && (
                    <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                      {formErrors.ratingCount}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="pg-website"
                  className="block text-xs font-semibold text-[#0B1533] mb-1"
                >
                  Official Website URL (Optional)
                </label>
                <input
                  id="pg-website"
                  type="url"
                  value={formState.website}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, website: e.target.value }))
                  }
                  placeholder="https://..."
                  aria-invalid={Boolean(formErrors.website)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                />
                {formErrors.website && (
                  <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                    {formErrors.website}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0B1533] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, featured: e.target.checked }))
                    }
                    className="rounded border-[#D4DDF0] text-[#1D4ED8]"
                  />
                  <span>Show in Featured PGs</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0B1533] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.recentlyAdded}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        recentlyAdded: e.target.checked,
                      }))
                    }
                    className="rounded border-[#D4DDF0] text-[#1D4ED8]"
                  />
                  <span>Show in Recently Added</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Saving to Firebase...'
                    : editingId
                      ? 'Save Changes to Firebase'
                      : 'Publish PG to Firebase'}
                </span>
              </button>
            </form>
          </section>

          {/* Right: Existing Directory Manager */}
          <section className="lg:col-span-7 bg-white border border-[#E2E8F5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDF1FA]">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0B1533]">
                  Live PG Directory ({listings.length})
                </h2>
                <p className="text-xs text-[#52607D]">
                  Click Edit to update any PG or publish initial records to
                  Firestore.
                </p>
              </div>

              <button
                type="button"
                disabled={seeding}
                onClick={() => void handleSeedToCloud()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#1D4ED8] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>
                  {seeding ? 'Syncing...' : 'Sync Default PGs to Cloud'}
                </span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#52607D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter listed PGs by name, area, or address..."
                aria-label="Filter listed PGs"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
              />
            </div>

            <div className="divide-y divide-[#EDF1FA] max-h-[680px] overflow-y-auto pr-1">
              {filteredListings.map((pg) => {
                const isCloud = cloudIdSet.has(pg.id);
                return (
                  <div
                    key={pg.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 border border-[#E2E8F5]">
                        <SafeImage
                          src={pg.image}
                          alt={pg.name}
                          fallbackTitle={pg.name}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display text-sm font-bold text-[#0B1533] truncate">
                            {pg.name}
                          </h3>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isCloud
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-[#F5F7FC] text-[#52607D] border border-[#DDE3F0]'
                            }`}
                          >
                            {isCloud ? 'Firestore' : 'Seed'}
                          </span>
                        </div>
                        <p className="text-xs text-[#52607D] flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-[#1D4ED8]" />
                          <span className="truncate">
                            {pg.area} · {pg.propertyType}
                            {pg.phone ? ` · ${pg.phone}` : ''}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/pg/${pg.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#52607D] hover:text-[#0B1533] bg-[#F5F7FC] border border-[#DDE3F0]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(pg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D4ED8] bg-[#EEF2FF] hover:bg-[#E0E7FF] cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      {isCloud && (
                        <>
                          {confirmDeleteId === pg.id ? (
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteListing(pg.id, pg.name)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(pg.id)}
                              aria-label={`Delete ${pg.name}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: ₹99 TOUR GUIDE BOOKINGS */}
      {activeTab === 'tours' && (
        <section className="bg-white border border-[#E2E8F5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-4 border-b border-[#EDF1FA]">
            <h2 className="font-display text-lg font-bold text-[#0B1533]">
              ₹99 Tour Guide Bookings
            </h2>
            <p className="text-xs text-[#52607D] mt-0.5">
              Student tour requests submitted with UPI UTR IDs stored in
              Firestore.
            </p>
          </div>

          {!isFirebaseAdmin ? (
            <p className="text-sm text-[#52607D] py-8 text-center">
              Sign in with your Admin Google account above to view private ₹99
              Tour Guide bookings.
            </p>
          ) : cloudTourBookings.length === 0 ? (
            <p className="text-sm text-[#52607D] py-8 text-center">
              No ₹99 Tour Guide bookings recorded in Firestore yet.
            </p>
          ) : (
            <div className="divide-y divide-[#EDF1FA]">
              {cloudTourBookings.map((b) => (
                <div
                  key={b.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-sm font-bold text-[#0B1533]">
                        {b.name}
                      </span>
                      <span className="font-mono text-xs text-[#1D4ED8]">
                        {b.phone}
                      </span>
                      <span className="font-mono text-xs bg-[#EEF2FF] text-[#6D28D9] px-2 py-0.5 rounded">
                        ₹{b.feeInr} · UTR: {b.utrNumber}
                      </span>
                    </div>
                    <p className="text-xs text-[#52607D]">
                      Area: <strong>{b.area}</strong>
                      {b.pgName ? ` · PG: ${b.pgName}` : ''} · Visit Date:{' '}
                      <strong>{b.preferredDate}</strong>
                    </p>
                    {b.notes && (
                      <p className="text-xs text-[#6B7A99]">Notes: {b.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor={`tour-status-${b.id}`} className="sr-only">
                      Status for {b.name}
                    </label>
                    <select
                      id={`tour-status-${b.id}`}
                      value={b.status}
                      onChange={(e) =>
                        void updateTourBookingStatus(
                          b.id,
                          e.target.value as TourBookingStatus,
                        )
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] cursor-pointer"
                    >
                      <option value="pending">Pending Verification</option>
                      <option value="confirmed">Guide Assigned</option>
                      <option value="completed">Tour Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: STUDENT ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <section className="bg-white border border-[#E2E8F5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-4 border-b border-[#EDF1FA]">
            <h2 className="font-display text-lg font-bold text-[#0B1533]">
              Student Enquiries
            </h2>
            <p className="text-xs text-[#52607D] mt-0.5">
              Messages submitted from PG detail pages and the Contact page.
            </p>
          </div>

          {!isFirebaseAdmin ? (
            <p className="text-sm text-[#52607D] py-8 text-center">
              Sign in with your Admin Google account above to view student
              enquiries.
            </p>
          ) : cloudEnquiries.length === 0 ? (
            <p className="text-sm text-[#52607D] py-8 text-center">
              No student enquiries recorded in Firestore yet.
            </p>
          ) : (
            <div className="divide-y divide-[#EDF1FA]">
              {cloudEnquiries.map((e) => (
                <div
                  key={e.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-sm font-bold text-[#0B1533]">
                        {e.name}
                      </span>
                      <span className="font-mono text-xs text-[#1D4ED8]">
                        {e.phone}
                      </span>
                      {e.email && (
                        <span className="text-xs text-[#52607D]">{e.email}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[#6D28D9]">
                      {e.pgName ?? `General Enquiry (${e.preferredArea})`}
                    </p>
                    <p className="text-xs text-[#52607D]">{e.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label htmlFor={`enq-status-${e.id}`} className="sr-only">
                      Status for {e.name}
                    </label>
                    <select
                      id={`enq-status-${e.id}`}
                      value={e.status}
                      onChange={(ev) =>
                        void updateEnquiryStatus(
                          e.id,
                          ev.target.value as EnquiryStatus,
                        )
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-[#F5F7FC] border border-[#D4DDF0] rounded-lg text-[#0B1533] cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </motion.div>
  );
}
