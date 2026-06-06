/**
 * E-E-A-T enhanced Schema.org JSON-LD generators for FITAURA.
 *
 * Experience    → aggregateRating, reviews, real product imagery
 * Expertise     → knowsAbout, author jobTitle, size/care guides linked
 * Authoritativeness → Brand, OfferCatalog, Canadian business entity
 * Trustworthiness   → MerchantReturnPolicy, ContactPoint, real contact data
 */

import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from './seo';
import { FOCUS_PRODUCT_PHRASE, getFocusKeywords } from './seo-keywords';

export const BUSINESS = {
  phone: '+1-587-432-6761',
  email: 'Fitaurawear@gmail.com',
  locality: 'Calgary',
  region: 'AB',
  country: 'CA',
  instagram: 'https://instagram.com/fitaura.ca',
  foundingDate: '2026',
} as const;

export const MERCHANT_RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  '@id': `${SITE_URL}/#return-policy`,
  name: 'FITAURA 30-Day Return Policy',
  applicableCountry: 'CA',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 30,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
  merchantReturnLink: `${SITE_URL}/returns`,
} as const;

const KNOWS_ABOUT = [
  'Gymwear',
  'Athleisure',
  'Modern lifestyle clothing',
  'Fashion-forward apparel',
  'Activewear',
  'Leggings',
  'Sports bras',
  'Loungewear',
  'Sustainable fashion',
  'Women\'s activewear',
  'Men\'s athleisure',
];

// ---------------------------------------------------------------------------
// Site-wide entities (rendered in root layout)
// ---------------------------------------------------------------------------

export function generateOrganizationEeatSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: 'FITAURA',
    alternateName: ['shopfitaura', 'FITAURA Canada', 'FITAURA Calgary'],
    url: SITE_URL,
    slogan: 'Confidence In Motion.',
    description: SITE_TAGLINE,
    foundingDate: BUSINESS.foundingDate,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
      caption: SITE_NAME,
    },
    image: DEFAULT_OG_IMAGE,
    knowsAbout: KNOWS_ABOUT,
    areaServed: [
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'United States' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.locality,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        contactType: 'customer service',
        areaServed: ['CA', 'US'],
        availableLanguage: ['English'],
        url: `${SITE_URL}/contact`,
      },
    ],
    sameAs: [BUSINESS.instagram],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'FITAURA — Gymwear, Athleisure & Lifestyle',
      itemListElement: [
        { '@type': 'OfferCatalog', name: 'Gymwear', url: `${SITE_URL}/shop` },
        { '@type': 'OfferCatalog', name: 'Athleisure', url: `${SITE_URL}/shop` },
        { '@type': 'OfferCatalog', name: 'Lounge & Lifestyle', url: `${SITE_URL}/categories` },
        { '@type': 'OfferCatalog', name: 'New Arrivals', url: `${SITE_URL}/shop` },
        { '@type': 'OfferCatalog', name: 'Accessories', url: `${SITE_URL}/categories` },
      ],
    },
  };
}

export function generateBrandSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    '@id': `${SITE_URL}/#brand`,
    name: SITE_NAME,
    slogan: 'Confidence In Motion.',
    description: FOCUS_PRODUCT_PHRASE,
    logo: `${SITE_URL}/icon-512.png`,
    url: SITE_URL,
    sameAs: [BUSINESS.instagram],
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    inLanguage: 'en-CA',
    publisher: { '@id': `${SITE_URL}/#organization` },
    about: { '@id': `${SITE_URL}/#brand` },
    keywords: getFocusKeywords('primary', 'commerce').join(', '),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOnlineStoreSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': `${SITE_URL}/#store`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    image: DEFAULT_OG_IMAGE,
    logo: `${SITE_URL}/icon-512.png`,
    paymentAccepted: ['Credit Card', 'Debit Card', 'Apple Pay', 'Google Pay'],
    currenciesAccepted: 'CAD',
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    brand: { '@id': `${SITE_URL}/#brand` },
    hasMerchantReturnPolicy: { '@id': `${SITE_URL}/#return-policy` },
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.locality,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    areaServed: [
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'United States' },
    ],
  };
}

export function generateClothingStoreSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${SITE_URL}/#clothing-store`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_TAGLINE,
    image: DEFAULT_OG_IMAGE,
    logo: `${SITE_URL}/icon-512.png`,
    priceRange: '$$',
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.locality,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.0447,
      longitude: -114.0719,
    },
    knowsAbout: KNOWS_ABOUT,
    areaServed: [
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'United States' },
    ],
    currenciesAccepted: 'CAD',
    paymentAccepted: ['Credit Card', 'Debit Card', 'Apple Pay', 'Google Pay'],
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    brand: { '@id': `${SITE_URL}/#brand` },
    sameAs: [BUSINESS.instagram],
  };
}

