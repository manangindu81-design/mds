"use client";
import { useState } from "react";
import Link from "next/link";
import { useData, Anggota as AnggotaType } from "../context/DataContext";

export default function AnggotaPage() {
  const { anggota, addAnggota } = useData();
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
    provinsi: "",
    telepon: "",
    email: "",
    pekerjaan: "",
    tempatKerja: "",
    pendapatan: "",
    namaAhliWaris: "",
    hubungan: "",
    catatan: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nik.trim()) errors.nik = "NIK wajib diisi";
    else if (formData.nik.length !== 16) errors.nik = "NIK harus 16 digit";
    if (!formData.nama.trim()) errors.nama = "Nama wajib diisi";
    if (!formData.tempatLahir.trim()) errors.tempatLahir = "Tempat lahir wajib diisi";
    if (!formData.tanggalLahir) errors.tanggalLahir = "Tanggal lahir wajib diisi";
    if (!formData.jkelamin) errors.jkelamin = "Jenis kelamin wajib dipilih";
    if (!formData.status) errors.status = "Status perkawinan wajib dipilih";
    if (!formData.alamat.trim()) errors.alamat = "Alamat wajib diisi";
    if (!formData.kel.trim()) errors.kel = "Kelurahan wajib diisi";
    if (!formData.kec.trim()) errors.kec = "Kecamatan wajib diisi";
    if (!formData.kota.trim()) errors.kota = "Kota/Kabupaten wajib diisi";
    if (!formData.telepon.trim()) errors.telepon = "Nomor telepon wajib diisi";
    if (!formData.pekerjaan.trim()) errors.pekerjaan = "Pekerjaan wajib diisi";
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
        setFormData({
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
          provinsi: "",
          telepon: "",
          email: "",
          pekerjaan: "",
          tempatKerja: "",
          pendapatan: "",
          namaAhliWaris: "",
          hubungan: "",
          catatan: "",
        });
      }, 3000);
    }
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
            <Link href="/simpanan" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Simpanan</Link>
            <Link href="/pinjaman" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Pinjaman</Link>
            <Link href="/anggota" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: 15 }}>Anggota</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="container" style={{ padding: "120px 24px 64px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <h1 style={{ fontSize: 36, fontFamily: "var(--font-heading)", marginBottom: 12, color: "var(--color-text-primary)" }}>
              Pendataan Anggota Baru
            </h1>
            <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
              Formulir pendaftaran anggota KSP Mulia Dana Sejahtera
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
              ✓ Pendaftaran anggota berhasil! Tim kami akan menghubungi Anda untuk konfirmasi.
            </div>
          )}

          <div className="card" style={{ padding: 40 }}>
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: 20, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12 }}>
                Data Diri
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>NIK (KTP) *</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.nik ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="16 digit NIK"
                    maxLength={16}
                  />
                  {formErrors.nik && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.nik}</div>}
                </div>

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
                    placeholder="Sesuai KTP"
                  />
                  {formErrors.nama && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.nama}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tempat Lahir *</label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.tempatLahir ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Kota lahir"
                  />
                  {formErrors.tempatLahir && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.tempatLahir}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal Lahir *</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.tanggalLahir ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                  />
                  {formErrors.tanggalLahir && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.tanggalLahir}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jenis Kelamin *</label>
                  <select
                    value={formData.jkelamin}
                    onChange={(e) => setFormData({ ...formData, jkelamin: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.jkelamin ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none",
                      background: "white"
                    }}
                  >
                    <option value="">Pilih</option>
                    <option value="laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>
                  {formErrors.jkelamin && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.jkelamin}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Status Perkawinan *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.status ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none",
                      background: "white"
                    }}
                  >
                    <option value="">Pilih status</option>
                    <option value="belum">Belum Kawin</option>
                    <option value="kawin">Kawin</option>
                    <option value="cerai-hidup">Cerai Hidup</option>
                    <option value="cerai-mati">Cerai Mati</option>
                  </select>
                  {formErrors.status && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.status}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nomor Telepon *</label>
                  <input
                    type="tel"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.telepon ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="0812 3456 7890"
                  />
                  {formErrors.telepon && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.telepon}</div>}
                </div>
              </div>

              <h3 style={{ fontSize: 20, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12, marginTop: 32 }}>
                Alamat
              </h3>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Alamat Jalan *</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: 8, 
                    border: formErrors.alamat ? "2px solid #e74c3c" : "2px solid #eee",
                    fontSize: 16,
                    outline: "none"
                  }}
                  placeholder="Jl. Rumah No."
                />
                {formErrors.alamat && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.alamat}</div>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>RT</label>
                  <input
                    type="text"
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="001"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>RW</label>
                  <input
                    type="text"
                    value={formData.rw}
                    onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="001"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Kelurahan *</label>
                  <input
                    type="text"
                    value={formData.kel}
                    onChange={(e) => setFormData({ ...formData, kel: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.kel ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Kelurahan"
                  />
                  {formErrors.kel && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.kel}</div>}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Kecamatan *</label>
                  <input
                    type="text"
                    value={formData.kec}
                    onChange={(e) => setFormData({ ...formData, kec: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.kec ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Kecamatan"
                  />
                  {formErrors.kec && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.kec}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Kota/Kabupaten *</label>
                  <input
                    type="text"
                    value={formData.kota}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.kota ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Kota"
                  />
                  {formErrors.kota && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.kota}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Provinsi</label>
                  <input
                    type="text"
                    value={formData.provinsi}
                    onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Provinsi"
                  />
                </div>
              </div>

              <h3 style={{ fontSize: 20, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12, marginTop: 32 }}>
                Pekerjaan
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pekerjaan *</label>
                  <input
                    type="text"
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: formErrors.pekerjaan ? "2px solid #e74c3c" : "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Pekerjaan"
                  />
                  {formErrors.pekerjaan && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.pekerjaan}</div>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tempat Kerja</label>
                  <input
                    type="text"
                    value={formData.tempatKerja}
                    onChange={(e) => setFormData({ ...formData, tempatKerja: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Nama perusahaan/instansi"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pendapatan per Bulan</label>
                <select
                  value={formData.pendapatan}
                  onChange={(e) => setFormData({ ...formData, pendapatan: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: 8, 
                    border: "2px solid #eee",
                    fontSize: 16,
                    outline: "none",
                    background: "white"
                  }}
                >
                  <option value="">Pilih rentang pendapatan</option>
                  <option value="1jt">&lt; Rp 2.000.000</option>
                  <option value="2-5jt">Rp 2.000.000 - Rp 5.000.000</option>
                  <option value="5-10jt">Rp 5.000.000 - Rp 10.000.000</option>
                  <option value="10-20jt">Rp 10.000.000 - Rp 20.000.000</option>
                  <option value="20jt">&gt; Rp 20.000.000</option>
                </select>
              </div>

              <h3 style={{ fontSize: 20, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12, marginTop: 32 }}>
                Ahli Waris
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nama Ahli Waris</label>
                  <input
                    type="text"
                    value={formData.namaAhliWaris}
                    onChange={(e) => setFormData({ ...formData, namaAhliWaris: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: "2px solid #eee",
                      fontSize: 16,
                      outline: "none"
                    }}
                    placeholder="Nama ahli waris"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Hubungan</label>
                  <select
                    value={formData.hubungan}
                    onChange={(e) => setFormData({ ...formData, hubungan: e.target.value })}
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: 8, 
                      border: "2px solid #eee",
                      fontSize: 16,
                      outline: "none",
                      background: "white"
                    }}
                  >
                    <option value="">Pilih hubungan</option>
                    <option value="suami">Suami</option>
                    <option value="istri">Istri</option>
                    <option value="anak">Anak</option>
                    <option value="orang-tua">Orang Tua</option>
                    <option value="saudara">Saudara</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
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
                Daftar Anggota
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