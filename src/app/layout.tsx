import type { Metadata } from "next";
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
      <body style={{ margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
        <DataProvider>
          <ClientLayout>{children}</ClientLayout>
        </DataProvider>
      </body>
    </html>
  );
}