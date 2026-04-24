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
  tanggalPengunduran?: string;
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

export interface Pengeluaran {
  id: number;
  tanggal: string;
  kategori: string;
  uraian: string;
  jumlah: number;
  metodePembayaran: string;
  operator: string;
}

export interface Pengurus {
  id: number;
  jabatan: string;
  nama: string;
  gelar?: string;
}

export interface Pengawas {
  id: number;
  jabatan: string;
  nama: string;
  gelar?: string;
}

export interface Karyawan {
  id: number;
  jabatan: string;
  nama: string;
}

interface DataContextType {
  anggota: Anggota[];
  simpanan: Simpanan[];
  pinjaman: Pinjaman[];
  angsuran: Angsuran[];
  transaksi: Transaksi[];
  pengeluaran: Pengeluaran[];
  pengurus: Pengurus[];
  pengawas: Pengawas[];
  karyawan: Karyawan[];
  logoBase64: string | null; // Store uploaded logo as base64
  addAnggota: (data: Anggota) => void;
  addSimpanan: (data: Simpanan) => void;
  addPinjaman: (data: Pinjaman) => void;
  addAngsuran: (data: Angsuran) => void;
  updatePinjaman: (id: number, sudahDibayar: number, outstanding: number) => void;
  addTransaksi: (data: Transaksi) => void;
  addPengeluaran: (data: Pengeluaran) => void;
  addPengurus: (data: Pengurus) => void;
  addPengawas: (data: Pengawas) => void;
  addKaryawan: (data: Karyawan) => void;
  updateAnggota: (id: number, data: Partial<Anggota>) => void;
  deleteAnggota: (id: number) => void;
  deletePinjaman: (id: number) => void;
  deleteAllPinjaman: () => void;
  clearAllData: () => void;
  setSimpanan: React.Dispatch<React.SetStateAction<Simpanan[]>>;
  deleteSimpanan: (id: number) => void;
  deleteAllSimpanan: () => void;
  deletePengeluaran: (id: number) => void;
  deleteAllPengeluaran: () => void;
  setPengeluaran: React.Dispatch<React.SetStateAction<Pengeluaran[]>>;
  setPengurus: React.Dispatch<React.SetStateAction<Pengurus[]>>;
  setPengawas: React.Dispatch<React.SetStateAction<Pengawas[]>>;
  setKaryawan: React.Dispatch<React.SetStateAction<Karyawan[]>>;
  deleteAllPengurus: () => void;
  deleteAllPengawas: () => void;
  deleteAllKaryawan: () => void;
  setLogoBase64: React.Dispatch<React.SetStateAction<string | null>>;
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
  const [pengeluaran, setPengeluaran] = useState<Pengeluaran[]>(() => getLocalStorage("ksp_pengeluaran"));
  const [pengurus, setPengurus] = useState<Pengurus[]>(() => getLocalStorage("ksp_pengurus") || [
    { id: 1, jabatan: "Ketua", nama: "Samudera Ginting", gelar: "S.H" },
    { id: 2, jabatan: "Wakil Ketua", nama: "Abel Lesmana Tarigan", gelar: "S.P" },
    { id: 3, jabatan: "Sekretaris", nama: "Carolla Sembiring", gelar: "S.H., M.Kn" },
    { id: 4, jabatan: "Bendahara", nama: "Juniawan Sebayang", gelar: "S.P., CHt" },
    { id: 5, jabatan: "Wakil Bendahara", nama: "Dustin Farrel Sembiring Pandia", gelar: "" },
  ]);
  const [pengawas, setPengawas] = useState<Pengawas[]>(() => getLocalStorage("ksp_pengawas") || [
    { id: 1, jabatan: "Ketua", nama: "Sayang David Ginting", gelar: "S.H., S.Pn" },
    { id: 2, jabatan: "Sekretaris", nama: "Sahala Panjaitan", gelar: "S.P" },
    { id: 3, jabatan: "Anggota", nama: "Mika Jepani Br Karosekali", gelar: "" },
  ]);
  const [karyawan, setKaryawan] = useState<Karyawan[]>(() => getLocalStorage("ksp_karyawan") || [
    { id: 1, jabatan: "Manager", nama: "Marwan Esra Bangun" },
    { id: 2, jabatan: "Admin", nama: "Erni Sembiring" },
    { id: 3, jabatan: "Marketing", nama: "Ezzra Mazmur Sembiring" },
  ]);
  const [logoBase64, setLogoBase64] = useState<string | null>(() => {
    const data = getLocalStorage("ksp_logo");
    return data && data.length > 0 ? data[0] : null;
  });

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

