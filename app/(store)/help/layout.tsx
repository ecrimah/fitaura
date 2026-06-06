import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Help Center',
  description: 'Get help with your FITAURA order, account, or product.',
  path: '/help',
});

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
