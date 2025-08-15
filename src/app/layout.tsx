import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import AuthSessionProvider from "./_components/session-provider";

export const metadata: Metadata = {
  title: "Vehicle Information Management System",
  description: "A comprehensive platform for managing vehicle information.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <AuthSessionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
