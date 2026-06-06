import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Return Submitted',
  description: 'Your FITAURA return request has been submitted.',
  path: '/returns/confirmation',
});

export default function ReturnsConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
