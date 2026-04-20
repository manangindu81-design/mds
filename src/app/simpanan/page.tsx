"use client";
import { useState, useRef } from "react";
import { useData, Simpanan as SimpananType } from "../context/DataContext";
import * as XLSX from "xlsx";

const formatRupiah = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const formatRupiahNum = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const getJenisLabel = (jenis: string) => {
  const labels: Record<string, string> = {
    pokok: "Simpanan Pokok",
    wajib: "Simpanan Wajib",
    sukarela: "Simpanan Sukarela",
    sibuhar: "Sibuhar (3%/th)",
    simapan: "Simapan (5%/th)",
    sihat: "Sihat (6%/th)",
    sihar: "Sihar (4%/th)",
    berjangka: "Simpanan Berjangka",
  };
  return labels[jenis] || jenis;
};

const getAkunLabel = (metode: string) => {
  const labels: Record<string, string> = {
    tunai: "Kas",
    "bri-tigabinanga": "Bank BRI Cab. Tigabinanga",
    "bri-berastagi": "Bank BRI Cab. Berastagi",
    "bpr-logo-asri": "Bank BPR Logo Asri",
  };
  return labels[metode] || "Kas";
};

const getKategoriSimpanan = (jenis: string) => {
  switch (jenis) {
    case "pokok": return "Setoran Simpanan Pokok";
    case "wajib": return "Setoran Simpanan Wajib";
    case "sibuhar": return "Setoran Sibuhar";
    case "simapan": return "Setoran Simapan";
    case "sihat": return "Setoran Sihat";
    case "sihar": return "Setoran Sihar";
    case "berjangka": return "Setoran Berjangka";
    default: return "Setoran Anggota";
  }
};