// ---------------------------------------------------------------------------
// Page-level schemas
// ---------------------------------------------------------------------------

export function generateWebPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  /** e.g. WebPage, AboutPage, CollectionPage, FAQPage */
  type?: string;
  speakableSelectors?: string[];
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': opts.type || 'WebPage',
    '@id': `${opts.url}#webpage`,
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: 'en-CA',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#brand` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    keywords: getFocusKeywords('primary', 'commerce').join(', '),
  };

  if (opts.speakableSelectors?.length) {
    schema.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: opts.speakableSelectors,
    };
  }

  return schema;
}

export function generateAboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about#webpage`,
    name: `About ${SITE_NAME} — Modern Lifestyle Clothing from Calgary`,
    description:
      'FITAURA is a Calgary-based modern lifestyle clothing brand specialising in gymwear, athleisure and fashion-forward apparel.',
    url: `${SITE_URL}/about`,
    inLanguage: 'en-CA',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    mainEntity: { '@id': `${SITE_URL}/#organization` },
    keywords: getFocusKeywords('primary', 'expertise').join(', '),
  };
}

export function generateItemListSchema(items: {
  name: string;
  url: string;
  image?: string;
  position: number;
}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

export function generateCollectionPageSchema(collection: {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${collection.url}#collection`,
    name: collection.name,
    description: collection.description,
    url: collection.url,
    inLanguage: 'en-CA',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#brand` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.numberOfItems,
    },
    keywords: getFocusKeywords('commerce').join(', '),
  };
}

// ---------------------------------------------------------------------------
// Product + commerce
// ---------------------------------------------------------------------------

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string | string[];
  url: string;
  price: number;
  currency?: string;
  sku: string;
  mpn?: string;
  gtin?: string;
  rating?: number;
  reviewCount?: number;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  brand?: string;
  category?: string;
  color?: string;
  size?: string;
  material?: string;
  priceValidUntil?: string;
  tags?: string[];
}) {
  const images = Array.isArray(product.image) ? product.image : [product.image];
  const availabilityMap = {
    in_stock: 'https://schema.org/InStock',
    out_of_stock: 'https://schema.org/OutOfStock',
    preorder: 'https://schema.org/PreOrder',
  } as const;
  const priceValidUntil =
    product.priceValidUntil ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${product.url}#product`,
    name: product.name,
    description: product.description,
    image: images,
    url: product.url,
    sku: product.sku,
    brand: { '@type': 'Brand', '@id': `${SITE_URL}/#brand`, name: product.brand || SITE_NAME },
    manufacturer: { '@id': `${SITE_URL}/#organization` },
    audience: {
      '@type': 'PeopleAudience',
      audienceType: 'Active lifestyle, gym and athleisure shoppers',
      geographicArea: { '@type': 'Country', name: 'Canada' },
    },
    keywords: [...getFocusKeywords('primary', 'commerce'), ...(product.tags ?? [])].join(', '),
    offers: {
      '@type': 'Offer',
      url: product.url,
      price: product.price.toFixed(2),
      priceCurrency: product.currency || 'CAD',
      availability: availabilityMap[product.availability || 'in_stock'],
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      hasMerchantReturnPolicy: { '@id': `${SITE_URL}/#return-policy` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'CAD' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CA' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' },
        },
      },
    },
  };

  if (product.mpn) schema.mpn = product.mpn;
  if (product.gtin) schema.gtin = product.gtin;
  if (product.category) schema.category = product.category;
  if (product.color) schema.color = product.color;
  if (product.size) schema.size = product.size;
  if (product.material) schema.material = product.material;

  if (product.rating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// Content / expertise
// ---------------------------------------------------------------------------

export function generateBlogPostingEeatSchema(post: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${post.url}#article`,
    headline: post.title,
    description: post.description,
    image: post.image || DEFAULT_OG_IMAGE,
    url: post.url,
    datePublished: post.publishedTime,
    dateModified: post.modifiedTime || post.publishedTime,
    inLanguage: 'en-CA',
    author: {
      '@type': 'Person',
      name: post.author || `${SITE_NAME} Editorial`,
      jobTitle: 'Activewear & Lifestyle Editor',
      worksFor: { '@id': `${SITE_URL}/#organization` },
      knowsAbout: ['Athleisure', 'Gymwear', 'Fashion-forward apparel', 'Sustainable activewear'],
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': post.url },
    keywords: [...(post.tags ?? []), ...getFocusKeywords('longtail')].join(', '),
    about: KNOWS_ABOUT.map((topic) => ({ '@type': 'Thing', name: topic })),
  };
}

export function generateFAQSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faqs#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

