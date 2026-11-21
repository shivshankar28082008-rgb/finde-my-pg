import test from 'node:test';
import assert from 'node:assert/strict';
import { PG_LISTINGS } from '../data/pgListings';
import {
  ADMIN_PANEL_ID,
  firestoreDocToPGListing,
  mergeListingsWithSeed,
  slugifyPGName,
  validateAdminPGForm,
  verifyAdminPanelId,
} from './adminUtils';

test('verifyAdminPanelId strictly unlocks only with 8969288', () => {
  assert.equal(ADMIN_PANEL_ID, '8969288');
  assert.equal(verifyAdminPanelId('8969288'), true);
  assert.equal(verifyAdminPanelId(' 8969288 '), true);
  assert.equal(verifyAdminPanelId('1234567'), false);
  assert.equal(verifyAdminPanelId(''), false);
  assert.equal(verifyAdminPanelId('89692880'), false);
});

test('slugifyPGName generates blueprint-compliant lowercase slugs', () => {
  const slug = slugifyPGName('Royal Campus View P.G. #1!');
  assert.equal(slug, 'royal-campus-view-p-g-1');
  assert.match(slug, /^[a-z0-9-]+$/);
});

test('validateAdminPGForm enforces blueprint schema constraints', () => {
  const invalidErrors = validateAdminPGForm({
    name: 'A',
    area: 'Law Gate',
    city: 'Phagwara',
    address: '123',
    propertyType: 'PG Accommodation',
    genderCategory: 'Boys',
    phone: '123',
    ratingCount: '-5',
    website: 'not-a-url',
    image: 'bad-url',
    featured: false,
    recentlyAdded: true,
  });

  assert.ok(invalidErrors.name);
  assert.ok(invalidErrors.address);
  assert.ok(invalidErrors.image);
  assert.ok(invalidErrors.phone);
  assert.ok(invalidErrors.ratingCount);
  assert.ok(invalidErrors.website);

  const validErrors = validateAdminPGForm({
    name: 'Campus Crown PG',
    area: 'Law Gate',
    city: 'Phagwara',
    address: 'Plot 22, Simar Enclave, Near LPU Law Gate, Phagwara, Punjab 144411',
    propertyType: 'PG Accommodation',
    genderCategory: 'Co-living',
    phone: '098765 43210',
    ratingCount: '25',
    website: 'https://campuscrown.example.com',
    image: 'https://i.ibb.co/cKBGfNbt/pg1.png',
    featured: true,
    recentlyAdded: true,
  });

  assert.deepEqual(validErrors, {});
});

test('mergeListingsWithSeed merges Firestore listings cleanly with initial 10 PGs', () => {
  const cloudPG = firestoreDocToPGListing({
    id: 'pg-cloud-11',
    slug: 'skyline-student-pg',
    name: 'Skyline Student PG',
    area: 'Law Gate',
    city: 'Phagwara',
    state: 'Punjab',
    address: 'Plot 45, Law Gate Road, Phagwara, Punjab 144411',
    propertyType: 'PG Accommodation',
    genderCategory: 'Boys',
    phone: '098765 00001',
    ratingCount: 18,
    image: 'https://i.ibb.co/cKBGfNbt/pg1.png',
    featured: true,
    recentlyAdded: true,
    addedOrder: 20,
    isPublished: true,
    createdByUid: 'admin-uid-1',
  });

  const merged = mergeListingsWithSeed(PG_LISTINGS, [cloudPG]);
  assert.equal(merged.length, 11);
  assert.equal(merged[0].id, 'pg-cloud-11');
  assert.equal(merged[0].genderLabel, 'Boys');
});
