"use client";
import { useState } from "react";
import Link from "next/link";
import { useData, Anggota as AnggotaType } from "../context/DataContext";

const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

export default function AnggotaPage() {
  const { anggota, addAnggota } = useData();
  const [activeTab, setActiveTab] = useState<"daftar" | "data">("data");
  
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jkelamin: "",
    status: "",
    alamat: "",
    rt: "",
    rw: "",
    kel: "",
    kec: "",
    kota: "",
    telepon: "",
    email: "",
    pekerjaan: "",
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
    if (!formData.pekerjaan.trim()) errors.pekerjaan = "Pekerjaan wajib";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const newAnggota: AnggotaType = {
        id: anggota.length + 1,
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
        tanggalJoin: new Date().toISOString().split("T")[0],
        statusKeanggotaan: "Aktif",
      };
      addAnggota(newAnggota);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ nik: "", nama: "", tempatLahir: "", tanggalLahir: "", jkelamin: "", status: "", alamat: "", rt: "", rw: "", kel: "", kec: "", kota: "", telepon: "", email: "", pekerjaan: "", tempatKerja: "", pendapatan: "" });
      }, 3000);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      <header style={{ background: "var(--color-surface)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 32 }}>🏛️</span>
            <div><div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--color-primary)" }}>KSP Mulia Dana Sejahtera</div><div style={{ fontSize: 11, color: "var(--color-secondary)", letterSpacing: 1 }}>TERDAFTAR & TERAWASI</div></div>
          </Link>
          <nav style={{ display: "flex", gap: 24 }}>
            <Link href="/" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Beranda</Link>
            <Link href="/simpanan" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Simpanan</Link>
            <Link href="/pinjaman" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Pinjaman</Link>
            <Link href="/anggota" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: 15 }}>Anggota</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{ padding: "120px 24px 64px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <h1 style={{ fontSize: 36, fontFamily: "var(--font-heading)", marginBottom: 12 }}>Keanggotaan</h1>
            <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>Pendaftaran & Data Anggota KSP</p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "var(--color-surface)", padding: 8, borderRadius: 12 }}>
            <button onClick={() => setActiveTab("data")} style={{ flex: 1, padding: "14px 24px", border: "none", borderRadius: 8, background: activeTab === "data" ? "var(--color-primary)" : "transparent", color: activeTab === "data" ? "white" : "var(--color-text-primary)", fontWeight: 600, cursor: "pointer" }}>📝 Pendaftaran</button>
            <button onClick={() => setActiveTab("daftar")} style={{ flex: 1, padding: "14px 24px", border: "none", borderRadius: 8, background: activeTab === "daftar" ? "var(--color-primary)" : "transparent", color: activeTab === "daftar" ? "white" : "var(--color-text-primary)", fontWeight: 600, cursor: "pointer" }}>📋 Data Anggota ({anggota.length})</button>
          </div>

          {activeTab === "data" && (
            <div className="card" style={{ padding: 40 }}>
              {submitted && <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>✓ Pendaftaran berhasil!</div>}
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12 }}>Data Diri</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>NIK (KTP) *</label><input type="text" value={formData.nik} onChange={e => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.nik ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} placeholder="16 digit" maxLength={16} />{formErrors.nik && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.nik}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nama Lengkap *</label><input type="text" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.nama ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.nama && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.nama}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tempat Lahir *</label><input type="text" value={formData.tempatLahir} onChange={e => setFormData({ ...formData, tempatLahir: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.tempatLahir ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.tempatLahir && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.tempatLahir}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal Lahir *</label><input type="date" value={formData.tanggalLahir} onChange={e => setFormData({ ...formData, tanggalLahir: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.tanggalLahir ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.tanggalLahir && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.tanggalLahir}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jenis Kelamin *</label><select value={formData.jkelamin} onChange={e => setFormData({ ...formData, jkelamin: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.jkelamin ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}><option value="">Pilih</option><option value="laki">Laki-laki</option><option value="perempuan">Perempuan</option></select>{formErrors.jkelamin && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.jkelamin}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Status *</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.status ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}><option value="">Pilih</option><option value="belum">Belum Kawin</option><option value="kawin">Kawin</option><option value="cerai">Cerai</option></select>{formErrors.status && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.status}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Telepon *</label><input type="tel" value={formData.telepon} onChange={e => setFormData({ ...formData, telepon: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.telepon ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.telepon && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.telepon}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: "2px solid #eee", fontSize: 16 }} /></div>
                </div>

                <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12, marginTop: 32 }}>Alamat</h3>
                <div style={{ marginBottom: 20 }}><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Alamat *</label><input type="text" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.alamat ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.alamat && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.alamat}</div>}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>RT</label><input type="text" value={formData.rt} onChange={e => setFormData({ ...formData, rt: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: "2px solid #eee", fontSize: 16 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>RW</label><input type="text" value={formData.rw} onChange={e => setFormData({ ...formData, rw: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: "2px solid #eee", fontSize: 16 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Kelurahan *</label><input type="text" value={formData.kel} onChange={e => setFormData({ ...formData, kel: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.kel ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.kel && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.kel}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Kecamatan *</label><input type="text" value={formData.kec} onChange={e => setFormData({ ...formData, kec: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.kec ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.kec && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.kec}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Kota/Kab *</label><input type="text" value={formData.kota} onChange={e => setFormData({ ...formData, kota: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.kota ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.kota && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.kota}</div>}</div>
                </div>

                <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12, marginTop: 32 }}>Pekerjaan</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pekerjaan *</label><input type="text" value={formData.pekerjaan} onChange={e => setFormData({ ...formData, pekerjaan: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: formErrors.pekerjaan ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} />{formErrors.pekerjaan && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{formErrors.pekerjaan}</div>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tempat Kerja</label><input type="text" value={formData.tempatKerja} onChange={e => setFormData({ ...formData, tempatKerja: e.target.value })} style={{ width: "100%", padding: 14, borderRadius: 8, border: "2px solid #eee", fontSize: 16 }} /></div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 16 }}>📝 Daftar Anggota</button>
              </form>
            </div>
          )}

          {activeTab === "daftar" && (
            <div className="card" style={{ padding: 40 }}>
              <h3 style={{ fontSize: 18, marginBottom: 24 }}>Data Anggota</h3>
              {anggota.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-secondary)" }}>Belum ada anggota. Silakan tambah anggota baru.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead><tr style={{ background: "var(--color-background)" }}><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>NIK</th><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Telepon</th><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Pekerjaan</th><th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #ddd" }}>Status</th></tr></thead>
                  <tbody>
                    {anggota.map((a, i) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: 12 }}>{i + 1}</td>
                        <td style={{ fontFamily: "monospace", fontSize: 13 }}>{a.nik}</td>
                        <td style={{ fontWeight: 500 }}>{a.nama}</td>
                        <td>{a.telepon}</td>
                        <td>{a.pekerjaan}</td>
                        <td style={{ textAlign: "center" }}><span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, background: a.statusKeanggotaan === "Aktif" ? "#d4edda" : "#f8d7da", color: a.statusKeanggotaan === "Aktif" ? "#155724" : "#721c24" }}>{a.statusKeanggotaan || "Aktif"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {anggota.length > 0 && (
                <div style={{ marginTop: 24, padding: 16, background: "var(--color-background)", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Total Anggota</div><div style={{ fontSize: 24, fontWeight: 700 }}>{anggota.length} Orang</div></div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Link href="/" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>← Kembali</Link>
          </div>
        </div>
      </div>
    </main>
  );
}