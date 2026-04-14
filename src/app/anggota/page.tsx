"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useData, Anggota as AnggotaType } from "../context/DataContext";
import * as XLSX from "xlsx";

export default function AnggotaPage() {
  const { anggota, addAnggota, addSimpanan, addTransaksi, clearAllData, updateAnggota, deleteAnggota } = useData();
  const [activeTab, setActiveTab] = useState<"daftar" | "data" | "import">("data");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };
  
  const noNBA = `NBA-${String(anggota.length + 1).padStart(3, "0")}`;
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
    posisi: "",
    pangkat: "",
    Golongan: "",
    statusPekerjaan: "",
    lamaBekerja: "",
    alamatTempatKerja: "",
    jenisTransaksi: "",
    alamat: "",
    rt: "",
    rw: "",
    kel: "",
    kec: "",
    kota: "",
    telepon: "",
    email: "",
    tempatKerja: "",
    pendapatan: "",
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
    if (!formData.kel.trim()) errors.kel = "Kelurahan wajib";
    if (!formData.kec.trim()) errors.kec = "Kecamatan wajib";
    if (!formData.kota.trim()) errors.kota = "Kota wajib";
    if (!formData.telepon.trim()) errors.telepon = "Telepon wajib";
    if (!formData.pekerjaan) errors.pekerjaan = "Pekerjaan wajib";
    if (!formData.jenisTransaksi) errors.jenisTransaksi = "Jenis transaksi wajib dipilih";
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
        rt: formData.rt,
        rw: formData.rw,
        kel: formData.kel,
        kec: formData.kec,
        kota: formData.kota,
        telepon: formData.telepon,
        email: formData.email,
        pekerjaan: formData.pekerjaan,
        tempatKerja: formData.tempatKerja,
        pendapatan: formData.pendapatan,
        tanggalJoin: tanggalMasuk,
        statusKeanggotaan: "Aktif",
      };
      addAnggota(newAnggota);
      
      const idAnggota = anggota.length + 1;
      const today = new Date().toISOString().split("T")[0];
      const noanggota = noNBA;
      
      addSimpanan({
        id: 0,
        idAnggota,
        nama: formData.nama,
        nomorAnggota: noanggota,
        tanggal: today,
        jenisSimpanan: "pokok",
        jumlah: 100000,
        metode: formData.jenisTransaksi,
        bunga: 0,
      });
      
      addSimpanan({
        id: 0,
        idAnggota,
        nama: formData.nama,
        nomorAnggota: noanggota,
        tanggal: today,
        jenisSimpanan: "wajib",
        jumlah: 25000,
        metode: formData.jenisTransaksi,
        bunga: 0,
      });
      
      addSimpanan({
        id: 0,
        idAnggota,
        nama: formData.nama,
        nomorAnggota: noanggota,
        tanggal: today,
        jenisSimpanan: "buku",
        jumlah: 25000,
        metode: formData.jenisTransaksi,
        bunga: 0,
      });
      
      addTransaksi({
        id: 0,
        noBukti: `BK-${today.replace(/-/g, "")}-001`,
        tanggal: today,
        jam: new Date().toTimeString().slice(0, 5),
        akun: "Kas",
        kategori: "Setoran Anggota",
        uraian: `Simpanan Pokok ${formData.nama}`,
        debet: 100000,
        kredit: 0,
        saldo: 0,
        operator: "Admin",
      });
      
      addTransaksi({
        id: 0,
        noBukti: `BK-${today.replace(/-/g, "")}-002`,
        tanggal: today,
        jam: new Date().toTimeString().slice(0, 5),
        akun: "Kas",
        kategori: "Setoran Anggota",
        uraian: `Simpanan Wajib ${formData.nama}`,
        debet: 25000,
        kredit: 0,
        saldo: 0,
        operator: "Admin",
      });
      
      addTransaksi({
        id: 0,
        noBukti: `BK-${today.replace(/-/g, "")}-003`,
        tanggal: today,
        jam: new Date().toTimeString().slice(0, 5),
        akun: "Kas",
        kategori: "Setoran Anggota",
        uraian: `Uang Buku ${formData.nama}`,
        debet: 25000,
        kredit: 0,
        saldo: 0,
        operator: "Admin",
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ nik: "", nama: "", tempatLahir: "", tanggalLahir: "", jkelamin: "", status: "", namaPasangan: "", jumlahAnak: "", namaIbuKandung: "", namaSaudara: "", telpSaudara: "", hubungan: "", pekerjaan: "", besarPenghasilan: "", posisi: "", pangkat: "", Golongan: "", statusPekerjaan: "", lamaBekerja: "", alamatTempatKerja: "", jenisTransaksi: "", alamat: "", rt: "", rw: "", kel: "", kec: "", kota: "", telepon: "", email: "", tempatKerja: "", pendapatan: "" });
      }, 3000);
    }
  };
  
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const parseExcelDate = (value: any): string => {
      if (!value) return "";
      
      if (typeof value === "number") {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
        return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
      }
      
      if (typeof value === "string") {
        const str = value.trim();
        const parts = str.split(/[-/]/);
        if (parts.length === 3) {
          const [p1, p2, p3] = parts;
          if (str.includes("-") && p3.length === 4) {
            return `${p1.padStart(2, "0")}-${p2.padStart(2, "0")}-${p3}`;
          }
          if (str.includes("/") && p3.length === 4) {
            return `${p1.padStart(2, "0")}-${p2.padStart(2, "0")}-${p3}`;
          }
        }
        return str;
      }
      
      return "";
    };
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        jsonData.forEach((row: any, index: number) => {
          const noNBA = `NBA-${String(anggota.length + index + 1).padStart(3, "0")}`;
          const today = new Date().toISOString().split("T")[0];
          
          const newAnggota: AnggotaType = {
            id: anggota.length + index + 1,
            nomorNBA: row["No. NBA"] || noNBA,
            nik: String(row["Nomor Identitas (KTP)"] || "").replace(/\.0$/, ""),
            nama: row["Nama Anggota"] || "",
            tempatLahir: row["Tempat Lahir"] || "",
            tanggalLahir: parseExcelDate(row["Tanggal Lahir"]),
            jkelamin: row["Jenis Kelamin"] === "Laki-laki" ? "laki" : "perempuan",
            status: row["Status Perkawinan"] === "Kawin" ? "kawin" : row["Status Perkawinan"] === "Belum Kawin" ? "belum" : "cerai",
            alamat: row["Alamat KTP"] || "",
            rt: "",
            rw: "",
            kel: "",
            kec: "",
            kota: "",
            telepon: String(row["No HP"] || "").replace(/\.0$/, ""),
            email: "",
            pekerjaan: row["Pekerjaan"] || "",
            tempatKerja: "",
            pendapatan: row["Pendapatan Perbulan"] || "",
            tanggalJoin: parseExcelDate(row["Tanggal Masuk"]) || today,
            statusKeanggotaan: "Aktif",
          };
          addAnggota(newAnggota);
          
          const metode = row["Metode Pembayaran"] === "Tunai" ? "tunai" : row["Metode Pembayaran"]?.includes("BRI") ? "transfer" : "tunai";
          const tglMasuk = parseExcelDate(row["Tanggal Masuk"]) || today;
          
          if (row["Simpanan Pokok"]) {
            addSimpanan({
              id: 0,
              idAnggota: newAnggota.id,
              nama: newAnggota.nama,
              nomorAnggota: newAnggota.nomorNBA,
              tanggal: tglMasuk,
              jenisSimpanan: "pokok",
              jumlah: parseInt(String(row["Simpanan Pokok"]).replace(/\.0$/, "")) || 100000,
              metode,
              bunga: 0,
            });
          }
          
          if (row["Simpanan Wajib"]) {
            addSimpanan({
              id: 0,
              idAnggota: newAnggota.id,
              nama: newAnggota.nama,
              nomorAnggota: newAnggota.nomorNBA,
              tanggal: tglMasuk,
              jenisSimpanan: "wajib",
              jumlah: parseInt(String(row["Simpanan Wajib"]).replace(/\.0$/, "")) || 25000,
              metode,
              bunga: 0,
            });
          }
          
          if (row["Uang Buku"]) {
            addSimpanan({
              id: 0,
              idAnggota: newAnggota.id,
              nama: newAnggota.nama,
              nomorAnggota: newAnggota.nomorNBA,
              tanggal: tglMasuk,
              jenisSimpanan: "buku",
              jumlah: parseInt(String(row["Uang Buku"]).replace(/\.0$/, "")) || 25000,
              metode,
              bunga: 0,
            });
          }
        });
        
        alert(`Berhasil import ${jsonData.length} data anggota!`);
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
      </div>

      {activeTab === "import" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Import Data Anggota dari Excel</h3>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
            Upload file Excel dengan format kolom:<br/>
            Tanggal Masuk, No. NBA, Nama Anggota, Nomor Identitas (KTP), Jenis Kelamin, Tempat Lahir, Tanggal Lahir, Agama, No HP, Alamat KTP, Alamat Domisili, Status Perkawinan, Nama Pasangan, Jumlah Anak, Nama Ibu Kandung, Nama Saudara Tidak Serumah, No HP Saudara, Pekerjaan, Pendapatan Perbulan, Status Rumah, Nama Referensi, Simpanan Pokok, Simpanan Wajib, Uang Buku, Metode Pembayaran
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
          
          <div style={{ padding: 16, background: "#f0f9ff", borderRadius: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0369a1", marginBottom: 8 }}>📌 Contoh Format Excel:</div>
            <table style={{ fontSize: 12, width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Tanggal Masuk</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>No. NBA</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Nama Anggota</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>No. KTP</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Jenis Kelamin</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>No. HP</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Simpanan Pokok</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Metode</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>2023-01-15</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>NBA-001</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>Budi Santoso</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>1234567890123456</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>Laki-laki</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>081234567890</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>100000</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>Tunai</td>
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
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }} /></div>
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
              {(formData.pekerjaan === "pegawai-negeri" || formData.pekerjaan === "pegawai-swasta") && (
                <>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Posisi/Jabatan</label><select value={formData.posisi} onChange={e => setFormData({ ...formData, posisi: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{getPosisiOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  {formData.pekerjaan === "pegawai-negeri" && (
                    <>
                      <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Pangkat</label><select value={formData.pangkat} onChange={e => setFormData({ ...formData, pangkat: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{optionsPangkat.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                      <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Golongan</label><select value={formData.Golongan} onChange={e => setFormData({ ...formData, Golongan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{optionsGolongan.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                    </>
                  )}
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Status Pekerjaan</label><select value={formData.statusPekerjaan} onChange={e => setFormData({ ...formData, statusPekerjaan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{getStatusPekerjaanOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Lama Bekerja</label><select value={formData.lamaBekerja} onChange={e => setFormData({ ...formData, lamaBekerja: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{optionsLamaBekerja.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nama Tempat Kerja</label><input type="text" value={formData.tempatKerja} onChange={e => setFormData({ ...formData, tempatKerja: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Alamat Tempat Kerja</label><input type="text" value={formData.alamatTempatKerja || ""} onChange={e => setFormData({ ...formData, alamatTempatKerja: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }} /></div>
                </>
              )}
            </div>

            <h3 style={{ fontSize: 16, marginBottom: 16, borderBottom: "2px solid #1B4D3E", paddingBottom: 8 }}>Setoran Awal</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Simpanan Pokok</label><input type="text" value="100.000" readOnly style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #22c55e", fontSize: 14, background: "#f0fdf4", fontWeight: 600, color: "#1B4D3E" }} /></div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Simpanan Wajib</label><input type="text" value="25.000" readOnly style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #22c55e", fontSize: 14, background: "#f0fdf4", fontWeight: 600, color: "#1B4D3E" }} /></div>
              <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Uang Buku</label><input type="text" value="25.000" readOnly style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #22c55e", fontSize: 14, background: "#f0fdf4", fontWeight: 600, color: "#1B4D3E" }} /></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Jenis Transaksi *</label>
              <select value={formData.jenisTransaksi} onChange={e => setFormData({ ...formData, jenisTransaksi: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.jenisTransaksi ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}>
                <option value="">Pilih</option>
                <option value="tunai">Tunai</option>
                <option value="bri-tigabinanga">BRI Cab. Tigabinanga</option>
                <option value="bri-berastagi">BRI Cab. Berastagi</option>
              </select>
              {formErrors.jenisTransaksi && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jenisTransaksi}</div>}
            </div>

            <button type="submit" style={{ width: "100%", padding: 14, background: "#1B4D3E", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>📝 Daftar Anggota</button>
          </form>
        </div>
      )}

      {activeTab === "daftar" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 16, marginBottom: 24 }}>Data Anggota</h3>
          {anggota.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>Belum ada anggota. Silakan tambah anggota baru.</div>
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
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>JK</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tgl Lahir</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>No. HP</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Pekerjaan</th>
                  <th style={{ padding: 10, textAlign: "center", borderBottom: "2px solid #ddd" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {anggota.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 10 }}>{i + 1}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.tanggalJoin}</td>
                    <td style={{ padding: 10, fontFamily: "monospace" }}>{(a as any).nomorNBA || "-"}</td>
                    <td style={{ padding: 10, fontWeight: 500 }}>{a.nama}</td>
                    <td style={{ padding: 10, fontFamily: "monospace", fontSize: 10 }}>{a.nik}</td>
                    <td style={{ padding: 10 }}>{a.jkelamin === "laki" ? "L" : "P"}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.tanggalLahir}</td>
                    <td style={{ padding: 10 }}>{a.telepon}</td>
                    <td style={{ padding: 10, fontSize: 11 }}>{a.pekerjaan}</td>
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
                            console.log("Editing member:", a.id, a.nama);
                            setEditingId(a.id);
                            setEditForm({
                              nama: a.nama,
                              nik: a.nik,
                              tempatLahir: a.tempatLahir,
                              tanggalLahir: a.tanggalLahir,
                              jkelamin: a.jkelamin,
                              status: a.status,
                              alamat: a.alamat,
                              rt: a.rt,
                              rw: a.rw,
                              kel: a.kel,
                              kec: a.kec,
                              kota: a.kota,
                              telepon: a.telepon,
                              email: a.email,
                              pekerjaan: a.pekerjaan,
                              tempatKerja: a.tempatKerja,
                              pendapatan: a.pendapatan,
                            });
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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

                <h4 style={{ fontSize: 13, marginBottom: 10, borderBottom: "1px solid #d97706", paddingBottom: 4, color: "#92400e" }}>Pekerjaan</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Pekerjaan</label><select value={editForm.pekerjaan || ""} onChange={e => setEditForm({...editForm, pekerjaan: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12, background: "white" }}>{optionsPekerjaan.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 4, fontSize: 11 }}>Tempat Kerja</label><input type="text" value={editForm.tempatKerja || ""} onChange={e => setEditForm({...editForm, tempatKerja: e.target.value})} style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }} /></div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => { updateAnggota(editingId, editForm); setEditingId(null); setEditForm({}); }} style={{ flex: 1, padding: "10px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>💾 Simpan</button>
                  <button onClick={() => { setEditingId(null); setEditForm({}); }} style={{ padding: "10px 16px", background: "#6b7280", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✕ Batal</button>
                </div>
              </div>
            )}

            {anggota.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <div style={{ padding: 16, background: "#d4edda", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#155724", marginBottom: 4 }}>Total Anggota</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#155724" }}>{anggota.length} Orang</div>
                </div>
                <div style={{ padding: 16, background: "#cce5ff", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#004085", marginBottom: 4 }}>Simpanan Pokok</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#004085" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(anggota.length * 100000)}</div>
                </div>
                <div style={{ padding: 16, background: "#fff3cd", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#856404", marginBottom: 4 }}>Simpanan Wajib</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#856404" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(anggota.length * 25000)}</div>
                </div>
                <div style={{ padding: 16, background: "#f8d7da", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#721c24", marginBottom: 4 }}>Uang Buku</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#721c24" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(anggota.length * 25000)}</div>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: 16, background: "#1B4D3E", borderRadius: 10, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "white", marginBottom: 4 }}>Total Pendapatan Awal</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#D4AF37" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(anggota.length * 150000)}</div>
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