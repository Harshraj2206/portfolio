import React, { useState } from 'react';
import { ContactConfig, SocialLink } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { SocialLinks } from '../common/SocialLinks';
import confetti from 'canvas-confetti';
import {
  Send,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Clock
} from 'lucide-react';

interface ContactSectionProps {
  contact: ContactConfig;
  socialLinks: SocialLink[];
  resumeUrl: string;
  onDownloadResume: () => void;
  className?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  socialLinks,
  resumeUrl,
  onDownloadResume,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // anti-spam bot trap
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

    // Honeypot check: If bot filled the hidden input, pretend success and abort
    if (formData.honeypot) {
      setStatus('success');
      return;
    }

    if (!validate()) return;

    setStatus('submitting');

    // If a Formspree endpoint is configured via env var or config
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
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#0A84FF', '#34C759', '#AF52DE'],
          });
          setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
          return;
        } else {
          throw new Error('Service returned an error.');
        }
      } catch (err) {
        console.warn('Form submission failed, offering mailto fallback:', err);
        // Fall back gracefully to mailto
      }
    }

    // Default Mailto Fallback
    const subject = encodeURIComponent(
      formData.subject ? `[Portfolio Inquiry] ${formData.subject}` : `[Portfolio Inquiry] From ${formData.name}`
    );
    const body = encodeURIComponent(
      `Hi [Your Name],\n\n${formData.message}\n\nFrom: ${formData.name}\nEmail: ${formData.email}`
    );

    window.location.href = `mailto:${contact.emailAddress}?subject=${subject}&body=${body}`;
    setStatus('success');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0A84FF', '#34C759'],
    });
    setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
  };

  return (
    <section
      id="contact"
      aria-label="Contact and Connect"
      className={`max-w-6xl mx-auto px-4 sm:px-6 mb-28 md:mb-36 scroll-mt-24 ${className}`}
    >
      <SectionHeading
        eyebrow="Let's Talk"
        title="Start a Conversation"
        subtitle={contact.subtext}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Links & Calendar Slot (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard variant="card" className="p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-apple-blue mb-1">
                <Mail className="w-4 h-4" />
                <span>Direct Inquiries</span>
              </div>
              <a
                href={`mailto:${contact.emailAddress}`}
                className="text-lg md:text-xl font-bold text-apple-gray-900 dark:text-white hover:text-apple-blue transition-colors"
              >
                {contact.emailAddress}
              </a>
              <div className="flex items-center gap-1.5 text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{contact.officeHoursNote}</span>
              </div>
            </div>

            {/* Calendly-Style Chat Link */}
            {contact.calendlyUrl && (
              <div className="p-4 rounded-card bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-apple-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-apple-purple" />
                    <span>Want a Quick 15-Min Chat?</span>
                  </div>
                </div>
                <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                  Grab a time directly on my calendar to talk about engineering teams, summer opportunities, or projects.
                </p>
                <div className="pt-2">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    href={contact.calendlyUrl}
                    isExternal
                    icon={<Calendar className="w-3.5 h-3.5" />}
                  >
                    Open Scheduling Calendar
                  </GlassButton>
                </div>
              </div>
            )}

            {/* Social Links Row */}
            <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-3">
              <span className="text-xs font-semibold text-apple-gray-600 dark:text-apple-gray-400">
                Verified Socials & Profiles
              </span>
              <SocialLinks links={socialLinks} variant="pills" />
            </div>

            {/* Résumé Quick Action */}
            <div className="pt-2">
              <GlassButton
                variant="primary"
                size="md"
                href={resumeUrl}
                isExternal
                onClick={onDownloadResume}
                icon={<FileDown className="w-4 h-4" />}
                className="w-full justify-center"
              >
                Download Résumé (PDF)
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Interactive Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <GlassCard variant="card" className="p-8">
            <h3 className="text-xl font-bold text-apple-gray-900 dark:text-white mb-6">
              Send a Direct Message
            </h3>

            {status === 'success' ? (
              <div className="p-8 rounded-card bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-apple-gray-900 dark:text-white">
                  Message Sent!
                </h4>
                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-300 max-w-sm mx-auto">
                  Thank you for reaching out. I have received your message and will reply to your email shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-xs font-semibold text-apple-blue hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Honeypot anti-spam trap (invisible to human users) */}
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
                      className="block text-xs font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-1.5"
                    >
                      Your Name <span className="text-red-500">*</span>
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
                      className={`w-full px-4 py-2.5 rounded-chip glass-surface bg-white/40 dark:bg-black/20 text-sm text-apple-gray-900 dark:text-white placeholder:text-apple-gray-400 focus-visible:ring-2 focus-visible:ring-apple-blue border transition-colors ${
                        errors.name ? 'border-red-500' : 'border-white/30 dark:border-white/10'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-1.5"
                    >
                      Email Address <span className="text-red-500">*</span>
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
                      className={`w-full px-4 py-2.5 rounded-chip glass-surface bg-white/40 dark:bg-black/20 text-sm text-apple-gray-900 dark:text-white placeholder:text-apple-gray-400 focus-visible:ring-2 focus-visible:ring-apple-blue border transition-colors ${
                        errors.email ? 'border-red-500' : 'border-white/30 dark:border-white/10'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject Input */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-1.5"
                  >
                    Topic / Role
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="e.g. Summer 2027 SWE Internship / Project Collaboration"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-chip glass-surface bg-white/40 dark:bg-black/20 text-sm text-apple-gray-900 dark:text-white placeholder:text-apple-gray-400 focus-visible:ring-2 focus-visible:ring-apple-blue border border-white/30 dark:border-white/10 transition-colors"
                  />
                </div>

                {/* Message Input */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-1.5"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Tell me about your team, challenge, or what you'd like to discuss..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    className={`w-full px-4 py-2.5 rounded-chip glass-surface bg-white/40 dark:bg-black/20 text-sm text-apple-gray-900 dark:text-white placeholder:text-apple-gray-400 focus-visible:ring-2 focus-visible:ring-apple-blue border transition-colors ${
                      errors.message ? 'border-red-500' : 'border-white/30 dark:border-white/10'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
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
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </GlassButton>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
