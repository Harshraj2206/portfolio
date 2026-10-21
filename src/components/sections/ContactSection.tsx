import React, { useState } from 'react';
import { ContactConfig, SocialLink } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassButton } from '../common/GlassButton';
import { SocialLinks } from '../common/SocialLinks';
import confetti from 'canvas-confetti';
import {
  Send,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

interface ContactSectionProps {
  contact: ContactConfig;
  socialLinks: SocialLink[];
  className?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  socialLinks,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter a message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      setStatus('success');
      return;
    }

    if (!validate()) return;

    setStatus('submitting');

    const endpoint = contact.formspreeEndpoint || import.meta.env.VITE_CONTACT_ENDPOINT;

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            subject: formData.subject || 'Portfolio Inquiry',
            message: formData.message,
          }),
        });

        if (response.ok) {
          setStatus('success');
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#0A84FF', '#FFFFFF'],
          });
          setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
          return;
        } else {
          throw new Error('Service returned an error.');
        }
      } catch (err) {
        console.warn('Form submission failed, offering mailto fallback:', err);
      }
    }

    const subject = encodeURIComponent(
      formData.subject ? `[Inquiry] ${formData.subject}` : `[Inquiry] From ${formData.name}`
    );
    const body = encodeURIComponent(
      `Hello,\n\n${formData.message}\n\nFrom: ${formData.name}\nEmail: ${formData.email}`
    );

    window.location.href = `mailto:${contact.emailAddress}?subject=${subject}&body=${body}`;
    setStatus('success');
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#0A84FF', '#FFFFFF'],
    });
    setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
  };

  return (
    <section
      id="contact"
      aria-label="Contact & Connect"
      className={`max-w-5xl mx-auto px-4 sm:px-6 mb-24 md:mb-32 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        title="Start a conversation"
        subtitle="Direct channels for engineering opportunities, technical advisory, and discussions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Inquiries & Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-[28px] glass-surface space-y-6">
            <div>
              <div className="text-[13px] font-semibold text-[#0A84FF] dark:text-[#409CFF] flex items-center gap-2 mb-1.5">
                <Mail className="w-4 h-4" />
                <span>Direct email</span>
              </div>
              <a
                href={`mailto:${contact.emailAddress}`}
                className="text-lg md:text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0A84FF] dark:hover:text-[#409CFF] transition-colors"
              >
                {contact.emailAddress}
              </a>
              <div className="flex items-center gap-1.5 text-[13px] text-apple-gray-500 dark:text-[#A1A1A6] mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{contact.officeHoursNote}</span>
              </div>
            </div>

            {/* Calendly Quick Link */}
            {contact.calendlyUrl && (
              <div className="p-4 rounded-card bg-black/5 dark:bg-white/5 border border-white/10 space-y-2">
                <div className="text-[14px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0A84FF]" />
                  <span>Technical sync</span>
                </div>
                <p className="text-[13px] text-apple-gray-500 dark:text-[#A1A1A6]">
                  Schedule a 15-minute video call to discuss roles or architecture.
                </p>
                <div className="pt-2">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    href={contact.calendlyUrl}
                    isExternal
                    icon={<Calendar className="w-3.5 h-3.5" />}
                  >
                    Open calendar
                  </GlassButton>
                </div>
              </div>
            )}

            {/* Social Links Row */}
            <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-2.5">
              <span className="text-[13px] font-semibold text-apple-gray-600 dark:text-[#A1A1A6]">
                Profiles & repositories
              </span>
              <SocialLinks links={socialLinks} variant="pills" />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-[28px] glass-surface">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#1D1D1F] dark:text-[#F5F5F7] mb-6">
              Send a direct message
            </h3>

            {status === 'success' ? (
              <div className="p-8 rounded-card bg-white/5 border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Message received
                </h4>
                <p className="text-[14px] text-apple-gray-500 dark:text-[#A1A1A6] max-w-sm mx-auto">
                  Thank you for reaching out. I typically reply within one business day.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-[13px] font-semibold text-[#0A84FF] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-[13px] font-medium text-apple-gray-700 dark:text-[#A1A1A6] mb-1.5"
                    >
                      Your name <span className="text-[#0A84FF]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full px-4 py-2.5 rounded-chip bg-white/40 dark:bg-black/30 text-[14px] text-apple-gray-900 dark:text-[#F5F5F7] placeholder:text-apple-gray-400 dark:placeholder:text-[#6E6E73] focus-visible:ring-2 focus-visible:ring-apple-blue border transition-colors ${
                        errors.name ? 'border-red-500' : 'border-black/10 dark:border-white/10'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[13px] font-medium text-apple-gray-700 dark:text-[#A1A1A6] mb-1.5"
                    >
                      Email address <span className="text-[#0A84FF]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="e.g. sarah@company.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full px-4 py-2.5 rounded-chip bg-white/40 dark:bg-black/30 text-[14px] text-apple-gray-900 dark:text-[#F5F5F7] placeholder:text-apple-gray-400 dark:placeholder:text-[#6E6E73] focus-visible:ring-2 focus-visible:ring-apple-blue border transition-colors ${
                        errors.email ? 'border-red-500' : 'border-black/10 dark:border-white/10'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-[13px] font-medium text-apple-gray-700 dark:text-[#A1A1A6] mb-1.5"
                  >
                    Topic / Context
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="e.g. Distributed Systems Architecture / Engineering Opportunity"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-chip bg-white/40 dark:bg-black/30 text-[14px] text-apple-gray-900 dark:text-[#F5F5F7] placeholder:text-apple-gray-400 dark:placeholder:text-[#6E6E73] focus-visible:ring-2 focus-visible:ring-apple-blue border border-black/10 dark:border-white/10 transition-colors"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[13px] font-medium text-apple-gray-700 dark:text-[#A1A1A6] mb-1.5"
                  >
                    Message <span className="text-[#0A84FF]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Details about your team, problem space, or inquiry..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    className={`w-full px-4 py-2.5 rounded-chip bg-white/40 dark:bg-black/30 text-[14px] text-apple-gray-900 dark:text-[#F5F5F7] placeholder:text-apple-gray-400 dark:placeholder:text-[#6E6E73] focus-visible:ring-2 focus-visible:ring-apple-blue border transition-colors ${
                      errors.message ? 'border-red-500' : 'border-black/10 dark:border-white/10'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Pill Button */}
                <div className="pt-2">
                  <GlassButton
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={status === 'submitting'}
                    icon={<Send className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    {status === 'submitting' ? 'Sending...' : 'Send message'}
                  </GlassButton>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
