"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useData, Anggota as AnggotaType } from "../context/DataContext";
import * as XLSX from "xlsx";

export default function AnggotaPage() {
  const { anggota, addAnggota, addSimpanan, addTransaksi, clearAllData, updateAnggota, deleteAnggota, simpanan } = useData();
  const [activeTab, setActiveTab] = useState<"daftar" | "data" | "import" | "keluar">("import");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [keluarSearch, setKeluarSearch] = useState("");
  
  const filteredAnggota = useMemo(() => {
    if (!searchQuery) return anggota || [];
    const q = searchQuery.toLowerCase();
    return (anggota || []).filter(a => 
      (a.nama && a.nama.toLowerCase().includes(q)) ||
      (a.nomorNBA && a.nomorNBA.toLowerCase().includes(q)) ||
      (a.nik && a.nik.includes(searchQuery))
    );
  }, [anggota, searchQuery]);
  
  const filteredKeluar = useMemo(() => {
    if (!keluarSearch) return (anggota || []).filter(a => a.statusKeanggotaan !== "Non-Aktif");
    const q = keluarSearch.toLowerCase();
    return (anggota || []).filter(a => 
      a.statusKeanggotaan !== "Non-Aktif" &&
      ((a.nama && a.nama.toLowerCase().includes(q)) ||
      (a.nomorNBA && a.nomorNBA.toLowerCase().includes(q)) ||
      (a.nik && a.nik.includes(keluarSearch)))
    );
  }, [anggota, keluarSearch]);
  
  const nonAktifAnggota = useMemo(() => {
    return (anggota || []).filter(a => a.statusKeanggotaan === "Non-Aktif");
  }, [anggota]);
  
  // Parse Excel date serial or string to DD-MM-YYYY
  const parseExcelDate = (value: any, defaultDate?: string): string => {
    if (value === undefined || value === null || value === "") {
      return defaultDate || new Date().toISOString().split("T")[0];
    }
    
    // Check if it's a number (Excel serial date)
    const numValue = Number(value);
    if (!isNaN(numValue) && typeof value !== "boolean") {
      // Handle Excel serial number (starting from Dec 30, 1899)
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + numValue * 24 * 60 * 60 * 1000);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    
    // Handle string dates
    if (typeof value === "string") {
      const str = value.trim();
      if (!str) return defaultDate || new Date().toISOString().split("T")[0];
      
      // Check if it's a numeric string (like "45272")
      const numericStr = Number(str);
      if (!isNaN(numericStr)) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + numericStr * 24 * 60 * 60 * 1000);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }
      
      const parts = str.split(/[-/]/);
      if (parts.length === 3) {
        const [p1, p2, p3] = parts;
        // Format DD-MM-YYYY -> YYYY-MM-DD
        if (str.includes("-") && p1.length <= 2 && p3.length === 4) {
          return `${p3}-${p2.padStart(2, "0")}-${p1.padStart(2, "0")}`;
        }
        // Format YYYY-MM-DD -> YYYY-MM-DD (already correct)
        if (str.includes("-") && p1.length === 4 && p3.length <= 2) {
          return `${p1}-${p2.padStart(2, "0")}-${p3.padStart(2, "0")}`;
        }
        // Format YYYY/MM/DD -> YYYY-MM-DD
        if (str.includes("/") && p1.length === 4) {
          return `${p1}-${p2.padStart(2, "0")}-${p3.padStart(2, "0")}`;
        }
      }
      return str;
    }
    
    return defaultDate || new Date().toISOString().split("T")[0];
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const handlePengunduran = (id: number) => {
    const targetDate = new Date().toISOString().split("T")[0];
    const biayaPengunduran = 50000;
    
    const agg = anggota.find(a => a.id === id);
    if (!agg) return;
    
    const aggSimpanan = simpanan.filter(s => s.idAnggota === id && (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib"));
    const totalSimpanan = aggSimpanan.reduce((sum, s) => sum + s.jumlah, 0);
    
    const confirmMsg = `anggota: ${agg.nama}
No. NBA: ${agg.nomorNBA || "-"}

Simpanan Pokok: Rp ${aggSimpanan.filter(s => s.jenisSimpanan === "pokok").reduce((sum, s) => sum + s.jumlah, 0).toLocaleString("id-ID")}
Simpanan Wajib: Rp ${aggSimpanan.filter(s => s.jenisSimpanan === "wajib").reduce((sum, s) => sum + s.jumlah, 0).toLocaleString("id-ID")}
Total Simpanan: Rp ${totalSimpanan.toLocaleString("id-ID")}

Biaya Pengunduran Diri: Rp ${biayaPengunduran.toLocaleString("id-ID")}

Yakin ingin memproses?`;
    
    if (!confirm(confirmMsg)) return;
    
    updateAnggota(id, {
      statusKeanggotaan: "Non-Aktif",
      tanggalPengunduran: targetDate
    });
    
    aggSimpanan.forEach((s, i) => {
      addSimpanan({
        id: 0,
        idAnggota: id,
        nama: agg.nama,
        nomorAnggota: agg.nomorNBA || "",
        tanggal: targetDate,
        jenisSimpanan: s.jenisSimpanan,
        jumlah: -Math.abs(s.jumlah),
        metode: "tunai",
        bunga: 0,
      });
      
      addTransaksi({
        id: 0,
        noBukti: `PD-${targetDate.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
        tanggal: targetDate,
        jam: "10:00",
        akun: "Kas",
        kategori: `Penarikan Simpanan ${s.jenisSimpanan.charAt(0).toUpperCase() + s.jenisSimpanan.slice(1)}`,
        uraian: `Penarikan Simpanan ${s.jenisSimpanan} ${agg.nama}`,
        debet: 0,
        kredit: Math.abs(s.jumlah),
        saldo: 0,
        operator: "Admin",
      });
      
      addTransaksi({
        id: 0,
        noBukti: `PP-${targetDate.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
        tanggal: targetDate,
        jam: "10:00",
        akun: "Pendapatan Pengunduran Diri Anggota",
        kategori: "Pendapatan Pengunduran Diri",
        uraian: `Pendapatan Pengunduran Diri ${agg.nama}`,
        debet: 0,
        kredit: Math.abs(s.jumlah),
        saldo: 0,
        operator: "Admin",
      });
    });
    
    addTransaksi({
      id: 0,
      noBukti: `BP-${targetDate.replace(/-/g, "")}-001`,
      tanggal: targetDate,
      jam: "10:00",
      akun: "Kas",
      kategori: "Biaya Pengunduran Diri",
      uraian: `Biaya Pengunduran Diri ${agg.nama}`,
      debet: biayaPengunduran,
      kredit: 0,
      saldo: 0,
      operator: "Admin",
    });
    
    addTransaksi({
      id: 0,
      noBukti: `BP-${targetDate.replace(/-/g, "")}-002`,
      tanggal: targetDate,
      jam: "10:00",
      akun: "Pendapatan Pengunduran Diri Anggota",
      kategori: "Pendapatan Pengunduran Diri",
      uraian: `Biaya Pengunduran Diri ${agg.nama}`,
      debet: 0,
      kredit: biayaPengunduran,
      saldo: 0,
      operator: "Admin",
    });
    
    alert(`Anggota "${agg.nama}" telah mengundurkan diri.\n\nSimpanan Pokok & Wajib: ${aggSimpanan.length} transaksi\nTotal Simpanan: Rp ${totalSimpanan.toLocaleString("id-ID")}\nBiaya Pengunduran: Rp ${biayaPengunduran.toLocaleString("id-ID")}`);
  };
  
  // When editingId changes, populate editForm with the selected anggota data
  useEffect(() => {
    if (editingId) {
      const selected = anggota.find(a => a.id === editingId);
      if (selected) {
        setEditForm({
          nik: String(selected.nik || ""),
          nama: String(selected.nama || ""),
          tempatLahir: String(selected.tempatLahir || ""),
          tanggalLahir: formatDate(String(selected.tanggalLahir || "")),
          jkelamin: String(selected.jkelamin || ""),
          status: String(selected.status || ""),
          namaPasangan: String((selected as any).namaPasangan || ""),
          jumlahAnak: String((selected as any).jumlahAnak || ""),
          namaIbuKandung: String((selected as any).namaIbuKandung || ""),
          namaSaudara: String((selected as any).namaSaudara || ""),
          telpSaudara: String((selected as any).telpSaudara || ""),
          hubungan: String((selected as any).hubungan || ""),
          pekerjaan: String(selected.pekerjaan || ""),
          alamat: String(selected.alamat || ""),
          telepon: String(selected.telepon || ""),
          email: String((selected as any).email || ""),
          tempatKerja: String((selected as any).tempatKerja || ""),
          pendapatan: String(selected.pendapatan || ""),
        });
      }
    }
  }, [editingId, anggota]);
  
  const formatDate = (date: string) => {
    if (!date) return "";
    // Handle YYYY-MM-DD format (for edit form input)
    if (date.includes("-") && date.length === 10 && date.substring(0,4).length === 4) {
      return date;
    }
    // Handle DD-MM-YYYY format (convert to YYYY-MM-DD for edit form)
    if (date.includes("-") && date.length === 10 && date.substring(6,10).length === 4) {
      const parts = date.split("-");
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    // Fallback
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const displayDate = (date: string) => {
    if (!date) return "-";
    // If YYYY-MM-DD, convert to DD-MM-YYYY for display
    if (date.includes("-") && date.length === 10 && date.substring(0,4).length === 4) {
      const parts = date.split("-");
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return date;
  };
  
  const noNBA = String(anggota.length + 1);
  const tanggalMasuk = formatDate(new Date().toISOString().split("T")[0]);
  
  const optionsHubungan = [
    { value: "", label: "Pilih" },
    { value: "kaka", label: "Kakak" },
    { value: "adik", label: "Adik" },
    { value: "ayah", label: "Ayah" },
    { value: "ibu", label: "Ibu" },
    { value: "paman", label: "Paman" },
    { value: "bibi", label: "Bibik" },
    { value: "keponakan", label: "Keponakan" },
    { value: "menantu", label: "Menantu" },
    { value: "lain", label: "Lainnya" },
  ];
  
  const optionsPekerjaan = [
    { value: "", label: "Pilih" },
    { value: "pegawai-negeri", label: "Pegawai Negeri" },
    { value: "pegawai-swasta", label: "Pegawai Swasta" },
    { value: "wiraswasta", label: "Wiraswasta" },
    { value: "tani", label: "Petani/Nelayan" },
    { value: "ojek", label: "Ojek/Driver" },
    { value: "pedagang", label: "Pedagang" },
    { value: "tukang", label: "Tukang Bangunan" },
    { value: "ibu-rumah-tangga", label: "Ibu Rumah Tangga" },
    { value: "pelajar", label: "Pelajar/Mahasiswa" },
    { value: "lain", label: "Lainnya" },
  ];
  
  const optionsPenghasilan = [
    { value: "", label: "Pilih" },
    { value: "<500rb", label: "Kurang dari 500 Ribu" },
    { value: "500rb-1jt", label: "500 Ribu - 1 Juta" },
    { value: "1jt-2jt", label: "1 Juta - 2 Juta" },
    { value: "2jt-3jt", label: "2 Juta - 3 Juta" },
    { value: "3jt-5jt", label: "3 Juta - 5 Juta" },
    { value: "5jt-10jt", label: "5 Juta - 10 Juta" },
    { value: ">10jt", label: "Lebih dari 10 Juta" },
  ];
  
  const optionsStatusPekerjaan = [
    { value: "", label: "Pilih" },
    { value: "tetap", label: "Karyawan Tetap" },
    { value: "kontrak", label: "Karyawan Kontrak" },
    { value: "daily", label: "Harian/Lepas" },
    { value: "magang", label: "Magang" },
    { value: "training", label: "Training" },
  ];
  
  const optionsStatusPekerjaanPNS = [
    { value: "", label: "Pilih" },
    { value: "pns-tetap", label: "PNS Tetap" },
    { value: "pns-honorer", label: "PNS Honorer" },
    { value: "pns-kontrak", label: "PNS Kontrak" },
    { value: "pns-kompetensi", label: "PNS Kompetensi" },
  ];
  
  const getStatusPekerjaanOptions = () => {
    if (formData.pekerjaan === "pegawai-negeri") return optionsStatusPekerjaanPNS;
    return optionsStatusPekerjaan;
  };
  
  const optionsLamaBekerja = [
    { value: "", label: "Pilih" },
    { value: "<6bln", label: "Kurang dari 6 Bulan" },
    { value: "6-12bln", label: "6 Bulan - 1 Tahun" },
    { value: "1-2thn", label: "1 Tahun - 2 Tahun" },
    { value: "2-3thn", label: "2 Tahun - 3 Tahun" },
    { value: "3-5thn", label: "3 Tahun - 5 Tahun" },
    { value: ">5thn", label: "Lebih dari 5 Tahun" },
  ];
  
  const optionsPosisiPNS = [
    { value: "", label: "Pilih" },
    { value: "eselon-i", label: "Eselon I (Dirjen/Sekjen)" },
    { value: "eselon-ii", label: "Eselon II (Kabiro/Kabag)" },
    { value: "eselon-iii", label: "Eselon III (Kasubag)" },
    { value: "eselon-iv", label: "Eselon IV (Staf)" },
    { value: "pejabat", label: "Pejabat Negara" },
    { value: "pns", label: "PNS" },
    { value: "honorer", label: "Honorer" },
    { value: "lain", label: "Lainnya" },
  ];
  
  const optionsPangkat = [
    { value: "", label: "Pilih" },
    { value: "Ia", label: "Ia (Juru)" },
    { value: "Ib", label: "Ib (Juru Tk. I)" },
    { value: "IIa", label: "IIa (Pengatur)" },
    { value: "IIb", label: "IIb (Pengatur Tk. I)" },
    { value: "IIIa", label: "IIIa (Penata)" },
    { value: "IIIb", label: "IIIb (Penata Tk. I)" },
    { value: "IVa", label: "IVa (Pembina)" },
    { value: "IVb", label: "IVb (Pembina Tk. I)" },
    { value: "IVc", label: "IVc (Pembina Utama)" },
    { value: "IVd", label: "IVd (Pembina Utama Madya)" },
    { value: "IVe", label: "IVe (Pembina Utama)" },
  ];
  
  const optionsGolongan = [
    { value: "", label: "Pilih" },
    { value: "1a", label: "Golongan 1a" },
    { value: "1b", label: "Golongan 1b" },
    { value: "1c", label: "Golongan 1c" },
    { value: "1d", label: "Golongan 1d" },
    { value: "2a", label: "Golongan 2a" },
    { value: "2b", label: "Golongan 2b" },
    { value: "2c", label: "Golongan 2c" },
    { value: "2d", label: "Golongan 2d" },
    { value: "3a", label: "Golongan 3a" },
    { value: "3b", label: "Golongan 3b" },
    { value: "3c", label: "Golongan 3c" },
    { value: "3d", label: "Golongan 3d" },
    { value: "4a", label: "Golongan 4a" },
    { value: "4b", label: "Golongan 4b" },
    { value: "4c", label: "Golongan 4c" },
    { value: "4d", label: "Golongan 4d" },
    { value: "4e", label: "Golongan 4e" },
  ];
  
  const optionsPosisiSwasta = [
    { value: "", label: "Pilih" },
    { value: "direktur", label: "Direktur" },
    { value: "manager", label: "Manager" },
    { value: "supervisor", label: "Supervisor" },
    { value: "staf", label: "Staf" },
    { value: "karyawan", label: "Karyawan" },
    { value: "operator", label: "Operator" },
    { value: "security", label: "Security" },
    { value: "cleaning", label: "Cleaning Service" },
    { value: "driver", label: "Driver" },
    { value: "lain", label: "Lainnya" },
  ];
  
  const getPosisiOptions = () => {
    if (formData.pekerjaan === "pegawai-negeri") return optionsPosisiPNS;
    if (formData.pekerjaan === "pegawai-swasta") return optionsPosisiSwasta;
    return [];
  };
  
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jkelamin: "",
    status: "",
    namaPasangan: "",
    jumlahAnak: "",
    namaIbuKandung: "",
    namaSaudara: "",
    telpSaudara: "",
    hubungan: "",
    pekerjaan: "",
    besarPenghasilan: "",
    alamat: "",
    telepon: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nik.trim()) errors.nik = "NIK wajib diisi";
    else if (formData.nik.length !== 16) errors.nik = "NIK 16 digit";
    if (!formData.nama.trim()) errors.nama = "Nama wajib diisi";
    if (!formData.tempatLahir.trim()) errors.tempatLahir = "Tempat lahir wajib";
    if (!formData.tanggalLahir) errors.tanggalLahir = "Tanggal lahir wajib";
    if (!formData.jkelamin) errors.jkelamin = "Jenis kelamin wajib";
    if (!formData.status) errors.status = "Status wajib dipilih";
    if (!formData.alamat.trim()) errors.alamat = "Alamat wajib diisi";
    if (!formData.telepon.trim()) errors.telepon = "Telepon wajib";
    if (!formData.pekerjaan) errors.pekerjaan = "Pekerjaan wajib";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const newAnggota: AnggotaType = {
        id: anggota.length + 1,
        nomorNBA: noNBA,
        nik: formData.nik,
        nama: formData.nama,
        tempatLahir: formData.tempatLahir,
        tanggalLahir: formData.tanggalLahir,
        jkelamin: formData.jkelamin,
        status: formData.status,
        alamat: formData.alamat,
        rt: "",
        rw: "",
        kel: "",
        kec: "",
        kota: "",
        telepon: formData.telepon,
        email: "",
        pekerjaan: formData.pekerjaan,
        tempatKerja: "",
        pendapatan: "",
        tanggalJoin: tanggalMasuk,
        statusKeanggotaan: "Aktif",
      };
      addAnggota(newAnggota);
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ nik: "", nama: "", tempatLahir: "", tanggalLahir: "", jkelamin: "", status: "", namaPasangan: "", jumlahAnak: "", namaIbuKandung: "", namaSaudara: "", telpSaudara: "", hubungan: "", pekerjaan: "", besarPenghasilan: "", alamat: "", telepon: "" });
      }, 3000);
    }
  };
  
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const parseExcelDate = (value: any, defaultDate?: string): string => {
      if (!value || value === "") {
        return defaultDate || new Date().toISOString().split("T")[0].split("-").reverse().join("-");
      }
      
      if (typeof value === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
        return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
      }
      
      if (typeof value === "string") {
        const str = value.trim();
        if (!str) return defaultDate || new Date().toISOString().split("T")[0].split("-").reverse().join("-");
        
        const parts = str.split(/[-/]/);
        if (parts.length === 3) {
          const [p1, p2, p3] = parts;
          // Format DD-MM-YYYY -> DD-MM-YYYY
          if (str.includes("-") && p1.length <= 2 && p3.length === 4) {
            return `${p1.padStart(2, "0")}-${p2.padStart(2, "0")}-${p3}`;
          }
          // Format YYYY-MM-DD -> DD-MM-YYYY
          if (str.includes("-") && p1.length === 4 && p3.length <= 2) {
            return `${p3.padStart(2, "0")}-${p2.padStart(2, "0")}-${p1}`;
          }
          // Format YYYY/MM/DD -> DD-MM-YYYY
          if (str.includes("/") && p1.length === 4) {
            return `${p3.padStart(2, "0")}-${p2.padStart(2, "0")}-${p1}`;
          }
        }
        return str;
      }
      
      return defaultDate || new Date().toISOString().split("T")[0].split("-").reverse().join("-");
    };
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          alert("File tidak terbaca!");
          return;
        }
        
        const workbook = XLSX.read(data, { type: "binary" });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          alert("Tidak ada sheet di file Excel!");
          return;
        }
        
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        if (!sheet) {
          alert("Sheet tidak ditemukan!");
          return;
        }
        
        const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
        
        if (!jsonData || jsonData.length === 0) {
          alert("Tidak ada data di file Excel!");
          return;
        }
        
        const sampleRow = jsonData[0];
        const requiredKeys = ["Nama Anggota", "Nomor Identitas (KTP)", "NIK"];
        const hasAnyKey = requiredKeys.some(key => sampleRow[key] !== undefined);
        
        if (!hasAnyKey) {
          alert(`Format Excel salah! Kolom yang ditemukan: ${Object.keys(sampleRow).join(", ")}\n\nPastikan menggunakan nama kolom yang sama dengan template.`);
          return;
        }
        
        const requiredColumns = ["Nama Anggota", "Nomor Identitas (KTP)"];
        const foundColumns = Object.keys(sampleRow);
        const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col));
        
        if (missingColumns.length > 0) {
          alert(`Kolom wajib tidak ditemukan: ${missingColumns.join(", ")}\nKolom yang ada: ${foundColumns.join(", ")}`);
          return;
        }
        
        let count = 0;
        const errors: { row: number; nama: string; errors: string[] }[] = [];
        
        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 1;
          const rowErrors: string[] = [];
          
          const nama = String(row["Nama Anggota"] || "").trim();
          const nik = String(row["Nomor Identitas (KTP)"] || row["NIK"] || "").replace(/\.0$/, "").trim();
          const jk = String(row["Jenis Kelamin"] || "").trim();
          const statusKawin = String(row["Status Perkawinan"] || "").trim();
          
          if (!nama) rowErrors.push("Nama Anggota wajib diisi");
          if (!nik) rowErrors.push("Nomor Identitas (KTP) wajib diisi");
          else if (nik.length < 16) rowErrors.push("NIK harus 16 digit");
          
          if (jk && !jk.toLowerCase().includes("laki") && !jk.toLowerCase().includes("peremp")) {
            rowErrors.push("Jenis Kelamin harus 'Laki-laki' atau 'Perempuan'");
          }
          
          if (statusKawin && !statusKawin.toLowerCase().includes("kawin") && !statusKawin.toLowerCase().includes("belum") && !statusKawin.toLowerCase().includes("cerai")) {
            rowErrors.push("Status Perkawinan harus 'Kawin', 'Belum Kawin', atau 'Cerai'");
          }
          
          if (rowErrors.length > 0) {
            errors.push({ row: rowNum, nama: nama || "-", errors: rowErrors });
            return;
          }
          
          const tglMasukRaw = row["Tanggal Masuk"];
          const tglLahirRaw = row["Tanggal Lahir"];
          const tglMasuk = parseExcelDate(tglMasukRaw);
          const tglLahir = parseExcelDate(tglLahirRaw);
          
          if (!tglMasuk || tglMasuk === "-") rowErrors.push("Format Tanggal Masuk tidak valid (gunakan DD-MM-YYYY)");
          if (!tglLahir || tglLahir === "-") rowErrors.push("Format Tanggal Lahir tidak valid (gunakan DD-MM-YYYY)");
          
          if (rowErrors.length > 0) {
            errors.push({ row: rowNum, nama: nama, errors: rowErrors });
            return;
          }
          
          count++;
          
          const noNBA = row["No. NBA"] || String(count);
          const newAnggota: AnggotaType = {
            id: count,
            nomorNBA: noNBA,
            nik: nik,
            nama: nama,
            tempatLahir: row["Tempat Lahir"] || "",
            tanggalLahir: tglLahir,
            jkelamin: jk.toLowerCase().includes("laki") ? "laki" : "perempuan",
            status: statusKawin.toLowerCase().includes("kawin") ? "kawin" : statusKawin.toLowerCase().includes("belum") ? "belum" : "cerai",
            namaPasangan: row["Nama Pasangan"] || "",
            jumlahAnak: row["Jumlah Anak"] || "",
            namaIbuKandung: row["Nama Ibu Kandung"] || "",
            namaSaudara: row["Nama Saudara Tidak Serumah"] || "",
            telpSaudara: row["No HP Saudara"] || "",
            hubungan: row["Hubungan Saudara"] || "",
            alamat: row["Alamat KTP"] || row["Alamat"] || "",
            telepon: String(row["No HP"] || "").replace(/\.0$/, ""),
            pekerjaan: row["Pekerjaan"] || "",
            besarPenghasilan: row["Pendapatan Perbulan"] || "",
            tanggalJoin: tglMasuk,
            statusKeanggotaan: "Aktif",
          };
          addAnggota(newAnggota);
        });
        
        if (errors.length > 0) {
          const errorMsg = errors.slice(0, 10).map(e => 
            `Baris ${e.row}: ${e.nama} - ${e.errors.join(", ")}`
          ).join("\n");
          
          const moreMsg = errors.length > 10 ? `\n...dan ${errors.length - 10} error lainnya` : "";
          alert(`Import selesai dengan ${errors.length} error:\n\n${errorMsg}${moreMsg}\n\nData yang valid: ${count} berhasil diimport.`);
        } else {
          alert(`Berhasil import ${count} data anggota!`);
        }
      } catch (error) {
        alert("Gagal import data. Pastikan format Excel benar.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E", marginBottom: 8 }}>Keanggotaan</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Pendaftaran & Data Anggota KSP</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "white", padding: 6, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflowX: "auto" }}>
        <button onClick={() => setActiveTab("data")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "data" ? "#1B4D3E" : "transparent", color: activeTab === "data" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📝 Daftar</button>
        <button onClick={() => setActiveTab("daftar")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "daftar" ? "#1B4D3E" : "transparent", color: activeTab === "daftar" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📋 Data ({anggota.length})</button>
        <button onClick={() => setActiveTab("import")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "import" ? "#1B4D3E" : "transparent", color: activeTab === "import" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📥 Import</button>
        <button onClick={() => setActiveTab("keluar")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "keluar" ? "#dc2626" : "transparent", color: activeTab === "keluar" ? "white" : "#dc2626", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>🚪 Keluar</button>
      </div>

      {activeTab === "import" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Import Data Anggota dari Excel</h3>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
            Upload file Excel dengan format kolom:<br/>
            Tanggal Masuk, No. NBA, Nama Anggota, Nomor Identitas (KTP), Jenis Kelamin, Tempat Lahir, Tanggal Lahir, Agama, No HP, Alamat KTP, Alamat Domisili, Status Perkawinan, Nama Pasangan, Jumlah Anak, Nama Ibu Kandung, Nama Saudara Tidak Serumah, No HP Saudara, Pekerjaan, Pendapatan Perbulan, Status Rumah, Nama Referensi
          </p>
          
          <div style={{ border: "2px dashed #ddd", borderRadius: 12, padding: 40, textAlign: "center", marginBottom: 20 }}>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              ref={fileInputRef}
              onChange={handleImportExcel}
              style={{ display: "none" }}
              id="excel-upload"
            />
            <label htmlFor="excel-upload" style={{ cursor: "pointer" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1B4D3E" }}>Klik untuk upload file Excel</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>Format: .xlsx, .xls, .csv</div>
            </label>
          </div>

          <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
            <button 
              onClick={() => {
                const templateData = [{
                  "Tanggal Masuk": "15-01-2023",
                  "No. NBA": "1",
                  "Nama Anggota": "Budi Santoso",
                  "Nomor Identitas (KTP)": "1234567890123456",
                  "Tempat Lahir": "Jakarta",
                  "Tanggal Lahir": "20-05-1990",
                  "Jenis Kelamin": "Laki-laki",
                  "Status Perkawinan": "Kawin",
                  "Nama Pasangan": "Siti Aminah",
                  "Jumlah Anak": "2",
                  "Nama Ibu Kandung": "Hj. Mariam",
                  "Nama Saudara Tidak Serumah": "Ahmad",
                  "No HP Saudara": "081234567891",
                  "Hubungan Saudara": "Adik",
                  "Alamat KTP": "Jl. Merdeka No. 10",
                  "No HP": "081234567890",
                  "Pekerjaan": "PNS",
                  "Pendapatan Perbulan": "5000000"
                }];
                const ws = XLSX.utils.json_to_sheet(templateData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Template");
                XLSX.writeFile(wb, "template_import_anggota_ksp.xlsx");
              }}
              style={{ padding: "10px 20px", background: "#0d9488", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              📥 Download Template Excel
            </button>
          </div>
          
          <div style={{ padding: 16, background: "#f0f9ff", borderRadius: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0369a1", marginBottom: 8 }}>📌 Format Import Excel - Kolom Wajib:</div>
            <table style={{ fontSize: 10, width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Tanggal Masuk</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>No. NBA</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Nama Anggota</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>No. KTP</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Tempat Lahir</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Tanggal Lahir</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Jenis Kelamin</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Status Kawin</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>15-01-2023</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>NBA-001</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>Budi Santoso</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>1234567890123456</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>Jakarta</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>20-05-1990</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>Laki-laki</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>Kawin</td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: 14, fontWeight: 600, color: "#0369a1", marginBottom: 8 }}>📌 Kolom Opsional - Data Keluarga:</div>
            <table style={{ fontSize: 10, width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Nama Pasangan</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Jumlah Anak</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Nama Ibu Kandung</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Nama Saudara Tidak Serumah</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>No HP Saudara</th>
                  <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Hubungan Saudara</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>Siti Aminah</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>2</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>Hj. Mariam</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>Ahmad</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>081234567891</td>
                  <td style={{ border: "1px solid #ddd", padding: 4 }}>Adik</td>
                </tr>
              </tbody>
            </table>

</div>
          
          <div style={{ marginTop: 24, padding: 16, background: "#fff3cd", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#856404" }}>⚠️ Hapus Semua Data</div>
              <div style={{ fontSize: 12, color: "#856404" }}>Jika Anda ingin import ulang, hapus dulu data lama</div>
            </div>
            <button 
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin menghapus semua data? Data tidak bisa dikembalikan.")) {
                  clearAllData();
                  alert("Semua data berhasil dihapus!");
                }
              }}
              style={{ padding: "10px 20px", background: "#dc3545", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              🗑️ Hapus Semua
            </button>
            
            <button 
              onClick={() => {
                if (anggota.length === 0) {
                  alert("Tidak ada data untuk diexport.");
                  return;
                }
                const exportData = anggota.map(a => ({
                  "Tanggal Masuk": a.tanggalJoin,
                  "No. NBA": a.nomorNBA || "",
                  "Nama Anggota": a.nama,
                  "Nomor Identitas (KTP)": a.nik,
                  "Jenis Kelamin": a.jkelamin === "laki" ? "Laki-laki" : "Perempuan",
                  "Tempat Lahir": a.tempatLahir,
                  "Tanggal Lahir": a.tanggalLahir,
                  "Status Perkawinan": a.status === "kawin" ? "Kawin" : a.status === "belum" ? "Belum Kawin" : "Cerai",
                  "Alamat KTP": a.alamat,
                  "No HP": a.telepon,
                  "Pekerjaan": a.pekerjaan,
                  "Pendapatan Perbulan": a.pendapatan
                }));
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Anggota");
                XLSX.writeFile(wb, `data_anggota_ksp_${new Date().toISOString().split('T')[0]}.xlsx`);
                alert(`Berhasil export ${exportData.length} data anggota!`);
              }}
              style={{ padding: "10px 20px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              📤 Export Data
            </button>
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          {submitted && <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>✓ Pendaftaran berhasil!</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20, padding: 16, background: "#f0fdf4", borderRadius: 10 }}>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6, fontSize: 13, color: "#166534" }}>No. NBA</label><input type="text" value={noNBA} readOnly style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #22c55e", fontSize: 14, background: "white", fontWeight: 600, color: "#1B4D3E" }} /></div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6, fontSize: 13, color: "#166534" }}>Tanggal Masuk</label><input type="text" value={tanggalMasuk} readOnly style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #22c55e", fontSize: 14, background: "white", fontWeight: 600, color: "#1B4D3E" }} /></div>
            </div>

            <h3 style={{ fontSize: 16, marginBottom: 16, borderBottom: "2px solid #1B4D3E", paddingBottom: 8 }}>Data Diri</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>NIK (KTP) *</label><input type="text" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.nik ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="16 digit" maxLength={16} />{formErrors.nik && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.nik}</div>}</div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nama Lengkap *</label><input type="text" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.nama ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} />{formErrors.nama && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.nama}</div>}</div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Tempat Lahir *</label><input type="text" value={formData.tempatLahir} onChange={e => setFormData({ ...formData, tempatLahir: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.tempatLahir ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} />{formErrors.tempatLahir && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.tempatLahir}</div>}</div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Tanggal Lahir *</label><input type="date" value={formData.tanggalLahir} onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.tanggalLahir ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} />{formErrors.tanggalLahir && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.tanggalLahir}</div>}</div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Jenis Kelamin *</label><select value={formData.jkelamin} onChange={e => setFormData({ ...formData, jkelamin: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.jkelamin ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}><option value="">Pilih</option><option value="laki">Laki-laki</option><option value="perempuan">Perempuan</option></select>{formErrors.jkelamin && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jkelamin}</div>}</div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Status *</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.status ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}><option value="">Pilih</option><option value="belum">Belum Kawin</option><option value="kawin">Kawin</option><option value="cerai">Cerai</option></select>{formErrors.status && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.status}</div>}</div>
              {formData.status === "kawin" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nama Pasangan</label><input type="text" value={formData.namaPasangan} onChange={e => setFormData({ ...formData, namaPasangan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Jumlah Anak</label><select value={formData.jumlahAnak} onChange={e => setFormData({ ...formData, jumlahAnak: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}><option value="">Pilih</option><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5+</option></select></div>
                </div>
              )}
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nama Ibu Kandung</label><input type="text" value={formData.namaIbuKandung} onChange={e => setFormData({ ...formData, namaIbuKandung: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }} /></div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Telepon *</label><input type="tel" value={formData.telepon} onChange={e => setFormData({ ...formData, telepon: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.telepon ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} />{formErrors.telepon && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.telepon}</div>}</div>
            </div>

            <h3 style={{ fontSize: 16, marginBottom: 16, borderBottom: "2px solid #1B4D3E", paddingBottom: 8 }}>Keluarga Tidak Serumah</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nama</label><input type="text" value={formData.namaSaudara} onChange={e => setFormData({ ...formData, namaSaudara: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }} /></div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>No. Telepon</label><input type="tel" value={formData.telpSaudara} onChange={e => setFormData({ ...formData, telpSaudara: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }} /></div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Hubungan</label><select value={formData.hubungan} onChange={e => setFormData({ ...formData, hubungan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{optionsHubungan.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            </div>

<h3 style={{ fontSize: 16, marginBottom: 16, borderBottom: "2px solid #1B4D3E", paddingBottom: 8 }}>Pekerjaan</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Pekerjaan</label><select value={formData.pekerjaan} onChange={e => setFormData({ ...formData, pekerjaan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{optionsPekerjaan.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Pendapatan Perbulan</label><select value={formData.besarPenghasilan} onChange={e => setFormData({ ...formData, besarPenghasilan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{optionsPenghasilan.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            </div>

            <button type="submit" style={{ width: "100%", padding: 14, background: "#1B4D3E", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>📝 Daftar Anggota</button>
          </form>
        </div>
      )}

      {activeTab === "keluar" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚪</div>
            <h3 style={{ fontSize: 20, color: "#dc2626", marginBottom: 8 }}>Pengunduran Diri Anggota</h3>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Cari anggota yang akan mengundurkan diri</p>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <input 
              type="text" 
              placeholder="Cari berdasarkan No. NBA, Nama, atau NIK..." 
              value={keluarSearch}
              onChange={(e) => setKeluarSearch(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #dc2626", fontSize: 14 }}
            />
          </div>

          {keluarSearch && filteredKeluar.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, background: "#fef2f2", borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <p style={{ color: "#991b1b", fontSize: 14 }}>Tidak ada anggota aktif yang cocok dengan pencarian.</p>
            </div>
          )}

          {filteredKeluar.length > 0 && (
            <div style={{ background: "#fef2f2", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #fecaca" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 12 }}>
                ⚠️ Perhatian - Proses Pengunduran Diri
              </div>
              <ul style={{ fontSize: 12, color: "#b91c1c", marginLeft: 20, lineHeight: 1.8 }}>
                <li>Simpanan Pokok & Wajib akan otomatis dicairkan</li>
                <li>Biaya Pengunduran Diri Rp 50.000 akan dipotong</li>
                <li>Status anggota diubah menjadi Non-Aktif</li>
                <li>Data tidak bisa dikembalikan setelah diproses</li>
              </ul>
            </div>
          )}

          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {filteredKeluar.map((a: typeof anggota[number]) => {
              const aggSimpanan = (simpanan || []).filter(s => s.idAnggota === a.id && (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib"));
              const totalSimpanan = aggSimpanan.reduce((sum, s) => sum + s.jumlah, 0);
              const pokok = aggSimpanan.filter(s => s.jenisSimpanan === "pokok").reduce((sum, s) => sum + s.jumlah, 0);
              const wajib = aggSimpanan.filter(s => s.jenisSimpanan === "wajib").reduce((sum, s) => sum + s.jumlah, 0);
              
              return (
                <div key={a.id} style={{ padding: 16, border: "2px solid #e5e7eb", borderRadius: 10, marginBottom: 12, background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>{a.nama}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        No. NBA: <span style={{ fontFamily: "monospace" }}>{a.nomorNBA || "-"}</span> | NIK: {a.nik || "-"}
                      </div>
                    </div>
                    <button 
                      onClick={() => handlePengunduran(a.id)}
                      style={{ padding: "8px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      🚪 Proses Keluar
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Simpanan Pokok</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>Rp {pokok.toLocaleString("id-ID")}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Simpanan Wajib</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>Rp {wajib.toLocaleString("id-ID")}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>Total</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>Rp {totalSimpanan.toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {nonAktifAnggota.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h4 style={{ fontSize: 14, color: "#6b7280", marginBottom: 16, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
                Riwayat Anggota Non-Aktif ({nonAktifAnggota.length})
              </h4>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {nonAktifAnggota.slice(0, 10).map((a) => (
                  <div key={a.id} style={{ padding: 10, borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{a.nama}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        {a.nomorNBA || "-"} | Tanggal: {a.tanggalPengunduran || "-"}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: "4px 8px", background: "#f3f4f6", borderRadius: 4, color: "#9ca3af" }}>
                      Non-Aktif
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "daftar" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 16, marginBottom: 24 }}>Data Anggota</h3>
          <div style={{ marginBottom: 16 }}>
            <input 
              type="text" 
              placeholder="Cari berdasarkan No. NBA, Nama, atau NIK..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }}
            />
          </div>
          {filteredAnggota.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>
              {searchQuery ? "Tidak ada anggota yang cocok dengan pencarian." : "Belum ada anggota. Silakan tambah anggota baru."}
            </div>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tgl Masuk</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>No. NBA</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>NIK</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tgl Lahir</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Jenis Kelamin</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Status Kawin</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Pasangan</th>
                  <th style={{ padding: 10, textAlign: "center", borderBottom: "2px solid #ddd" }}>Anak</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Telepon</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Alamat</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Saudara</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Hub Saudara</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Pekerjaan</th>
                  <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>Pendapatan</th>
                  <th style={{ padding: 10, textAlign: "center", borderBottom: "2px solid #ddd" }}>Aksi</th>
                </tr>
              </thead>
<tbody>
                {filteredAnggota.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 10 }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.tanggalJoin}</td>
                    <td style={{ padding: 10, fontFamily: "monospace" }}>{a.nomorNBA || "-"}</td>
                    <td style={{ padding: 10, fontWeight: 500 }}>{a.nama}</td>
                    <td style={{ padding: 10, fontFamily: "monospace", fontSize: 10 }}>{a.nik}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{displayDate(a.tanggalLahir)}</td>
                    <td style={{ padding: 10 }}>{a.jkelamin === "laki" ? "Laki-Laki" : a.jkelamin === "perempuan" ? "Perempuan" : "-"}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.status === "kawin" ? "Kawin" : a.status === "belum" ? "Belum" : "Cerai"}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.namaPasangan || "-"}</td>
                    <td style={{ padding: 10, textAlign: "center", fontSize: 11 }}>{a.jumlahAnak || "0"}</td>
                    <td style={{ padding: 10 }}>{a.telepon}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.alamat || "-"}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.namaSaudara || "-"}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.hubungan || "-"}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.pekerjaan || "-"}</td>
                    <td style={{ padding: 10, fontSize: 11, textAlign: "right" }}>{a.pendapatan ? `Rp ${Number(a.pendapatan).toLocaleString("id-ID")}` : "-"}</td>
                    <td style={{ padding: 10, textAlign: "center" }}>
                      {editingId === a.id ? (
                        <button 
                          onClick={() => {
                            console.log("Saving:", editForm);
                            updateAnggota(a.id, editForm);
                            setEditingId(null);
                            setEditForm({});
                          }}
                          style={{ padding: "6px 12px", background: "#22c55e", color: "white", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                        >
                          💾
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            console.log("DEBUG - anggota data:", a);
                            const formData = {
                              nik: String(a.nik || ""),
                              nama: String(a.nama || ""),
                              tempatLahir: String(a.tempatLahir || ""),
                              tanggalLahir: formatDate(String(a.tanggalLahir || "")),
                              jkelamin: String(a.jkelamin || ""),
                              status: String(a.status || ""),
                              namaPasangan: String(a.namaPasangan || ""),
                              jumlahAnak: String(a.jumlahAnak || ""),
                              namaIbuKandung: String(a.namaIbuKandung || ""),
                              namaSaudara: String(a.namaSaudara || ""),
                              telpSaudara: String(a.telpSaudara || ""),
                              hubungan: String(a.hubungan || ""),
                              pekerjaan: String(a.pekerjaan || ""),
                              alamat: String(a.alamat || ""),
                              telepon: String(a.telepon || ""),
                              email: String(a.email || ""),
                              tempatKerja: String(a.tempatKerja || ""),
                              pendapatan: String(a.pendapatan || ""),
                            };
                            setEditForm(formData);
                            setEditingId(a.id);
                          }}
                          style={{ padding: "6px 12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                        >
                          ✏️
                        </button>
                      )}
                      {editingId === a.id && (
                        <button 
                          onClick={() => {
                            setEditingId(null);
                            setEditForm({});
                          }}
                          style={{ padding: "6px 12px", background: "#6b7280", color: "white", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", marginLeft: 4 }}
                        >
                          ✕
                        </button>
)}
                      {editingId !== a.id && a.statusKeanggotaan !== "Non-Aktif" && (
                        <button 
                          onClick={() => handlePengunduran(a.id)}
                          style={{ padding: "6px 12px", background: "#dc2626", color: "white", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                        >
                          🚫
                        </button>
                      )}
                      {editingId !== a.id && (
                        <button 
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus anggota "${a.nama}"?`)) {
                              deleteAnggota(a.id);
                              alert("Anggota berhasil dihapus!");
                            }
                          }}
                          style={{ padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", marginLeft: 4 }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAnggota.length > itemsPerPage && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20, gap: 8 }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "8px 16px", background: currentPage === 1 ? "#ddd" : "#1B4D3E", color: currentPage === 1 ? "#888" : "white", border: "none", borderRadius: 6, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  Halaman {currentPage} dari {Math.ceil(filteredAnggota.length / itemsPerPage)}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAnggota.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(anggota.length / itemsPerPage)}
                  style={{ padding: "8px 16px", background: currentPage >= Math.ceil(anggota.length / itemsPerPage) ? "#ddd" : "#1B4D3E", color: currentPage >= Math.ceil(anggota.length / itemsPerPage) ? "#888" : "white", border: "none", borderRadius: 6, cursor: currentPage >= Math.ceil(anggota.length / itemsPerPage) ? "not-allowed" : "pointer", fontSize: 13 }}
                >
                  Next →
                </button>
              </div>
            )}

            {editingId && (
              <div style={{ marginTop: 16, padding: 20, background: "#fffbeb", borderRadius: 12, border: "3px solid #f59e0b", minHeight: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#92400e" }}>
                  ✏️ Edit Data Anggota (ID: {editingId})
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16, padding: 12, background: "#fef3c7", borderRadius: 8 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 12, color: "#92400e" }}>No. NBA</label><input type="text" value={(anggota.find(a => a.id === editingId) as any)?.nomorNBA || ""} disabled style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #d97706", fontSize: 12, background: "#fef3c7", color: "#92400e" }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 12, color: "#92400e" }}>Tanggal Masuk</label><input type="text" value={(anggota.find(a => a.id === editingId) as any)?.tanggalJoin || ""} disabled style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #d97706", fontSize: 12, background: "#fef3c7", color: "#92400e" }} /></div>
                </div>

                <h4 style={{ fontSize: 13, marginBottom: 10, borderBottom: "1px solid #d97706", paddingBottom: 4, color: "#92400e" }}>Data Diri</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>NIK (KTP)</label><input type="text" value={editForm.nik || ""} onChange={e => setEditForm({...editForm, nik: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Nama Lengkap</label><input type="text" value={editForm.nama || ""} onChange={e => setEditForm({...editForm, nama: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Tempat Lahir</label><input type="text" value={editForm.tempatLahir || ""} onChange={e => setEditForm({...editForm, tempatLahir: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Tanggal Lahir</label><input type="date" value={editForm.tanggalLahir || ""} onChange={e => setEditForm({...editForm, tanggalLahir: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Jenis Kelamin</label><select value={editForm.jkelamin || ""} onChange={e => setEditForm({...editForm, jkelamin: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12, background: "white" }}><option value="">Pilih</option><option value="laki">Laki-laki</option><option value="perempuan">Perempuan</option></select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Status</label><select value={editForm.status || ""} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12, background: "white" }}><option value="">Pilih</option><option value="belum">Belum Kawin</option><option value="kawin">Kawin</option><option value="cerai">Cerai</option></select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Nama Ibu Kandung</label><input type="text" value={editForm.namaIbuKandung || ""} onChange={e => setEditForm({...editForm, namaIbuKandung: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Telepon</label><input type="tel" value={editForm.telepon || ""} onChange={e => setEditForm({...editForm, telepon: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Email</label><input type="email" value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                </div>

                <h4 style={{ fontSize: 13, marginBottom: 10, borderBottom: "1px solid #d97706", paddingBottom: 4, color: "#92400e" }}>Alamat</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div style={{ gridColumn: "span 2" }}><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Alamat</label><input type="text" value={editForm.alamat || ""} onChange={e => setEditForm({...editForm, alamat: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Kelurahan</label><input type="text" value={editForm.kel || ""} onChange={e => setEditForm({...editForm, kel: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Kecamatan</label><input type="text" value={editForm.kec || ""} onChange={e => setEditForm({...editForm, kec: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Kota/Kabupaten</label><input type="text" value={editForm.kota || ""} onChange={e => setEditForm({...editForm, kota: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                </div>

                <h4 style={{ fontSize: 13, marginBottom: 10, borderBottom: "1px solid #d97706", paddingBottom: 4, color: "#92400e" }}>Keluarga</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Nama Pasangan</label><input type="text" value={editForm.namaPasangan || ""} onChange={e => setEditForm({...editForm, namaPasangan: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Jumlah Anak</label><input type="text" value={editForm.jumlahAnak || ""} onChange={e => setEditForm({...editForm, jumlahAnak: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Nama Saudara</label><input type="text" value={editForm.namaSaudara || ""} onChange={e => setEditForm({...editForm, namaSaudara: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>No HP Saudara</label><input type="text" value={editForm.telpSaudara || ""} onChange={e => setEditForm({...editForm, telpSaudara: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div style={{ gridColumn: "span 2" }}><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Hubungan Saudara</label><input type="text" value={editForm.hubungan || ""} onChange={e => setEditForm({...editForm, hubungan: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                </div>

                <h4 style={{ fontSize: 13, marginBottom: 10, borderBottom: "1px solid #d97706", paddingBottom: 4, color: "#92400e" }}>Pekerjaan</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Pekerjaan</label><select value={editForm.pekerjaan || ""} onChange={e => setEditForm({...editForm, pekerjaan: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12, background: "white" }}>{optionsPekerjaan.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Tempat Kerja</label><input type="text" value={editForm.tempatKerja || ""} onChange={e => setEditForm({...editForm, tempatKerja: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                  <div style={{ gridColumn: "span 2" }}><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Pendapatan</label><input type="text" value={editForm.pendapatan || ""} onChange={e => setEditForm({...editForm, pendapatan: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => { updateAnggota(editingId, editForm); setEditingId(null); setEditForm({}); }} style={{ flex: 1, padding: "10px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>💾 Simpan</button>
                  <button onClick={() => { setEditingId(null); setEditForm({}); }} style={{ padding: "10px 16px", background: "#6b7280", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✕ Batal</button>
                </div>
              </div>
            )}

            {anggota.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <div style={{ padding: 16, background: "#d4edda", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#155724", marginBottom: 4 }}>Total Anggota</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#155724" }}>{anggota.length} Orang</div>
                </div>
              </div>
            </div>
            )}
            </>
          )}
        </div>
      )}
    </div>
  );
}