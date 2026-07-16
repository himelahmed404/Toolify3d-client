'use client';

import { useRef, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import PageHero from '@/components/ui/PageHero';
import { useGsap, fadeUpOnMount, fadeUpOnScroll, staggerRevealOnScroll } from '@/lib/gsap';
import { FaSquareWhatsapp } from "react-icons/fa6";
import WhatsAppLink from '@/components/ui/WhatsAppLink';
import { apiFetch } from '@/lib/api/client';
import { FAQ_ITEMS } from '@/data/faq';


const MATERIAL_OPTIONS = [
  'PLA+ (Rigid, detailed)',
  'PETG (Durable, semi-flex)',
  'TPU (Flexible, wearable)',
  'Not sure — help me choose',
];

export default function ContactPage() {
  const fileInputRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    quantity: 1,
    material: MATERIAL_OPTIONS[0],
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSubmitMessage('Your request was sent. We will get back to you within 2 hours.');
      setForm({
        name: '',
        email: '',
        quantity: 1,
        material: MATERIAL_OPTIONS[0],
        description: '',
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useGsap((gsap) => {
    fadeUpOnMount(gsap, '.reveal-hero', { y: 40, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.15 });
    fadeUpOnScroll(gsap, '.contact-form-reveal', { y: 30, duration: 0.7 });
    fadeUpOnScroll(gsap, '.contact-sidebar-reveal', { y: 30, duration: 0.7, delay: 0.15 });
    fadeUpOnScroll(gsap, '.contact-faq-header');
    staggerRevealOnScroll(gsap, '.contact-faq-item', { start: 'top 90%', step: 0.06, y: 20, duration: 0.5 });
    fadeUpOnScroll(gsap, '.contact-cta-reveal', { start: 'top 90%', y: 20 });
  }, []);

  return (
    <PageShell>
      <div className="bg-background text-on-surface">
        <PageHero
          eyebrow="// CONTACT"
          title="Start Your Print"
          description="Send file → get quote → approve → we print. That's it."
        />

        {/* Main Content */}
        <section className="bg-white py-section-padding-v px-margin-page">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Form */}
            <div className="md:col-span-7 contact-form-reveal">
              <p className="font-mono text-sm text-[#1DB954] mb-4">{'// SEND_YOUR_REQUEST'}</p>
              <h2 className="font-display font-bold text-[32px] mb-8">Order Request</h2>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {submitMessage && (
                  <div className="font-mono text-sm text-primary border border-primary/30 bg-primary/5 px-4 py-3 rounded-sm">
                    {submitMessage}
                  </div>
                )}
                {submitError && (
                  <div className="font-mono text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3 rounded-sm">
                    {submitError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase text-on-surface-variant">Name</label>
                    <input
                      className="w-full border border-outline-variant focus:border-primary focus:ring-0 rounded-sm py-3 px-4 bg-surface-container-lowest outline-none"
                      placeholder="Your name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase text-on-surface-variant">Email</label>
                    <input
                      className="w-full border border-outline-variant focus:border-primary focus:ring-0 rounded-sm py-3 px-4 bg-surface-container-lowest outline-none"
                      placeholder="you@example.com"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase text-on-surface-variant">Quantity</label>
                    <input
                      className="w-full border border-outline-variant focus:border-primary focus:ring-0 rounded-sm py-3 px-4 bg-surface-container-lowest outline-none"
                      min={1}
                      type="number"
                      required
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase text-on-surface-variant">Material Selection</label>
                    <select
                      className="w-full border border-outline-variant focus:border-primary focus:ring-0 rounded-sm py-3 px-4 bg-surface-container-lowest outline-none"
                      value={form.material}
                      onChange={(e) => setForm({ ...form, material: e.target.value })}
                    >
                      {MATERIAL_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase text-on-surface-variant">Project Description</label>
                  <textarea
                    className="w-full border border-outline-variant focus:border-primary focus:ring-0 rounded-sm py-3 px-4 bg-surface-container-lowest outline-none resize-y"
                    placeholder="Describe what you need — or just paste a reference image link."
                    rows={7}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0D0D0D] text-white font-display font-semibold py-5 rounded-sm btn-hover transition-all flex justify-center items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending...' : 'Send Order Request'}
                  <span className="material-symbols-outlined">trending_flat</span>
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-5 lg:col-span-5 contact-sidebar-reveal">
              <div className="sticky top-24 space-y-md border border-outline-variant p-lg bg-surface-container-lowest shadow-sm">
                <div className="flex items-center gap-xs border-b border-outline-variant pb-sm mb-sm">
                  <h2 className="font-mono text-xs tracking-widest uppercase text-[#1DB954]">{"// REACH_US"}</h2>
                </div>

                <div className="space-y-sm">
                  <WhatsAppLink
                    className="w-full bg-[#25D366] text-white font-bold p-sm flex items-center justify-center gap-sm hover:brightness-110 transition-all active:scale-[0.98]"
                  >
                    <span className="text-2xl"> <FaSquareWhatsapp /></span>
                    CHAT ON WHATSAPP
                  </WhatsAppLink>

                  <div className="grid grid-cols-2 gap-sm">
                    <div className="p-sm bg-surface-container border border-outline-variant/30">
                      <p className="font-mono text-[10px] text-outline">RESPONSE_TIME</p>
                      <p className="font-body text-base font-bold">&lt; 2 HOURS</p>
                    </div>
                    <div className="p-sm bg-surface-container border border-outline-variant/30">
                      <p className="font-mono text-[10px] text-outline">LOCATION</p>
                      <p className="font-body text-base font-bold">DHAKA, BD</p>
                    </div>
                  </div>

                  <div className="py-sm">
                    <p className="font-mono text-xs tracking-widest uppercase mb-xs">OPERATING_HOURS</p>
                    <div className="flex justify-between font-body text-base">
                      <span>SATURDAY — THURSDAY</span>
                      <span className="font-mono">10:00 - 21:00</span>
                    </div>
                  </div>

                  <div className="py-sm border-t border-outline-variant/30">
                    <p className="font-mono text-xs tracking-widest uppercase mb-xs">ACCEPTED_PAYMENTS</p>
                    <div className="flex flex-wrap gap-xs">
                      {['BKASH', 'NAGAD', 'BANK_TRANSFER'].map((method) => (
                        <span
                          key={method}
                          className="px-xs py-1 bg-surface-container border border-outline-variant rounded font-mono text-[10px]"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="py-sm border-t border-outline-variant/30">
                    <p className="font-mono text-xs tracking-widest uppercase mb-xs">CONNECT</p>
                    <div className="flex gap-md">
                      <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                        public
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                        alternate_email
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                        share
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#F5F5F5] py-section-padding-v px-margin-page">
          <div className="max-w-container-max mx-auto">
            <div className="contact-faq-header">
              <p className="font-mono text-sm text-[#1DB954] mb-4">{'// FAQ'}</p>
              <h2 className="font-display font-extrabold text-[32px] md:text-[48px] mb-12">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              {FAQ_ITEMS.map((item, index) => (
                <div
                  key={item.question}
                  className={`contact-faq-item accordion-item border-b border-outline-variant ${
                    activeFaq === index ? 'active' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="w-full flex justify-between items-center py-6 text-left group"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={activeFaq === index}
                  >
                    <span className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                      {item.question}
                    </span>
                    <span className="material-symbols-outlined accordion-icon transition-transform">add</span>
                  </button>
                  <div className="accordion-content">
                    <p className="pb-6 font-body text-base text-on-surface-variant">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WhatsApp CTA Strip */}
        <section className="bg-white py-12 px-margin-page border-t border-outline-variant">
          <div className="contact-cta-reveal max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-body text-lg text-on-surface-variant text-center md:text-left">
              Prefer WhatsApp? Skip the form and message us directly.
            </p>
            <WhatsAppLink
              className="bg-primary text-white px-10 py-4 font-display font-semibold rounded-sm flex items-center gap-3 btn-hover transition-all"
            >
              Open WhatsApp
              <span className="material-symbols-outlined">north_east</span>
            </WhatsAppLink>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
