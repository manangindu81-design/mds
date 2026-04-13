import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "./context/DataContext";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "KSP Mulia Dana Sejahtera",
  description: "Sistem Pengelolaan Data Koperasi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
        <DataProvider>
          <ClientLayout>{children}</ClientLayout>
        </DataProvider>
      </body>
    </html>
  );
}