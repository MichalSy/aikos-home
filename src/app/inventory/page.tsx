import { Suspense } from 'react';
import { InventoryClient } from './InventoryClient';

// Server Component - handles initial data fetch
export default function InventoryPage() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Suspense fallback={<div style={{ color: '#888' }}>Loading inventory...</div>}>
        <InventoryClient />
      </Suspense>
    </div>
  );
}
