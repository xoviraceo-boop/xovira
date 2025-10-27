import React from "react";
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Head from "next/head";
import Providers from "@/components/providers/Providers";
import { mergeOpenGraph } from '@/utils/utilities//mergeOpenGraph';
import { getServerSideURL } from '@/utils/utilities/getURL';
import { auth } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ['latin'], weight: ['400', '700'] });

const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    title: "NaisCorp",
    description: "The connected workspace where better, faster work happens.",
    images: ['/images/logo.png'],
  },
  icons: {
    icon: [
      { url: "/global/app_logos/favicon.ico", media: "(prefers-color-scheme: light)" },
      { url: "/global/app_logos/favicon.ico", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/images/logo.png",
    shortcut: "/images/logo.png",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href="https://shopify-app.doc2product.com" />
      </Head>
      <body className={inter.className}>
        <React.StrictMode>
          <Providers session={session}>
            {children}
          </Providers>
        </React.StrictMode>
      </body>
    </html>
  );
}