export default function SimpananPage() {
  const { simpanan, addSimpanan, addTransaksi, anggota } = useData();
  const [activeTab, setActiveTab] = useState<"input" | "data" | "import" | "kartu" | "jurnal">("input");
  const [selectedAnggota, setSelectedAnggota] = useState<number | "">(0);
  const [formData, setFormData] = useState({
    nama: "",
    nomorAnggota: "",
    tanggal: "",
    jenisSimpanan: "",
    jumlah: "",
    metodePembayaran: "",
    catatan: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<{
    noBukti: string; nama: string; jenisSimpanan: string; jumlah: number; metode: string; tanggal: string;
  } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [importType, setImportType] = useState<"pokok" | "wajib">("wajib");

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nama.trim()) errors.nama = "Nama wajib diisi";
    if (!formData.nomorAnggota.trim()) errors.nomorAnggota = "Nomor anggota wajib diisi";
    if (!formData.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!formData.jenisSimpanan) errors.jenisSimpanan = "Jenis simpanan wajib dipilih";
    if (!formData.jumlah) errors.jumlah = "Jumlah wajib diisi";
    if (!formData.metodePembayaran) errors.metodePembayaran = "Metode pembayaran wajib dipilih";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const jumlahNum = parseInt(formData.jumlah.replace(/\D/g, ""));
      const newSimpanan: SimpananType = {
        id: simpanan.length + 1,
        idAnggota: 0,
        nama: formData.nama,
        nomorAnggota: formData.nomorAnggota,
        tanggal: formData.tanggal,
        jenisSimpanan: formData.jenisSimpanan,
        jumlah: jumlahNum,
        metode: formData.metodePembayaran,
        bunga: 0,
      };
      addSimpanan(newSimpanan);
      
      const getAkun = (metode: string) => {
        if (metode === "tunai") return "Kas";
        if (metode === "bri-tigabinanga") return "Bank BRI Cab. Tigabinanga";
        if (metode === "bri-berastagi") return "Bank BRI Cab. Berastagi";
        if (metode === "bpr-logo-asri") return "Bank BPR Logo Asri";
        return "Kas";
      };
      
      // Mapping jenis simpanan ke kategori jurnal
      const getKategoriSimpanan = (jenis: string) => {
        switch (jenis) {
          case "pokok": return "Setoran Simpanan Pokok";
          case "wajib": return "Setoran Simpanan Wajib";
          case "sibuhar": return "Setoran Sibuhar";
          case "simapan": return "Setoran Simapan";
          case "sihat": return "Setoran Sihat";
          case "sihar": return "Setoran Sihar";
          case "berjangka": return "Setoran Berjangka";
          default: return "Setoran Anggota";
        }
      };
      
      addTransaksi({
        id: 0,
        noBukti: `SM-${formData.tanggal.replace(/-/g, "")}-${String(simpanan.length + 1).padStart(3, "0")}`,
        tanggal: formData.tanggal,
        jam: "10:00",
        akun: getAkun(formData.metodePembayaran),
        kategori: getKategoriSimpanan(formData.jenisSimpanan),
        uraian: `${formData.jenisSimpanan} - ${formData.nama}`,
        debet: jumlahNum,
        kredit: 0,
        saldo: 0,
        operator: "Admin",
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ nama: "", nomorAnggota: "", tanggal: "", jenisSimpanan: "", jumlah: "", metodePembayaran: "", catatan: "" });
      }, 3000);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E", marginBottom: 8 }}>Input Simpanan</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Formulir pencatatan simpanan anggota</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "white", padding: 6, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflowX: "auto" }}>
        <button onClick={() => setActiveTab("input")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "input" ? "#1B4D3E" : "transparent", color: activeTab === "input" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📝 Input</button>
        <button onClick={() => setActiveTab("data")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "data" ? "#1B4D3E" : "transparent", color: activeTab === "data" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📋 Data ({simpanan.length})</button>
        <button onClick={() => setActiveTab("import")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "import" ? "#1B4D3E" : "transparent", color: activeTab === "import" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📥 Import</button>
        <button onClick={() => setActiveTab("kartu")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "kartu" ? "#1B4D3E" : "transparent", color: activeTab === "kartu" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📒 Kartu Simpanan</button>
      </div>

      {activeTab === "input" && (
        <div>
        {submitted && (
        <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>
          ✓ Data simpanan berhasil disimpan!
        </div>
      )}

      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nama Lengkap *</label>
              <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.nama ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="Nama lengkap" />
              {formErrors.nama && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.nama}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nomor Anggota *</label>
              <input type="text" value={formData.nomorAnggota} onChange={(e) => setFormData({ ...formData, nomorAnggota: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.nomorAnggota ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="AG-001" />
              {formErrors.nomorAnggota && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.nomorAnggota}</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Tanggal *</label>
              <input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.tanggal ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} />
              {formErrors.tanggal && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.tanggal}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Jenis Simpanan *</label>
              <select value={formData.jenisSimpanan} onChange={(e) => setFormData({ ...formData, jenisSimpanan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.jenisSimpanan ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}>
                <option value="">Pilih jenis</option>
                <option value="pokok">Simpanan Pokok</option>
                <option value="wajib">Simpanan Wajib</option>
                <option value="sibuhar">Sibuhar (Bunga Harian 3%/th)</option>
                <option value="simapan">Simapan (Masa Depan 5%/th, 100rb-1JT/bln, 1-10 thn)</option>
                <option value="sihat">Sihat (Hari Tua 6%/th, 100rb-1JT/bln, 1-15 thn)</option>
                <option value="sihar">Sihar (Hari Raya 4%/th, 100rb-500rb/bln, 12 bln)</option>
                <option value="berjangka">Simpanan Berjangka</option>
              </select>
              {formErrors.jenisSimpanan && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jenisSimpanan}</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Jumlah (Rp) *</label>
              <input type="text" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: formatRupiah(e.target.value) })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.jumlah ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="Rp 0" />
              {formErrors.jumlah && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jumlah}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Metode *</label>
              <select value={formData.metodePembayaran} onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.metodePembayaran ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}>
                <option value="">Pilih metode</option>
                <option value="tunai">Tunai</option>
                <option value="bri-tigabinanga">Bank BRI Cab. Tigabinanga</option>
                <option value="bri-berastagi">Bank BRI Cab. Berastagi</option>
                <option value="bpr-logo-asri">Bank BPR Logo Asri</option>
              </select>
              {formErrors.metodePembayaran && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.metodePembayaran}</div>}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Catatan</label>
            <textarea value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} rows={3} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, resize: "vertical" }} placeholder="Catatan tambahan (opsional)" />
          </div>

          <button type="submit" style={{ width: "100%", padding: 14, background: "#1B4D3E", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Simpan Data</button>
        </form>
        </div>
        </div>
        )}

        {activeTab === "data" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          {simpanan.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>Belum ada data simpanan.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tanggal</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Jenis</th>
                  <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>Jumlah</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Metode</th>
                </tr>
              </thead>
              <tbody>
                {simpanan.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 10 }}>{i + 1}</td>
                    <td style={{ padding: 10 }}>{s.tanggal}</td>
                    <td style={{ padding: 10 }}>{s.nama}</td>
                    <td style={{ padding: 10 }}>{getJenisLabel(s.jenisSimpanan)}</td>
                    <td style={{ padding: 10, textAlign: "right" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(s.jumlah)}</td>
                    <td style={{ padding: 10 }}>{s.metode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "import" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 18, marginBottom: 20, color: "#1B4D3E" }}>📥 Import Simpanan dari Excel</h3>
          
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button 
              onClick={() => setImportType("pokok")}
              style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: importType === "pokok" ? "#1B4D3E" : "#e5e7eb", color: importType === "pokok" ? "white" : "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              🏦 Simpanan Pokok
            </button>
            <button 
              onClick={() => setImportType("wajib")}
              style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: importType === "wajib" ? "#1B4D3E" : "#e5e7eb", color: importType === "wajib" ? "white" : "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              💰 Simpanan Wajib
            </button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <button 
              onClick={() => {
                const templateData = [{
                  "No. NBA": "1",
                  "Nama Anggota": "Budi Santoso",
                  "Tanggal Transaksi": "15-01-2024",
                  "Jenis Pembayaran": "Tunai",
                  "Jumlah Transaksi": importType === "pokok" ? 100000 : 25000
                }];
                const ws = XLSX.utils.json_to_sheet(templateData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Template");
                XLSX.writeFile(wb, `template_import_simpanan_${importType}_ksp.xlsx`);
              }}
              style={{ padding: "10px 20px", background: "#0d9488", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              📥 Download Template Excel
            </button>
          </div>

          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Format Kolom Excel:</p>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: 8, background: "#f9fafb" }}>No. NBA</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, background: "#f9fafb" }}>Nama Anggota</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, background: "#f9fafb" }}>Tanggal Transaksi</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, background: "#f9fafb" }}>Jenis Pembayaran</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, background: "#f9fafb" }}>Jumlah Transaksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>1</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>Budi Santoso</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>15-01-2024</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>Tunai</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>25000</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: 8, fontSize: 12 }}>*) Jenis Pembayaran: Tunai, Transfer BRI Cab. Tigabinanga, Transfer BRI Cab. Berastagi, Transfer BPR Logo Asri, Penarikan</p>
          </div>

          <div style={{ border: "2px dashed #ddd", borderRadius: 12, padding: 40, textAlign: "center" }}>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
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
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    
                    if (!jsonData || jsonData.length === 0) {
                      alert("Tidak ada data di file Excel!");
                      return;
                    }
                    
                    const sampleRow = jsonData[0] as Record<string, unknown>;
                    const requiredColumns = ["No. NBA", "Nama Anggota", "Jumlah Transaksi"];
                    const foundColumns = Object.keys(sampleRow);
                    const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col));
                    
                    if (missingColumns.length > 0) {
                      alert(`Kolom wajib tidak ditemukan: ${missingColumns.join(", ")}\nKolom yang ada: ${foundColumns.join(", ")}`);
                      return;
                    }
                    
                    let count = 0;
                    const errors: { row: number; noNBA: string; nama: string; error: string }[] = [];
                    
                    jsonData.forEach((row: any, index: number) => {
                      const rowNum = index + 1;
                      const noNBA = row["No. NBA"];
                      const nama = row["Nama Anggota"];
                      const jmlRaw = row["Jumlah Transaksi"];
                      const tglRaw = row["Tanggal Transaksi"];
                      const jenisBayar = row["Jenis Pembayaran"] || "";
                      
                      if (!noNBA && !nama) {
                        errors.push({ row: rowNum, noNBA: "-", nama: "-", error: "No. NBA dan Nama Anggota kosong" });
                        return;
                      }
                      
                      // Validate No NBA exists
                      const noNBAString = String(noNBA);
                      const anggotaFound = anggota.find(a => {
                        const anggotaNBA = String((a as any).nomorNBA || "");
                        return anggotaNBA === noNBAString || anggotaNBA === `NBA-${noNBAString.padStart(3, "0")}` || anggotaNBA === `NBA-${noNBAString}`;
                      });
                      
                      if (!anggotaFound) {
                        errors.push({ row: rowNum, noNBA: noNBAString, nama: nama || "-", error: "No. NBA tidak ditemukan di data anggota" });
                        return;
                      }
                      
                      // Validate jumlah
                      let jumlah = 0;
                      if (typeof jmlRaw === "number") {
                        jumlah = jmlRaw;
                      } else if (typeof jmlRaw === "string") {
                        jumlah = parseInt(jmlRaw.replace(/\.0$/, "").replace(/[^0-9]/g, "")) || 0;
                      }
                      
                      if (jumlah <= 0) {
                        errors.push({ row: rowNum, noNBA: noNBAString, nama: nama, error: "Jumlah harus lebih dari 0" });
                        return;
                      }
                      
                      // Validate metode
                      const validMetode = ["tunai", "tigabinanga", "berastagi", "bpr"];
                      const metodeMatch = validMetode.find(m => jenisBayar.toLowerCase().includes(m));
                      if (!metodeMatch && jenisBayar) {
                        errors.push({ row: rowNum, noNBA: noNBAString, nama: nama, error: "Jenis Pembayaran tidak valid (pilih: Tunai, BRI Tigabinanga, BRI Berastagi, BPR)" });
                        return;
                      }
                      
                      // Parse tanggal
                      let tanggal = "";
                      if (tglRaw) {
                        const tglNum = Number(tglRaw);
                        if (!isNaN(tglNum)) {
                          const excelEpoch = new Date(1899, 11, 30);
                          const date = new Date(excelEpoch.getTime() + tglNum * 24 * 60 * 60 * 1000);
                          tanggal = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                        } else if (typeof tglRaw === "string") {
                          const parts = tglRaw.split(/[-/]/);
                          if (parts.length === 3 && parts[2].length === 4) {
                            tanggal = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                          }
                        }
                      }
                      
                      if (!tanggal) {
                        errors.push({ row: rowNum, noNBA: noNBAString, nama: nama, error: "Format Tanggal tidak valid (gunakan DD-MM-YYYY)" });
                        return;
                      }
                      
                      let metode = "tunai";
                      if (jenisBayar.toLowerCase().includes("tigabinanga")) metode = "bri-tigabinanga";
                      else if (jenisBayar.toLowerCase().includes("berastagi")) metode = "bri-berastagi";
                      else if (jenisBayar.toLowerCase().includes("bpr")) metode = "bpr-logo-asri";
                      
                      count++;
                      
                      addSimpanan({
                        id: 0,
                        idAnggota: anggotaFound.id,
                        nama: nama || anggotaFound.nama,
                        nomorAnggota: noNBA,
                        tanggal: tanggal,
                        jenisSimpanan: importType,
                        jumlah: jumlah,
                        metode: metode,
                        bunga: 0,
                      });
                      
                      const akun = metode === "tunai" ? "Kas" : 
                                   metode === "bri-tigabinanga" ? "Bank BRI Cab. Tigabinanga" :
                                   metode === "bri-berastagi" ? "Bank BRI Cab. Berastagi" :
                                   metode === "bpr-logo-asri" ? "Bank BPR Logo Asri" : "Kas";
                      
                      addTransaksi({
                        id: 0,
                        noBukti: `BK-${tanggal.replace(/-/g, "")}-${String(count).padStart(3, "0")}`,
                        tanggal: tanggal,
                        jam: "09:00",
                        akun: akun,
                        kategori: `Setoran Simpanan ${importType.charAt(0).toUpperCase() + importType.slice(1)}`,
                        uraian: `Setoran Simpanan ${importType.charAt(0).toUpperCase() + importType.slice(1)} ${nama || anggotaFound.nama}`,
                        debet: jumlah,
                        kredit: 0,
                        saldo: 0,
                        operator: "Admin",
                      });
                    });
                    
                    if (errors.length > 0) {
                      const errorMsg = errors.slice(0, 10).map(e => 
                        `Baris ${e.row} (${e.noNBA}): ${e.nama} - ${e.error}`
                      ).join("\n");
                      
                      const moreMsg = errors.length > 10 ? `\n...dan ${errors.length - 10} error lainnya` : "";
                      alert(`Import selesai dengan ${errors.length} error:\n\n${errorMsg}${moreMsg}\n\nData valid: ${count} berhasil diimport.`);
                    } else {
                      alert(`Berhasil import ${count} transaksi simpanan!`);
                    }
                  } catch (error) {
                    alert("Gagal import data. Pastikan format Excel benar.");
                  }
                };
                reader.readAsBinaryString(file);
              }}
              style={{ display: "none" }}
              id="fileInputSimpanan"
            />
            <label htmlFor="fileInputSimpanan" style={{ cursor: "pointer", display: "block" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1B4D3E" }}>Klik untuk upload file Excel</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>Format: .xlsx, .xls, .csv</div>
            </label>
          </div>
        </div>
      )}

      {activeTab === "kartu" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 18, marginBottom: 20, color: "#1B4D3E" }}>📒 Kartu Simpanan Anggota</h3>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pilih Anggota</label>
            <select 
              value={selectedAnggota} 
              onChange={(e) => setSelectedAnggota(e.target.value ? Number(e.target.value) : 0)}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}
            >
              <option value={0}>-- Pilih Anggota --</option>
              {anggota.map(a => (
                <option key={a.id} value={a.id}>{a.nama} (NBA: {(a as any).nomorNBA || "-"})</option>
              ))}
            </select>
          </div>

          {Number(selectedAnggota) > 0 && (
            <>
              {(() => {
                const anggotaData = anggota.find(a => a.id === selectedAnggota);
                const mutasi = simpanan.filter(s => s.idAnggota === selectedAnggota);
                const totalSaldo = mutasi.reduce((sum, s) => sum + s.jumlah, 0);
                
                return (
                  <div>
                    <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 8, marginBottom: 20 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{anggotaData?.nama}</h4>
                      <p style={{ fontSize: 13, color: "#6b7280" }}>No. NBA: {(anggotaData as any)?.nomorNBA || "-"}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4D3E", marginTop: 8 }}>Total Saldo: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalSaldo)}</p>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>TANGGAL</th>
                          <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>JENIS</th>
                          <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>DEBET (MASUK)</th>
                          <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>SALDO</th>
                          <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>METODE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mutasi.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>Belum ada transaksi simpanan.</td></tr>
                        ) : (
                          mutasi.map((s, i) => {
                            const saldoSekarang = mutasi.slice(0, i + 1).reduce((sum, m) => sum + m.jumlah, 0);
                            return (
                              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: 10 }}>{s.tanggal}</td>
                                <td style={{ padding: 10, fontWeight: 500 }}>{getJenisLabel(s.jenisSimpanan)}</td>
                                <td style={{ padding: 10, textAlign: "right", color: "#22c55e" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(s.jumlah)}</td>
                                <td style={{ padding: 10, textAlign: "right", fontWeight: 600 }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(saldoSekarang)}</td>
                                <td style={{ padding: 10 }}>{s.metode}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>

                    <button 
                      onClick={() => window.print()}
                      style={{ marginTop: 20, padding: "12px 24px", background: "#1B4D3E", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                    >
                      🖨️ Cetak Kartu Simpanan
                    </button>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}