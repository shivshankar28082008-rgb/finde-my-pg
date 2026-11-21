import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Compass, MapPin, MessageSquare, QrCode } from 'lucide-react';
import { EnquiryForm } from '../components/EnquiryForm';
import { usePreferences } from '../context/PreferencesContext';
import { TOUR_GUIDE_FEE_INR } from '../data/pgListings';

export function ContactPage() {
  const { enquiries, tourBookings, openTourModal } = usePreferences();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-[1280px] mx-auto px-5 sm:px-8 py-10 sm:py-14"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[#1D4ED8]">
              Contact Us
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1533]">
              Need help finding or updating a PG listing?
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#52607D] leading-relaxed">
              Reach out to the Find My PG team for neighbourhood guidance across
              LPU Law Gate, Phagwara, and Jalandhar, or book an assisted on-ground
              PG tour with our team.
            </p>
          </div>

          {/* Tour Guide Quick Callout */}
          <div className="p-5 rounded-2xl bg-[#0B1533] text-white space-y-3 shadow-[0_14px_34px_-16px_rgba(11,21,51,0.5)]">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C7D2FE]">
                <Compass className="w-4 h-4 text-[#818CF8]" />
                <span>Team Assisted Visit</span>
              </span>
              <span className="font-mono text-sm font-bold text-white">
                ₹{TOUR_GUIDE_FEE_INR}
              </span>
            </div>
            <h2 className="font-display text-lg font-bold">
              Book a Local Tour Guide
            </h2>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Our local team walks you through verified PGs in Law Gate,
              Phagwara, or Jalandhar. Pay ₹{TOUR_GUIDE_FEE_INR} via UPI QR to
              confirm your guided visit.
            </p>
            <button
              type="button"
              onClick={() => openTourModal()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:opacity-95 rounded-lg transition-opacity cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Open ₹{TOUR_GUIDE_FEE_INR} Tour Guide QR</span>
            </button>
          </div>

          <div className="space-y-4 pt-2 border-t border-[#E2E8F5]">
            <div className="flex items-start gap-3 pt-4">
              <MapPin className="w-5 h-5 text-[#1D4ED8] mt-0.5 shrink-0" />
              <div>
                <h2 className="font-display text-sm font-semibold text-[#0B1533]">
                  Active Coverage Regions
                </h2>
                <p className="text-sm text-[#52607D] mt-0.5">
                  LPU Law Gate (144411), Phagwara (144401 / 144411), and
                  Jalandhar (144001 / 144005), Punjab.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-[#6D28D9] mt-0.5 shrink-0" />
              <div>
                <h2 className="font-display text-sm font-semibold text-[#0B1533]">
                  Direct Property Contact
                </h2>
                <p className="text-sm text-[#52607D] mt-0.5">
                  For immediate room availability or rent enquiries, open any{' '}
                  <Link
                    to="/explore"
                    className="text-[#1D4ED8] font-semibold hover:underline"
                  >
                    PG listing
                  </Link>{' '}
                  to call or WhatsApp the property directly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#1D4ED8] mt-0.5 shrink-0" />
              <div>
                <h2 className="font-display text-sm font-semibold text-[#0B1533]">
                  List Your PG Property
                </h2>
                <p className="text-sm text-[#52607D] mt-0.5">
                  Are you a PG or hostel owner near LPU, Phagwara, or Jalandhar?
                  Share your official property address, contact number, and
                  Google Maps details via the enquiry form.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmed Tour Guide Bookings History */}
          {tourBookings.length > 0 && (
            <div className="pt-6 border-t border-[#E2E8F5]">
              <h2 className="font-display text-sm font-semibold text-[#0B1533]">
                Your Tour Guide Bookings ({tourBookings.length})
              </h2>
              <ul className="mt-3 space-y-2.5">
                {tourBookings.slice(0, 3).map((booking) => (
                  <li
                    key={booking.id}
                    className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F5] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#0B1533]">
                        {booking.area} Tour · ₹{booking.feeInr}
                      </span>
                      <span className="font-mono text-[#1D4ED8]">{booking.id}</span>
                    </div>
                    <p className="text-[#52607D]">
                      Date: {booking.preferredDate} · UTR: {booking.utrNumber}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User's Saved Enquiries History */}
          {enquiries.length > 0 && (
            <div className="pt-6 border-t border-[#E2E8F5]">
              <h2 className="font-display text-sm font-semibold text-[#0B1533]">
                Your Recent Enquiries ({enquiries.length})
              </h2>
              <ul className="mt-3 space-y-2.5">
                {enquiries.slice(0, 3).map((item) => (
                  <li
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F5] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#0B1533]">
                        {item.pgName ?? 'General Contact Enquiry'}
                      </span>
                      <span className="font-mono text-[#52607D]">{item.id}</span>
                    </div>
                    <p className="text-[#52607D] line-clamp-2">{item.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-[#FFFFFF] border border-[#E2E8F5] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-16px_rgba(11,21,51,0.1)]">
            <EnquiryForm
              heading="Send Us a Message"
              subheading="Fill in your details below and we will record your enquiry right away."
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
