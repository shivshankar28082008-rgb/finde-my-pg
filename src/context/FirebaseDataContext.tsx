import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { LOCATION_HUBS, PG_LISTINGS, TOUR_GUIDE_FEE_INR } from '../data/pgListings';
import type {
  EnquiryRecord,
  LocationArea,
  LocationHub,
  PGListing,
  TourGuideBookingRecord,
} from '../types/pg';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  firestoreDocToPGListing,
  mapListingToGenderCategory,
  mergeListingsWithSeed,
  slugifyPGName,
  type AdminPGFormInput,
  type FirestorePGDoc,
} from '../utils/adminUtils';

export type EnquiryStatus = 'pending' | 'contacted' | 'closed';
export type TourBookingStatus = 'pending' | 'confirmed' | 'completed';

export interface CloudEnquiryDoc {
  id: string;
  name: string;
  phone: string;
  email?: string;
  preferredArea: LocationArea;
  pgId?: string;
  pgName?: string;
  message: string;
  status: EnquiryStatus;
  createdAtIso: string;
}

export interface CloudTourBookingDoc {
  id: string;
  name: string;
  phone: string;
  area: LocationArea;
  pgName?: string;
  preferredDate: string;
  utrNumber: string;
  feeInr: number;
  notes?: string;
  status: TourBookingStatus;
  createdAtIso: string;
}

interface FirebaseDataContextValue {
  user: User | null;
  authReady: boolean;
  isFirebaseAdmin: boolean;
  authError: string | null;
  signInAdminWithGoogle: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  listings: PGListing[];
  cloudListingIds: string[];
  listingsSynced: boolean;
  getBySlug: (slug: string) => PGListing | undefined;
  getByIds: (ids: string[]) => PGListing[];
  getFeatured: () => PGListing[];
  getRecentlyAdded: () => PGListing[];
  getRelatedByArea: (current: PGListing, limit?: number) => PGListing[];
  getLocationHubs: () => Array<
    LocationHub & { count: number; listings: PGListing[] }
  >;
  createPGListing: (input: AdminPGFormInput) => Promise<PGListing>;
  updatePGListing: (id: string, input: AdminPGFormInput) => Promise<void>;
  deletePGListing: (id: string) => Promise<void>;
  seedInitialPGsToFirestore: () => Promise<number>;
  saveEnquiryToFirestore: (
    record: EnquiryRecord,
    area?: LocationArea,
  ) => Promise<void>;
  saveTourBookingToFirestore: (record: TourGuideBookingRecord) => Promise<void>;
  cloudEnquiries: CloudEnquiryDoc[];
  cloudTourBookings: CloudTourBookingDoc[];
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  updateTourBookingStatus: (
    id: string,
    status: TourBookingStatus,
  ) => Promise<void>;
}

const FirebaseDataContext = createContext<FirebaseDataContextValue | null>(
  null,
);

function timestampToIso(value: unknown): string {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as Timestamp).toDate === 'function'
  ) {
    return (value as Timestamp).toDate().toISOString();
  }
  return new Date().toISOString();
}

