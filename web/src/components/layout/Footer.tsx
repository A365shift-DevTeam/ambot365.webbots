import { Link } from 'react-router-dom';
import { BRAND, NAV_LINKS } from '@/lib/constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">{BRAND.name}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{BRAND.description}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${BRAND.supportEmail}`}
                  className="text-sm text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {BRAND.supportEmail}
                </a>
              </li>
              <li>
                <a
                  href={`https://${BRAND.domain}`}
                  className="text-sm text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {BRAND.domain}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">Powered by {BRAND.name}</p>
        </div>
      </div>
    </footer>
  );
}
