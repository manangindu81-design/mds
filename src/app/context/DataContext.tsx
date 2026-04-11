"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface Anggota {
  id: number;
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jkelamin: string;
  status: string;
  alamat: string;
  rt: string;
  rw: string;
  kel: string;
  kec: string;
  kota: string;
  telepon: string;
  email: string;
  pekerjaan: string;
  tempatKerja: string;
  pendapatan: string;
  tanggalJoin: string;
  statusKeanggotaan: string;
}

export interface Simpanan {
  id: number;
  idAnggota: number;
  nama: string;
  nomorAnggota: string;
  tanggal: string;
  jenisSimpanan: string;
  jumlah: number;
  metode: string;
  bunga: number;
}

export interface Pinjaman {
  id: number;
  idAnggota: number;
  nama: string;
  nomorAnggota: string;
  tanggal: string;
  sistem: string;
  jenisPinjaman: string;
  jumlah: number;
  tenor: number;
  bunga: number;
  tujuan: string;
  status: string;
}

export interface Transaksi {
  id: number;
  noBukti: string;
  tanggal: string;
  jam: string;
  akun: string;
  kategori: string;
  uraian: string;
  debet?: number;
  kredit?: number;
  saldo?: number;
  operator: string;
}

interface DataContextType {
  anggota: Anggota[];
  simpanan: Simpanan[];
  pinjaman: Pinjaman[];
  transaksi: Transaksi[];
  addAnggota: (data: Anggota) => void;
  addSimpanan: (data: Simpanan) => void;
  addPinjaman: (data: Pinjaman) => void;
  addTransaksi: (data: Transaksi) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [simpanan, setSimpanan] = useState<Simpanan[]>([]);
  const [pinjaman, setPinjaman] = useState<Pinjaman[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);

  const addAnggota = (data: Anggota) => {
    setAnggota(prev => [...prev, { ...data, id: prev.length + 1 }]);
  };

  const addSimpanan = (data: Simpanan) => {
    setSimpanan(prev => [...prev, { ...data, id: prev.length + 1 }]);
  };

  const addPinjaman = (data: Pinjaman) => {
    setPinjaman(prev => [...prev, { ...data, id: prev.length + 1 }]);
  };

  const addTransaksi = (data: Transaksi) => {
    setTransaksi(prev => [...prev, { ...data, id: prev.length + 1 }]);
  };

  return (
    <DataContext.Provider value={{
      anggota,
      simpanan,
     pinjaman,
      transaksi,
      addAnggota,
      addSimpanan,
      addPinjaman,
      addTransaksi,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}