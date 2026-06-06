/**
 * Shared FAQ content — used by the FAQs page UI and FAQPage JSON-LD.
 * Includes E-E-A-T product-focused answers (sizing, materials, fit) so
 * Google associates FITAURA with gymwear + athleisure expertise.
 */

export interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export const FAQ_CATEGORIES = [
  { id: 'all', name: 'All Questions', icon: 'ri-question-line' },
  { id: 'products', name: 'Products & Fit', icon: 'ri-shirt-line' },
  { id: 'orders', name: 'Orders', icon: 'ri-shopping-bag-line' },
  { id: 'shipping', name: 'Shipping', icon: 'ri-truck-line' },
  { id: 'returns', name: 'Returns', icon: 'ri-arrow-go-back-line' },
  { id: 'payment', name: 'Payment', icon: 'ri-bank-card-line' },
  { id: 'account', name: 'Account', icon: 'ri-user-line' },
] as const;

export const FAQ_ITEMS: FaqItem[] = [
  // ---- E-E-A-T: Product expertise (gymwear / athleisure / lifestyle) ----
  {
    category: 'products',
    question: 'What makes FITAURA different from other gymwear brands?',
    answer:
      'FITAURA is a modern lifestyle clothing brand — not just gymwear. We design gymwear, athleisure and fashion-forward apparel that moves from training to street without a wardrobe change. Every piece is fit-tested in Calgary, built for confidence in comfort, and made to hold shape wash after wash.',
  },
  {
    category: 'products',
    question: 'What fabrics does FITAURA use for leggings and sports bras?',
    answer:
      'Our core gymwear and athleisure pieces use recycled nylon blends, organic-cotton mixes and OEKO-TEX certified knits selected for stretch recovery, breathability and a premium hand-feel. Fabric composition is listed on every product page.',
  },
  {
    category: 'products',
    question: 'How do I choose the right size for FITAURA activewear?',
    answer:
      'Use our Size Guide — it includes bust, waist, hip and inseam measurements for leggings, sports bras, tops and joggers. Between sizes? For compressive gymwear, size up; for relaxed athleisure, your usual size usually works. Still unsure? Contact us at Fitaurawear@gmail.com before ordering.',
  },
  {
    category: 'products',
    question: 'Is FITAURA gymwear squat-proof and sweat-wicking?',
    answer:
      'Yes. Our sculpting leggings and seamless styles are designed for full range of motion with opacity-tested fabric. Moisture-wicking blends keep you dry through training and everyday wear — the same standard we apply across our athleisure line.',
  },
  {
    category: 'products',
    question: 'Can I wear FITAURA athleisure outside the gym?',
    answer:
      'Absolutely — that is the point. FITAURA is fashion-forward apparel built for lifestyle: lounge sets, elevated joggers and coordinated pieces you can wear to the studio, coffee run or travel day. Modern lifestyle clothing, not single-use gym gear.',
  },
  {
    category: 'products',
    question: 'How should I care for FITAURA gymwear to make it last?',
    answer:
      'Wash cold inside out, skip fabric softener, and air-dry or tumble low. Full care instructions are in our Care Guide. Proper care preserves elastane stretch and colour — so your pieces stay sharp season after season.',
  },
  // ---- Orders ----
  {
    category: 'orders',
    question: 'How do I place an order?',
    answer:
      'Browse our shop, add gymwear or athleisure pieces to your bag, checkout with your delivery address and payment method, and confirm. You will receive email confirmation with order details and tracking when your order ships.',
  },
  {
    category: 'orders',
    question: 'Can I modify or cancel my order?',
    answer:
      'You can modify or cancel within 1 hour of placing it. Contact Fitaurawear@gmail.com immediately. Once processed, changes may not be possible.',
  },
  {
    category: 'orders',
    question: 'How do I track my order?',
    answer:
      'After dispatch you receive a tracking number via email. Use our Order Tracking page with your order number and email for real-time delivery updates.',
  },
  {
    category: 'orders',
    question: 'What if I receive the wrong item?',
    answer:
      'Contact us within 48 hours with photos. We will send the correct item immediately and arrange free return collection of the wrong piece.',
  },
  // ---- Shipping ----
  {
    category: 'shipping',
    question: 'What are your delivery times?',
    answer:
      'Standard shipping: 3–7 business days across Canada. Express: 1–2 business days in major cities. Orders before 2pm MT dispatch same day. Remote areas may take 5–10 business days.',
  },
  {
    category: 'shipping',
    question: 'How much does shipping cost?',
    answer:
      'Standard shipping $8 CAD. Express $18 CAD. FREE standard shipping on orders over $120 CAD. Calgary local delivery $6 CAD.',
  },
  {
    category: 'shipping',
    question: 'Do you ship outside Canada?',
    answer:
      'We ship across Canada today and are expanding to the US. Join our newsletter for international shipping updates.',
  },
  {
    category: 'shipping',
    question: 'What if nobody is home for delivery?',
    answer:
      'The carrier attempts delivery twice, then holds the package at a collection point for 5 days. You receive SMS and email with pickup instructions.',
  },
  // ---- Returns ----
  {
    category: 'returns',
    question: 'What is your return policy?',
    answer:
      '30-day returns on unworn items with tags attached. Initiate from your account, print the label, and ship back. Refunds process within 5–7 business days after we receive the item.',
  },
  {
    category: 'returns',
    question: 'Which items cannot be returned?',
    answer:
      'For hygiene reasons we cannot accept returns on opened intimate apparel or earrings. Custom or personalised items are non-returnable unless defective.',
  },
  {
    category: 'returns',
    question: 'Who pays for return shipping?',
    answer:
      'Defective or wrong-item returns: we cover shipping. Change-of-mind returns: customer pays (~$10 CAD standard).',
  },
  {
    category: 'returns',
    question: 'Can I exchange for a different size?',
    answer:
      'Yes — select Exchange when initiating your return. We ship the replacement once we receive the original. Exchange shipping is free.',
  },
  // ---- Payment ----
  {
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer:
      'Visa, Mastercard, American Express, Apple Pay, Google Pay and Stripe secure checkout. All prices in CAD.',
  },
  {
    category: 'payment',
    question: 'Is my payment information secure?',
    answer:
      'Yes. Payments are processed by Stripe with PCI-DSS Level 1 compliance. FITAURA never stores full card numbers on our servers.',
  },
  {
    category: 'payment',
    question: 'When will my payment be charged?',
    answer:
      'Card payments are captured at checkout. If an item is out of stock, we refund within 24 hours.',
  },
  {
    category: 'payment',
    question: 'How do refunds work?',
    answer:
      'Refunds return to your original payment method within 5–10 business days after we receive and inspect your return.',
  },
  // ---- Account ----
  {
    category: 'account',
    question: 'Do I need an account to shop?',
    answer:
      'No — guest checkout is available. An account lets you track orders, save addresses and manage returns faster.',
  },
  {
    category: 'account',
    question: 'How do I reset my password?',
    answer:
      'Use Forgot Password on the sign-in page. A reset link is sent to your registered email within minutes.',
  },
  {
    category: 'account',
    question: 'Can I have multiple delivery addresses?',
    answer:
      'Yes — save multiple addresses in your account and select the one you need at checkout.',
  },
  {
    category: 'account',
    question: 'How do I update my account information?',
    answer:
      'Log in, open Account Settings, and update your name, email, phone, password or saved addresses.',
  },
];
