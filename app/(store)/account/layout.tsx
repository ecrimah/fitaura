import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'Account',
  description: 'Manage your FITAURA account, addresses, and orders.',
  path: '/account',
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
