import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  UserPlus,
  CalendarCheck,
  ShieldCheck,
  CreditCard,
  HeartPulse,
  MessageCircle,
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: 'getting-started',
    icon: HeartPulse,
    label: 'Getting Started',
    color: 'from-blue-500 to-cyan-500',
    faqs: [
      {
        q: 'What is HealthProvida?',
        a: 'HealthProvida is a platform that connects patients with verified healthcare clinics and providers across the country. You can search, compare, and book appointments all in one place.',
      },
      {
        q: 'Do I need an account to search for clinics?',
        a: 'No — you can browse and search clinics without an account. However, you will need to sign up to book appointments, save favourites, or access your health history.',
      },
      {
        q: 'Is HealthProvida free to use?',
        a: 'Browsing and booking appointments through HealthProvida is completely free for patients. Clinics pay a subscription fee to be listed on the platform.',
      },
    ],
  },
  {
    id: 'appointments',
    icon: CalendarCheck,
    label: 'Appointments',
    color: 'from-green-500 to-emerald-500',
    faqs: [
      {
        q: 'How do I book an appointment?',
        a: 'Navigate to a clinic page, choose a service, and select an available time slot. You will receive a confirmation email once the clinic accepts your request.',
      },
      {
        q: 'Can I cancel or reschedule?',
        a: 'Yes. Go to your profile, open "My Appointments," and choose to reschedule or cancel. Cancellations made less than 24 hours before the appointment may be subject to a fee set by the clinic.',
      },
      {
        q: 'What if the clinic does not confirm my booking?',
        a: 'Clinics typically respond within a few hours. If you have not heard back within 24 hours, contact us and we will follow up on your behalf.',
      },
    ],
  },
  {
    id: 'providers',
    icon: UserPlus,
    label: 'For Providers',
    color: 'from-violet-500 to-purple-500',
    faqs: [
      {
        q: 'How do I list my clinic on HealthProvida?',
        a: 'Click "Join as a Provider" in the menu and complete the application form. Our team will review your submission and contact you within 2–3 business days.',
      },
      {
        q: 'What information is required to sign up as a provider?',
        a: 'You will need your clinic name, address, registration number, services offered, and contact details. Supporting documents such as licenses may be requested during verification.',
      },
      {
        q: 'How long does the verification process take?',
        a: 'Verification typically takes 2–5 business days. We may reach out for additional documents to ensure your clinic meets our quality standards.',
      },
    ],
  },
  {
    id: 'privacy',
    icon: ShieldCheck,
    label: 'Privacy & Security',
    color: 'from-rose-500 to-pink-500',
    faqs: [
      {
        q: 'How is my personal data stored?',
        a: 'All data is encrypted at rest and in transit. We comply with relevant data-protection regulations and never sell your personal information to third parties.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to Settings → Account → Delete Account. This will permanently remove your profile and all associated data within 30 days.',
      },
    ],
  },
  {
    id: 'billing',
    icon: CreditCard,
    label: 'Billing',
    color: 'from-amber-500 to-orange-500',
    faqs: [
      {
        q: 'Does HealthProvida charge patients for bookings?',
        a: 'HealthProvida does not charge patients a booking fee. Any consultation or service fees are set by the clinic and collected by them directly.',
      },
      {
        q: 'How do providers pay for their subscription?',
        a: 'Providers are billed monthly via the payment method provided during onboarding. Invoices are available in the Admin Portal under Billing.',
      },
    ],
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800 pr-4">{q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-gray-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

const HelpCenterPage = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [openFaq, setOpenFaq] = useState(null);

  const currentCategory = categories.find((c) => c.id === activeCategory);

  const filteredFaqs = search.trim()
    ? categories.flatMap((c) =>
        c.faqs
          .filter(
            (f) =>
              f.q.toLowerCase().includes(search.toLowerCase()) ||
              f.a.toLowerCase().includes(search.toLowerCase())
          )
          .map((f) => ({ ...f, categoryLabel: c.label }))
      )
    : currentCategory?.faqs ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 opacity-90" />
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                top: `${10 + i * 12}%`,
                left: `${5 + i * 15}%`,
              }}
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <MessageCircle className="w-3.5 h-3.5" />
              We're here to help
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Help Center
            </h1>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Find answers to common questions or get in touch with our support team.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOpenFaq(null); }}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white shadow-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main */}
      <section className="container mx-auto px-4 py-14">
        {search.trim() ? (
          /* Search results */
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-4">
              {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </p>
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No results found.</p>
                <p className="text-sm mt-1">Try different keywords or browse the categories below.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredFaqs.map((f, i) => (
                  <div key={i}>
                    {f.categoryLabel && (
                      <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1 ml-1">
                        {f.categoryLabel}
                      </p>
                    )}
                    <AccordionItem
                      q={f.q}
                      a={f.a}
                      isOpen={openFaq === `search-${i}`}
                      onToggle={() => setOpenFaq(openFaq === `search-${i}` ? null : `search-${i}`)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Category browser */
          <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
            {/* Sidebar */}
            <aside className="lg:w-56 flex-shrink-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
                Categories
              </p>
              <nav className="flex flex-col gap-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = cat.id === activeCategory;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setOpenFaq(null); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                        isActive
                          ? 'bg-white shadow-sm text-blue-600'
                          : 'text-gray-600 hover:bg-white/60'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </span>
                      {cat.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* FAQ panel */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentCategory && (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentCategory.color} flex items-center justify-center shadow`}>
                          <currentCategory.icon className="w-5 h-5 text-white" />
                        </span>
                        <h2 className="text-xl font-bold text-gray-800">{currentCategory.label}</h2>
                      </div>
                      <div className="flex flex-col gap-3">
                        {currentCategory.faqs.map((faq, i) => (
                          <AccordionItem
                            key={i}
                            q={faq.q}
                            a={faq.a}
                            isOpen={openFaq === `${activeCategory}-${i}`}
                            onToggle={() =>
                              setOpenFaq(openFaq === `${activeCategory}-${i}` ? null : `${activeCategory}-${i}`)
                            }
                          />
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center mx-auto mb-4 shadow">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Still have questions?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Our support team is available Monday – Friday, 9 am – 6 pm.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-green-700 transition-all shadow"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HelpCenterPage;
