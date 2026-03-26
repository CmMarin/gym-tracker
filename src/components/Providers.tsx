"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-center" toastOptions={{
        style: {
          borderRadius: '16px',
          background: '#fff',
          color: '#1e293b', /* slate-800 */
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }
      }} />
      {children}
    </SessionProvider>
  );
}
