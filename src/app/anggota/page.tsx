"use client";
import { useState } from "react";
import Link from "next/link";
import { useData, Anggota as AnggotaType } from "../context/DataContext";

export default function AnggotaPage() {
  const { anggota, addAnggota, addSimpanan, addTransaksi } = useData();
  const [activeTab, setActiveTab] = useState<"daftar" | "data">("data");
  
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
  
  const optionsLamaBekerja = [
    { value: "", label: "Pilih" },
    { value: "<6bln", label: "Kurang dari 6 Bulan" },
    { value: "6-12bln", label: "6 Bulan - 1 Tahun" },
    { value: "1-2thn", label: "1 Tahun - 2 Tahun" },
    { value: "2-3thn", label: "2 Tahun - 3 Tahun" },
    { value: "3-5thn", label: "3 Tahun - 5 Tahun" },
    { value: ">5thn", label: "Lebih dari 5 Tahun" },
  ];
  
  const optionsPosisi = [
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
        setFormData({ nik: "", nama: "", tempatLahir: "", tanggalLahir: "", jkelamin: "", status: "", namaPasangan: "", jumlahAnak: "", namaIbuKandung: "", namaSaudara: "", telpSaudara: "", hubungan: "", pekerjaan: "", besarPenghasilan: "", posisi: "", statusPekerjaan: "", lamaBekerja: "", alamatTempatKerja: "", jenisTransaksi: "", alamat: "", rt: "", rw: "", kel: "", kec: "", kota: "", telepon: "", email: "", tempatKerja: "", pendapatan: "" });
      }, 3000);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E", marginBottom: 8 }}>Keanggotaan</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Pendaftaran & Data Anggota KSP</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "white", padding: 8, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <button onClick={() => setActiveTab("data")} style={{ flex: 1, padding: "14px 24px", border: "none", borderRadius: 8, background: activeTab === "data" ? "#1B4D3E" : "transparent", color: activeTab === "data" ? "white" : "#1B4D3E", fontWeight: 600, cursor: "pointer" }}>📝 Pendaftaran</button>
        <button onClick={() => setActiveTab("daftar")} style={{ flex: 1, padding: "14px 24px", border: "none", borderRadius: 8, background: activeTab === "daftar" ? "#1B4D3E" : "transparent", color: activeTab === "daftar" ? "white" : "#1B4D3E", fontWeight: 600, cursor: "pointer" }}>📋 Data Anggota ({anggota.length})</button>
      </div>

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
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Posisi/Jabatan</label><select value={formData.posisi} onChange={e => setFormData({ ...formData, posisi: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{optionsPosisi.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Status Pekerjaan</label><select value={formData.statusPekerjaan} onChange={e => setFormData({ ...formData, statusPekerjaan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}>{optionsStatusPekerjaan.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
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
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead><tr style={{ background: "#f9fafb" }}><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>No. NBA</th><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>NIK</th><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th><th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tgl Masuk</th><th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #ddd" }}>Status</th></tr></thead>
              <tbody>
                {anggota.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{i + 1}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{(a as any).nomorNBA || "-"}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{a.nik}</td>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{a.nama}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(a.tanggalJoin)}</td>
                    <td style={{ textAlign: "center" }}><span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 11, background: "#d4edda", color: "#155724" }}>{a.statusKeanggotaan || "Aktif"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {anggota.length > 0 && (
            <div style={{ marginTop: 24, padding: 16, background: "#f9fafb", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Total Anggota</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1B4D3E" }}>{anggota.length} Orang</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}