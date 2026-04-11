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
  namaSuamiIstri: string;
  alamat: string;
  tanggal: string;
  sistem: string;
  jenisPinjaman: string;
  jumlah: number;
  tenor: number;
  bunga: number;
  denda: number;
  tujuan: string;
  status: string;
  biayaAdmin: number;
  sudahDibayar: number;
  outstanding: number;
  jenisKredit: string;
  jenisPencairan: string;
  noPerjanjian: string;
  tanggalRealisasi: string;
  tanggalJatuhTempo: string;
  biayaMaterai: number;
  biayaLegalisasi: number;
  feeNotaris: number;
}

export interface Angsuran {
  id: number;
  idPinjaman: number;
  idAnggota: number;
  nama: string;
  nomorAnggota: string;
  tanggal: string;
  angsuranKe: number;
  angsuranPokok: number;
  angsuranBunga: number;
  denda: number;
  totalBayar: number;
  saldoPiutang: number;
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
  angsuran: Angsuran[];
  transaksi: Transaksi[];
  addAnggota: (data: Anggota) => void;
  addSimpanan: (data: Simpanan) => void;
  addPinjaman: (data: Pinjaman) => void;
  addAngsuran: (data: Angsuran) => void;
  updatePinjaman: (id: number, sudahDibayar: number, outstanding: number) => void;
  addTransaksi: (data: Transaksi) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [simpanan, setSimpanan] = useState<Simpanan[]>([]);
  const [pinjaman, setPinjaman] = useState<Pinjaman[]>([]);
  const [angsuran, setAngsuran] = useState<Angsuran[]>([]);
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

  const addAngsuran = (data: Angsuran) => {
    setAngsuran(prev => [...prev, { ...data, id: prev.length + 1 }]);
  };

  const updatePinjaman = (id: number, sudahDibayar: number, outstanding: number) => {
    setPinjaman(prev => prev.map(p => 
      p.id === id ? { ...p, sudahDibayar, outstanding } : p
    ));
  };

  const addTransaksi = (data: Transaksi) => {
    setTransaksi(prev => [...prev, { ...data, id: prev.length + 1 }]);
  };

  return (
    <DataContext.Provider value={{
      anggota,
      simpanan,
      pinjaman,
      angsuran,
      transaksi,
      addAnggota,
      addSimpanan,
      addPinjaman,
      addAngsuran,
      updatePinjaman,
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