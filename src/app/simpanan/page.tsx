"use client";
import { useState, useRef, useMemo } from "react";
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

const allJenisSimpanan: { value: string; label: string }[] = [
  { value: "pokok", label: "Simpanan Pokok" },
  { value: "wajib", label: "Simpanan Wajib" },
  { value: "sukarela", label: "Simpanan Sukarela" },
  { value: "sibuhar", label: "Sibuhar (3%/th)" },
  { value: "simapan", label: "Simapan (5%/th)" },
  { value: "sihat", label: "Sihat (6%/th)" },
  { value: "sihar", label: "Sihar (4%/th)" },
  { value: "berjangka", label: "Simpanan Berjangka" },
];

export default function SimpananPage() {
  const { simpanan, addSimpanan, addTransaksi, anggota, deleteSimpanan } = useData();
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
   const [importType, setImportType] = useState<"pokok" | "wajib" | "sibuhar" | "simapan" | "sihat" | "sihar" | "penarikan-pokok" | "penarikan-wajib" | "penarikan-sibuhar">("wajib");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteFilter, setDeleteFilter] = useState<Set<string>>(new Set());
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const filteredSimpanan = useMemo(() => {
    if (!searchQuery) return simpanan;
    const q = searchQuery.toLowerCase();
    return simpanan.filter(s => 
      (s.nama && s.nama.toLowerCase().includes(q)) ||
      (s.nomorAnggota && s.nomorAnggota.toLowerCase().includes(q)) ||
      (s.jenisSimpanan && s.jenisSimpanan.toLowerCase().includes(q))
    );
  }, [simpanan, searchQuery]);

   const validateForm = () => {
     const errors: Record<string, string> = {};
     if (!formData.nama.trim()) errors.nama = "Nama wajib diisi";
     if (!formData.nomorAnggota.trim()) errors.nomorAnggota = "Nomor anggota wajib diisi";
     if (!formData.tanggal) errors.tanggal = "Tanggal wajib diisi";
     if (!formData.jenisSimpanan) errors.jenisSimpanan = "Jenis simpanan wajib dipilih";
     if (!formData.jumlah) errors.jumlah = "Jumlah wajib diisi";
     if (!formData.metodePembayaran) errors.metodePembayaran = "Metode pembayaran wajib dipilih";
     
     // Balance validation for withdrawals (penarikan)
     if (formData.metodePembayaran === "penarikan") {
       const nominated = anggota.find(a => a.nomorNBA?.trim().toLowerCase() === formData.nomorAnggota.trim().toLowerCase());
       if (nominated) {
         const currentBalance = simpanan
           .filter(s => s.idAnggota === nominated.id && s.jenisSimpanan === formData.jenisSimpanan)
           .reduce((sum, s) => sum + s.jumlah, 0);
         const withdrawalAmount = parseInt(formData.jumlah.replace(/\D/g, "")) || 0;
         if (withdrawalAmount > currentBalance) {
           errors.jumlah = `Saldo tidak mencukupi! Saldo saat ini: Rp ${currentBalance.toLocaleString("id-ID")}`;
         }
       }
     }
     
     setFormErrors(errors);
     return Object.keys(errors).length === 0;
   };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const jumlahNum = parseInt(formData.jumlah.replace(/\D/g, ""));

      // Look up anggota by nomorAnggota (case-insensitive, trim spaces)
      const nominated = anggota.find(a => a.nomorNBA?.trim().toLowerCase() === formData.nomorAnggota.trim().toLowerCase());

      if (!nominated) {
        alert(`Anggota dengan No. NBA "${formData.nomorAnggota}" tidak ditemukan.`);
        return;
      }

      const isPenarikan = formData.metodePembayaran === "penarikan";
      const jumlahFinal = isPenarikan ? -Math.abs(jumlahNum) : Math.abs(jumlahNum);

      const newSimpanan: SimpananType = {
        id: simpanan.length + 1,
        idAnggota: nominated.id,
        nama: nominated.nama,
        nomorAnggota: nominated.nomorNBA,
        tanggal: formData.tanggal,
        jenisSimpanan: formData.jenisSimpanan,
        jumlah: jumlahFinal,
        metode: isPenarikan ? "tunai" : formData.metodePembayaran,
        bunga: 0,
      };
      addSimpanan(newSimpanan);

      const getAkun = (metode: string) => {
        if (metode === "tunai" || isPenarikan) return "Kas";
        if (metode === "bri-tigabinanga") return "Bank BRI Cab. Tigabinanga";
        if (metode === "bri-berastagi") return "Bank BRI Cab. Berastagi";
        if (metode === "bpr-logo-asri") return "Bank BPR Logo Asri";
        return "Kas";
      };

      const getKategoriSimpanan = (jenis: string, isWithdrawal: boolean) => {
        const prefix = isWithdrawal ? "Penarikan Simpanan" : "Setoran Simpanan";
        switch (jenis) {
          case "pokok": return `${prefix} Pokok`;
          case "wajib": return `${prefix} Wajib`;
          case "sibuhar": return `${prefix} Sibuhar`;
          case "simapan": return `${prefix} Simapan`;
          case "sihat": return `${prefix} Sihat`;
          case "sihar": return `${prefix} Sihar`;
          case "berjangka": return `${prefix} Berjangka`;
          default: return `${prefix} Anggota`;
        }
      };

      const noBukti = `${isPenarikan ? "PD" : "SM"}-${formData.tanggal.replace(/-/g, "")}-${String(simpanan.length + 1).padStart(3, "0")}`;

      addTransaksi({
        id: 0,
        noBukti: noBukti,
        tanggal: formData.tanggal,
        jam: "10:00",
        akun: getAkun(formData.metodePembayaran),
        kategori: getKategoriSimpanan(formData.jenisSimpanan, isPenarikan),
        uraian: `${isPenarikan ? "Penarikan" : "Setoran"} Simpanan ${formData.jenisSimpanan.charAt(0).toUpperCase() + formData.jenisSimpanan.slice(1)} — ${nominated.nama}`,
        debet: isPenarikan ? 0 : Math.abs(jumlahNum),
        kredit: isPenarikan ? Math.abs(jumlahNum) : 0,
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

   const validateExcelDate = (value: any): string | null => {
     if (!value && value !== 0) return null;

     // Excel serial number (days since 1899-12-30)
     if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
       const excelEpoch = new Date(1899, 11, 30);
       const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
       if (isNaN(date.getTime())) return null;
       return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
     }

     // String date
     if (typeof value === "string") {
       const str = value.trim();
       if (!str) return null;

       // Check if numeric string (Excel serial as string)
       const numVal = Number(str);
       if (!isNaN(numVal) && str.length < 10 && isFinite(numVal)) {
         const excelEpoch = new Date(1899, 11, 30);
         const date = new Date(excelEpoch.getTime() + numVal * 24 * 60 * 60 * 1000);
         if (isNaN(date.getTime())) return null;
         return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
       }

       // Parse DD-MM-YYYY or DD/MM/YYYY
       const parts = str.split(/[-/]/);
       if (parts.length === 3) {
         const [p1, p2, p3] = parts;
         // DD-MM-YYYY -> YYYY-MM-DD
         if (p1.length <= 2 && p2.length <= 2 && p3.length === 4) {
           const day = p1.padStart(2, "0");
           const month = p2.padStart(2, "0");
           const year = p3;
           const testDate = new Date(`${year}-${month}-${day}`);
           if (!isNaN(testDate.getTime())) {
             return `${year}-${month}-${day}`;
           }
         }
         // YYYY-MM-DD (already correct)
         if (p1.length === 4 && p2.length <= 2 && p3.length <= 2) {
           const year = p1;
           const month = p2.padStart(2, "0");
           const day = p3.padStart(2, "0");
           const testDate = new Date(`${year}-${month}-${day}`);
           if (!isNaN(testDate.getTime())) {
             return `${year}-${month}-${day}`;
           }
         }
       }
       return null;
     }

     return null;
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
           <div style={{ marginBottom: 24, padding: 16, background: "#f0f9ff", borderRadius: 12, border: "2px solid #bae6fd" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
               <span style={{ fontSize: 20 }}>ℹ️</span>
               <div style={{ fontWeight: 600, color: "#0369a1", fontSize: 14 }}>Panduan Penarikan Sibuhar</div>
             </div>
             <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#0c4a6e", lineHeight: 1.7 }}>
               <li><strong>Setoran Simpanan:</strong> Pilih jenis simpanan → Metode <em>Tunai</em> atau <em>Transfer</em></li>
               <li><strong>Penarikan Simpanan (termasuk Sibuhar):</strong> Pilih jenis simpanan → Metode <em>Penarikan</em>. Saldo akan otomatis berkurang dan membuat transaksi Kas Keluar.</li>
               <li>Untuk penarikan multiple data, gunakan tab <strong>Import</strong> dan pilih jenis <em>Penarikan Simpanan Bunga Harian (Sibuhar)</em>.</li>
             </ul>
           </div>
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
               <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Metode Pembayaran *</label>
               <select value={formData.metodePembayaran} onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.metodePembayaran ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}>
                 <option value="">Pilih metode</option>
                 <option value="tunai">💰 Tunai (Setoran)</option>
                 <option value="bri-tigabinanga">🏦 Transfer BRI Cab. Tigabinanga</option>
                 <option value="bri-berastagi">🏦 Transfer BRI Cab. Berastagi</option>
                 <option value="bpr-logo-asri">🏦 Transfer BPR Logo Asri</option>
                 <option value="penarikan">⏬ Penarikan (Withdraw)</option>
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

         {simpanan.length > 0 && (
           <div style={{ marginTop: 32, padding: 20, background: "#fef2f2", borderRadius: 12, border: "2px solid #fecaca" }}>
             <div style={{ fontSize: 13, fontWeight: 600, color: "#991b1b", marginBottom: 12 }}>
               ⚠️ Hapus Semua Data Simpanan
             </div>
             <div style={{ fontSize: 12, color: "#7f1d1d", marginBottom: 16 }}>
               Menghapus semua data simpanan (pokok, wajib, sukarela, berjangka, dll). Tindakan ini tidak bisa dibatalkan.
             </div>
              <button
                onClick={() => {
                  if (confirm(`Yakin ingin menghapus SEMUA data simpanan? Total ${simpanan.length} transaksi akan dihapus.`)) {
                    const idsToDelete = simpanan.map(s => s.id);
                    idsToDelete.forEach(id => deleteSimpanan(id));
                    alert("Semua data simpanan berhasil dihapus!");
                  }
                }}
               style={{ width: "100%", padding: 12, background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
             >
               🗑️ Hapus Semua Simpanan
             </button>
           </div>
         )}
       </div>
     </div>
   )}

        {activeTab === "data" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          {simpanan.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>Belum ada data simpanan.</div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <input 
                  type="text" 
                  placeholder="Cari berdasarkan No. NBA, Nama, atau Jenis..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }}
                />
              </div>
              <div style={{ marginBottom: 16, padding: 16, background: "#fef2f2", borderRadius: 12, border: "2px solid #fecaca" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
                    🗑️ Hapus Transaksi Simpanan Berdasarkan Jenis
                  </div>
                  <button
                    onClick={() => setShowDeleteOptions(!showDeleteOptions)}
                    style={{ padding: "6px 12px", background: "#6b7280", color: "white", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                  >
                    {showDeleteOptions ? "⊖ Tutup" : "+ Pilih Jenis"}
                  </button>
                </div>

                {showDeleteOptions && (
                  <div>
                    <div style={{ fontSize: 11, color: "#7f1d1d", marginBottom: 12 }}>
                      Pilih satu atau lebih jenis simpanan yang akan dihapus:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginBottom: 16 }}>
                      {allJenisSimpanan.map(jenis => {
                        const count = simpanan.filter(s => s.jenisSimpanan === jenis.value).length;
                        if (count === 0) return null;
                        const isChecked = deleteFilter.has(jenis.value);
                        return (
                          <label key={jenis.value} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, background: "white", borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newFilter = new Set(deleteFilter);
                                if (e.target.checked) {
                                  newFilter.add(jenis.value);
                                } else {
                                  newFilter.delete(jenis.value);
                                }
                                setDeleteFilter(newFilter);
                              }}
                              style={{ width: 16, height: 16 }}
                            />
                            <span style={{ fontSize: 13, color: "#374151" }}>{jenis.label}</span>
                            <span style={{ fontSize: 11, color: "#6b7280", marginLeft: "auto" }}>({count})</span>
                          </label>
                        );
                      })}
                    </div>

                    {deleteFilter.size > 0 && (
                      <div style={{ padding: 12, background: "#fee2e2", borderRadius: 8, marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: "#991b1b", marginBottom: 4 }}>
                          Akan dihapus: {Array.from(deleteFilter).map(j => allJenisSimpanan.find(a => a.value === j)?.label).join(", ")}
                        </div>
                        <div style={{ fontSize: 11, color: "#dc2626" }}>
                          Total transaksi: {simpanan.filter(s => deleteFilter.has(s.jenisSimpanan)).length} data
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (deleteFilter.size === 0) {
                          alert("Pilih minimal satu jenis simpanan untuk dihapus!");
                          return;
                        }
                        const toDelete = simpanan.filter(s => deleteFilter.has(s.jenisSimpanan));
                        const confirmMsg = `Yakin menghapus ${toDelete.length} transaksi simpanan dari:\n${Array.from(deleteFilter).map(j => `  • ${allJenisSimpanan.find(a => a.value === j)?.label}`).join("\n")}\n\nTindakan ini tidak bisa dibatalkan!`;
                        if (!confirm(confirmMsg)) return;

                        toDelete.forEach(s => deleteSimpanan(s.id));
                        setDeleteFilter(new Set());
                        setShowDeleteOptions(false);
                        alert(`Berhasil menghapus ${toDelete.length} transaksi simpanan!`);
                      }}
                      style={{ width: "100%", padding: 12, background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                    >
                      🗑️ Hapus {deleteFilter.size > 0 ? `${simpanan.filter(s => deleteFilter.has(s.jenisSimpanan)).length} Transaksi Terpilih` : "Transaksi Terpilih"}
                    </button>
                  </div>
                )}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tanggal</th>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Jenis</th>
                    <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>Jumlah</th>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Metode</th>
                    <th style={{ padding: 10, textAlign: "center", borderBottom: "2px solid #ddd" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSimpanan.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 10 }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td style={{ padding: 10 }}>{s.tanggal}</td>
                      <td style={{ padding: 10 }}>{s.nama}</td>
                      <td style={{ padding: 10 }}>{getJenisLabel(s.jenisSimpanan)}</td>
                      <td style={{ padding: 10, textAlign: "right" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(s.jumlah)}</td>
                      <td style={{ padding: 10 }}>{s.metode}</td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        <button 
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus simpanan "${s.nama}" sebesar Rp ${Number(s.jumlah).toLocaleString("id-ID")}?`)) {
                              deleteSimpanan(s.id);
                              alert("Data simpanan berhasil dihapus!");
                            }
                          }}
                          style={{ padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

               {filteredSimpanan.length > itemsPerPage && (
                 <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20, gap: 8 }}>
                   <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "8px 16px", background: currentPage === 1 ? "#ddd" : "#1B4D3E", color: currentPage === 1 ? "#888" : "white", border: "none", borderRadius: 6, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>← Prev</button>
                   <span style={{ padding: "8px 16px", fontSize: 13 }}>Halaman {currentPage} dari {Math.ceil(filteredSimpanan.length / itemsPerPage)}</span>
                   <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredSimpanan.length / itemsPerPage), p + 1))} disabled={currentPage >= Math.ceil(filteredSimpanan.length / itemsPerPage)} style={{ padding: "8px 16px", background: currentPage >= Math.ceil(filteredSimpanan.length / itemsPerPage) ? "#ddd" : "#1B4D3E", color: currentPage >= Math.ceil(filteredSimpanan.length / itemsPerPage) ? "#888" : "white", border: "none", borderRadius: 6, cursor: currentPage >= Math.ceil(filteredSimpanan.length / itemsPerPage) ? "not-allowed" : "pointer", fontSize: 13 }}>Next →</button>
                 </div>
               )}

               {simpanan.length > 0 && (
                 <div style={{ marginTop: 24, padding: 16, background: "#fef2f2", borderRadius: 12, border: "2px solid #fecaca" }}>
                   <div style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", marginBottom: 8 }}>
                     ⚠️ Hapus Semua Data Simpanan
                   </div>
                   <div style={{ fontSize: 11, color: "#7f1d1d", marginBottom: 12 }}>
                     Menghapus semua transaksi simpanan (Pokok, Wajib, Sukarela, Berjangka, dll). Tindakan ini permanen.
                   </div>
                   <button
                     onClick={() => {
                       if (confirm(`Yakin ingin menghapus SEMUA data simpanan? Total ${simpanan.length} transaksi akan dihapus.`)) {
                         simpanan.forEach(s => deleteSimpanan(s.id));
                         alert("Semua data simpanan berhasil dihapus!");
                       }
                     }}
                     style={{ width: "100%", padding: 12, background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                   >
                     🗑️ Hapus Semua Simpanan
                   </button>
                 </div>
               )}
             </>
           )}
         </div>
       )}

      {activeTab === "import" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 18, marginBottom: 20, color: "#1B4D3E" }}>📥 Import Simpanan dari Excel</h3>
          
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
             <div>
               <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>Jenis Transaksi Simpanan</label>
               <select 
                 value={importType} 
                 onChange={(e) => setImportType((e.target as HTMLSelectElement).value as any)}
                 style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #e5e7eb", fontSize: 15, background: "white" }}
               >
                 <option value="pokok">🏦 Setoran Simpanan Pokok</option>
                 <option value="wajib">💰 Setoran Simpanan Wajib</option>
                  <option value="sibuhar">📈 Setoran Simpanan Bunga Harian (Sibuhar)</option>
                  <option value="penarikan-sibuhar">⏬ Penarikan Simpanan Bunga Harian (Sibuhar)</option>
                  <option value="simapan">🏫 Setoran Simpanan Masa Depan (Simapan)</option>
                 <option value="sihat">👵 Setoran Simpanan Hari Tua (Sihat)</option>
                 <option value="sihar">🎉 Setoran Simpanan Hari Raya (Sihar)</option>
                 <option value="penarikan-pokok">⏬ Penarikan Simpanan Pokok</option>
                 <option value="penarikan-wajib">⏬ Penarikan Simpanan Wajib</option>
               </select>
               <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                 Pilih jenis transaksi yang sesuai dengan file Excel Anda.
               </p>
             </div>

             <div>
               <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>Download Template</label>
               <button 
                  onClick={() => {
                    const isPenarikan = importType.startsWith("penarikan");
                    const templateData = [{
                      "No. NBA": "1",
                      "Nama Anggota": "Budi Santoso",
                      "Tanggal Transaksi": "15-01-2024",
                      "Jenis Pembayaran": isPenarikan ? "Penarikan" : "Tunai",
                      "Jumlah Transaksi": importType === "pokok" || importType === "penarikan-pokok" ? 100000 :
                                          importType === "sibuhar" || importType === "penarikan-sibuhar" ? 25000 : 50000
                    }];
                   const ws = XLSX.utils.json_to_sheet(templateData);
                   const wb = XLSX.utils.book_new();
                   XLSX.utils.book_append_sheet(wb, ws, "Template");
                   XLSX.writeFile(wb, `template_import_simpanan_${importType}_ksp.xlsx`);
                 }}
                 style={{ 
                   width: "100%", 
                   padding: 14, 
                   background: "#0d9488", 
                   color: "white", 
                   border: "none", 
                   borderRadius: 8, 
                   fontWeight: 600, 
                   cursor: "pointer",
                   fontSize: 15
                 }}
               >
                 📥 Download Template Excel
               </button>
               <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                 Template sudah disesuaikan dengan jenis transaksi yang dipilih.
               </p>
             </div>
           </div>

           <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
             <div style={{ background: "#fef2f2", border: "2px solid #fecaca", borderRadius: 10, padding: 16, marginBottom: 16 }}>
               <p style={{ fontWeight: 800, color: "#991b1b", marginBottom: 10, fontSize: 14 }}>⚠️ IMPORT DATA SIMPANAN — SEMUA KOLOM WAJIB DIISI</p>
               <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 10 }}>
                 <thead>
                   <tr>
                     <th style={{ border: "2px solid #dc2626", padding: 10, background: "#fee2e2", color: "#991b1b", fontWeight: 700, textAlign: "left" }}>Kolom *</th>
                     <th style={{ border: "2px solid #dc2626", padding: 10, background: "#fee2e2", color: "#991b1b", fontWeight: 700, textAlign: "left" }}>Contoh Nilai</th>
                     <th style={{ border: "2px solid #dc2626", padding: 10, background: "#fee2e2", color: "#991b1b", fontWeight: 700, textAlign: "left" }}>Catatan</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontWeight: 600 }}>No. NBA</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8 }}>1</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontSize: 12 }}>Harus sesuai No. NBA anggota terdaftar (case-insensitive)</td>
                   </tr>
                   <tr>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontWeight: 600 }}>Nama Anggota</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8 }}>Budi Santoso</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontSize: 12 }}>Hanya referensi, tidak dicek ke data anggota</td>
                   </tr>
                   <tr>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontWeight: 600 }}>Tanggal Transaksi</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8 }}>15-01-2024</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontSize: 12 }}>Format: DD-MM-YYYY atau tanggal Excel</td>
                   </tr>
                   <tr>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontWeight: 600 }}>Jenis Pembayaran</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8 }}>Tunai</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontSize: 12 }}>Tunai / Transfer BRI Tigabinanga / Transfer BRI Berastagi / Transfer BPR Logo Asri / Penarikan</td>
                   </tr>
                   <tr>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontWeight: 600 }}>Jumlah Transaksi</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8 }}>25000</td>
                     <td style={{ border: "1px solid #fecaca", padding: 8, fontSize: 12 }}>Angka positif, tanpa Rp, koma, atau titik</td>
                   </tr>
                  </tbody>
                </table>
                  <div style={{ background: "#fff3cd", border: "2px solid #f59e0b", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <p style={{ fontWeight: 700, color: "#92400e", marginBottom: 6, fontSize: 13 }}>ℹ️ Aturan Duplikat No. NBA:</p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#92400e", lineHeight: 1.7 }}>
                      <li><strong>Simpanan Wajib, Bunga Harian (Sibuhar), & Penarikan Sibuhar:</strong> <em>DUPLIKAT DIZINKAN</em> — Banyak transaksi untuk No. NBA yang sama, baik pada tanggal berbeda maupun sama.</li>
                      <li><strong>Simpanan Pokok, Penarikan (Pokok/Wajib), Simapan, Sihat, Sihar:</strong> Setiap No. NBA hanya boleh muncul <strong>satu kali</strong> (1 transaksi total).</li>
                    </ul>
                  </div>
                <p style={{ fontWeight: 700, color: "#1d4ed8", fontSize: 13, marginTop: 12, marginBottom: 6 }}>🔎 Validasi Import (Strict Mode):</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#1e40af", lineHeight: 1.8 }}>
                  <li><strong>Kolom wajib</strong> — Semua 5 kolom wajib diisi. Jika ada yang kosong → import DIBATALKAN.</li>
                  <li><strong>No. NBA unik</strong> — Untuk Simpanan Pokok/Simapan/Sihat/Sihar/Penarikan (Pokok/Wajib): No. NBA hanya boleh muncul sekali. Untuk Simpanan Wajib, Sibuhar, & Penarikan Sibuhar: <em>duplikat No. NBA diizinkan</em> (boleh multiple transaksi, tanggal sama atau berbeda).</li>
                  <li><strong>No. NBA valid</strong> — Harus cocok dengan data anggota yang sudah terdaftar.</li>
                  <li><strong>Jumlah</strong> — Harus angka positif lebih dari 0.</li>
                  <li><strong>Tanggal</strong> — Format DD-MM-YYYY (contoh: 15-01-2024) atau serial Excel.</li>
                  <li><strong>Jenis Pembayaran</strong> — Harus sesuai pilihan yang tersedia.</li>
                  <li><strong>All-or-nothing</strong> — Jika 1 baris error, SEMUA data ditolak (tidak ada partial import).</li>
                </ul>
             </div>
           </div>

           <div style={{ border: "2px dashed #ddd", borderRadius: 12, padding: 40, textAlign: "center" }}>
             <input
               type="file"
               accept=".xlsx, .xls, .csv"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (!file) {
                   alert("Pilih file Excel terlebih dahulu!");
                   return;
                 }

                 const reader = new FileReader();
                 reader.onload = (event) => {
                   try {
                     const data = event.target?.result;
                     if (!data) {
                       alert("File tidak dapat dibaca!");
                       return;
                     }

                     const workbook = XLSX.read(data, { type: "binary" });
                     if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                       alert("File Excel tidak memiliki sheet!");
                       return;
                     }

                     const sheetName = workbook.SheetNames[0];
                     const sheet = workbook.Sheets[sheetName];
                     if (!sheet) {
                       alert("Sheet tidak ditemukan!");
                       return;
                     }

                     const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
                     if (!jsonData || jsonData.length === 0) {
                       alert("File Excel tidak berisi data!");
                       return;
                     }

                     // Define required columns (normalized: lowercase, spaces instead of underscores)
                     const requiredCols = [
                       "no. nba", "nama anggota", "tanggal transaksi", "jumlah transaksi", "jenis pembayaran"
                     ];

                     const sampleRow = jsonData[0];
                     const rawColumns = Object.keys(sampleRow);

                     // Normalize column names: lowercase, trim, replace underscores with spaces
                     const normalize = (col: string) => col.toLowerCase().trim().replace(/_/g, " ");
                     const normalizedMap: Record<string, string> = {};
                     rawColumns.forEach(col => {
                       normalizedMap[normalize(col)] = col;
                     });

                     // Check for missing required columns
                     const missingRequired = requiredCols.filter(key => !normalizedMap[key]);
                     if (missingRequired.length > 0) {
                       const missingNames = missingRequired.map(k => {
                         const names: Record<string, string> = {
                           "no. nba": "No. NBA",
                           "nama anggota": "Nama Anggota",
                           "tanggal transaksi": "Tanggal Transaksi",
                           "jumlah transaksi": "Jumlah Transaksi",
                           "jenis pembayaran": "Jenis Pembayaran"
                         };
                         return names[k] || k;
                       });
                       alert(
                         `❌ KOLOM WAJIB TIDAK DITEMUKAN:\n\n` +
                         `${missingNames.join(", ")}\n\n` +
                         `Kolom yang ada di file Anda:\n${rawColumns.join(", ")}\n\n` +
                         `Silakan download template yang benar dan sesuaikan kolomnya.`
                       );
                       return;
                     }

                      // Check for duplicate entries
                       // For wajib & sibuhar (setoran & penarikan): allow duplicate (No. NBA + Tanggal) — multiple transactions same day allowed
                       // For other types (pokok, penarikan, etc.): No. NBA must be unique (only one transaction total)
                       const isRecurringType = importType === "wajib" || importType === "sibuhar" || importType === "penarikan-sibuhar";
                      
                      if (!isRecurringType) {
                        // Non-recurring types: enforce strict No. NBA uniqueness
                        const seenNoNBA = new Set<string>();
                        const duplicates = new Set<string>();
                        jsonData.forEach((row) => {
                          const rawNoNBA = row[normalizedMap["no. nba"]];
                          const noNBA = String(rawNoNBA ?? "").trim().toLowerCase();
                          if (noNBA) {
                            if (seenNoNBA.has(noNBA)) duplicates.add(noNBA);
                            else seenNoNBA.add(noNBA);
                          }
                        });
                        if (duplicates.size > 0) {
                          alert(
                            `❌ DUPLIKAT No. NBA TERDETEKSI:\n\n` +
                            `No. NBA berikut muncul lebih dari sekali:\n` +
                            `${Array.from(duplicates).map(d => `  • ${d.toUpperCase()}`).join("\n")}\n\n` +
                            `Untuk jenis transaksi ini (${importType}), setiap No. NBA hanya boleh muncul satu kali.\n` +
                            `Silakan gabungkan atau hapus duplikat.`
                          );
                          return;
                        }
                      }
                      // For recurring types (wajib, sibuhar): no duplicate check — allowed multiple transactions per member on any dates

                     // Strict validation: collect ALL errors first, then abort if any exist
                     const validationErrors: Array<{
                       row: number;
                       field: string;
                       value: string;
                       message: string;
                     }> = [];

                     jsonData.forEach((row, idx) => {
                       const rowNum = idx + 2; // +2 because header is row 1
                       const get = (colKey: string) => {
                         const normKey = normalize(colKey);
                         const actualKey = normalizedMap[normKey];
                         return actualKey ? row[actualKey] : undefined;
                       };

                       const noNBA = String(get("no. nba") ?? "").trim();
                       const nama = String(get("nama anggota") ?? "").trim();
                       const jmlRaw = get("jumlah transaksi");
                       const tglRaw = get("tanggal transaksi");
                       const jenisBayar = String(get("jenis pembayaran") ?? "").trim();

                       // Required field checks
                       if (!noNBA) {
                         validationErrors.push({ row: rowNum, field: "No. NBA", value: "", message: "wajib diisi (kosong)" });
                       }
                       if (!nama) {
                         validationErrors.push({ row: rowNum, field: "Nama Anggota", value: "", message: "wajib diisi (kosong)" });
                       }

                        // Validate anggota exists
                        let anggotaFound: any = null;
                        if (noNBA) {
                          anggotaFound = anggota.find(a => {
                            const aNBA = String(a.nomorNBA || "").trim().toLowerCase();
                            return aNBA === noNBA.toLowerCase() || aNBA === `nba-${noNBA.padStart(3, "0")}` || aNBA === `nba-${noNBA}`;
                          });
                          if (!anggotaFound) {
                            validationErrors.push({ row: rowNum, field: "No. NBA", value: noNBA, message: "tidak ditemukan di data anggota" });
                          }
                        }

                       // Validate jumlah
                       let jumlah = 0;
                       if (jmlRaw === undefined || jmlRaw === null || jmlRaw === "") {
                         validationErrors.push({ row: rowNum, field: "Jumlah Transaksi", value: "", message: "wajib diisi (kosong)" });
                       } else {
                         if (typeof jmlRaw === "number") {
                           jumlah = Math.floor(jmlRaw);
                         } else if (typeof jmlRaw === "string") {
                           const cleaned = jmlRaw.replace(/\./g, "").replace(/[^0-9]/g, "");
                           if (cleaned.length === 0) {
                             validationErrors.push({ row: rowNum, field: "Jumlah Transaksi", value: String(jmlRaw), message: "format tidak valid (harus angka)" });
                           } else {
                             jumlah = parseInt(cleaned);
                           }
                         } else {
                           validationErrors.push({ row: rowNum, field: "Jumlah Transaksi", value: String(jmlRaw), message: "tipe data tidak valid" });
                         }

                           // Validate jumlah is positive
                           if (jumlah <= 0) {
                             validationErrors.push({ row: rowNum, field: "Jumlah Transaksi", value: String(jmlRaw), message: `harus > 0 (saat ini: ${jumlah})` });
                           }
                        }

                        // Balance validation for withdrawals (only for penarikan import)
                        if (importType.startsWith("penarikan") && anggotaFound && jumlah > 0) {
                          const jenisSimpanan = importType.replace("penarikan-", "");
                          const currentBalance = simpanan
                            .filter(s => s.idAnggota === anggotaFound.id && s.jenisSimpanan === jenisSimpanan)
                            .reduce((sum, s) => sum + s.jumlah, 0);
                          if (jumlah > currentBalance) {
                            validationErrors.push({
                              row: rowNum,
                              field: "Jumlah Transaksi",
                              value: String(jmlRaw),
                              message: `Saldo ${jenisSimpanan} tidak mencukupi. Saldo saat ini: Rp ${currentBalance.toLocaleString("id-ID")}`
                            });
                          }
                        }

                        // Validate tanggal (required)
                       const tanggal = validateExcelDate(tglRaw);
                       if (!tanggal) {
                         validationErrors.push({ row: rowNum, field: "Tanggal Transaksi", value: String(tglRaw ?? ""), message: "format tidak valid (gunakan DD-MM-YYYY)" });
                       }

                        // Validate jenis pembayaran (required)
                        if (!jenisBayar) {
                          validationErrors.push({ row: rowNum, field: "Jenis Pembayaran", value: "", message: "wajib dipilih (kosong)" });
                        } else {
                          // Normalize: lowercase, trim, replace punctuation with spaces, collapse multiple spaces
                          const normalizedInput = jenisBayar.toLowerCase().trim().replace(/[\.\-_,]/g, " ").replace(/\s+/g, " ");
                          
                          // Define payment type patterns (normalized space-separated keywords)
                          const paymentPatterns: Record<string, string[]> = {
                            "tunai": ["tunai"],
                            "bri-tigabinanga": ["bri tigabinanga", "bri cab tigabinanga", "tigabinanga"],
                            "bri-berastagi": ["bri berastagi", "bri cab berastagi", "berastagi"],
                            "bpr-logo-asri": ["bpr logo asri", "bpr"],
                            "penarikan": ["penarikan", "tarik", "withdraw"]
                          };

                          const isValid = Object.entries(paymentPatterns).some(([key, patterns]) => 
                            patterns.some(pattern => normalizedInput.includes(pattern))
                          );

                          if (!isValid) {
                            validationErrors.push({ 
                              row: rowNum, 
                              field: "Jenis Pembayaran", 
                              value: jenisBayar, 
                              message: `tidak dikenali. Gunakan: Tunai / Transfer BRI Cab. Tigabinanga / Transfer BRI Cab. Berastagi / Transfer BPR Logo Asri / Penarikan` 
                            });
                          }
                        }
                     });

                     // STRICT MODE: If ANY errors, abort entire import
                     if (validationErrors.length > 0) {
                       const errorsByRow: Record<number, typeof validationErrors> = {};
                       validationErrors.forEach(err => {
                         if (!errorsByRow[err.row]) errorsByRow[err.row] = [];
                         errorsByRow[err.row].push(err);
                       });

                       const errorLines: string[] = [];
                       Object.entries(errorsByRow).slice(0, 50).forEach(([rowNum, errors]) => {
                         errorLines.push(`━━━━━━━━━━━━━━━━━━━━━━━━`);
                         errorLines.push(`📍 BARIS ${rowNum}:`);
                         errors.forEach(err => {
                           const emoji = err.field.includes("No. NBA") || err.field.includes("Nama") ? "🔴" :
                                        err.field.includes("Jumlah") ? "💢" : "⚠️";
                           errorLines.push(`  ${emoji} ${err.field}: "${err.value}" → ${err.message}`);
                         });
                       });

                       const moreCount = validationErrors.length - 50;
                       const moreMsg = moreCount > 0 ? `\n\n...dan ${moreCount} error lainnya pada baris lain` : "";

                       alert(
                         `❌ IMPORT DIBATALKAN\n\n` +
                         `Terdapat ${validationErrors.length} kesalahan ditemukan:\n` +
                         errorLines.join("\n") +
                         `\n\n━━━━━━━━━━━━━━━━━━━━━━━━${moreMsg}\n\n` +
                         `📌 PERIKSA LAGI:\n` +
                         `1. Semua kolom wajib diisi: No. NBA, Nama Anggota, Tanggal Transaksi, Jumlah Transaksi, Jenis Pembayaran\n` +
                         `2. No. NBA harus sesuai dengan data anggota\n` +
                         `3. Tanggal format DD-MM-YYYY (contoh: 15-01-2024)\n` +
                         `4. Jumlah: angka positif tanpa Rp atau tanda ribuan\n` +
                         `5. Jenis Pembayaran: Tunai / Transfer BRI Cab. Tigabinanga / Transfer BRI Cab. Berastagi / Transfer BPR Logo Asri / Penarikan\n\n` +
                         `Download template, perbaiki data, lalu coba lagi.`
                       );
                       return;
                     }

                     // All validation passed — show summary and confirm
                     const totalRows = jsonData.length;
                     const totalJumlah = jsonData.reduce((sum, row) => {
                       const jmlRaw = row["Jumlah Transaksi"];
                       let jml = 0;
                       if (typeof jmlRaw === "number") jml = Math.abs(jmlRaw);
                       else if (typeof jmlRaw === "string") jml = parseInt(jmlRaw.replace(/\./g, "").replace(/[^0-9]/g, "")) || 0;
                       return sum + jml;
                     }, 0);

                      const isPenarikan = importType.startsWith("penarikan");
                      const jenisLabel = isPenarikan
                        ? importType === "penarikan-pokok" ? "Penarikan Simpanan Pokok"
                          : importType === "penarikan-wajib" ? "Penarikan Simpanan Wajib"
                          : importType === "penarikan-sibuhar" ? "Penarikan Simpanan Bunga Harian (Sibuhar)"
                          : "Penarikan Simpanan"
                        : importType === "pokok" ? "Setoran Simpanan Pokok"
                        : importType === "wajib" ? "Setoran Simpanan Wajib"
                        : importType === "sibuhar" ? "Setoran Simpanan Bunga Harian (Sibuhar)"
                        : "Setoran Simpanan";

                     const confirmMsg = `Yakin mengimpor ${totalRows} transaksi?\n\n` +
                       `Jenis: ${jenisLabel}\n` +
                       `Total Jumlah: Rp ${totalJumlah.toLocaleString("id-ID")}\n\n` +
                       `Data akan ditambahkan ke sistem. Tindakan ini tidak bisa dibatalkan.`;

                     if (!confirm(confirmMsg)) return;

                      // Proceed with import
                      jsonData.forEach((row, index) => {
                        // Helper to get column value using normalized mapping
                        const getCol = (colKey: string) => {
                          const normKey = normalize(colKey);
                          const actualKey = normalizedMap[normKey];
                          return actualKey ? row[actualKey] : undefined;
                        };

                        const noNBA = String(getCol("no. nba") ?? "").trim();
                        const nama = String(getCol("nama anggota") ?? "").trim();
                        const jmlRaw = getCol("jumlah transaksi");
                        const tglRaw = getCol("tanggal transaksi");
                        const jenisBayar = String(getCol("jenis pembayaran") ?? "").trim();

                       const anggotaFound = anggota.find(a => String(a.nomorNBA).trim().toLowerCase() === noNBA.toLowerCase());
                       if (!anggotaFound) return; // Should not happen after validation

                       let jumlah = 0;
                       if (typeof jmlRaw === "number") jumlah = Math.floor(jmlRaw);
                       else jumlah = parseInt(String(jmlRaw).replace(/\./g, "").replace(/[^0-9]/g, "")) || 0;

                       const tanggal = validateExcelDate(tglRaw)!;
                       const jenisSimpanan = isPenarikan ? importType.replace("penarikan-", "") : importType;

                        let metode = "tunai";
                        const bayarNorm = jenisBayar.toLowerCase().trim().replace(/[\.\-_,]/g, " ").replace(/\s+/g, " ");
                        if (bayarNorm.includes("tigabinanga")) metode = "bri-tigabinanga";
                        else if (bayarNorm.includes("berastagi")) metode = "bri-berastagi";
                        else if (bayarNorm.includes("bpr") && bayarNorm.includes("logo")) metode = "bpr-logo-asri";
                        else if (bayarNorm.includes("bpr")) metode = "bpr-logo-asri"; // fallback

                       const jumlahFinal = isPenarikan ? -Math.abs(jumlah) : Math.abs(jumlah);
                       const metodeFinal = isPenarikan ? "tunai" : metode;

                       addSimpanan({
                         id: 0,
                         idAnggota: anggotaFound.id,
                         nama: anggotaFound.nama,
                         nomorAnggota: anggotaFound.nomorNBA,
                         tanggal: tanggal,
                         jenisSimpanan: jenisSimpanan,
                         jumlah: jumlahFinal,
                         metode: metodeFinal,
                         bunga: 0,
                       });

                       const akunMap: Record<string, string> = {
                         "tunai": "Kas",
                         "bri-tigabinanga": "Bank BRI Cab. Tigabinanga",
                         "bri-berastagi": "Bank BRI Cab. Berastagi",
                         "bpr-logo-asri": "Bank BPR Logo Asri",
                         "penarikan": "Kas"
                       };
                       const akun = akunMap[metodeFinal] || "Kas";

                       const kategori = isPenarikan
                         ? `Penarikan Simpanan ${jenisSimpanan.charAt(0).toUpperCase() + jenisSimpanan.slice(1)}`
                         : `Setoran Simpanan ${jenisSimpanan.charAt(0).toUpperCase() + jenisSimpanan.slice(1)}`;
                       const uraian = `${isPenarikan ? "Penarikan" : "Setoran"} Simpanan ${jenisSimpanan.charAt(0).toUpperCase() + jenisSimpanan.slice(1)} — ${anggotaFound.nama}`;
                       const noBukti = `${isPenarikan ? "PD" : "BK"}-${tanggal.replace(/-/g, "")}-${String(simpanan.length + index + 1).padStart(3, "0")}`;

                       addTransaksi({
                         id: 0,
                         noBukti: noBukti,
                         tanggal: tanggal,
                         jam: "09:00",
                         akun: akun,
                         kategori: kategori,
                         uraian: uraian,
                         debet: isPenarikan ? 0 : Math.abs(jumlah),
                         kredit: isPenarikan ? Math.abs(jumlah) : 0,
                         saldo: 0,
                         operator: "Admin",
                       });

                       if (isPenarikan) {
                         addTransaksi({
                           id: 0,
                           noBukti: `PP-${tanggal.replace(/-/g, "")}-${String(simpanan.length + index + 1).padStart(3, "0")}`,
                           tanggal: tanggal,
                           jam: "09:00",
                           akun: "Pendapatan Pengunduran Diri Anggota",
                           kategori: "Pendapatan Pengunduran Diri",
                           uraian: `Pendapatan Pengunduran Diri — ${anggotaFound.nama}`,
                           debet: 0,
                           kredit: Math.abs(jumlah),
                           saldo: 0,
                           operator: "Admin",
                         });
                       }
                     });

                     alert(`✅ Berhasil import ${totalRows} transaksi simpanan!`);
                     setActiveTab("data");

                   } catch (error) {
                     console.error("Import error:", error);
                     alert("Gagal import data. Pastikan file Excel tidak rusak dan format benar.");
                   }
                 };
                 reader.readAsBinaryString(file);
                 if (e.target) (e.target as HTMLInputElement).value = "";
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

                    <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                      <button 
                        onClick={() => window.print()}
                        style={{ flex: 1, padding: "12px 24px", background: "#1B4D3E", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                      >
                        🖨️ Cetak Kartu Simpanan
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus SEMUA data simpanan? Tindakan ini tidak bisa dibatalkan!`)) {
                            simpanan.forEach(s => deleteSimpanan(s.id));
                            alert("Semua data simpanan berhasil dihapus!");
                          }
                        }}
                        style={{ flex: 1, padding: "12px 24px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                      >
                        🗑️ Hapus Semua Simpanan
                      </button>
                    </div>
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