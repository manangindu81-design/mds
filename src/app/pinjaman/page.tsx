"use client";
import { useState } from "react";
import Link from "next/link";
import { useData, Pinjaman as PinjamanType } from "../context/DataContext";

export default function PinjamanPage() {
  const { pinjaman, addPinjaman } = useData();
  const [formData, setFormData] = useState({
    nama: "",
    nomorAnggota: "",
    tanggal: "",
    sistem: "",
    jenisPinjaman: "",
    jumlah: "",
    tenor: "",
    bunga: "",
    tujuan: "",
    jaminan: "",
    metodePembayaran: "",
    catatan: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const sistemOptions = [
    { value: "musiman", label: "Musiman (Saldo Menurun)", bunga: 2.5, tenorMax: 6, deskripsi: "Bunga 2,5% per bulan" },
    { value: "flat", label: "Flat (Angsuran Tetap)", bunga: 1.5, tenorMax: 36, deskripsi: "Bunga 1,5% - 2% per bulan" },
  ];

  const currentOption = sistemOptions.find(o => o.value === formData.sistem);

  const calculatePreview = () => {
    if (!formData.sistem || !formData.jumlah || !formData.tenor) return null;
    const jumlah = parseInt(formData.jumlah.replace(/\D/g, "")) || 0;
    const tenor = parseInt(formData.tenor);
    const bunga = currentOption?.bunga || 0;

    if (jumlah <= 0 || tenor <= 0) return null;

    let totalBunga: number;
    let angsuranPerBulan: number;

    if (formData.sistem === "musiman") {
      const rate = bunga / 100;
      totalBunga = jumlah * rate * (tenor + 1) / 2;
      angsuranPerBulan = jumlah / tenor;
      return {
        totalBunga,
        angsuranPerBulan: angsuranPerBulan + (totalBunga / tenor),
        totalPembayaran: jumlah + totalBunga
      };
    } else {
      totalBunga = jumlah * (bunga / 100) * tenor;
      angsuranPerBulan = (jumlah / tenor) + (totalBunga / tenor);
      return {
        totalBunga,
        angsuranPerBulan,
        totalPembayaran: jumlah + totalBunga
      };
    }
  };

  const preview = calculatePreview();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nama.trim()) errors.nama = "Nama wajib diisi";
    if (!formData.nomorAnggota.trim()) errors.nomorAnggota = "Nomor anggota wajib diisi";
    if (!formData.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!formData.sistem) errors.sistem = "Sistem perhitungan wajib dipilih";
    if (!formData.jenisPinjaman) errors.jenisPinjaman = "Jenis pinjaman wajib dipilih";
    if (!formData.jumlah) errors.jumlah = "Jumlah wajib diisi";
    if (!formData.tenor) errors.tenor = "Jangka waktu wajib dipilih";
    if (!formData.tujuan.trim()) errors.tujuan = "Tujuan wajib diisi";
    if (!formData.metodePembayaran) errors.metodePembayaran = "Metode pembayaran wajib dipilih";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const jumlahNum = parseInt(formData.jumlah.replace(/\D/g, ""));
      const currentOption = sistemOptions.find(o => o.value === formData.sistem);
      const newPinjaman: PinjamanType = {
        id: pinjaman.length + 1,
        idAnggota: 0,
        nama: formData.nama,
        nomorAnggota: formData.nomorAnggota,
        tanggal: formData.tanggal,
        sistem: formData.sistem,
        jenisPinjaman: formData.jenisPinjaman,
        jumlah: jumlahNum,
        tenor: parseInt(formData.tenor),
        bunga: currentOption?.bunga || 0,
        tujuan: formData.tujuan,
        status: "Menunggu",
      };
      addPinjaman(newPinjaman);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          nama: "",
          nomorAnggota: "",
          tanggal: "",
          sistem: "",
          jenisPinjaman: "",
          jumlah: "",
          tenor: "",
          bunga: "",
          tujuan: "",
          jaminan: "",
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

  const formatRupiahNum = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-background)" }}>
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
            <Link href="/pinjaman" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: 15 }}>Pinjaman</Link>
            <Link href="/anggota" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Anggota</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{ padding: "120px 24px 64px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
            <h1 style={{ fontSize: 36, fontFamily: "var(--font-heading)", marginBottom: 12, color: "var(--color-text-primary)" }}>
              Pengajuan Pinjaman
            </h1>
            <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
              Formulir pengajuan pinjaman anggota dengan kalkulasi bunga otomatis
            </p>
          </div>

          {submitted && (
            <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>
              ✓ Pengajuan pinjaman berhasil! Tim akan memproses dalam 1-3 hari kerja.
            </div>
          )}

          <div className="card" style={{ padding: 40 }}>
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12 }}>
                Data Peminjaman
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.nama ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
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
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.nomorAnggota ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                    placeholder="Contoh: AG-001"
                  />
                  {formErrors.nomorAnggota && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.nomorAnggota}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal Pengajuan *</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.tanggal ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                  />
                  {formErrors.tanggal && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.tanggal}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Sistem Perhitungan *</label>
                  <select
                    value={formData.sistem}
                    onChange={(e) => setFormData({ ...formData, sistem: e.target.value, tenor: "", bunga: "" })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.sistem ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                  >
                    <option value="">Pilih sistem</option>
                    {sistemOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label} - {opt.deskripsi}</option>
                    ))}
                  </select>
                  {formErrors.sistem && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.sistem}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jenis Pinjaman *</label>
                  <select
                    value={formData.jenisPinjaman}
                    onChange={(e) => setFormData({ ...formData, jenisPinjaman: e.target.value })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.jenisPinjaman ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                  >
                    <option value="">Pilih jenis pinjaman</option>
                    <option value="umum">Pinjaman Umum</option>
                    <option value="bisnis">Pinjaman Bisnis</option>
                    <option value="produktif">Pinjaman Produktif</option>
                    <option value="dana-sehat">Dana Sehat</option>
                    <option value="pendidikan">Pinjaman Pendidikan</option>
                  </select>
                  {formErrors.jenisPinjaman && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.jenisPinjaman}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jumlah Pinjaman (Rp) *</label>
                  <input
                    type="text"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: formatRupiah(e.target.value) })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.jumlah ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                    placeholder="Rp 0"
                  />
                  {formErrors.jumlah && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.jumlah}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jangka Waktu *</label>
                  <select
                    value={formData.tenor}
                    onChange={(e) => setFormData({ ...formData, tenor: e.target.value })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.tenor ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                    disabled={!formData.sistem}
                  >
                    <option value="">Pilih jangka waktu</option>
                    {formData.sistem === "musiman" ? (
                      [1, 2, 3, 4, 5, 6].map(bulan => (
                        <option key={bulan} value={bulan}>{bulan} Bulan</option>
                      ))
                    ) : (
                      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].map(bulan => (
                        <option key={bulan} value={bulan}>{bulan} Bulan</option>
                      ))
                    )}
                  </select>
                  {formErrors.tenor && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.tenor}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Bunga (%)</label>
                  <input
                    type="text"
                    value={currentOption ? `${currentOption.bunga}% per bulan` : "-"}
                    readOnly
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, background: "#f9f9f9", color: "#666" }}
                  />
                </div>
              </div>

              {preview && (
                <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)", borderRadius: 12, padding: 24, marginBottom: 24, color: "white" }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>Kalkulasi Pinjaman</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>Bunga Total</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{formatRupiahNum(preview.totalBunga)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>Angsuran/Bulan</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{formatRupiahNum(preview.angsuranPerBulan)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>Total Pembayaran</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{formatRupiahNum(preview.totalPembayaran)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tujuan Penggunaan *</label>
                  <input
                    type="text"
                    value={formData.tujuan}
                    onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.tujuan ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                    placeholder="Contoh: Modal usaha, beli kendaraan"
                  />
                  {formErrors.tujuan && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.tujuan}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jaminan</label>
                  <select
                    value={formData.jaminan}
                    onChange={(e) => setFormData({ ...formData, jaminan: e.target.value })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                  >
                    <option value="">Pilih jaminan</option>
                    <option value="tanpa-jaminan">Tanpa Jaminan</option>
                    <option value="bpkb">BPKB Kendaraan</option>
                    <option value="shm">SHM Tanah/Bangunan</option>
                    <option value="emas">Barang Berharga</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Metode Pembayaran Angsuran *</label>
                <select
                  value={formData.metodePembayaran}
                  onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value })}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.metodePembayaran ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                >
                  <option value="">Pilih metode</option>
                  <option value="tunai">Tunai</option>
                  <option value="transfer">Transfer Otomatis</option>
                  <option value="potong-gaji">Potong Gaji</option>
                </select>
                {formErrors.metodePembayaran && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.metodePembayaran}</div>}
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, outline: "none", resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                Ajukan Pinjaman
              </button>
            </form>
          </div>

          {pinjaman.length > 0 && (
            <div className="card" style={{ padding: 40, marginTop: 32 }}>
              <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12 }}>
                Daftar Anggota Peminjam
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "var(--color-background)" }}>
                    <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>No</th>
                    <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th>
                    <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>No. Anggota</th>
                    <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Jenis</th>
                    <th style={{ padding: "12px 8px", textAlign: "right", borderBottom: "2px solid #ddd" }}>Jumlah</th>
                    <th style={{ padding: "12px 8px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Tenor</th>
                    <th style={{ padding: "12px 8px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Bunga</th>
                    <th style={{ padding: "12px 8px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pinjaman.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px 8px" }}>{idx + 1}</td>
                      <td style={{ padding: "12px 8px", fontWeight: 500 }}>{p.nama}</td>
                      <td style={{ padding: "12px 8px" }}>{p.nomorAnggota}</td>
                      <td style={{ padding: "12px 8px" }}>{p.jenisPinjaman}</td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>{formatRupiahNum(p.jumlah)}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{p.tenor} bln</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{p.bunga}%</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: 16, 
                          fontSize: 12,
                          background: p.status === "Disetujui" ? "#d4edda" : p.status === "Menunggu" ? "#fff3cd" : "#f8d7da",
                          color: p.status === "Disetujui" ? "#155724" : p.status === "Menunggu" ? "#856404" : "#721c24"
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 24, padding: 16, background: "var(--color-background)", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Total Peminjam</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{pinjaman.length} Anggota</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Total Pinjaman Aktif</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{formatRupiahNum(pinjaman.reduce((sum, p) => sum + p.jumlah, 0))}</div>
                </div>
              </div>
            </div>
          )}

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