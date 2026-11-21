# Find My PG — Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Default Deny**: Every unspecified path under `/databases/{database}/documents` is explicitly denied (`allow read, write: if false`).
2. **Admin-Only Catalog Mutations**: Only verified administrators (`request.auth != null && request.auth.token.email_verified == true` AND either bootstrapped owner email `shivshankar28082008@gmail.com` or an existing `/admins/{uid}` record) may `create`, `update`, or `delete` documents in `/pg_listings/{pgId}`.
3. **Public Published Catalog Query**: Unauthenticated or standard users may only `get` or `list` `/pg_listings/{pgId}` documents where `resource.data.isPublished == true`, preventing exposure of unpublished drafts.
4. **PII Isolation**: `/enquiries/{enquiryId}` and `/tour_bookings/{bookingId}` contain student phone numbers, emails, and UPI UTR numbers. `get`, `list`, `update`, and `delete` are strictly restricted to `isAdmin()`. No blanket `isSignedIn()` reads exist.
5. **No Privilege Escalation**: `/admins/{adminId}` denies all client `create`, `update`, and `delete` requests.
6. **Temporal Integrity & Immutability**: `createdAt` must equal `request.time` on create and remain immutable (`incoming().createdAt == existing().createdAt`) on update; `updatedAt` must equal `request.time` on create and update. `createdByUid` on `pg_listings` must equal `request.auth.uid` on create and remain immutable on update.
7. **Strict Schema & Volumetric Guards**: Every string field has explicit `.size()` bounds matching `firebase-blueprint.json`; document IDs match `^[a-zA-Z0-9_-]+$` (`<= 128` chars); shadow/ghost fields are rejected via `keys().hasOnly(...)` and `affectedKeys().hasOnly(...)`.
8. **Terminal State Locking**: Once an enquiry reaches `status == 'closed'` or a tour booking reaches `status == 'completed'`, non-admin updates are impossible (and only `isAdmin()` can update statuses with strict schema validation).

## 2. The "Dirty Dozen" Attack Payloads (All Must Fail with PERMISSION_DENIED)
1. **Unauthenticated PG Create**: Anonymous actor creates `/pg_listings/evil-pg`.
2. **Unverified Admin Email Spoof**: User with `email: 'shivshankar28082008@gmail.com'` and `email_verified: false` tries to create a PG.
3. **Shadow Field Injection on PG Create**: Admin tries to write `/pg_listings/pg-1` with ghost field `isVerifiedBySystem: true`.
4. **Identity Spoofing on PG Create**: Admin tries to set `createdByUid: 'another-uid'` instead of `request.auth.uid`.
5. **ID Poisoning**: Admin attempts to write `/pg_listings/bad$id..with spaces` or a 150-char document ID.
6. **Value Poisoning / Resource Exhaustion**: Admin attempts to write a 2000-character `name` or invalid `area: 'Mars'`.
7. **Timestamp Forgery**: Actor attempts to create an enquiry with a client-forged `createdAt` timestamp instead of `request.time`.
8. **PII Blanket Read on Enquiries**: Authenticated non-admin attempts `get` or `list` on `/enquiries`.
9. **PII Blanket Read on Tour Bookings**: Authenticated non-admin attempts `get` or `list` on `/tour_bookings`.
10. **Status Shortcutting on Tour Booking Create**: Public visitor tries to create a tour booking with `status: 'confirmed'` instead of `status: 'pending'`, or `feeInr: 0` instead of `99`.
11. **Admin Privilege Escalation**: Authenticated user tries to create `/admins/{theirUid}` with `role: 'admin'`.
12. **Immutable Field Tampering**: Admin attempts to update `pg_listings/{pgId}` while mutating `createdAt` or `createdByUid`.
