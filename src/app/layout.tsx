import type { Metadata } from "next";
import Head from "next/head";
import Script from "next/script";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { DataProvider } from "./context/DataContext";
import ClientLayout from "./components/ClientLayout";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "KSP Mulia Dana Sejahtera",
  description: "Sistem Pengelolaan Data Koperasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <Head>
        <link rel="preload" href="/js/main.js" as="script" />
      </Head>
      <body style={{ margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
        <Script src="/js/main.js" strategy="afterInteractive" />
        <DataProvider>
          <ClientLayout>{children}</ClientLayout>
        </DataProvider>
      </body>
    </html>
  );
}