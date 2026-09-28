"use client";

import { PollarProvider } from '@pollar/react';
import { ReactNode } from 'react';

export function PollarProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <PollarProvider
      client={{
        apiKey: "pat_6d9ac2fd4be4182b3be29fe7162226c13f4c6524b81a39ca5dcf93c64265121c",
        // @ts-ignore
        network: 'stellar',
      }}
    >
      {children}
    </PollarProvider>
  );
}
