"use client";
import { useState } from "react";
import Link from "next/link";

const mockTransaksi = [
  { id: 1, tanggal: "2024-04-11", jenis: "Simpanan", nama: "Budi Santoso", jumlah: 500000, metode: "Transfer", status: "Berhasil", operator: "Admin" },
  { id: 2, tanggal: "2024-04-11", jenis: "Pinjaman", nama: "Siti Rahayu", jumlah: 3000000, metode: "Tunai", status: "Menunggu", operator: "Admin" },
  { id: 3, tanggal: "2024-04-11", jenis: "Pembayaran", nama: "Ahmad Wijaya", jumlah: 250000, metode: "Transfer", status: "Berhasil", operator: "Admin" },
  { id: 4, tanggal: "2024-04-10", jenis: "Simpanan", nama: "Dewi Lestari", jumlah: 1000000, metode: "Tunai", status: "Berhasil", operator: "Admin" },
  { id: 5, tanggal: "2024-04-10", jenis: "Bunga", nama: "Budi Santoso", jumlah: 50000, metode: "Transfer", status: "Berhasil", operator: "Admin" },
  { id: 6, tanggal: "2024-04-10", jenis: "Pinjaman", nama: "Joko Pramono", jumlah: 5000000, metode: "Transfer", status: "Berhasil", operator: "Admin" },
  { id: 7, tanggal: "2024-04-09", jenis: "Simpanan", nama: "Siti Rahayu", jumlah: 750000, metode: "Potong Gaji", status: "Berhasil", operator: "Admin" },
  { id: 8, tanggal: "2024-04-09", jenis: "Pembayaran", nama: "Ahmad Wijaya", jumlah: 180000, metode: "Transfer", status: "Berhasil", operator: "Admin" },
];

