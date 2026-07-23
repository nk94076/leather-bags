"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#201812",
            color: "#faf6f2",
            border: "1px solid #6f4e37",
          },
        }}
      />
    </SessionProvider>
  );
}
