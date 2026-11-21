import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Compass,
  Maximize2,
  QrCode,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import {
  BRAND_LOGO_URL,
  TOUR_GUIDE_FEE_INR,
  TOUR_GUIDE_QR_URL,
} from '../data/pgListings';
import { usePreferences } from '../context/PreferencesContext';
import type {
  LocationArea,
  TourGuideBookingRecord,
  TourGuideValidationErrors,
} from '../types/pg';
import { validateTourGuideForm } from '../utils/pgFilters';

export function TourGuideModal() {
  const {
    isTourModalOpen,
    tourModalContext,
    closeTourModal,
    submitTourBooking,
  } = usePreferences();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState<LocationArea>('Law Gate');
  const [pgName, setPgName] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<TourGuideValidationErrors>({});
  const [confirmed, setConfirmed] = useState<TourGuideBookingRecord | null>(
    null,
  );
  const [qrExpanded, setQrExpanded] = useState(false);

  useEffect(() => {
    if (isTourModalOpen) {
      setArea(tourModalContext.area ?? 'Law Gate');
      setPgName(tourModalContext.pgName ?? '');
      setConfirmed(null);
      setErrors({});
      setQrExpanded(false);
    }
  }, [isTourModalOpen, tourModalContext]);

  useEffect(() => {
    if (!isTourModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (qrExpanded) {
          setQrExpanded(false);
        } else {
          closeTourModal();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTourModalOpen, qrExpanded, closeTourModal]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateTourGuideForm({
      name,
      phone,
      area,
      preferredDate,
      utrNumber,
      pgName: pgName.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const record = submitTourBooking({
      name: name.trim(),
      phone: phone.trim(),
      area,
      preferredDate,
      utrNumber: utrNumber.trim(),
      pgName: pgName.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setConfirmed(record);
    setName('');
    setPhone('');
    setPreferredDate('');
    setUtrNumber('');
    setNotes('');
  };

  return (
    <AnimatePresence>
      {isTourModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Book Find My PG Tour Guide — ₹99"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close Tour Guide booking modal"
            onClick={closeTourModal}
            className="fixed inset-0 bg-[#0B1533]/70 cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-4xl bg-[#FFFFFF] border border-[#DDE3F0] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            {/* Header Bar */}
            <div className="px-6 py-4 bg-[#0B1533] text-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-white rounded-lg px-2 py-1 shrink-0">
                  <img
                    src={BRAND_LOGO_URL}
                    alt="Find My PG"
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold leading-tight truncate">
                    Personal PG Tour Guide Service
                  </h2>
                  <p className="text-xs text-[#C7D2FE]">
                    Provided directly by the Find My PG Team · Fee ₹
                    {TOUR_GUIDE_FEE_INR}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeTourModal}
                aria-label="Close Tour Guide modal"
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-7 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: UPI QR Code & ₹99 Charge Details */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl bg-[#0B1533] text-white p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-[#93C5FD]">
                        Tour Guide Fee
                      </p>
                      <p className="font-mono text-3xl font-bold tabular-nums mt-0.5">
                        ₹{TOUR_GUIDE_FEE_INR}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-300">
                      <p className="font-semibold text-white">One-Time Visit</p>
                      <p>Scan with any UPI App</p>
                    </div>
                  </div>

                  {/* Exact Attached UPI QR Code */}
                  <div className="relative rounded-xl overflow-hidden bg-[#191C1E] border border-white/15 p-2">
                    <img
                      src={TOUR_GUIDE_QR_URL}
                      alt="UPI QR Code to pay ₹99 for Find My PG Tour Guide"
                      data-testid="tour-guide-qr-image"
                      className="w-full aspect-square object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setQrExpanded(true)}
                      aria-label="Zoom UPI QR Code full screen"
                      className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/12 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Open Full-Size QR Code</span>
                    </button>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-200 pt-1">
                    <li className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-[#93C5FD] shrink-0 mt-0.5" />
                      <span>
                        Our local team member escorts you to PGs in Law Gate,
                        Phagwara, or Jalandhar.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Compass className="w-4 h-4 text-[#93C5FD] shrink-0 mt-0.5" />
                      <span>
                        Inspect real rooms, check distance to campus gate, and
                        meet owners directly.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#93C5FD] shrink-0 mt-0.5" />
                      <span>
                        Pay ₹{TOUR_GUIDE_FEE_INR} via UPI QR and enter your UTR
                        ID to confirm your slot.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Booking Confirmation Form */}
              <div className="lg:col-span-7">
                {confirmed ? (
                  <div
                    role="status"
                    data-testid="tour-booking-confirmation"
                    className="rounded-2xl bg-[#EEF3FF] border border-[#BFDBFE] p-6 space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#1D4ED8] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-display text-xl font-bold text-[#0B1533]">
                          Tour Guide Request Confirmed
                        </h3>
                        <p className="text-sm text-[#4C5876] mt-1 leading-relaxed">
                          Thank you,{' '}
                          <span className="font-semibold text-[#0B1533]">
                            {confirmed.name}
                          </span>
                          . Our Find My PG Tour Guide team will reach out on{' '}
                          <span className="font-mono font-semibold text-[#0B1533]">
                            {confirmed.phone}
                          </span>{' '}
                          to coordinate your visit in{' '}
                          <span className="font-semibold text-[#0B1533]">
                            {confirmed.area}
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 pt-3 border-t border-[#CBD5F5] text-xs">
                      <div>
                        <dt className="text-[#4C5876]">Booking Reference</dt>
                        <dd className="font-mono font-bold text-[#0B1533] mt-0.5">
                          {confirmed.id}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4C5876]">Tour Charge Paid</dt>
                        <dd className="font-mono font-bold text-[#1D4ED8] mt-0.5">
                          ₹{confirmed.feeInr} (UTR: {confirmed.utrNumber})
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4C5876]">Preferred Visit Date</dt>
                        <dd className="font-semibold text-[#0B1533] mt-0.5">
                          {confirmed.preferredDate}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4C5876]">Target Area / PG</dt>
                        <dd className="font-semibold text-[#0B1533] mt-0.5">
                          {confirmed.pgName
                            ? `${confirmed.pgName} (${confirmed.area})`
                            : confirmed.area}
                        </dd>
                      </div>
                    </dl>

                    <div className="pt-2 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => setConfirmed(null)}
                        className="px-4 py-2 text-xs font-semibold text-[#1D4ED8] bg-white border border-[#BFDBFE] hover:bg-[#F5F7FC] rounded-lg transition-colors cursor-pointer"
                      >
                        Book Another Tour
                      </button>
                      <button
                        type="button"
                        onClick={closeTourModal}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1539A8] rounded-lg transition-colors cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-4"
                  >
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D28D9]">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Step 1: Scan ₹99 QR · Step 2: Confirm Details</span>
                      </div>
                      <h3 className="mt-1 font-display text-xl font-bold text-[#0B1533]">
                        Schedule Your Guided PG Visit
                      </h3>
                      <p className="text-sm text-[#4C5876] mt-1">
                        After paying ₹{TOUR_GUIDE_FEE_INR} via the UPI QR code,
                        submit your details below so our team assigns your Tour
                        Guide.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="tour-name"
                          className="block text-xs font-semibold text-[#0B1533] mb-1.5"
                        >
                          Student Name *
                        </label>
                        <input
                          id="tour-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          aria-invalid={Boolean(errors.name)}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                        />
                        {errors.name && (
                          <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="tour-phone"
                          className="block text-xs font-semibold text-[#0B1533] mb-1.5"
                        >
                          WhatsApp / Mobile Number *
                        </label>
                        <input
                          id="tour-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          aria-invalid={Boolean(errors.phone)}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                        />
                        {errors.phone && (
                          <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="tour-area"
                          className="block text-xs font-semibold text-[#0B1533] mb-1.5"
                        >
                          Tour Area *
                        </label>
                        <select
                          id="tour-area"
                          value={area}
                          onChange={(e) =>
                            setArea(e.target.value as LocationArea)
                          }
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] cursor-pointer"
                        >
                          <option value="Law Gate">LPU Law Gate</option>
                          <option value="Phagwara">Phagwara</option>
                          <option value="Jalandhar">Jalandhar</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="tour-date"
                          className="block text-xs font-semibold text-[#0B1533] mb-1.5"
                        >
                          Preferred Visit Date *
                        </label>
                        <input
                          id="tour-date"
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          aria-invalid={Boolean(errors.preferredDate)}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                        />
                        {errors.preferredDate && (
                          <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                            {errors.preferredDate}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="tour-pg-name"
                          className="block text-xs font-semibold text-[#0B1533] mb-1.5"
                        >
                          Specific PG (Optional)
                        </label>
                        <input
                          id="tour-pg-name"
                          type="text"
                          value={pgName}
                          onChange={(e) => setPgName(e.target.value)}
                          placeholder="e.g. Dreams PG, GM PG Room"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="tour-utr"
                          className="block text-xs font-semibold text-[#0B1533] mb-1.5"
                        >
                          UPI Transaction / UTR ID *
                        </label>
                        <input
                          id="tour-utr"
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="Enter 12-digit UTR after ₹99 payment"
                          aria-invalid={Boolean(errors.utrNumber)}
                          className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8]"
                        />
                        {errors.utrNumber && (
                          <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
                            {errors.utrNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="tour-notes"
                        className="block text-xs font-semibold text-[#0B1533] mb-1.5"
                      >
                        Preferences or Timing Notes (Optional)
                      </label>
                      <textarea
                        id="tour-notes"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Morning 11 AM visit, looking for boys / girls PG near Law Gate"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] focus:bg-white focus:border-[#1D4ED8] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] text-white text-sm font-semibold transition-all shadow-md cursor-pointer"
                    >
                      Confirm Tour Guide Booking (₹{TOUR_GUIDE_FEE_INR} Paid)
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>

          {/* Full-Size QR Zoom Lightbox */}
          {qrExpanded && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Full-size ₹99 UPI QR Code"
              className="fixed inset-0 z-[60] bg-[#0B1533]/92 flex flex-col items-center justify-center p-6"
            >
              <button
                type="button"
                onClick={() => setQrExpanded(false)}
                aria-label="Close full-size QR code"
                className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="bg-[#191C1E] p-4 rounded-2xl border border-white/20 max-w-sm w-full">
                <img
                  src={TOUR_GUIDE_QR_URL}
                  alt="Full-size UPI QR Code for ₹99 Find My PG Tour Guide"
                  className="w-full h-auto rounded-xl"
                />
                <p className="text-center text-sm font-semibold text-white mt-3">
                  Find My PG Tour Guide · Pay ₹{TOUR_GUIDE_FEE_INR} via UPI
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
