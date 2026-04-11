"use client";
import { useState } from "react";
import Link from "next/link";
import { useData, Pinjaman as PinjamanType } from "../context/DataContext";

export default function PinjamanPage() {
  const { anggota, pinjaman, angsuran, addPinjaman, addAngsuran, updatePinjaman, addTransaksi } = useData();
  const [activeTab, setActiveTab] = useState<"pencairan" | "daftar" | "angsuran">("pencairan");
  
  const [formData, setFormData] = useState({
    idAnggota: "",
    nama: "",
    nomorAnggota: "",
    tanggal: new Date().toISOString().split("T")[0],
    sistem: "flat",
    jenisPinjaman: "",
    jumlah: "",
    tenor: "12",
    bunga: "1.5",
    biayaAdmin: "25000",
    tujuan: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedPencairan, setSubmittedPencairan] = useState(false);

  const [formAngsuran, setFormAngsuran] = useState({
    idPinjaman: "",
    tanggal: new Date().toISOString().split("T")[0],
    angsuranPokok: "",
    angsuranBunga: "",
    denda: "0",
  });
  const [formErrorsAngsuran, setFormErrorsAngsuran] = useState<Record<string, string>>({});
  const [submittedAngsuran, setSubmittedAngsuran] = useState(false);

  const sistemOptions = [
    { value: "musiman", label: "Musiman (Saldo Menurun)", bunga: 2.5, tenorMax: 6, deskripsi: "Bunga 2,5% per bulan" },
    { value: "flat", label: "Flat (Angsuran Tetap)", bunga: 1.5, tenorMax: 36, deskripsi: "Bunga 1,5% - 2% per bulan" },
  ];

  const currentOption = sistemOptions.find(o => o.value === formData.sistem);

  const handleSelectAnggota = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = anggota.find(a => a.id.toString() === selectedId);
    if (selected) {
      setFormData({
        ...formData,
        idAnggota: selectedId,
        nama: selected.nama,
        nomorAnggota: selected.nik || `AG-${String(selected.id).padStart(3, "0")}`,
      });
    }
  };

  const calculatePreview = () => {
    if (!formData.jumlah || !formData.tenor) return null;
    const jumlah = parseInt(formData.jumlah.replace(/\D/g, "")) || 0;
    const tenor = parseInt(formData.tenor);
    const bunga = currentOption?.bunga || 0;
    const biayaAdmin = parseInt(formData.biayaAdmin.replace(/\D/g, "")) || 0;

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
        totalPembayaran: jumlah + totalBunga,
        biayaAdmin,
        totalTagihan: jumlah + totalBunga + biayaAdmin
      };
    } else {
      totalBunga = jumlah * (bunga / 100) * tenor;
      angsuranPerBulan = (jumlah / tenor) + (totalBunga / tenor);
      return {
        totalBunga,
        angsuranPerBulan,
        totalPembayaran: jumlah + totalBunga,
        biayaAdmin,
        totalTagihan: jumlah + totalBunga + biayaAdmin
      };
    }
  };

  const preview = calculatePreview();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.idAnggota) errors.idAnggota = "Anggota wajib dipilih";
    if (!formData.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!formData.jenisPinjaman) errors.jenisPinjaman = "Jenis pinjaman wajib dipilih";
    if (!formData.jumlah) errors.jumlah = "Jumlah wajib diisi";
    if (!formData.tenor) errors.tenor = "Jangka waktu wajib dipilih";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const jumlahNum = parseInt(formData.jumlah.replace(/\D/g, ""));
      const biayaAdminNum = parseInt(formData.biayaAdmin.replace(/\D/g, "")) || 25000;
      const currentOption = sistemOptions.find(o => o.value === formData.sistem);
      
      const newPinjaman: PinjamanType = {
        id: pinjaman.length + 1,
        idAnggota: parseInt(formData.idAnggota),
        nama: formData.nama,
        nomorAnggota: formData.nomorAnggota,
        tanggal: formData.tanggal,
        sistem: formData.sistem,
        jenisPinjaman: formData.jenisPinjaman,
        jumlah: jumlahNum,
        tenor: parseInt(formData.tenor),
        bunga: currentOption?.bunga || 0,
        tujuan: formData.tujuan,
        status: "Disetujui",
        biayaAdmin: biayaAdminNum,
        sudahDibayar: 0,
        outstanding: jumlahNum,
      };
      addPinjaman(newPinjaman);

      addTransaksi({
        id: 0,
        noBukti: `PK-${String(Date.now()).slice(-6)}`,
        tanggal: formData.tanggal,
        jam: new Date().toLocaleTimeString("id-ID"),
        akun: "Piutang Pinjaman",
        kategori: "Debet",
        uraian: `Pencairan Pinjaman ${formData.nama} - ${formData.jenisPinjaman}`,
        debet: jumlahNum,
        kredit: 0,
        saldo: jumlahNum,
        operator: "System",
      });

      addTransaksi({
        id: 0,
        noBukti: `PK-${String(Date.now()).slice(-6)}`,
        tanggal: formData.tanggal,
        jam: new Date().toLocaleTimeString("id-ID"),
        akun: "Kas/Bank",
        kategori: "Kredit",
        uraian: `Pencairan Pinjaman ${formData.nama} - ${formData.jenisPinjaman}`,
        debet: 0,
        kredit: jumlahNum,
        saldo: -jumlahNum,
        operator: "System",
      });

      if (biayaAdminNum > 0) {
        addTransaksi({
          id: 0,
          noBukti: `ADM-${String(Date.now()).slice(-6)}`,
          tanggal: formData.tanggal,
          jam: new Date().toLocaleTimeString("id-ID"),
          akun: "Pendapatan Admin",
          kategori: "Kredit",
          uraian: `Biaya Admin Pinjaman ${formData.nama}`,
          debet: 0,
          kredit: biayaAdminNum,
          saldo: biayaAdminNum,
          operator: "System",
        });
      }

      setSubmittedPencairan(true);
      setTimeout(() => {
        setSubmittedPencairan(false);
        setFormData({
          idAnggota: "",
          nama: "",
          nomorAnggota: "",
          tanggal: new Date().toISOString().split("T")[0],
          sistem: "flat",
          jenisPinjaman: "",
          jumlah: "",
          tenor: "12",
          bunga: "1.5",
          biayaAdmin: "25000",
          tujuan: "",
        });
      }, 3000);
    }
  };

  const validateFormAngsuran = () => {
    const errors: Record<string, string> = {};
    if (!formAngsuran.idPinjaman) errors.idPinjaman = "Pinjaman wajib dipilih";
    if (!formAngsuran.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!formAngsuran.angsuranPokok) errors.angsuranPokok = "Angsuran Pokok wajib diisi";
    if (!formAngsuran.angsuranBunga) errors.angsuranBunga = "Angsuran Bunga wajib diisi";
    setFormErrorsAngsuran(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitAngsuran = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFormAngsuran()) {
      const selectedPinjaman = pinjaman.find(p => p.id.toString() === formAngsuran.idPinjaman);
      if (!selectedPinjaman) return;

      const angsuranPokokNum = parseInt(formAngsuran.angsuranPokok.replace(/\D/g, ""));
      const angsuranBungaNum = parseInt(formAngsuran.angsuranBunga.replace(/\D/g, ""));
      const dendaNum = parseInt(formAngsuran.denda.replace(/\D/g, "")) || 0;
      const totalBayar = angsuranPokokNum + angsuranBungaNum + dendaNum;
      const angsuranKe = angsuran.filter(a => a.idPinjaman === selectedPinjaman.id).length + 1;
      const newSudahDibayar = selectedPinjaman.sudahDibayar + angsuranPokokNum;
      const newOutstanding = selectedPinjaman.outstanding - angsuranPokokNum;

      addAngsuran({
        id: 0,
        idPinjaman: selectedPinjaman.id,
        idAnggota: selectedPinjaman.idAnggota,
        nama: selectedPinjaman.nama,
        nomorAnggota: selectedPinjaman.nomorAnggota,
        tanggal: formAngsuran.tanggal,
        angsuranKe,
        angsuranPokok: angsuranPokokNum,
        angsuranBunga: angsuranBungaNum,
        denda: dendaNum,
        totalBayar,
        saldoPiutang: newOutstanding,
      });

      updatePinjaman(selectedPinjaman.id, newSudahDibayar, newOutstanding);

      addTransaksi({
        id: 0,
        noBukti: `AN-${String(Date.now()).slice(-6)}`,
        tanggal: formAngsuran.tanggal,
        jam: new Date().toLocaleTimeString("id-ID"),
        akun: "Piutang Pinjaman",
        kategori: "Kredit",
        uraian: `Angsuran ke-${angsuranKe} ${selectedPinjaman.nama}`,
        debet: 0,
        kredit: angsuranPokokNum,
        saldo: -angsuranPokokNum,
        operator: "System",
      });

      addTransaksi({
        id: 0,
        noBukti: `AN-${String(Date.now()).slice(-6)}`,
        tanggal: formAngsuran.tanggal,
        jam: new Date().toLocaleTimeString("id-ID"),
        akun: "Kas/Bank",
        kategori: "Debet",
        uraian: `Penerimaan Angsuran ke-${angsuranKe} ${selectedPinjaman.nama}`,
        debet: totalBayar,
        kredit: 0,
        saldo: totalBayar,
        operator: "System",
      });

      if (angsuranBungaNum > 0) {
        addTransaksi({
          id: 0,
          noBukti: `Bunga-${String(Date.now()).slice(-6)}`,
          tanggal: formAngsuran.tanggal,
          jam: new Date().toLocaleTimeString("id-ID"),
          akun: "Pendapatan Bunga",
          kategori: "Kredit",
          uraian: `Pendapatan Bunga Angsuran ke-${angsuranKe} ${selectedPinjaman.nama}`,
          debet: 0,
          kredit: angsuranBungaNum,
          saldo: angsuranBungaNum,
          operator: "System",
        });
      }

      if (dendaNum > 0) {
        addTransaksi({
          id: 0,
          noBukti: `DN-${String(Date.now()).slice(-6)}`,
          tanggal: formAngsuran.tanggal,
          jam: new Date().toLocaleTimeString("id-ID"),
          akun: "Pendapatan Denda",
          kategori: "Kredit",
          uraian: `Denda Angsuran ke-${angsuranKe} ${selectedPinjaman.nama}`,
          debet: 0,
          kredit: dendaNum,
          saldo: dendaNum,
          operator: "System",
        });
      }

      setSubmittedAngsuran(true);
      setTimeout(() => {
        setSubmittedAngsuran(false);
        setFormAngsuran({
          idPinjaman: "",
          tanggal: new Date().toISOString().split("T")[0],
          angsuranPokok: "",
          angsuranBunga: "",
          denda: "0",
        });
      }, 3000);
    }
  };

  const handleSelectPinjaman = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = pinjaman.find(p => p.id.toString() === selectedId);
    if (selected) {
      const angsuranPokok = Math.floor(selected.jumlah / selected.tenor);
      const angsuranBunga = Math.floor((selected.jumlah * selected.bunga / 100));
      setFormAngsuran({
        ...formAngsuran,
        idPinjaman: selectedId,
        angsuranPokok: angsuranPokok.toString(),
        angsuranBunga: angsuranBunga.toString(),
      });
    }
  };

  const formatRupiah = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatRupiahNum = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  const activePinjaman = pinjaman.filter(p => p.status === "Disetujui" && p.outstanding > 0);

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
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
            <h1 style={{ fontSize: 36, fontFamily: "var(--font-heading)", marginBottom: 12, color: "var(--color-text-primary)" }}>
              Manajemen Pinjaman
            </h1>
            <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
              Pencairan, Tracking, dan Angsuran Pinjaman Anggota
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "var(--color-surface)", padding: 8, borderRadius: 12 }}>
            <button
              onClick={() => setActiveTab("pencairan")}
              style={{
                flex: 1,
                padding: "14px 24px",
                border: "none",
                borderRadius: 8,
                background: activeTab === "pencairan" ? "var(--color-primary)" : "transparent",
                color: activeTab === "pencairan" ? "white" : "var(--color-text-primary)",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              📝 Pencairan
            </button>
            <button
              onClick={() => setActiveTab("daftar")}
              style={{
                flex: 1,
                padding: "14px 24px",
                border: "none",
                borderRadius: 8,
                background: activeTab === "daftar" ? "var(--color-primary)" : "transparent",
                color: activeTab === "daftar" ? "white" : "var(--color-text-primary)",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              📋 Daftar Peminjam
            </button>
            <button
              onClick={() => setActiveTab("angsuran")}
              style={{
                flex: 1,
                padding: "14px 24px",
                border: "none",
                borderRadius: 8,
                background: activeTab === "angsuran" ? "var(--color-primary)" : "transparent",
                color: activeTab === "angsuran" ? "white" : "var(--color-text-primary)",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              💳 Angsuran
            </button>
          </div>

          {activeTab === "pencairan" && (
            <div className="card" style={{ padding: 40 }}>
              {submittedPencairan && (
                <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>
                  ✓ Pencairan Pinjaman Berhasil! jurnal Otomatis Dibuat.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12 }}>
                  Form Pencairan Pinjaman
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pilih Anggota *</label>
                    <select
                      value={formData.idAnggota}
                      onChange={handleSelectAnggota}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.idAnggota ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                    >
                      <option value="">Pilih Anggota</option>
                      {anggota.map(a => (
                        <option key={a.id} value={a.id}>{a.nama} ({a.nik || `AG-${String(a.id).padStart(3, "0")}`})</option>
                      ))}
                    </select>
                    {formErrors.idAnggota && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.idAnggota}</div>}
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal Pencairan *</label>
                    <input
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.tanggal ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                    />
                    {formErrors.tanggal && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.tanggal}</div>}
                  </div>
                </div>

                {formData.nama && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, padding: 16, background: "var(--color-background)", borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Nama Anggota</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{formData.nama}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Nomor Anggota</div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{formData.nomorAnggota}</div>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Sistem Perhitungan *</label>
                    <select
                      value={formData.sistem}
                      onChange={(e) => setFormData({ ...formData, sistem: e.target.value, tenor: "", bunga: "" })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                    >
                      {sistemOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label} - {opt.deskripsi}</option>
                      ))}
                    </select>
                  </div>

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
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nominal Pinjaman (Rp) *</label>
                    <input
                      type="text"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: formatRupiah(e.target.value) })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.jumlah ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                      placeholder="Rp 0"
                    />
                    {formErrors.jumlah && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrors.jumlah}</div>}
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tenor (Bulan) *</label>
                    <select
                      value={formData.tenor}
                      onChange={(e) => setFormData({ ...formData, tenor: e.target.value })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.tenor ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                    >
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
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Biaya Admin (Rp)</label>
                    <input
                      type="text"
                      value={formData.biayaAdmin}
                      onChange={(e) => setFormData({ ...formData, biayaAdmin: formatRupiah(e.target.value) })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, outline: "none" }}
                      placeholder="Rp 25.000"
                    />
                  </div>
                </div>

                {preview && (
                  <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)", borderRadius: 12, padding: 24, marginBottom: 24, color: "white" }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>Kalkulasi Pinjaman</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>Plafon</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiahNum(parseInt(formData.jumlah.replace(/\D/g, "")))}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>Bunga Total</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiahNum(preview.totalBunga)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>Admin</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiahNum(preview.biayaAdmin)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>Angsuran/Bulan</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiahNum(preview.angsuranPerBulan + (preview.biayaAdmin / parseInt(formData.tenor)))}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tujuan Penggunaan</label>
                  <input
                    type="text"
                    value={formData.tujuan}
                    onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, outline: "none" }}
                    placeholder="Contoh: Modal usaha"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  💰 Cairkan Pinjaman
                </button>
              </form>
            </div>
          )}

          {activeTab === "daftar" && (
            <div className="card" style={{ padding: 40 }}>
              <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12 }}>
                Daftar Anggota Peminjam
              </h3>
              {pinjaman.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-secondary)" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <p>Belum ada peminjam. Lakukan pencairan terlebih dahulu.</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "var(--color-background)" }}>
                      <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>No</th>
                      <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th>
                      <th style={{ padding: "12px 8px", textAlign: "left", borderBottom: "2px solid #ddd" }}>No. Anggota</th>
                      <th style={{ padding: "12px 8px", textAlign: "right", borderBottom: "2px solid #ddd" }}>Plafon</th>
                      <th style={{ padding: "12px 8px", textAlign: "right", borderBottom: "2px solid #ddd" }}>Sudah Dibayar</th>
                      <th style={{ padding: "12px 8px", textAlign: "right", borderBottom: "2px solid #ddd" }}>Outstanding</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Tenor</th>
                      <th style={{ padding: "12px 8px", textAlign: "center", borderBottom: "2px solid #ddd" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pinjaman.map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px 8px" }}>{idx + 1}</td>
                        <td style={{ padding: "12px 8px", fontWeight: 500 }}>{p.nama}</td>
                        <td style={{ padding: "12px 8px" }}>{p.nomorAnggota}</td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 500 }}>{formatRupiahNum(p.jumlah)}</td>
                        <td style={{ padding: "12px 8px", textAlign: "right", color: "#27ae60" }}>{formatRupiahNum(p.sudahDibayar || 0)}</td>
                        <td style={{ padding: "12px 8px", textAlign: "right", color: "#e74c3c", fontWeight: 600 }}>{formatRupiahNum(p.outstanding || p.jumlah)}</td>
                        <td style={{ padding: "12px 8px", textAlign: "center" }}>{p.tenor} bln</td>
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
              )}
              {pinjaman.length > 0 && (
                <div style={{ marginTop: 24, padding: 16, background: "var(--color-background)", borderRadius: 8, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Total Peminjam</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{pinjaman.length} Anggota</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Total Plafon</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{formatRupiahNum(pinjaman.reduce((sum, p) => sum + p.jumlah, 0))}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Total Outstanding</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#e74c3c" }}>{formatRupiahNum(pinjaman.reduce((sum, p) => sum + (p.outstanding || p.jumlah), 0))}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "angsuran" && (
            <div className="card" style={{ padding: 40 }}>
              {submittedAngsuran && (
                <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>
                  ✓ Angsuran Berhasil Dicatat! jurnal Otomatis Dibuat.
                </div>
              )}

              <form onSubmit={handleSubmitAngsuran}>
                <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12 }}>
                  Input Angsuran
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pilih Pinjaman *</label>
                    <select
                      value={formAngsuran.idPinjaman}
                      onChange={handleSelectPinjaman}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrorsAngsuran.idPinjaman ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none", background: "white" }}
                    >
                      <option value="">Pilih Pinjaman</option>
                      {activePinjaman.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nama} - {formatRupiahNum(p.outstanding || p.jumlah)} (Outstanding)
                        </option>
                      ))}
                    </select>
                    {formErrorsAngsuran.idPinjaman && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrorsAngsuran.idPinjaman}</div>}
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal Angsuran *</label>
                    <input
                      type="date"
                      value={formAngsuran.tanggal}
                      onChange={(e) => setFormAngsuran({ ...formAngsuran, tanggal: e.target.value })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrorsAngsuran.tanggal ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                    />
                    {formErrorsAngsuran.tanggal && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrorsAngsuran.tanggal}</div>}
                  </div>
                </div>

                {formAngsuran.idPinjaman && (
                  <div style={{ padding: 16, background: "var(--color-background)", borderRadius: 8, marginBottom: 24 }}>
                    {(() => {
                      const selected = pinjaman.find(p => p.id.toString() === formAngsuran.idPinjaman);
                      if (!selected) return null;
                      return (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</div>
                            <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.nama}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Angsuran Ke</div>
                            <div style={{ fontSize: 16, fontWeight: 600 }}>{angsuran.filter(a => a.idPinjaman === selected.id).length + 1}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Sisa Outstanding</div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#e74c3c" }}>{formatRupiahNum(selected.outstanding || selected.jumlah)}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Angsuran Pokok (Rp) *</label>
                    <input
                      type="text"
                      value={formAngsuran.angsuranPokok}
                      onChange={(e) => setFormAngsuran({ ...formAngsuran, angsuranPokok: formatRupiah(e.target.value) })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrorsAngsuran.angsuranPokok ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                      placeholder="Rp 0"
                    />
                    {formErrorsAngsuran.angsuranPokok && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrorsAngsuran.angsuranPokok}</div>}
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>Mengurangi Piutang</div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Angsuran Bunga (Rp) *</label>
                    <input
                      type="text"
                      value={formAngsuran.angsuranBunga}
                      onChange={(e) => setFormAngsuran({ ...formAngsuran, angsuranBunga: formatRupiah(e.target.value) })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrorsAngsuran.angsuranBunga ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, outline: "none" }}
                      placeholder="Rp 0"
                    />
                    {formErrorsAngsuran.angsuranBunga && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>{formErrorsAngsuran.angsuranBunga}</div>}
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>Menambah Pendapatan</div>
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Denda (Rp)</label>
                  <input
                    type="text"
                    value={formAngsuran.denda}
                    onChange={(e) => setFormAngsuran({ ...formAngsuran, denda: formatRupiah(e.target.value) })}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, outline: "none" }}
                    placeholder="Rp 0"
                  />
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>Menambah Pendapatan Denda</div>
                </div>

                {(formAngsuran.angsuranPokok || formAngsuran.angsuranBunga) && (
                  <div style={{ background: "#e8f5e9", borderRadius: 8, padding: 16, marginBottom: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Total Pembayaran:</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#27ae60" }}>
                      {formatRupiahNum(
                        (parseInt(formAngsuran.angsuranPokok?.replace(/\D/g, "")) || 0) +
                        (parseInt(formAngsuran.angsuranBunga?.replace(/\D/g, "")) || 0) +
                        (parseInt(formAngsuran.denda?.replace(/\D/g, "")) || 0)
                      )}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  💳 Simpan Angsuran
                </button>
              </form>
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