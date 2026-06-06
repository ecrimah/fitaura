import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo';

export const metadata: Metadata = noindexMetadata({
  title: 'App Settings',
  description: 'Manage notifications and install preferences for the FITAURA app.',
  path: '/pwa-settings',
});

export default function PwaSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