const mockAnggota = [
  { id: 1, nama: "Budi Santoso", nomor: "AG-001" },
  { id: 2, nama: "Siti Rahayu", nomor: "AG-002" },
  { id: 3, nama: "Ahmad Wijaya", nomor: "AG-003" },
  { id: 4, nama: "Dewi Lestari", nomor: "AG-004" },
  { id: 5, nama: "Joko Pramono", nomor: "AG-005" },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function TransaksiPage() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    jenis: "",
    nama: "",
    nomorAnggota: "",
    jumlah: "",
    metode: "",
    keterangan: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!formData.jenis) errors.jenis = "Jenis transaksi wajib dipilih";
    if (!formData.nama) errors.nama = "Nama anggota wajib dipilih";
    if (!formData.jumlah) errors.jumlah = "Jumlah wajib diisi";
    if (!formData.metode) errors.metode = "Metode wajib dipilih";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          tanggal: new Date().toISOString().split("T")[0],
          jenis: "",
          nama: "",
          nomorAnggota: "",
          jumlah: "",
          metode: "",
          keterangan: "",
        });
      }, 2000);
    }
  };

  const handleNamaChange = (nama: string) => {
    const anggota = mockAnggota.find(a => a.nama === nama);
    setFormData({ 
      ...formData, 
      nama, 
      nomorAnggota: anggota ? anggota.nomor : "" 
    });
  };

  const formatRupiahInput = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const filteredTransaksi = mockTransaksi.filter(t => {
    if (filterTanggal && t.tanggal !== filterTanggal) return false;
    if (filterJenis && t.jenis !== filterJenis) return false;
    return true;
  });

  const totalInput = filteredTransaksi.reduce((acc, t) => {
    if (t.jenis === "Simpanan" || t.jenis === "Bunga") return acc + t.jumlah;
    return acc;
  }, 0);
  
  const totalOutput = filteredTransaksi.reduce((acc, t) => {
    if (t.jenis === "Pinjaman" || t.jenis === "Pembayaran") return acc + t.jumlah;
    return acc;
  }, 0);

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Header */}
      <header style={{ background: "var(--color-surface)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 32 }}>🏛️</span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--color-primary)" }}>KSP Mulia Dana Sejahtera</div>
              <div style={{ fontSize: 11, color: "var(--color-secondary)", letterSpacing: 1 }}>TERDAFTAR & TERAWASI</div>
            </div>
          </Link>
          <nav style={{ display: "flex", gap: 24 }}>
            <Link href="/" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Beranda</Link>
            <Link href="/simpanan" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Simpanan</Link>
            <Link href="/pinjaman" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Pinjaman</Link>
            <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Dashboard</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{ padding: "120px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 32 }}>
          {/* Form Input */}
          <div>
            <div className="card" style={{ padding: 32, position: "sticky", top: 100 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💳</div>
                <h2 style={{ fontSize: 22, fontFamily: "var(--font-heading)" }}>Transaksi Harian</h2>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Input transaksi anggota</p>
              </div>

              {submitted && (
                <div style={{ background: "#d4edda", color: "#155724", padding: 12, borderRadius: 8, marginBottom: 16, textAlign: "center", fontSize: 14 }}>
                  ✓ Transaksi berhasil disimpan!
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal *</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: formErrors.tanggal ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }}
                  />
                  {formErrors.tanggal && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.tanggal}</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jenis Transaksi *</label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: formErrors.jenis ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}
                  >
                    <option value="">Pilih jenis</option>
                    <option value="Simpanan">💰 Simpanan</option>
                    <option value="Pembayaran">💳 Pembayaran Angsuran</option>
                    <option value="Bunga">📈 Pembagian Bunga</option>
                    <option value="Admin">⚙️ Transaksi Admin</option>
                  </select>
                  {formErrors.jenis && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jenis}</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nama Anggota *</label>
                  <select
                    value={formData.nama}
                    onChange={(e) => handleNamaChange(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: formErrors.nama ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}
                  >
                    <option value="">Pilih anggota</option>
                    {mockAnggota.map(a => (
                      <option key={a.id} value={a.nama}>{a.nama} ({a.nomor})</option>
                    ))}
                  </select>
                  {formErrors.nama && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.nama}</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jumlah (Rp) *</label>
                  <input
                    type="text"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: formatRupiahInput(e.target.value) })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: formErrors.jumlah ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }}
                    placeholder="Rp 0"
                  />
                  {formErrors.jumlah && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jumlah}</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Metode *</label>
                  <select
                    value={formData.metode}
                    onChange={(e) => setFormData({ ...formData, metode: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: formErrors.metode ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}
                  >
                    <option value="">Pilih metode</option>
                    <option value="Tunai">Tunai</option>
                    <option value="Transfer">Transfer Bank</option>
                    <option value="Potong Gaji">Potong Gaji</option>
                  </select>
                  {formErrors.metode && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.metode}</div>}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Keterangan</label>
                  <textarea
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    rows={2}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, resize: "vertical", fontFamily: "inherit" }}
                    placeholder="Catatan tambahan"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Simpan Transaksi
                </button>
              </form>
            </div>
          </div>

          {/* Data Table */}
          <div>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h3 style={{ fontSize: 20 }}>Riwayat Transaksi</h3>
                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    type="date"
                    value={filterTanggal}
                    onChange={(e) => setFilterTanggal(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "2px solid #eee", fontSize: 14 }}
                    placeholder="Filter tanggal"
                  />
                  <select
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "2px solid #eee", fontSize: 14, background: "white" }}
                  >
                    <option value="">Semua Jenis</option>
                    <option value="Simpanan">Simpanan</option>
                    <option value="Pinjaman">Pinjaman</option>
                    <option value="Pembayaran">Pembayaran</option>
                    <option value="Bunga">Bunga</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "#d4edda", padding: 16, borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#155724", marginBottom: 4 }}>Total Masuk</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#155724" }}>{formatRupiah(totalInput)}</div>
                </div>
                <div style={{ background: "#f8d7da", padding: 16, borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#721c24", marginBottom: 4 }}>Total Keluar</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#721c24" }}>{formatRupiah(totalOutput)}</div>
                </div>
                <div style={{ background: "var(--color-primary)", padding: 16, borderRadius: 12, textAlign: "center", color: "white" }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Saldo</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiah(totalInput - totalOutput)}</div>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Tanggal</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Jenis</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                    <th style={{ textAlign: "right", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Jumlah</th>
                    <th style={{ textAlign: "center", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransaksi.map((t, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: 12, fontSize: 14 }}>{t.tanggal}</td>
                      <td style={{ padding: 12, fontSize: 14 }}>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: 4, 
                          fontSize: 12,
                          background: t.jenis === "Simpanan" ? "#d4edda" : t.jenis === "Pinjaman" ? "#cce5ff" : t.jenis === "Pembayaran" ? "#fff3cd" : "#e2e3e5",
                          color: t.jenis === "Simpanan" ? "#155724" : t.jenis === "Pinjaman" ? "#004085" : t.jenis === "Pembayaran" ? "#856404" : "#383d41"
                        }}>
                          {t.jenis}
                        </span>
                      </td>
                      <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{t.nama}</td>
                      <td style={{ padding: 12, fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(t.jumlah)}</td>
                      <td style={{ padding: 12, textAlign: "center" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: 12, 
                          fontSize: 12, 
                          background: t.status === "Berhasil" ? "#d4edda" : "#fff3cd",
                          color: t.status === "Berhasil" ? "#155724" : "#856404"
                        }}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                <button style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}>
                  Lihat semua transaksi →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}