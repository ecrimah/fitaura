'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MiniCart from './MiniCart';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import AnnouncementBar from './AnnouncementBar';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collection', href: '/categories' },
  { label: 'About', href: '/about' },
  { label: 'Journal', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'FITAURA';

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };
    updateWishlistCount();
    window.addEventListener('wishlistUpdated', updateWishlistCount);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const onScroll = () => setHasScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
      window.removeEventListener('scroll', onScroll);
      subscription.unsubscribe();
    };
  }, []);

  // Close the search overlay on Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <AnnouncementBar />

      <header
        className={`bg-cream-50/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${
          hasScrolled ? 'border-b border-ink-100 shadow-soft' : 'border-b border-transparent'
        }`}
      >
        <div className="safe-area-top" />
        <nav aria-label="Main navigation" className="relative">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="h-[68px] lg:h-[76px] grid grid-cols-[auto_1fr_auto] items-center gap-4">

              {/* Left: Mobile Menu Trigger + Logo
                  The logo is only shown from `lg:` upward — on mobile and
                  tablet the FITAURA mark already lives at the top of the
                  hamburger drawer, so we omit it here to keep the bar
                  uncluttered around the menu trigger. */}
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 -ml-2 text-ink-900 hover:text-sienna-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <i className="ri-menu-line text-2xl"></i>
                </button>
                <Link
                  href="/"
                  className="hidden lg:flex items-center select-none group"
                  aria-label={`${siteName} home`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- intentional <img> for crisp scaling of brand mark with transparency */}
                  <img
                    src="/fitaura-logo.png"
                    alt={siteName}
                    className="h-10 md:h-12 w-auto object-contain select-none"
                    draggable={false}
                  />
                </Link>
              </div>

              {/* Center: Navigation (Desktop) */}
              <div className="hidden lg:flex items-center justify-center gap-10">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative py-2 text-[12px] uppercase tracking-[0.22em] font-medium text-ink-700 hover:text-sienna-500 transition-colors"
                  >
                    {link.label}
                    <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 origin-left bg-sienna-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </Link>
                ))}
              </div>

              {/* Right: Utility icons */}
              <div className="flex items-center justify-end gap-1 sm:gap-2">
                <button
                  className="p-2 text-ink-900 hover:text-sienna-500 transition-colors"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                >
                  <i className="ri-search-line text-[20px]"></i>
                </button>

                {user ? (
                  <Link
                    href="/account"
                    className="p-2 text-ink-900 hover:text-sienna-500 transition-colors hidden sm:block"
                    aria-label="Account"
                  >
                    <i className="ri-user-line text-[20px]"></i>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    className="p-2 text-ink-900 hover:text-sienna-500 transition-colors hidden sm:block"
                    aria-label="Login"
                  >
                    <i className="ri-user-line text-[20px]"></i>
                  </Link>
                )}

                <Link
                  href="/wishlist"
                  className="p-2 text-ink-900 hover:text-sienna-500 transition-colors relative hidden sm:block"
                  aria-label="Wishlist"
                >
                  <i className="ri-heart-line text-[20px]"></i>
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-0 flex h-[18px] min-w-[18px] px-[5px] items-center justify-center rounded-full bg-sienna-500 text-[10px] font-semibold text-cream-50">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    className="p-2 text-ink-900 hover:text-sienna-500 transition-colors"
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    aria-label="Bag"
                  >
                    <i className="ri-shopping-bag-line text-[20px]"></i>
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-0 flex h-[18px] min-w-[18px] px-[5px] items-center justify-center rounded-full bg-sienna-500 text-[10px] font-semibold text-cream-50">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                </div>
              </div>

            </div>
          </div>
        </nav>
      </header>

      {/* Search overlay — Spotlight-style pill
          A single floating pill with a search icon, an input, and a
          close button. Press Enter to search; Esc or backdrop click to
          dismiss. The cream surface + sienna focus ring keep it on
          the FITAURA brand voice. */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-ink-900/50 backdrop-blur-md z-[60] flex items-start justify-center pt-20 sm:pt-28 px-4 animate-in fade-in duration-200"
          onClick={() => setIsSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search FITAURA"
        >
          <form
            onSubmit={handleSearch}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl animate-in slide-in-from-top-4 fade-in duration-300"
          >
            <div className="flex items-center bg-cream-50 rounded-full shadow-[0_18px_60px_-15px_rgba(11,15,23,0.45)] ring-1 ring-cream-200 focus-within:ring-2 focus-within:ring-sienna-500/60 transition-shadow pl-5 sm:pl-6 pr-2">
              <i
                className="ri-search-line text-lg sm:text-xl text-ink-400 flex-shrink-0"
                aria-hidden
              ></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, collections, categories…"
                className="flex-1 bg-transparent border-0 outline-none ring-0 shadow-none appearance-none focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none px-3 sm:px-4 py-3.5 sm:py-4 text-base sm:text-lg placeholder:text-ink-400 text-ink-900 min-w-0"
                style={{ boxShadow: 'none' }}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="w-8 h-8 flex items-center justify-center text-ink-300 hover:text-ink-700 transition-colors flex-shrink-0"
                  aria-label="Clear search"
                >
                  <i className="ri-close-circle-fill text-base"></i>
                </button>
              )}
              <span className="hidden sm:block w-px h-5 bg-cream-200 mx-1.5 flex-shrink-0" />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-cream-100 rounded-full transition-colors flex-shrink-0"
                aria-label="Close search"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-semibold text-cream-100/80">
              Press{' '}
              <kbd className="bg-cream-50/15 text-cream-50 border border-cream-50/20 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-normal mx-0.5">
                Enter
              </kbd>{' '}
              to search ·{' '}
              <kbd className="bg-cream-50/15 text-cream-50 border border-cream-50/20 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-normal mx-0.5">
                Esc
              </kbd>{' '}
              to close
            </p>
          </form>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-cream-50 shadow-soft-lg flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-5 border-b border-ink-100 flex items-center justify-between">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                {/* eslint-disable-next-line @next/next/no-img-element -- intentional <img> for crisp scaling of brand mark with transparency */}
                <img
                  src="/fitaura-logo.png"
                  alt={siteName}
                  className="h-9 w-auto object-contain select-none"
                  draggable={false}
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-ink-500 hover:text-ink-900"
                aria-label="Close menu"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-5 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-2 py-4 text-base font-medium text-ink-900 hover:text-sienna-500 transition-colors border-b border-ink-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <i className="ri-arrow-right-s-line text-xl text-ink-300"></i>
                </Link>
              ))}
              <div className="h-px bg-transparent my-4"></div>
              {[
                { label: 'Wishlist', href: '/wishlist', icon: 'ri-heart-line' },
                { label: 'Track Order', href: '/order-tracking', icon: 'ri-truck-line' },
                { label: 'My Account', href: '/account', icon: 'ri-user-line' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-2 py-3 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`${link.icon} text-lg`}></i>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-5 border-t border-ink-100">
              <p className="text-[11px] tracking-[0.2em] uppercase text-ink-400 text-center">
                &copy; {new Date().getFullYear()} {siteName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
