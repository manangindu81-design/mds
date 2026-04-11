import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "./context/DataContext";

export const metadata: Metadata = {
  title: "KSP Mulia Dana Sejahtera",
  description: "Koperasi Simpan Pinjam Mulia Dana Sejahtera - Membangun Negeri, Membahagiakan Anggota",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}