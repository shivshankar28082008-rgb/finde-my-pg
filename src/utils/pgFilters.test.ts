import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_LOGO_URL,
  LOCATION_HUBS,
  PG_LISTINGS,
  TOUR_GUIDE_FEE_INR,
  TOUR_GUIDE_QR_URL,
} from '../data/pgListings';
import {
  buildGoogleMapsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  DEFAULT_FILTERS,
  filterAndSortPGs,
  formatPGZoneMeta,
  hasActiveFilters,
  normalizeIndianPhone,
  parseStoredIds,
  pushRecentId,
  toggleIdInList,
  validateEnquiryForm,
  validateTourGuideForm,
} from './pgFilters';

test('dataset includes all 10 required PG listings with exact provided images', () => {
  assert.equal(PG_LISTINGS.length, 10);
  for (const pg of PG_LISTINGS) {
    assert.ok(pg.image.startsWith('https://'), `${pg.name} must have provided https image`);
    assert.ok(pg.address.length > 10, `${pg.name} must have complete address`);
  }
  const nest = PG_LISTINGS.find((pg) => pg.slug === 'phase-3-the-nest-pg');
  assert.ok(nest);
  assert.equal(nest.phone, undefined);
  assert.equal(nest.ratingCount, undefined);

  const gm = PG_LISTINGS.find((pg) => pg.slug === 'gm-pg-room');
  assert.ok(gm);
  assert.equal(gm.ratingCount, 134);
  assert.ok(gm.bookingForm?.includes('docs.google.com/forms'));
});

test('filterAndSortPGs filters by location area accurately', () => {
  const lawGate = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    location: 'Law Gate',
  });
  assert.equal(lawGate.length, 4);

  const phagwara = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    location: 'Phagwara',
  });
  assert.equal(phagwara.length, 3);

  const jalandhar = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    location: 'Jalandhar',
  });
  assert.equal(jalandhar.length, 3);
});

test('filterAndSortPGs filters by search query, gender, property type, and city', () => {
  const byName = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    query: 'sardar',
  });
  assert.equal(byName.length, 2);

  const byAddress = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    query: 'Model Town',
  });
  assert.equal(byAddress.length, 1);
  assert.equal(byAddress[0].slug, 'pg-in-jalandhar');

  const boys = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    gender: 'Boys',
  });
  assert.equal(boys.length, 3);

  const girls = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    gender: 'Girls',
  });
  assert.equal(girls.length, 2);

  const coliving = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    gender: 'Co-living',
  });
  assert.equal(coliving.length, 2);

  const hostels = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    propertyType: 'Hostel',
  });
  assert.equal(hostels.length, 1);
  assert.equal(hostels[0].slug, 'satyam-pg-boys-hostel');

  const cityJalandhar = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    city: 'Jalandhar',
  });
  assert.equal(cityJalandhar.length, 3);
});

test('filterAndSortPGs sorts by name ascending, descending, and reviews', () => {
  const asc = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    sortBy: 'name-asc',
  });
  assert.equal(asc[0].name, 'Chawla PG Boys and Girls');

  const desc = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    sortBy: 'name-desc',
  });
  assert.equal(desc[0].name, 'The Grand Sardar PG');

  const byReviews = filterAndSortPGs(PG_LISTINGS, {
    ...DEFAULT_FILTERS,
    sortBy: 'reviews-desc',
  });
  assert.equal(byReviews[0].slug, 'satyam-pg-boys-hostel');
  assert.equal(byReviews[0].ratingCount, 153);
});

test('Google Maps, Phone, and WhatsApp URL builders format links accurately', () => {
  const mapsUrl = buildGoogleMapsUrl('Football Chowk, Vijay Nagar, Jalandhar, Punjab 144001.');
  assert.equal(
    mapsUrl,
    'https://www.google.com/maps/search/?api=1&query=Football%20Chowk%2C%20Vijay%20Nagar%2C%20Jalandhar%2C%20Punjab%20144001.',
  );

  assert.equal(normalizeIndianPhone('088474 65393'), '918847465393');
  assert.equal(buildTelUrl('088474 65393'), 'tel:08847465393');
  assert.ok(
    buildWhatsAppUrl('088474 65393', 'Dreams PG').startsWith(
      'https://wa.me/918847465393?text=',
    ),
  );
});

test('localStorage helpers and active filter detection work safely', () => {
  assert.deepEqual(parseStoredIds('["pg-1","pg-2"]'), ['pg-1', 'pg-2']);
  assert.deepEqual(parseStoredIds('invalid-json'), []);
  assert.deepEqual(toggleIdInList(['pg-1'], 'pg-2'), ['pg-2', 'pg-1']);
  assert.deepEqual(toggleIdInList(['pg-2', 'pg-1'], 'pg-2'), ['pg-1']);
  assert.deepEqual(pushRecentId(['pg-1', 'pg-2'], 'pg-2', 3), ['pg-2', 'pg-1']);
  assert.equal(hasActiveFilters(DEFAULT_FILTERS), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTERS, query: 'nest' }), true);
});

test('validateEnquiryForm enforces required inputs and catches invalid formats', () => {
  const emptyErrors = validateEnquiryForm({
    name: '',
    phone: '',
    email: 'bad-email',
    message: 'hi',
  });
  assert.ok(emptyErrors.name);
  assert.ok(emptyErrors.phone);
  assert.ok(emptyErrors.email);
  assert.ok(emptyErrors.message);

  const validErrors = validateEnquiryForm({
    name: 'Aarav Sharma',
    phone: '9876543210',
    email: 'aarav@example.com',
    message: 'Looking for a single room near Law Gate starting next semester.',
  });
  assert.deepEqual(validErrors, {});
});

test('formatPGZoneMeta avoids redundant city repetition', () => {
  assert.equal(
    formatPGZoneMeta({ area: 'Law Gate', city: 'Phagwara' }),
    'Law Gate · Phagwara',
  );
  assert.equal(
    formatPGZoneMeta({ area: 'Phagwara', city: 'Phagwara' }),
    'Phagwara · Punjab',
  );
  assert.equal(
    formatPGZoneMeta({ area: 'Jalandhar', city: 'Jalandhar' }),
    'Jalandhar · Punjab',
  );
});

test('location hubs use only real PG images and brand assets are wired', () => {
  const realPgImages = new Set(PG_LISTINGS.map((pg) => pg.image));
  for (const hub of LOCATION_HUBS) {
    assert.ok(
      realPgImages.has(hub.image),
      `${hub.displayTitle} must use a real PG listing photograph`,
    );
  }
  assert.ok(BRAND_LOGO_URL.startsWith('/assets/aistudio/'));
  assert.ok(TOUR_GUIDE_QR_URL.startsWith('/assets/aistudio/'));
  assert.equal(TOUR_GUIDE_FEE_INR, 99);
});

test('validateTourGuideForm validates required booking and UPI UTR fields', () => {
  const invalid = validateTourGuideForm({
    name: '',
    phone: '123',
    area: 'Law Gate',
    preferredDate: '',
    utrNumber: '123',
  });
  assert.ok(invalid.name);
  assert.ok(invalid.phone);
  assert.ok(invalid.preferredDate);
  assert.ok(invalid.utrNumber);

  const valid = validateTourGuideForm({
    name: 'Ananya Singh',
    phone: '9876543210',
    area: 'Law Gate',
    preferredDate: '2026-11-25',
    utrNumber: '432981234567',
    pgName: 'Dreams PG',
  });
  assert.deepEqual(valid, {});
});


