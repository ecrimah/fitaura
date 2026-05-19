'use client';

import { useState, useEffect } from 'react';

export default function PWASplash() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Only show splash in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Only show on first load (not on subsequent navigations)
    const hasShownSplash = sessionStorage.getItem('splashShown');

    if (isStandalone && !hasShownSplash) {
      setShowSplash(true);
      sessionStorage.setItem('splashShown', 'true');

      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showSplash) return null;

  return (
    <div className="pwa-splash" aria-hidden="true">
      <div className="pwa-splash-logo mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-512.png?v=5"
          alt="FITAURA"
          className="w-24 h-24 object-contain"
        />
      </div>
      <h1 className="text-ink-900 text-2xl font-display tracking-wide mb-2">FITAURA</h1>
      <p className="text-ink-500 text-sm font-medium mb-8">Confidence In Motion</p>
      <div className="pwa-splash-dots flex gap-1.5">
        <span className="w-2 h-2 bg-white rounded-full" />
        <span className="w-2 h-2 bg-white rounded-full" />
        <span className="w-2 h-2 bg-white rounded-full" />
      </div>
    </div>
  );
}
