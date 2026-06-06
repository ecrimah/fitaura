import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'We Will Be Right Back',
  description: 'FITAURA is briefly under maintenance.',
  path: '/maintenance',
});

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
