import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import CreditBadge from './CreditBadge';

interface Props {
  children: ReactNode;
}

const navLinks = [
  { to: '/generate', label: 'Generate' },
  { to: '/settings', label: 'Settings' },
  { to: '/history', label: 'History' },
];

export default function Layout({ children }: Props) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const fetchCredits = useAppStore((s) => s.fetchCredits);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-all duration-200">
            <span className="text-emerald-400">Listing</span>Kit
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-2">
              <CreditBadge />
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>Built by licensed real estate agents</p>
      </footer>
    </div>
  );
}
