import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { TOUR_GUIDE_FEE_INR } from '../data/pgListings';
import type {
  EnquiryFormInput,
  EnquiryRecord,
  LocationArea,
  TourGuideBookingInput,
  TourGuideBookingRecord,
} from '../types/pg';
import {
  parseStoredIds,
  pushRecentId,
  toggleIdInList,
} from '../utils/pgFilters';

import { useFirebaseData } from './FirebaseDataContext';

const SAVED_STORAGE_KEY = 'findmypg_saved_ids_v1';
const RECENT_STORAGE_KEY = 'findmypg_recent_ids_v1';
const ENQUIRIES_STORAGE_KEY = 'findmypg_enquiries_v1';
const TOUR_BOOKINGS_STORAGE_KEY = 'findmypg_tour_bookings_v1';

export interface TourModalContext {
  area?: LocationArea;
  pgName?: string;
}

interface PreferencesContextValue {
  savedIds: string[];
  recentlyViewedIds: string[];
  enquiries: EnquiryRecord[];
  tourBookings: TourGuideBookingRecord[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  recordView: (id: string) => void;
  clearRecent: () => void;
  submitEnquiry: (input: EnquiryFormInput) => EnquiryRecord;
  submitTourBooking: (input: TourGuideBookingInput) => TourGuideBookingRecord;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  isTourModalOpen: boolean;
  tourModalContext: TourModalContext;
  openTourModal: (ctx?: TourModalContext) => void;
  closeTourModal: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function readArray<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { saveEnquiryToFirestore, saveTourBookingToFirestore, listings } =
    useFirebaseData();
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    parseStoredIds(window.localStorage.getItem(SAVED_STORAGE_KEY)),
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    parseStoredIds(window.localStorage.getItem(RECENT_STORAGE_KEY)),
  );
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>(() =>
    readArray<EnquiryRecord>(ENQUIRIES_STORAGE_KEY),
  );
  const [tourBookings, setTourBookings] = useState<TourGuideBookingRecord[]>(
    () => readArray<TourGuideBookingRecord>(TOUR_BOOKINGS_STORAGE_KEY),
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [tourModalContext, setTourModalContext] = useState<TourModalContext>(
    {},
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        RECENT_STORAGE_KEY,
        JSON.stringify(recentlyViewedIds),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [recentlyViewedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ENQUIRIES_STORAGE_KEY,
        JSON.stringify(enquiries),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [enquiries]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        TOUR_BOOKINGS_STORAGE_KEY,
        JSON.stringify(tourBookings),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [tourBookings]);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  );

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => toggleIdInList(prev, id));
  }, []);

  const recordView = useCallback((id: string) => {
    setRecentlyViewedIds((prev) => pushRecentId(prev, id, 6));
  }, []);

  const clearRecent = useCallback(() => {
    setRecentlyViewedIds([]);
  }, []);

  const submitEnquiry = useCallback(
    (input: EnquiryFormInput): EnquiryRecord => {
      const record: EnquiryRecord = {
        ...input,
        id: `ENQ-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
      };
      setEnquiries((prev) => [record, ...prev]);
      const matchedPG = input.pgId
        ? listings.find((p) => p.id === input.pgId)
        : undefined;
      void saveEnquiryToFirestore(record, matchedPG?.area ?? 'Law Gate').catch(
        (err) => {
          console.error('Could not sync enquiry to Firestore:', err);
        },
      );
      return record;
    },
    [listings, saveEnquiryToFirestore],
  );

  const submitTourBooking = useCallback(
    (input: TourGuideBookingInput): TourGuideBookingRecord => {
      const record: TourGuideBookingRecord = {
        ...input,
        id: `TOUR-${Date.now().toString().slice(-6)}`,
        feeInr: TOUR_GUIDE_FEE_INR,
        createdAt: new Date().toISOString(),
      };
      setTourBookings((prev) => [record, ...prev]);
      void saveTourBookingToFirestore(record).catch((err) => {
        console.error('Could not sync tour booking to Firestore:', err);
      });
      return record;
    },
    [saveTourBookingToFirestore],
  );

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const openTourModal = useCallback((ctx: TourModalContext = {}) => {
    setTourModalContext(ctx);
    setIsTourModalOpen(true);
  }, []);
  const closeTourModal = useCallback(() => setIsTourModalOpen(false), []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      savedIds,
      recentlyViewedIds,
      enquiries,
      tourBookings,
      isSaved,
      toggleSaved,
      recordView,
      clearRecent,
      submitEnquiry,
      submitTourBooking,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      isTourModalOpen,
      tourModalContext,
      openTourModal,
      closeTourModal,
    }),
    [
      savedIds,
      recentlyViewedIds,
      enquiries,
      tourBookings,
      isSaved,
      toggleSaved,
      recordView,
      clearRecent,
      submitEnquiry,
      submitTourBooking,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      isTourModalOpen,
      tourModalContext,
      openTourModal,
      closeTourModal,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}