  useEffect(() => {
    saveLocalStorage("ksp_pengeluaran", pengeluaran);
  }, [pengeluaran]);

  useEffect(() => {
    saveLocalStorage("ksp_pengurus", pengurus);
  }, [pengurus]);

  useEffect(() => {
    saveLocalStorage("ksp_pengawas", pengawas);
  }, [pengawas]);

   useEffect(() => {
     saveLocalStorage("ksp_karyawan", karyawan);
   }, [karyawan]);

   useEffect(() => {
     saveLocalStorage("ksp_logo", logoBase64 ? [logoBase64] : []);
   }, [logoBase64]);

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
     console.log(`[DataContext] updateAnggota id=${id}`, data);
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
      setPengeluaran([]);
      setPengurus([]);
      setPengawas([]);
      setKaryawan([]);
      setLogoBase64(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("ksp_anggota");
        localStorage.removeItem("ksp_simpanan");
        localStorage.removeItem("ksp_pinjaman");
        localStorage.removeItem("ksp_angsuran");
        localStorage.removeItem("ksp_transaksi");
        localStorage.removeItem("ksp_pengeluaran");
        localStorage.removeItem("ksp_pengurus");
        localStorage.removeItem("ksp_pengawas");
        localStorage.removeItem("ksp_karyawan");
        localStorage.removeItem("ksp_logo");
      }
    };

  const deleteSimpanan = (id: number) => {
    setSimpanan(prev => prev.filter(s => s.id !== id));
  };

   const deleteAllSimpanan = () => {
     setSimpanan([]);
   };

   const deletePinjaman = (id: number) => {
     setPinjaman(prev => prev.filter(p => p.id !== id));
   };

    const deleteAllPinjaman = () => {
      // Also delete all angsuran for those pinjaman
      setPinjaman([]);
      setAngsuran([]);
    };

   const addPengeluaran = (data: Pengeluaran) => {
     setPengeluaran(prev => [...prev, { ...data, id: prev.length + 1 }]);
   };

   const deletePengeluaran = (id: number) => {
     setPengeluaran(prev => prev.filter(p => p.id !== id));
   };

    const deleteAllPengeluaran = () => {
      setPengeluaran([]);
    };

    // Personnel management
    const addPengurus = (data: Pengurus) => {
      setPengurus(prev => [...prev, { ...data, id: prev.length + 1 }]);
    };

    const addPengawas = (data: Pengawas) => {
      setPengawas(prev => [...prev, { ...data, id: prev.length + 1 }]);
    };

    const addKaryawan = (data: Karyawan) => {
      setKaryawan(prev => [...prev, { ...data, id: prev.length + 1 }]);
    };

    const deleteAllPengurus = () => {
      setPengurus([]);
    };

    const deleteAllPengawas = () => {
      setPengawas([]);
    };

    const deleteAllKaryawan = () => {
      setKaryawan([]);
    };

     return (
       <DataContext.Provider value={{
         anggota,
         simpanan,
         pinjaman,
         angsuran,
         transaksi,
         pengeluaran,
          pengurus,
          pengawas,
          karyawan,
          logoBase64,
          addAnggota,
          addSimpanan,
          addPinjaman,
          addAngsuran,
          updatePinjaman,
          addTransaksi,
          addPengeluaran,
          addPengurus,
          addPengawas,
          addKaryawan,
          updateAnggota,
          deleteAnggota,
          deletePinjaman,
          deleteAllPinjaman,
          clearAllData,
          setSimpanan,
          deleteSimpanan,
          deleteAllSimpanan,
          deletePengeluaran,
          deleteAllPengeluaran,
          setPengeluaran,
          setPengurus,
          setPengawas,
          setKaryawan,
          setLogoBase64,
          deleteAllPengurus,
          deleteAllPengawas,
          deleteAllKaryawan,
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