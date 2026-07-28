import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BRAND } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Get in touch with the ${BRAND.name} team. We're here to help you with your chatbot needs.`,
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Page header */}
        <section className="bg-gradient-to-b from-brand-50/50 to-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Have questions about {BRAND.name}? We&apos;d love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact content */}
        <section className="py-12 sm:py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              {/* Contact info */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">Email</h3>
                      <a
                        href={`mailto:${BRAND.supportEmail}`}
                        className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        {BRAND.supportEmail}
                      </a>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">Website</h3>
                      <a
                        href={`https://${BRAND.domain}`}
                        className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        {BRAND.domain}
                      </a>
                    </div>
                  </div>

                  {/* Support hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">Support Hours</h3>
                      <p className="text-sm text-slate-500">
                        Mon - Fri, 9:00 AM - 6:00 PM IST
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick help box */}
                <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 border border-brand-200">
                  <h3 className="text-sm font-semibold text-brand-800 mb-2">
                    💡 Quick Help
                  </h3>
                  <p className="text-sm text-brand-700 leading-relaxed">
                    For immediate assistance with your chatbot setup, email us at{' '}
                    <a href={`mailto:${BRAND.supportEmail}`} className="font-medium underline">
                      {BRAND.supportEmail}
                    </a>{' '}
                    and we&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
