"use client";
import { useState } from "react";
import Link from "next/link";

const kategoriAkun = [
  { kode: "1101", nama: "Kas", jenis: "Aset" },
  { kode: "1102", nama: "Bank BCA", jenis: "Aset" },
  { kode: "1103", nama: "Bank BRI", jenis: "Aset" },
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

const mockTransaksi = [
  { id: 1, noBukti: "BKM-001", tanggal: "2024-04-11", jam: "08:15", akun: "1101", kategori: "Kas", jenisTransaksi: "Kas Masuk", uraian: "Setoran simpanan sukarela", debet: 500000, kredit: 0, saldo: 500000, operator: "Admin" },
  { id: 2, noBukti: "BKK-001", tanggal: "2024-04-11", jam: "09:30", akun: "2201", kategori: "Pinjaman", jenisTransaksi: "Kas Keluar", uraian: "Pencairan pinjaman", debet: 0, kredit: 3000000, saldo: -2500000, operator: "Admin" },
  { id: 3, noBukti: "BKM-002", tanggal: "2024-04-11", jam: "10:45", akun: "2201", kategori: "Pinjaman", jenisTransaksi: "Kas Masuk", uraian: "Angsuran ke-1", debet: 250000, kredit: 0, saldo: -2250000, operator: "Admin" },
  { id: 4, noBukti: "BKM-003", tanggal: "2024-04-10", jam: "08:00", akun: "1101", kategori: "Kas", jenisTransaksi: "Kas Masuk", uraian: "Setoran simpanan wajib", debet: 1000000, kredit: 0, saldo: 1500000, operator: "Admin" },
  { id: 5, noBukti: "BKM-004", tanggal: "2024-04-10", jam: "11:20", akun: "4101", kategori: "Pendapatan", jenisTransaksi: "Kas Masuk", uraian: "Bunga bulan April", debet: 50000, kredit: 0, saldo: 1550000, operator: "Admin" },
  { id: 6, noBukti: "BKK-002", tanggal: "2024-04-10", jam: "14:00", akun: "2202", kategori: "Pinjaman", jenisTransaksi: "Kas Keluar", uraian: "Pencairan modal bisnis", debet: 0, kredit: 5000000, saldo: -3450000, operator: "Admin" },
  { id: 7, noBukti: "BKM-005", tanggal: "2024-04-09", jam: "09:00", akun: "1103", kategori: "Bank", jenisTransaksi: "Kas Masuk", uraian: "Setoran via potong gaji", debet: 750000, saldo: -750000, operator: "Admin" },
  { id: 8, noBukti: "BKK-003", tanggal: "2024-04-09", jam: "13:30", akun: "2201", kategori: "Pinjaman", jenisTransaksi: "Kas Keluar", uraian: "Angsuran bulan April", debet: 0, kredit: 180000, saldo: -930000, operator: "Admin" },
];

const mockAnggota = [
  { id: 1, nama: "Budi Santoso", nomor: "AG-001", saldoSimpanan: 5500000, saldoPinjaman: 0 },
  { id: 2, nama: "Siti Rahayu", nomor: "AG-002", saldoSimpanan: 3250000, saldoPinjaman: 3000000 },
  { id: 3, nama: "Ahmad Wijaya", nomor: "AG-003", saldoSimpanan: 10500000, saldoPinjaman: 5000000 },
  { id: 4, nama: "Dewi Lestari", nomor: "AG-004", saldoSimpanan: 250000, saldoPinjaman: 0 },
  { id: 5, nama: "Joko Pramono", nomor: "AG-005", saldoSimpanan: 0, saldoPinjaman: 5000000 },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function TransaksiPage() {
  const [activeTab, setActiveTab] = useState("kas-masuk");
  const [showModal, setShowModal] = useState(false);
  const [showJurnal, setShowJurnal] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState("");
  const [selectedTransaksi, setSelectedTransaksi] = useState<typeof mockTransaksi[0] | null>(null);
  
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
  
  const totalMasuk = mockTransaksi.filter(t => (t.debet || 0) > 0).reduce((acc, t) => acc + (t.debet || 0), 0);
  const totalKeluar = mockTransaksi.filter(t => (t.kredit || 0) > 0).reduce((acc, t) => acc + (t.kredit || 0), 0);
  const saldoKas = totalMasuk - totalKeluar;

  const formatRupiahInput = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const generateNoBukti = (prefix: string) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const num = String(mockTransaksi.length + 1).padStart(3, "0");
    return `${prefix}-${date}-${num}`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: "var(--color-primary)", color: "white", padding: "24px 0", position: "fixed", height: "100vh" }}>
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
        <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
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
            <div style={{ fontSize: 20, fontWeight: 700, color: "#373151" }}>{mockTransaksi.filter(t => t.tanggal === "2024-04-11").length}</div>
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
              <button style={{ padding: "8px 16px", background: "white", border: "2px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>Export Excel</button>
              <button style={{ padding: "8px 16px", background: "white", border: "2px solid #e5e7eb", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>Cetak</button>
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
              {mockTransaksi.map((t, i) => (
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
                  <td style={{ padding: 14, textAlign: "right", fontSize: 13, fontWeight: 600, color: t.saldo >= 0 ? "#22c55e" : "#ef4444" }}>{formatRupiah(Math.abs(t.saldo))}</td>
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
                        <option key={a.kode} value={a.kode}>{a.kode} - {a.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Akun Kredit (Sumber)</label>
                    <select value={formData.akunKredit} onChange={(e) => setFormData({ ...formData, akunKredit: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "white" }}>
                      <option value="">Pilih Akun...</option>
                      {kategoriAkun.map(a => (
                        <option key={a.kode} value={a.kode}>{a.kode} - {a.nama}</option>
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
                  <button onClick={() => { alert("Transaksi berhasil disimpan!"); setShowModal(false); }} style={{ padding: "12px", background: "var(--color-primary)", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, color: "white" }}>Simpan Transaksi</button>
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
                    {mockTransaksi.flatMap((t, i) => [
                      { ...t, isDebet: true },
                      { ...t, isDebet: false }
                    ]).map((t, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: 10, fontSize: 12, textAlign: "center" }}>{t.tanggal}</td>
                        <td style={{ padding: 10, fontSize: 12, textAlign: "center" }}>{t.noBukti}</td>
                        <td style={{ padding: 10, fontSize: 12, fontFamily: "monospace" }}>{t.akun}</td>
                        <td style={{ padding: 10, fontSize: 12 }}>{kategoriAkun.find(a => a.kode === t.akun)?.nama || t.kategori}</td>
                        <td style={{ padding: 10, fontSize: 12 }}>{t.uraian}</td>
                        <td style={{ padding: 10, fontSize: 12, textAlign: "right", color: t.isDebet && t.debet > 0 ? "#22c55e" : "#9ca3af" }}>{t.isDebet && t.debet > 0 ? formatRupiah(t.debet) : "-"}</td>
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