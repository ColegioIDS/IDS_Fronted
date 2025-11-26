// src/app/(admin)/config-status-mapping/page.tsx
import { ConfigStatusMappingPage } from '@/components/features/config-status-mapping';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Config-Status Mappings | IDS System',
  description: 'Manage config-status mappings',
};

export default function Page() {
  return <ConfigStatusMappingPage />;
}
