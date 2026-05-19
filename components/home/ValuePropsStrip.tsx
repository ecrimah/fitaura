const PROPS = [
  {
    icon: 'ri-truck-line',
    title: 'Fast & Reliable Shipping',
    body: 'Tracked delivery across Canada and the US — packed with care and on its way within 24 hours.',
  },
  {
    icon: 'ri-arrow-go-back-line',
    title: 'Easy 14-Day Returns',
    body: 'Changed your mind? Hassle-free returns within 14 days. Refunds back to your original payment method.',
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Secure Payments',
    body: 'Every transaction is processed through Stripe with PCI-DSS encryption. Your card details never touch our servers.',
  },
  {
    icon: 'ri-customer-service-2-line',
    title: 'Real Customer Care',
    body: 'A real person, never a bot. Reach the FITAURA team for sizing, styling and order help whenever you need.',
  },
];

/**
 * ValuePropsStrip
 *
 * The "Why Customers Trust Us" section — moved from a thin badge strip
 * into a proper editorial block: eyebrow + display heading + supporting
 * paragraph + 4 trust cards arranged on a soft cream backdrop.
 *
 * The cards use the brand palette (sienna icon chip + cream-100 card +
 * sienna-50 hover wash) instead of the green reference, but the layout
 * and information hierarchy mirror it 1:1.
 */
export default function ValuePropsStrip() {
  return (
    <section className="bg-cream-50 py-12 lg:py-16 border-t border-cream-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-9 lg:mb-12">
          <span className="eyebrow mb-3 block">Why Customers Trust Us</span>
          <h2 className="font-display text-[24px] sm:text-[30px] lg:text-[36px] leading-[1.1] tracking-tight text-ink-900 mb-3">
            Built on quality, comfort, and confidence.
          </h2>
          <p className="text-ink-500 text-sm lg:text-[15px] leading-relaxed max-w-xl mx-auto">
            Every FITAURA piece is designed, sampled and stitched with intent —
            so what you put on is something you actually want to live in.
          </p>
        </div>

        {/* Cards */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-5">
          {PROPS.map((p) => (
            <li
              key={p.title}
              className="group relative overflow-hidden rounded-xl bg-white border border-cream-200 p-5 lg:p-6 transition-all duration-300 hover:border-sienna-200 hover:shadow-[0_14px_38px_-22px_rgba(209,79,43,0.35)] hover:-translate-y-0.5"
            >
              {/* Soft brand wash that fades in on hover, mirroring the
                  gradient in the reference layout. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-sienna-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              <div className="relative">
                <span className="inline-flex w-10 h-10 items-center justify-center bg-sienna-500 text-cream-50 rounded-lg mb-4 transition-transform duration-300 group-hover:scale-[1.06]">
                  <i className={`${p.icon} text-base`} aria-hidden></i>
                </span>
                <h3 className="font-display text-[15px] lg:text-base text-ink-900 mb-2 tracking-tight">
                  {p.title}
                </h3>
                <p className="text-ink-500 leading-relaxed text-[13px]">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
