/**
 * FITAURA focus-product keyword clusters for E-E-A-T + SERP domination.
 *
 * Primary focus (user mandate):
 *   "Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel"
 *
 * Clusters are grouped by search intent so each page type can merge the
 * right terms without keyword-stuffing every URL with the same block.
 */

/** Core brand + product positioning — weave into every indexable page. */
export const FOCUS_PRODUCT_PHRASE =
  'modern lifestyle clothing, gymwear, athleisure and fashion-forward apparel';

export const PRIMARY_KEYWORDS = [
  'modern lifestyle clothing',
  'gymwear',
  'athleisure',
  'fashion-forward apparel',
  'FITAURA',
  'shopfitaura',
] as const;

/** Category + geo modifiers — shop, categories, product pages. */
export const COMMERCE_KEYWORDS = [
  'gymwear Canada',
  'athleisure Canada',
  'activewear Canada',
  'workout clothes Canada',
  'women gymwear',
  'men athleisure',
  'lounge lifestyle clothing',
  'seamless leggings',
  'sports bra Canada',
  'sculpting leggings',
  'premium activewear',
  'Calgary clothing brand',
  'Canadian athleisure brand',
] as const;

/** Expertise + trust — guides, about, FAQs, blog. */
export const EXPERTISE_KEYWORDS = [
  'activewear size guide',
  'gymwear fit guide',
  'athleisure care instructions',
  'how to wash leggings',
  'sustainable activewear',
  'slow fashion activewear',
  'premium gymwear quality',
  'confidence in comfort',
] as const;

/** Long-tail capture — blog, journal, sustainability. */
export const LONG_TAIL_KEYWORDS = [
  'best athleisure brand Canada',
  'Calgary gymwear brand',
  'fashion forward workout clothes',
  'lifestyle clothing for gym and street',
  'elevated athleisure for women',
  'modern gymwear that looks good outside the gym',
  'Canadian fashion-forward activewear',
] as const;

export type KeywordCluster = 'primary' | 'commerce' | 'expertise' | 'longtail' | 'all';

const CLUSTERS: Record<Exclude<KeywordCluster, 'all'>, readonly string[]> = {
  primary: PRIMARY_KEYWORDS,
  commerce: COMMERCE_KEYWORDS,
  expertise: EXPERTISE_KEYWORDS,
  longtail: LONG_TAIL_KEYWORDS,
};

/**
 * Merge focus keywords for a page type. De-duplicates and returns a flat
 * array suitable for `<meta name="keywords">` or JSON-LD `keywords`.
 */
export function getFocusKeywords(
  ...clusters: KeywordCluster[]
): string[] {
  const selected =
    clusters.length === 0 || clusters.includes('all')
      ? Object.values(CLUSTERS).flat()
      : clusters.flatMap((c) => (c === 'all' ? [] : CLUSTERS[c]));

  return Array.from(new Set([...selected, ...PRIMARY_KEYWORDS]));
}

/**
 * Build a meta description that naturally includes the focus product phrase
 * without exceeding ~155 characters. Pass a page-specific lead sentence.
 */
export function buildFocusDescription(lead: string, maxLen = 155): string {
  const trimmed = lead.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxLen) return trimmed;

  const ellipsis = '…';
  return trimmed.slice(0, maxLen - ellipsis.length).replace(/\s+\S*$/, '') + ellipsis;
}

/** Default homepage / root description with full focus phrase. */
export const FOCUS_META_DESCRIPTION = buildFocusDescription(
  'Shop FITAURA — modern lifestyle clothing, gymwear, athleisure and fashion-forward apparel designed in Calgary. Confidence in comfort, shipped across Canada.',
);
