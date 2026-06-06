import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Support',
  description: 'Submit and track support tickets for your FITAURA order.',
  path: '/support',
});

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
