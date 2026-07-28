import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS, BRAND } from '@/lib/constants';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt={BRAND.name} className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" id="main-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-btn"
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-down" id="mobile-nav">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin/login"
                className="mx-4 mt-2 px-4 py-3 rounded-lg text-sm font-medium bg-brand-500 text-white text-center hover:bg-brand-600 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
