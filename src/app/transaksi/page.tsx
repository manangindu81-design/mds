"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "../context/DataContext";

const kategoriAkun = [
  { kode: "1101", nama: "Kas", jenis: "Aset" },
  { kode: "1102", nama: "Bank BRI Cab. Tigabinanga", jenis: "Aset" },
  { kode: "1103", nama: "Bank BRI Cab. Berastagi", jenis: "Aset" },
  { kode: "1104", nama: "Bank BPR Logo Asri", jenis: "Aset" },
  { kode: "1201", nama: "Piutang Anggota", jenis: "Aset" },
  { kode: "1202", nama: "Piutang Bukan Anggota", jenis: "Aset" },
  { kode: "2101", nama: "Simpanan Pokok", jenis: "Kewajiban" },
  { kode: "2102", nama: "Simpanan Wajib", jenis: "Kewajiban" },
  { kode: "2103", nama: "Simpanan Sukarela", jenis: "Kewajiban" },
  { kode: "2104", nama: "Simpanan Berjangka", jenis: "Kewajiban" },
  { kode: "2201", nama: "Pinjaman Umum", jenis: "Kewajiban" },
  { kode: "2202", nama: "Pinjaman Bisnis", jenis: "Kewajiban" },
  { kode: "3101", nama: "Modal Utama", jenis: "Modal" },
  { kode: "3102", nama: "Cadangan Laba", jenis: "Modal" },
  { kode: "4101", nama: "Pendapatan Bunga Pinjaman", jenis: "Pendapatan" },
  { kode: "4102", nama: "Pendapatan Adm", jenis: "Pendapatan" },
  { kode: "4201", nama: "Beban Bunga SHU", jenis: "Beban" },
  { kode: "4202", nama: "Beban Operasional", jenis: "Beban" },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function TransaksiPage() {
  const { anggota, simpanan, pinjaman, transaksi, addTransaksi } = useData();
  const [activeTab, setActiveTab] = useState("kas-masuk");
  const [showModal, setShowModal] = useState(false);
  const [showJurnal, setShowJurnal] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState("");
  const [selectedTransaksi, setSelectedTransaksi] = useState<typeof transaksi[0] | null>(null);
  
  const [formData, setFormData] = useState({
    noBukti: "",
    tanggal: new Date().toISOString().split("T")[0],
    jam: new Date().toTimeString().slice(0, 5),
    akunDebet: "",
    akunKredit: "",
    uraian: "",
    jumlah: "",
    metode: "",
    referensi: "",
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const filteredTransaksi = useMemo(() => {
    if (!searchQuery) return transaksi;
    const q = searchQuery.toLowerCase();
    return transaksi.filter(t => 
      (t.noBukti && t.noBukti.toLowerCase().includes(q)) ||
      (t.kategori && t.kategori.toLowerCase().includes(q)) ||
      (t.uraian && t.uraian.toLowerCase().includes(q)) ||
      (t.akun && t.akun.toLowerCase().includes(q))
    );
  }, [transaksi, searchQuery]);
  
  const allTransaksi = [...filteredTransaksi];
  const totalMasuk = allTransaksi.filter(t => (t.debet || 0) > 0).reduce((sum, t) => sum + (t.debet || 0), 0);
  const totalKeluar = allTransaksi.filter(t => (t.kredit || 0) > 0).reduce((sum, t) => sum + (t.kredit || 0), 0);
  const saldoKas = totalMasuk - totalKeluar;

  const formatRupiahInput = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const generateNoBukti = (prefix: string) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const num = String(allTransaksi.length + 1).padStart(3, "0");
    return `${prefix}-${date}-${num}`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: "var(--color-primary)", color: "white", padding: "24px 0", position: "fixed", height: "100vh" }} className="no-print">
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "white" }}>
            <span style={{ fontSize: 28 }}>🏛️</span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600 }}>KSP Mulia</div>
              <div style={{ fontSize: 10, color: "var(--color-secondary)", letterSpacing: 1 }}>Dana Sejahtera</div>
            </div>
          </Link>
        </div>

        <nav style={{ padding: "0 12px" }}>
          {[
            { id: "kas-masuk", label: "Kas Masuk", icon: "📥" },
            { id: "kas-keluar", label: "Kas Keluar", icon: "📤" },
            { id: "jurnal", label: "Jurnal Umum", icon: "📒" },
            { id: "buku-besar", label: "Buku Besar", icon: "📊" },
            { id: "neraca", label: "Neraca", icon: "⚖️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                width: "100%", 
                padding: "12px 16px", 
                background: activeTab === item.id ? "rgba(255,255,255,0.15)" : "none",
                border: "none",
                borderRadius: 8,
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, padding: 16, background: "rgba(255,255,255,0.1)", borderRadius: 8 }}>
          <div style={{ fontSize: 12 }}>Saldo Kas</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-secondary)" }}>{formatRupiah(saldoKas)}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 260, padding: 24 }}>
        {/* Header */}
        <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} className="no-print">
          <div>
            <h1 style={{ fontSize: 24, fontFamily: "var(--font-heading)", color: "#1a1a1a" }}>
              {activeTab === "kas-masuk" && "Kas Masuk (Penerimaan)"}
              {activeTab === "kas-keluar" && "Kas Keluar (Pengeluaran)"}
              {activeTab === "jurnal" && "Jurnal Umum"}
              {activeTab === "buku-besar" && "Buku Besar"}
              {activeTab === "neraca" && "Neraca Saldo"}
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>KSP Mulia Dana Sejahtera - {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setShowJurnal(true)} style={{ padding: "10px 20px", background: "white", border: "2px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontWeight: 500, color: "#374151" }}>
              📋 Buku Jurnal
            </button>
            <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", background: "var(--color-primary)", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500 }}>
              + Transaksi Baru
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Kas Masuk</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>{formatRupiah(totalMasuk)}</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Kas Keluar</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444" }}>{formatRupiah(totalKeluar)}</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Saldo Kas Akhir</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-primary)" }}>{formatRupiah(saldoKas)}</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Transaksi Hari Ini</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#373151" }}>{allTransaksi.filter(t => t.tanggal === "2024-04-11").length}</div>
          </div>
        </div>

        {/* Transaction Table */}
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "2px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} style={{ padding: "8px 12px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
              <input type="text" placeholder="Cari..." style={{ padding: "8px 12px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, width: 200 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => alert("Export Excel: Mengunduh data transaksi...")} style={{ padding: "8px 16px", background: "white", border: "2px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>📊 Export Excel</button>
              <button onClick={() => window.print()} style={{ padding: "8px 16px", background: "white", border: "2px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>🖨️ Cetak Langsung</button>
              <button onClick={() => alert("Untuk Export PDF: Gunakan fitur Cetak (Ctrl+P) lalu pilih 'Simpan sebagai PDF'.")} style={{ padding: "8px 16px", background: "white", border: "2px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>📄 Export PDF</button>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ textAlign: "center", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>No. Bukti</th>
                <th style={{ textAlign: "center", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Tanggal</th>
                <th style={{ textAlign: "center", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Jam</th>
                <th style={{ textAlign: "left", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Uraian / Keterangan</th>
                <th style={{ textAlign: "center", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Akun</th>
                <th style={{ textAlign: "right", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Debet (Rp)</th>
                <th style={{ textAlign: "right", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Kredit (Rp)</th>
                <th style={{ textAlign: "right", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Saldo (Rp)</th>
                <th style={{ textAlign: "center", padding: 14, fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {allTransaksi.map((t, i) => (
                <tr 
                  key={i} 
                  onClick={() => setSelectedTransaksi(t)}
                  style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer", background: selectedTransaksi?.id === t.id ? "#f0f9f4" : "transparent" }}
                >
                  <td style={{ padding: 14, textAlign: "center", fontSize: 13, fontFamily: "monospace" }}>{t.noBukti}</td>
                  <td style={{ padding: 14, textAlign: "center", fontSize: 13 }}>{t.tanggal}</td>
                  <td style={{ padding: 14, textAlign: "center", fontSize: 13, color: "#6b7280" }}>{t.jam}</td>
                  <td style={{ padding: 14, fontSize: 13 }}>{t.uraian}</td>
                  <td style={{ padding: 14, textAlign: "center" }}>
                    <span style={{ padding: "4px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: 4, fontSize: 11 }}>{t.kategori}</span>
                  </td>
                  <td style={{ padding: 14, textAlign: "right", fontSize: 13, color: "#22c55e", fontWeight: 500 }}>{(t.debet || 0) > 0 ? formatRupiah(t.debet || 0) : "-"}</td>
                  <td style={{ padding: 14, textAlign: "right", fontSize: 13, color: "#ef4444", fontWeight: 500 }}>{(t.kredit || 0) > 0 ? formatRupiah(t.kredit || 0) : "-"}</td>
                  <td style={{ padding: 14, textAlign: "right", fontSize: 13, fontWeight: 600, color: (t.saldo || 0) >= 0 ? "#22c55e" : "#ef4444" }}>{formatRupiah(Math.abs(t.saldo || 0))}</td>
                  <td style={{ padding: 14, textAlign: "center" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-primary)" }}>📝</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9fafb", fontWeight: 700 }}>
                <td colSpan={5} style={{ padding: 14, textAlign: "right", fontSize: 13 }}>TOTAL</td>
                <td style={{ padding: 14, textAlign: "right", fontSize: 13, color: "#22c55e" }}>{formatRupiah(totalMasuk)}</td>
                <td style={{ padding: 14, textAlign: "right", fontSize: 13, color: "#ef4444" }}>{formatRupiah(totalKeluar)}</td>
                <td style={{ padding: 14, textAlign: "right", fontSize: 13, color: "var(--color-primary)" }}>{formatRupiah(saldoKas)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", borderRadius: 16, width: 700, maxHeight: "90vh", overflow: "auto" }}>
              <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f3f4f6" }}>
                <h2 style={{ fontSize: 20 }}>Input Transaksi Baru</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>✕</button>
              </div>
              
              <div style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>No. Bukti</label>
                    <input type="text" value={generateNoBukti(activeTab === "kas-masuk" ? "BKM" : "BKK")} readOnly style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "#f9fafb" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Tanggal Transaksi</label>
                    <input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
                  </div>
                </div>

                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                   <div>
                     <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Akun Debet (Penerimaan)</label>
                     <select value={formData.akunDebet} onChange={(e) => setFormData({ ...formData, akunDebet: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "white" }}>
                       <option value="">Pilih Akun...</option>
                       {kategoriAkun.filter(a => a.jenis === "Aset").map(a => (
                         <option key={a.kode} value={a.nama}>{a.nama}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Akun Kredit (Sumber)</label>
                     <select value={formData.akunKredit} onChange={(e) => setFormData({ ...formData, akunKredit: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "white" }}>
                       <option value="">Pilih Akun...</option>
                       {kategoriAkun.map(a => (
                         <option key={a.kode} value={a.nama}>{a.nama}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Uraian / Keterangan</label>
                  <textarea value={formData.uraian} onChange={(e) => setFormData({ ...formData, uraian: e.target.value })} rows={2} placeholder="Ketikan uraian transaksi..." style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, resize: "vertical", fontFamily: "inherit" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Jumlah (Rp)</label>
                    <input type="text" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: formatRupiahInput(e.target.value) })} placeholder="Rp 0" style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Metode Pembayaran</label>
                    <select value={formData.metode} onChange={(e) => setFormData({ ...formData, metode: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "white" }}>
                      <option value="">Pilih metode...</option>
                      <option value="tunai">Tunai</option>
                      <option value="transfer">Transfer Bank</option>
                      <option value="potong-gaji">Potong Gaji</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Referensi (No. Anggota / Pinjaman)</label>
                  <input type="text" value={formData.referensi} onChange={(e) => setFormData({ ...formData, referensi: e.target.value })} placeholder="AG-001 / PJM-001" style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: "12px", background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, color: "#374151" }}>Batal</button>
                  <button onClick={() => {
                    const jumlah = parseInt(formData.jumlah) || 0;
                    const akun = formData.akunDebet || formData.akunKredit || "Kas";
                    addTransaksi({
                      id: 0,
                      noBukti: formData.noBukti || `TRX-${Date.now()}`,
                      tanggal: formData.tanggal,
                      jam: formData.jam,
                      akun: akun,
                      kategori: formData.metode || "Lainnya",
                      uraian: formData.uraian,
                      debet: activeTab === "kas-masuk" ? jumlah : 0,
                      kredit: activeTab === "kas-keluar" ? jumlah : 0,
                      saldo: 0,
                      operator: "Admin",
                    });
                    alert("Transaksi berhasil disimpan!");
                    setShowModal(false);
                    setFormData({ noBukti: "", tanggal: new Date().toISOString().split("T")[0], jam: new Date().toTimeString().slice(0, 5), akunDebet: "", akunKredit: "", uraian: "", jumlah: "", metode: "", referensi: "" });
                  }} style={{ padding: "12px", background: "var(--color-primary)", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, color: "white" }}>Simpan Transaksi</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jurnal Modal */}
        {showJurnal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", borderRadius: 16, width: 900, maxHeight: "90vh", overflow: "auto" }}>
              <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f3f4f6" }}>
                <h2 style={{ fontSize: 20 }}>Buku Jurnal Umum</h2>
                <button onClick={() => setShowJurnal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th style={{ padding: 12, fontSize: 11, color: "#6b7280", textAlign: "center" }}>Tanggal</th>
                      <th style={{ padding: 12, fontSize: 11, color: "#6b7280", textAlign: "center" }}>No. Bukti</th>
                      <th style={{ padding: 12, fontSize: 11, color: "#6b7280", textAlign: "left" }}>Kode Akun</th>
                      <th style={{ padding: 12, fontSize: 11, color: "#6b7280", textAlign: "left" }}>Nama Akun</th>
                      <th style={{ padding: 12, fontSize: 11, color: "#6b7280", textAlign: "left" }}>Uraian</th>
                      <th style={{ padding: 12, fontSize: 11, color: "#6b7280", textAlign: "right" }}>Debet</th>
                      <th style={{ padding: 12, fontSize: 11, color: "#6b7280", textAlign: "right" }}>Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransaksi.flatMap((t, i) => [
                      { ...t, isDebet: true },
                      { ...t, isDebet: false }
                    ]).map((t, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: 10, fontSize: 12, textAlign: "center" }}>{t.tanggal}</td>
                        <td style={{ padding: 10, fontSize: 12, textAlign: "center" }}>{t.noBukti}</td>
                        <td style={{ padding: 10, fontSize: 12, fontFamily: "monospace" }}>{t.akun}</td>
                        <td style={{ padding: 10, fontSize: 12 }}>{kategoriAkun.find(a => a.kode === t.akun)?.nama || t.kategori}</td>
                        <td style={{ padding: 10, fontSize: 12 }}>{t.uraian}</td>
                        <td style={{ padding: 10, fontSize: 12, textAlign: "right", color: t.isDebet && (t.debet || 0) > 0 ? "#22c55e" : "#9ca3af" }}>{t.isDebet && (t.debet || 0) > 0 ? formatRupiah(t.debet || 0) : "-"}</td>
                        <td style={{ padding: 10, fontSize: 12, textAlign: "right", color: !t.isDebet && (t.kredit || 0) > 0 ? "#ef4444" : "#9ca3af" }}>{!t.isDebet && (t.kredit || 0) > 0 ? formatRupiah(t.kredit || 0) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}