"use client";
import { useState } from "react";
import Link from "next/link";

export default function SimpananPage() {
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
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          nama: "",
          nomorAnggota: "",
          tanggal: "",
          jenisSimpanan: "",
          jumlah: "",
          metodePembayaran: "",
          catatan: "",
        });
      }, 3000);
    }
  };

  const formatRupiah = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

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
            <Link href="/simpanan" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: 15 }}>Simpanan</Link>
            <Link href="/pinjaman" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Pinjaman</Link>
            <Link href="/anggota" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Anggota</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container" style={{ padding: "120px 24px 64px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
            <h1 style={{ fontSize: 36, fontFamily: "var(--font-heading)", marginBottom: 12, color: "var(--color-text-primary)" }}>
              Input Simpanan
            </h1>
            <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
              Formulir pencatatan simpanan anggota
            </p>
          </div>

          {submitted && (
            <div style={{ 
              background: "#d4edda", 
              color: "#155724", 
              padding: 16, 
              borderRadius: 8, 
              marginBottom: 24,
              textAlign: "center"
            }}>
              ✓ Data simpanan berhasil disimpan!
            </div>
          )}

          <div className="card" style={{ padding: 40 }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.nama ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Masukkan nama lengkap"
                  />
                  {formErrors.nama && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.nama}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nomor Anggota *</label>
                  <input
                    type="text"
                    value={formData.nomorAnggota}
                    onChange={(e) => setFormData({ ...formData, nomorAnggota: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.nomorAnggota ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Contoh: AG-001"
                  />
                  {formErrors.nomorAnggota && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.nomorAnggota}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal *</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.tanggal ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                  />
                  {formErrors.tanggal && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.tanggal}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jenis Simpanan *</label>
                  <select
                    value={formData.jenisSimpanan}
                    onChange={(e) => setFormData({ ...formData, jenisSimpanan: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.jenisSimpanan ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none",
                      background: "white"
                    }}
                  >
                    <option value="">Pilih jenis simpanan</option>
                    <option value="pokok">Simpanan Pokok</option>
                    <option value="sukarela">Simpanan Sukarela</option>
                    <option value="berjangka">Simpanan Berjangka</option>
                    <option value="sukarela-khusus">Simpanan Sukarela Khusus</option>
                  </select>
                  {formErrors.jenisSimpanan && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.jenisSimpanan}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jumlah (Rp) *</label>
                  <input
                    type="text"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: formatRupiah(e.target.value) })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.jumlah ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Rp 0"
                  />
                  {formErrors.jumlah && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.jumlah}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Metode Pembayaran *</label>
                  <select
                    value={formData.metodePembayaran}
                    onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.metodePembayaran ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none",
                      background: "white"
                    }}
                  >
                    <option value="">Pilih metode</option>
                    <option value="tunai">Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="potong-gaji">Potong Gaji</option>
                  </select>
                  {formErrors.metodePembayaran && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.metodePembayaran}</div>}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows={3}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: 8, 
                    border: "2px solid #eee",
                    fontSize: 16,
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Simpan Data
              </button>
            </form>
          </div>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Link href="/" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}