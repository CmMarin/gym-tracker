import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuffBuddies",
  description: "Level up your workouts",
  icons: {
    icon: '/site-icon.ico',
    apple: '/site-icon.ico'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BuffBuddies",
  },
  formatDetection: {
    telephone: false,
  }
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
