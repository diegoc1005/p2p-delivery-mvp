"use client";

import { PollarProvider } from '@pollar/react';
import { ReactNode } from 'react';

export function PollarProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <PollarProvider
      client={{
        apiKey: "pub_testnet_3205f7beeb231674b94298b0f29ba1be",
        // @ts-ignore
        network: 'stellar',
      }}
    >
      {children}
    </PollarProvider>
  );
}
