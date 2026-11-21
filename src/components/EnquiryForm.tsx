import { useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import type { EnquiryRecord, EnquiryValidationErrors } from '../types/pg';
import { buildWhatsAppUrl, validateEnquiryForm } from '../utils/pgFilters';

interface EnquiryFormProps {
  pgId?: string;
  pgName?: string;
  pgPhone?: string;
  heading?: string;
  subheading?: string;
}

export function EnquiryForm({
  pgId,
  pgName,
  pgPhone,
  heading = 'Send an Enquiry',
  subheading = 'Ask directly about room availability, monthly rent, and visit timings.',
}: EnquiryFormProps) {
  const { submitEnquiry } = usePreferences();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    pgName
      ? `Hi, I am interested in ${pgName}. Please share room availability and rent details.`
      : '',
  );
  const [errors, setErrors] = useState<EnquiryValidationErrors>({});
  const [submittedRecord, setSubmittedRecord] = useState<EnquiryRecord | null>(
    null,
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateEnquiryForm({
      name,
      phone,
      email,
      message,
      pgId,
      pgName,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const record = submitEnquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: message.trim(),
      pgId,
      pgName,
    });
    setSubmittedRecord(record);
    setName('');
    setPhone('');
    setEmail('');
    setMessage(
      pgName
        ? `Hi, I am interested in ${pgName}. Please share room availability and rent details.`
        : '',
    );
  };

  if (submittedRecord) {
    return (
      <div
        role="status"
        data-testid="enquiry-confirmation"
        className="bg-[#EEF3FF] border border-[#BFDBFE] rounded-xl p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-base font-bold text-[#0B1533]">
              Enquiry Recorded
            </h3>
            <p className="text-sm text-[#4C5876] mt-1 leading-relaxed">
              Thank you,{' '}
              <span className="font-semibold text-[#0B1533]">
                {submittedRecord.name}
              </span>
              . Your enquiry
              {submittedRecord.pgName ? ` for ${submittedRecord.pgName}` : ''}{' '}
              has been saved with reference{' '}
              <span className="font-mono text-xs font-semibold text-[#1D4ED8]">
                {submittedRecord.id}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {pgPhone && pgName && (
            <a
              href={buildWhatsAppUrl(pgPhone, pgName)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] rounded-lg transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Follow up on WhatsApp</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setSubmittedRecord(null)}
            className="px-4 py-2 text-xs font-semibold text-[#0B1533] bg-white border border-[#DDE3F0] hover:bg-[#F5F7FC] rounded-lg transition-colors cursor-pointer"
          >
            Send Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold text-[#0B1533]">
          {heading}
        </h3>
        <p className="text-sm text-[#4C5876] mt-1">{subheading}</p>
      </div>

      <div>
        <label
          htmlFor={`enquiry-name-${pgId ?? 'contact'}`}
          className="block text-xs font-semibold text-[#0B1533] mb-1.5"
        >
          Full Name *
        </label>
        <input
          id={`enquiry-name-${pgId ?? 'contact'}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          aria-invalid={Boolean(errors.name)}
          className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] placeholder:text-[#7A87A5] focus:bg-white focus:border-[#1D4ED8] transition-colors"
        />
        {errors.name && (
          <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
            {errors.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor={`enquiry-phone-${pgId ?? 'contact'}`}
            className="block text-xs font-semibold text-[#0B1533] mb-1.5"
          >
            Phone Number *
          </label>
          <input
            id={`enquiry-phone-${pgId ?? 'contact'}`}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            aria-invalid={Boolean(errors.phone)}
            className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] placeholder:text-[#7A87A5] focus:bg-white focus:border-[#1D4ED8] transition-colors"
          />
          {errors.phone && (
            <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`enquiry-email-${pgId ?? 'contact'}`}
            className="block text-xs font-semibold text-[#0B1533] mb-1.5"
          >
            Email (Optional)
          </label>
          <input
            id={`enquiry-email-${pgId ?? 'contact'}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            aria-invalid={Boolean(errors.email)}
            className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] placeholder:text-[#7A87A5] focus:bg-white focus:border-[#1D4ED8] transition-colors"
          />
          {errors.email && (
            <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={`enquiry-message-${pgId ?? 'contact'}`}
          className="block text-xs font-semibold text-[#0B1533] mb-1.5"
        >
          Message *
        </label>
        <textarea
          id={`enquiry-message-${pgId ?? 'contact'}`}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us your move-in timeframe or questions..."
          aria-invalid={Boolean(errors.message)}
          className="w-full px-3.5 py-2.5 text-sm bg-[#F5F7FC] border border-[#DDE3F0] rounded-lg text-[#0B1533] placeholder:text-[#7A87A5] focus:bg-white focus:border-[#1D4ED8] transition-colors resize-none"
        />
        {errors.message && (
          <p role="alert" className="mt-1 text-xs text-[#B91C1C]">
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#1D4ED8] to-[#6D28D9] hover:from-[#1539A8] hover:to-[#5B21B6] rounded-lg transition-all shadow-sm cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>Submit Enquiry</span>
      </button>
    </form>
  );
}