export function FirebaseDataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [cloudListings, setCloudListings] = useState<PGListing[]>([]);
  const [listingsSynced, setListingsSynced] = useState(false);
  const [cloudEnquiries, setCloudEnquiries] = useState<CloudEnquiryDoc[]>([]);
  const [cloudTourBookings, setCloudTourBookings] = useState<
    CloudTourBookingDoc[]
  >([]);

  // Track Firebase Auth state & verify admin role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError(null);

      if (!currentUser) {
        setIsFirebaseAdmin(false);
        setAuthReady(true);
        return;
      }

      if (
        currentUser.emailVerified &&
        currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL
      ) {
        setIsFirebaseAdmin(true);
        setAuthReady(true);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
        setIsFirebaseAdmin(Boolean(currentUser.emailVerified && adminSnap.exists()));
      } catch {
        setIsFirebaseAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to published public PG listings in Firestore
  useEffect(() => {
    const pgQuery = query(
      collection(db, 'pg_listings'),
      where('isPublished', '==', true),
    );
    const unsubscribe = onSnapshot(
      pgQuery,
      (snapshot) => {
        const docs: PGListing[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FirestorePGDoc;
          if (data && data.id && data.name) {
            docs.push(firestoreDocToPGListing(data));
          }
        });
        setCloudListings(docs);
        setListingsSynced(true);
      },
      (error) => {
        console.warn('Firestore public listings listener warning:', error.message);
        setListingsSynced(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Admin-only listeners for PII collections (enquiries & tour_bookings)
  useEffect(() => {
    if (!authReady || !isFirebaseAdmin) {
      setCloudEnquiries([]);
      setCloudTourBookings([]);
      return;
    }

    const unsubEnquiries = onSnapshot(
      collection(db, 'enquiries'),
      (snapshot) => {
        const rows: CloudEnquiryDoc[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          rows.push({
            id: String(d.id ?? docSnap.id),
            name: String(d.name ?? ''),
            phone: String(d.phone ?? ''),
            email: typeof d.email === 'string' && d.email ? d.email : undefined,
            preferredArea: (d.preferredArea as LocationArea) ?? 'Law Gate',
            pgId: typeof d.pgId === 'string' && d.pgId ? d.pgId : undefined,
            pgName:
              typeof d.pgName === 'string' && d.pgName ? d.pgName : undefined,
            message: String(d.message ?? ''),
            status: (d.status as EnquiryStatus) ?? 'pending',
            createdAtIso: timestampToIso(d.createdAt),
          });
        });
        rows.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
        setCloudEnquiries(rows);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'enquiries');
      },
    );

    const unsubTours = onSnapshot(
      collection(db, 'tour_bookings'),
      (snapshot) => {
        const rows: CloudTourBookingDoc[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          rows.push({
            id: String(d.id ?? docSnap.id),
            name: String(d.name ?? ''),
            phone: String(d.phone ?? ''),
            area: (d.area as LocationArea) ?? 'Law Gate',
            pgName:
              typeof d.pgName === 'string' && d.pgName ? d.pgName : undefined,
            preferredDate: String(d.preferredDate ?? ''),
            utrNumber: String(d.utrNumber ?? ''),
            feeInr: Number(d.feeInr ?? TOUR_GUIDE_FEE_INR),
            notes: typeof d.notes === 'string' && d.notes ? d.notes : undefined,
            status: (d.status as TourBookingStatus) ?? 'pending',
            createdAtIso: timestampToIso(d.createdAt),
          });
        });
        rows.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
        setCloudTourBookings(rows);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tour_bookings');
      },
    );

    return () => {
      unsubEnquiries();
      unsubTours();
    };
  }, [authReady, isFirebaseAdmin]);

  const listings = useMemo(
    () => mergeListingsWithSeed(PG_LISTINGS, cloudListings),
    [cloudListings],
  );

  const cloudListingIds = useMemo(
    () => cloudListings.map((item) => item.id),
    [cloudListings],
  );

  const signInAdminWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Google sign-in could not be completed.';
      setAuthError(msg);
      throw error;
    }
  }, []);

  const signOutAdmin = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const createPGListing = useCallback(
    async (input: AdminPGFormInput): Promise<PGListing> => {
      const currentUser = auth.currentUser;
      if (!currentUser || !isFirebaseAdmin) {
        throw new Error(
          'Please sign in with your verified Admin Google account to publish PGs to Firebase.',
        );
      }

      const id = `pg-${Date.now()}`;
      const baseSlug = slugifyPGName(input.name);
      const slugExists = listings.some((p) => p.slug === baseSlug);
      const slug = slugExists
        ? `${baseSlug}-${Date.now().toString().slice(-4)}`
        : baseSlug;

      const maxOrder = listings.reduce(
        (max, item) => Math.max(max, item.addedOrder),
        10,
      );

      const payload: Record<string, unknown> = {
        id,
        slug,
        name: input.name.trim().slice(0, 120),
        area: input.area,
        city: input.city,
        state: 'Punjab',
        address: input.address.trim().slice(0, 320),
        propertyType: input.propertyType,
        genderCategory: input.genderCategory,
        image: input.image.trim().slice(0, 1000),
        featured: Boolean(input.featured),
        recentlyAdded: Boolean(input.recentlyAdded),
        addedOrder: maxOrder + 1,
        isPublished: true,
        createdByUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const trimmedPhone = input.phone.trim();
      if (trimmedPhone) {
        payload.phone = trimmedPhone.slice(0, 32);
      }
      const trimmedWebsite = input.website.trim();
      if (trimmedWebsite) {
        payload.website = trimmedWebsite.slice(0, 300);
      }
      const ratingRaw = input.ratingCount.trim();
      if (ratingRaw) {
        const parsed = Number.parseInt(ratingRaw, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          payload.ratingCount = parsed;
        }
      }

      const path = `pg_listings/${id}`;
      try {
        await setDoc(doc(db, 'pg_listings', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      return firestoreDocToPGListing({
        id,
        slug,
        name: payload.name as string,
        area: input.area,
        city: input.city,
        state: 'Punjab',
        address: payload.address as string,
        propertyType: input.propertyType,
        genderCategory: input.genderCategory,
        phone: (payload.phone as string | undefined) ?? undefined,
        ratingCount: (payload.ratingCount as number | undefined) ?? undefined,
        website: (payload.website as string | undefined) ?? undefined,
        image: payload.image as string,
        featured: Boolean(input.featured),
        recentlyAdded: Boolean(input.recentlyAdded),
        addedOrder: maxOrder + 1,
        isPublished: true,
        createdByUid: currentUser.uid,
      });
    },
    [isFirebaseAdmin, listings],
  );

  const updatePGListing = useCallback(
    async (id: string, input: AdminPGFormInput): Promise<void> => {
      const currentUser = auth.currentUser;
      if (!currentUser || !isFirebaseAdmin) {
        throw new Error(
          'Please sign in with your verified Admin Google account to update PG listings.',
        );
      }

      const existing = listings.find((item) => item.id === id);
      const isInCloud = cloudListingIds.includes(id);

      const baseSlug = existing?.slug || slugifyPGName(input.name);
      const trimmedPhone = input.phone.trim();
      const trimmedWebsite = input.website.trim();
      const ratingRaw = input.ratingCount.trim();
      const parsedRating =
        ratingRaw.length > 0 ? Number.parseInt(ratingRaw, 10) : undefined;

      const path = `pg_listings/${id}`;

      if (!isInCloud) {
        // Seed record not yet in Firestore: create document with matching ID
        const createPayload: Record<string, unknown> = {
          id,
          slug: baseSlug,
          name: input.name.trim().slice(0, 120),
          area: input.area,
          city: input.city,
          state: 'Punjab',
          address: input.address.trim().slice(0, 320),
          propertyType: input.propertyType,
          genderCategory: input.genderCategory,
          image: input.image.trim().slice(0, 1000),
          featured: Boolean(input.featured),
          recentlyAdded: Boolean(input.recentlyAdded),
          addedOrder: existing?.addedOrder ?? 11,
          isPublished: true,
          createdByUid: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (trimmedPhone) createPayload.phone = trimmedPhone.slice(0, 32);
        if (trimmedWebsite) createPayload.website = trimmedWebsite.slice(0, 300);
        if (parsedRating !== undefined && Number.isFinite(parsedRating)) {
          createPayload.ratingCount = parsedRating;
        }
        try {
          await setDoc(doc(db, 'pg_listings', id), createPayload);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
        return;
      }

      const updatePayload: Record<string, unknown> = {
        slug: baseSlug,
        name: input.name.trim().slice(0, 120),
        area: input.area,
        city: input.city,
        state: 'Punjab',
        address: input.address.trim().slice(0, 320),
        propertyType: input.propertyType,
        genderCategory: input.genderCategory,
        phone: trimmedPhone.slice(0, 32),
        website: trimmedWebsite.slice(0, 300),
        image: input.image.trim().slice(0, 1000),
        featured: Boolean(input.featured),
        recentlyAdded: Boolean(input.recentlyAdded),
        addedOrder: existing?.addedOrder ?? 11,
        isPublished: true,
        updatedAt: serverTimestamp(),
      };

      if (parsedRating !== undefined && Number.isFinite(parsedRating)) {
        updatePayload.ratingCount = parsedRating;
      }

      try {
        await updateDoc(doc(db, 'pg_listings', id), updatePayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [cloudListingIds, isFirebaseAdmin, listings],
  );

  const deletePGListing = useCallback(
    async (id: string): Promise<void> => {
      if (!auth.currentUser || !isFirebaseAdmin) {
        throw new Error(
          'Please sign in with your verified Admin Google account to delete listings.',
        );
      }
      const path = `pg_listings/${id}`;
      try {
        await deleteDoc(doc(db, 'pg_listings', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [isFirebaseAdmin],
  );

  const seedInitialPGsToFirestore = useCallback(async (): Promise<number> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !isFirebaseAdmin) {
      throw new Error(
        'Please sign in with your verified Admin Google account first.',
      );
    }

    let syncedCount = 0;
    for (const pg of PG_LISTINGS) {
      if (cloudListingIds.includes(pg.id)) continue;
      const payload: Record<string, unknown> = {
        id: pg.id,
        slug: pg.slug,
        name: pg.name,
        area: pg.area,
        city: pg.city,
        state: 'Punjab',
        address: pg.address,
        propertyType: pg.propertyType,
        genderCategory: mapListingToGenderCategory(pg),
        image: pg.image,
        featured: pg.featured,
        recentlyAdded: pg.recentlyAdded,
        addedOrder: pg.addedOrder,
        isPublished: true,
        createdByUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (pg.phone) payload.phone = pg.phone;
      if (typeof pg.ratingCount === 'number') {
        payload.ratingCount = pg.ratingCount;
      }
      if (pg.website) payload.website = pg.website;

      const path = `pg_listings/${pg.id}`;
      try {
        await setDoc(doc(db, 'pg_listings', pg.id), payload);
        syncedCount += 1;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
    return syncedCount;
  }, [cloudListingIds, isFirebaseAdmin]);

  const saveEnquiryToFirestore = useCallback(
    async (record: EnquiryRecord, area: LocationArea = 'Law Gate') => {
      const payload: Record<string, unknown> = {
        id: record.id,
        name: record.name.trim().slice(0, 100),
        phone: record.phone.trim().slice(0, 24),
        preferredArea: area,
        message: record.message.trim().slice(0, 1000),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (record.email.trim()) {
        payload.email = record.email.trim().slice(0, 120);
      }
      if (record.pgId) {
        payload.pgId = record.pgId.slice(0, 128);
      }
      if (record.pgName) {
        payload.pgName = record.pgName.slice(0, 120);
      }

      const path = `enquiries/${record.id}`;
      try {
        await setDoc(doc(db, 'enquiries', record.id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [],
  );

  const saveTourBookingToFirestore = useCallback(
    async (record: TourGuideBookingRecord) => {
      const payload: Record<string, unknown> = {
        id: record.id,
        name: record.name.trim().slice(0, 100),
        phone: record.phone.trim().slice(0, 24),
        area: record.area,
        preferredDate: record.preferredDate.trim().slice(0, 32),
        utrNumber: record.utrNumber.trim().slice(0, 40),
        feeInr: TOUR_GUIDE_FEE_INR,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (record.pgName?.trim()) {
        payload.pgName = record.pgName.trim().slice(0, 120);
      }
      if (record.notes?.trim()) {
        payload.notes = record.notes.trim().slice(0, 500);
      }

      const path = `tour_bookings/${record.id}`;
      try {
        await setDoc(doc(db, 'tour_bookings', record.id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [],
  );

  const updateEnquiryStatus = useCallback(
    async (id: string, status: EnquiryStatus) => {
      if (!auth.currentUser || !isFirebaseAdmin) return;
      const path = `enquiries/${id}`;
      try {
        await updateDoc(doc(db, 'enquiries', id), {
          status,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [isFirebaseAdmin],
  );

  const updateTourBookingStatus = useCallback(
    async (id: string, status: TourBookingStatus) => {
      if (!auth.currentUser || !isFirebaseAdmin) return;
      const path = `tour_bookings/${id}`;
      try {
        await updateDoc(doc(db, 'tour_bookings', id), {
          status,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [isFirebaseAdmin],
  );

  const getBySlug = useCallback(
    (slug: string) => listings.find((pg) => pg.slug === slug),
    [listings],
  );

  const getByIds = useCallback(
    (ids: string[]) => {
      const byId = new Map(listings.map((pg) => [pg.id, pg]));
      return ids
        .map((id) => byId.get(id))
        .filter((item): item is PGListing => Boolean(item));
    },
    [listings],
  );

  const getFeatured = useCallback(
    () => listings.filter((pg) => pg.featured),
    [listings],
  );

  const getRecentlyAdded = useCallback(
    () =>
      [...listings]
        .filter((pg) => pg.recentlyAdded)
        .sort((a, b) => b.addedOrder - a.addedOrder),
    [listings],
  );

  const getRelatedByArea = useCallback(
    (current: PGListing, limit = 3) => {
      const sameArea = listings.filter(
        (pg) => pg.id !== current.id && pg.area === current.area,
      );
      if (sameArea.length >= limit) {
        return sameArea.slice(0, limit);
      }
      const others = listings.filter(
        (pg) => pg.id !== current.id && pg.area !== current.area,
      );
      return [...sameArea, ...others].slice(0, limit);
    },
    [listings],
  );

  const getLocationHubs = useCallback(
    () =>
      LOCATION_HUBS.map((hub) => {
        const areaListings = listings.filter((pg) => pg.area === hub.area);
        return {
          ...hub,
          count: areaListings.length,
          listings: areaListings,
        };
      }),
    [listings],
  );

  const value = useMemo<FirebaseDataContextValue>(
    () => ({
      user,
      authReady,
      isFirebaseAdmin,
      authError,
      signInAdminWithGoogle,
      signOutAdmin,
      listings,
      cloudListingIds,
      listingsSynced,
      getBySlug,
      getByIds,
      getFeatured,
      getRecentlyAdded,
      getRelatedByArea,
      getLocationHubs,
      createPGListing,
      updatePGListing,
      deletePGListing,
      seedInitialPGsToFirestore,
      saveEnquiryToFirestore,
      saveTourBookingToFirestore,
      cloudEnquiries,
      cloudTourBookings,
      updateEnquiryStatus,
      updateTourBookingStatus,
    }),
    [
      user,
      authReady,
      isFirebaseAdmin,
      authError,
      signInAdminWithGoogle,
      signOutAdmin,
      listings,
      cloudListingIds,
      listingsSynced,
      getBySlug,
      getByIds,
      getFeatured,
      getRecentlyAdded,
      getRelatedByArea,
      getLocationHubs,
      createPGListing,
      updatePGListing,
      deletePGListing,
      seedInitialPGsToFirestore,
      saveEnquiryToFirestore,
      saveTourBookingToFirestore,
      cloudEnquiries,
      cloudTourBookings,
      updateEnquiryStatus,
      updateTourBookingStatus,
    ],
  );

  return (
    <FirebaseDataContext.Provider value={value}>
      {children}
    </FirebaseDataContext.Provider>
  );
}

export function useFirebaseData(): FirebaseDataContextValue {
  const ctx = useContext(FirebaseDataContext);
  if (!ctx) {
    throw new Error(
      'useFirebaseData must be used within FirebaseDataProvider',
    );
  }
  return ctx;
}
