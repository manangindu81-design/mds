"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Anggota {
  id: number;
  nomorNBA: string;
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jkelamin: string;
  status: string;
  namaPasangan?: string;
  jumlahAnak?: string;
  namaIbuKandung?: string;
  namaSaudara?: string;
  telpSaudara?: string;
  hubungan?: string;
  alamat: string;
  rt?: string;
  rw?: string;
  kel?: string;
  kec?: string;
  kota?: string;
  telepon: string;
  email?: string;
  pekerjaan: string;
  besarPenghasilan?: string;
  posisi?: string;
  pangkat?: string;
  Golongan?: string;
  statusPekerjaan?: string;
  lamaBekerja?: string;
  alamatTempatKerja?: string;
  tempatKerja?: string;
  pendapatan?: string;
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
  updateAnggota: (id: number, data: Partial<Anggota>) => void;
  deleteAnggota: (id: number) => void;
  clearAllData: () => void;
  setSimpanan: React.Dispatch<React.SetStateAction<Simpanan[]>>;
  deleteSimpanan: (id: number) => void;
  deleteAllSimpanan: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const getLocalStorage = (key: string): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalStorage = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Save error:", e);
  }
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [anggota, setAnggota] = useState<Anggota[]>(() => getLocalStorage("ksp_anggota"));
  const [simpanan, setSimpanan] = useState<Simpanan[]>(() => getLocalStorage("ksp_simpanan"));
  const [pinjaman, setPinjaman] = useState<Pinjaman[]>(() => getLocalStorage("ksp_pinjaman"));
  const [angsuran, setAngsuran] = useState<Angsuran[]>(() => getLocalStorage("ksp_angsuran"));
  const [transaksi, setTransaksi] = useState<Transaksi[]>(() => getLocalStorage("ksp_transaksi"));

  useEffect(() => {
    saveLocalStorage("ksp_anggota", anggota);
  }, [anggota]);

  useEffect(() => {
    saveLocalStorage("ksp_simpanan", simpanan);
  }, [simpanan]);

  useEffect(() => {
    saveLocalStorage("ksp_pinjaman", pinjaman);
  }, [pinjaman]);

  useEffect(() => {
    saveLocalStorage("ksp_angsuran", angsuran);
  }, [angsuran]);

  useEffect(() => {
    saveLocalStorage("ksp_transaksi", transaksi);
  }, [transaksi]);

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

  const updateAnggota = (id: number, data: Partial<Anggota>) => {
    setAnggota(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAnggota = (id: number) => {
    setAnggota(prev => prev.filter(a => a.id !== id));
  };

  const clearAllData = () => {
    setAnggota([]);
    setSimpanan([]);
    setPinjaman([]);
    setAngsuran([]);
    setTransaksi([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ksp_anggota");
      localStorage.removeItem("ksp_simpanan");
      localStorage.removeItem("ksp_pinjaman");
      localStorage.removeItem("ksp_angsuran");
      localStorage.removeItem("ksp_transaksi");
    }
  };

  const deleteSimpanan = (id: number) => {
    setSimpanan(prev => prev.filter(s => s.id !== id));
  };

  const deleteAllSimpanan = () => {
    setSimpanan([]);
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
      updateAnggota,
      deleteAnggota,
      clearAllData,
      setSimpanan,
      deleteSimpanan,
      deleteAllSimpanan,
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