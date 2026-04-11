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
    namaSuamiIstri: "",
    alamat: "",
    tanggal: new Date().toISOString().split("T")[0],
    sistem: "flat",
    bunga: "1.5",
    jenisPinjaman: "",
    jumlah: "",
    tenor: "12",
    denda: "2",
    tujuan: "",
    jenisKredit: "",
    jenisPencairan: "",
    noPerjanjian: "",
    tanggalRealisasi: "",
    bpjstk: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittedPencairan, setSubmittedPencairan] = useState(false);

  const [formAngsuran, setFormAngsuran] = useState({
    idPinjaman: "",
    tanggal: new Date().toISOString().split("T")[0],
    angsuranPokok: "",
    angsuranBunga: "",
    hariTerlambat: "0",
  });
  const [formErrorsAngsuran, setFormErrorsAngsuran] = useState<Record<string, string>>({});
  const [submittedAngsuran, setSubmittedAngsuran] = useState(false);

  const flatBungaOptions = [
    { value: "1.5", label: "1,5% per bulan" },
    { value: "1.6", label: "1,6% per bulan" },
    { value: "1.65", label: "1,65% per bulan" },
    { value: "1.7", label: "1,7% per bulan" },
    { value: "1.75", label: "1,75% per bulan" },
    { value: "1.8", label: "1,8% per bulan" },
    { value: "2", label: "2% per bulan" },
  ];

  const musimanBungaOptions = [
    { value: "2.5", label: "2,5% per bulan" },
  ];

  const handleSistemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sistem = e.target.value;
    const bunga = sistem === "musiman" ? "2.5" : "1.5";
    const tenor = sistem === "musiman" ? "3" : "12";
    setFormData({ ...formData, sistem, bunga, tenor });
  };

  const handleSelectAnggota = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = anggota.find(a => a.id.toString() === selectedId);
    if (selected) {
      setFormData({
        ...formData,
        idAnggota: selectedId,
        nama: selected.nama,
        nomorAnggota: selected.nik || `AG-${String(selected.id).padStart(3, "0")}`,
        alamat: selected.alamat || "",
      });
    }
  };

  const handleTenorInput = (value: string) => {
    let tenorNum = parseInt(value) || 0;
    if (tenorNum > 12) tenorNum = 12;
    setFormData({ ...formData, tenor: tenorNum.toString() });
  };

  const handlePinjamanChange = (value: string) => {
    const selected =pinjaman.find(p => p.id.toString() === value);
    if (selected) {
      setFormAngsuran({
        ...formAngsuran,
        idPinjaman: value,
        angsuranPokok: Math.floor(selected.jumlah / selected.tenor).toString(),
        angsuranBunga: Math.floor(selected.jumlah * selected.bunga / 100).toString(),
      });
    }
  };

  const calculateJatuhTempo = () => {
    if (!formData.tanggalRealisasi || !formData.tenor) return "";
    const tgl = new Date(formData.tanggalRealisasi);
    tgl.setMonth(tgl.getMonth() + parseInt(formData.tenor));
    return tgl.toISOString().split("T")[0];
  };

  const calculateBiaya = () => {
    const jumlah = parseInt(formData.jumlah.replace(/\D/g, "")) || 0;
    const tenor = parseInt(formData.tenor) || 1;
    const isPendiri = formData.jenisPinjaman === "pendiri";
    const isSimpanan = formData.jenisPinjaman === "simpanan";
    const hasAgunan = ["bpkb", "akta-tanah", "sertifikat", "surat-desa"].includes(formData.jenisPinjaman);
    const bpjstkAmount = formData.bpjstk ? tenor * 20000 : 0;
    
    const biayaAdmin = Math.round(jumlah * 0.02);
    const danaRisiko = Math.round(jumlah * 0.01);
    const danaSosial = Math.round(jumlah * 0.01);
    const insentif = (isPendiri || isSimpanan) ? Math.round(jumlah * 0.01) : 0;
    const legalisasi = hasAgunan ? 400000 : 0;
    const feeNotaris = 100000;
    const materai = 24000;
    
    return {
      biayaAdmin,
      danaRisiko,
      danaSosial,
      insentif,
      legalisasi,
      feeNotaris,
      materai,
      bpjstk: bpjstkAmount,
      totalPotongan: biayaAdmin + danaRisiko + danaSosial + insentif + legalisasi + feeNotaris + materai + bpjstkAmount
    };
  };

  const calculatePreview = () => {
    if (!formData.jumlah || !formData.tenor) return null;
    const jumlah = parseInt(formData.jumlah.replace(/\D/g, "")) || 0;
    const tenor = parseInt(formData.tenor);
    const bunga = parseFloat(formData.bunga) || 0;
    const biaya = calculateBiaya();

    if (jumlah <= 0 || tenor <= 0) return null;

    let totalBunga: number;
    let angsuranPerBulan: number;
    let pokokPerBulan = Math.floor(jumlah / tenor);

    if (formData.sistem === "musiman") {
      const rate = bunga / 100;
      totalBunga = jumlah * rate * (tenor + 1) / 2;
      angsuranPerBulan = (jumlah / tenor) + (totalBunga / tenor);
    } else {
      totalBunga = jumlah * (bunga / 100) * tenor;
      angsuranPerBulan = (jumlah / tenor) + (totalBunga / tenor);
    }

    const jumlahDicairkan = jumlah - biaya.totalPotongan;

    return {
      totalBunga,
      angsuranPerBulan,
      totalPembayaran: jumlah + totalBunga,
      pokokPerBulan,
      jumlahDicairkan,
      biaya
    };
  };

  const preview = calculatePreview();
  const currentBungaOptions = formData.sistem === "musiman" ? musimanBungaOptions : flatBungaOptions;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.idAnggota) errors.idAnggota = "Anggota wajib dipilih";
    if (!formData.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!formData.jenisPinjaman) errors.jenisPinjaman = "Jenis pinjaman wajib diisi";
    if (!formData.jumlah) errors.jumlah = "Jumlah wajib diisi";
    if (!formData.tenor) errors.tenor = "Jangka waktu wajib diisi";
    if (!formData.jenisKredit) errors.jenisKredit = "Jenis kredit wajib dipilih";
    if (!formData.jenisPencairan) errors.jenisPencairan = "Jenis pencairan wajib dipilih";
    if (!formData.noPerjanjian) errors.noPerjanjian = "No. perjanjian wajib diisi";
    if (!formData.tanggalRealisasi) errors.tanggalRealisasi = "Tanggal realisasi wajib diisi";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const jumlahNum = parseInt(formData.jumlah.replace(/\D/g, ""));
      const currentBunga = parseFloat(formData.bunga);
      const jatuhTempo = calculateJatuhTempo();
      const biaya = calculateBiaya();
      
      const newPinjaman: PinjamanType = {
        id: pinjaman.length + 1,
        idAnggota: parseInt(formData.idAnggota),
        nama: formData.nama,
        nomorAnggota: formData.nomorAnggota,
        namaSuamiIstri: formData.namaSuamiIstri,
        alamat: formData.alamat,
        tanggal: formData.tanggal,
        sistem: formData.sistem,
        jenisPinjaman: formData.jenisPinjaman,
        jumlah: jumlahNum,
        tenor: parseInt(formData.tenor),
        bunga: currentBunga,
        denda: parseFloat(formData.denda) || 2,
        tujuan: formData.tujuan,
        status: "Disetujui",
        biayaAdmin: biaya.totalPotongan,
        sudahDibayar: 0,
        outstanding: jumlahNum,
        jenisKredit: formData.jenisKredit,
        jenisPencairan: formData.jenisPencairan,
        noPerjanjian: formData.noPerjanjian,
        tanggalRealisasi: formData.tanggalRealisasi,
        tanggalJatuhTempo: jatuhTempo,
        biayaMaterai: biaya.materai,
        biayaLegalisasi: biaya.legalisasi,
        feeNotaris: biaya.feeNotaris,
      };
      addPinjaman(newPinjaman);

      addTransaksi({
        id: 0,
        noBukti: `PK-${String(Date.now()).slice(-6)}`,
        tanggal: formData.tanggalRealisasi,
        jam: new Date().toLocaleTimeString("id-ID"),
        akun: "Piutang Pinjaman",
        kategori: "Debet",
        uraian: `Pencairan Pinjaman ${formData.nama}`,
        debet: jumlahNum,
        kredit: 0,
        saldo: jumlahNum,
        operator: "System",
      });

      addTransaksi({
        id: 0,
        noBukti: `PK-${String(Date.now()).slice(-6)}`,
        tanggal: formData.tanggalRealisasi,
        jam: new Date().toLocaleTimeString("id-ID"),
        akun: "Kas/Bank",
        kategori: "Kredit",
        uraian: `Pencairan Pinjaman ${formData.nama}`,
        debet: 0,
        kredit: jumlahNum,
        saldo: -jumlahNum,
        operator: "System",
      });

      if (biaya.biayaAdmin > 0) {
        addTransaksi({ id: 0, noBukti: `ADM-${String(Date.now()).slice(-6)}`, tanggal: formData.tanggalRealisasi, jam: new Date().toLocaleTimeString("id-ID"), akun: "Pendapatan Admin", kategori: "Kredit", uraian: `Biaya Admin`, debet: 0, kredit: biaya.biayaAdmin, saldo: biaya.biayaAdmin, operator: "System" });
      }
      if (biaya.danaRisiko > 0) {
        addTransaksi({ id: 0, noBukti: `RSK-${String(Date.now()).slice(-6)}`, tanggal: formData.tanggalRealisasi, jam: new Date().toLocaleTimeString("id-ID"), akun: "Dana Resiko", kategori: "Kredit", uraian: `Dana Resiko`, debet: 0, kredit: biaya.danaRisiko, saldo: biaya.danaRisiko, operator: "System" });
      }
      if (biaya.danaSosial > 0) {
        addTransaksi({ id: 0, noBukti: `SOS-${String(Date.now()).slice(-6)}`, tanggal: formData.tanggalRealisasi, jam: new Date().toLocaleTimeString("id-ID"), akun: "Dana Sosial", kategori: "Kredit", uraian: `Dana Sosial`, debet: 0, kredit: biaya.danaSosial, saldo: biaya.danaSosial, operator: "System" });
      }
      if (biaya.insentif > 0) {
        addTransaksi({ id: 0, noBukti: `INS-${String(Date.now()).slice(-6)}`, tanggal: formData.tanggalRealisasi, jam: new Date().toLocaleTimeString("id-ID"), akun: "Insentif Penanggung Jawab", kategori: "Kredit", uraian: `Insentif PJ`, debet: 0, kredit: biaya.insentif, saldo: biaya.insentif, operator: "System" });
      }

      setSubmittedPencairan(true);
      setTimeout(() => {
        setSubmittedPencairan(false);
        setFormData({
          idAnggota: "", nama: "", nomorAnggota: "", namaSuamiIstri: "", alamat: "",
          tanggal: new Date().toISOString().split("T")[0], sistem: "flat", bunga: "1.5",
          jenisPinjaman: "", jumlah: "", tenor: "12", denda: "2", tujuan: "",
          jenisKredit: "", jenisPencairan: "", noPerjanjian: "", tanggalRealisasi: "",
          bpjstk: false,
        });
      }, 3000);
    }
  };

  const handleSubmitAngsuran = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPinjaman =pinjaman.find(p => p.id.toString() === formAngsuran.idPinjaman);
    if (!selectedPinjaman || !formAngsuran.angsuranPokok || !formAngsuran.angsuranBunga) return;

    const angsuranPokokNum = parseInt(formAngsuran.angsuranPokok.replace(/\D/g, ""));
    const angsuranBungaNum = parseInt(formAngsuran.angsuranBunga.replace(/\D/g, ""));
    const hariTerlambat = parseInt(formAngsuran.hariTerlambat) || 0;
    const dendaNum = hariTerlambat > 0 ? Math.floor(selectedPinjaman.jumlah * 0.03 / 30 * hariTerlambat) : 0;
    const totalBayar = angsuranPokokNum + angsuranBungaNum + dendaNum;
    const angsuranKe = angsuran.filter(a => a.idPinjaman === selectedPinjaman.id).length + 1;
    const newOutstanding = selectedPinjaman.outstanding - angsuranPokokNum;

    addAngsuran({ id: 0, idPinjaman: selectedPinjaman.id, idAnggota: selectedPinjaman.idAnggota, nama: selectedPinjaman.nama, nomorAnggota: selectedPinjaman.nomorAnggota, tanggal: formAngsuran.tanggal, angsuranKe, angsuranPokok: angsuranPokokNum, angsuranBunga: angsuranBungaNum, denda: dendaNum, totalBayar, saldoPiutang: newOutstanding });
    updatePinjaman(selectedPinjaman.id, selectedPinjaman.sudahDibayar + angsuranPokokNum, newOutstanding);

    addTransaksi({ id: 0, noBukti: `AN-${String(Date.now()).slice(-6)}`, tanggal: formAngsuran.tanggal, jam: new Date().toLocaleTimeString("id-ID"), akun: "Piutang Pinjaman", kategori: "Kredit", uraian: `Angsuran ke-${angsuranKe}`, debet: 0, kredit: angsuranPokokNum, saldo: -angsuranPokokNum, operator: "System" });
    addTransaksi({ id: 0, noBukti: `AN-${String(Date.now()).slice(-6)}`, tanggal: formAngsuran.tanggal, jam: new Date().toLocaleTimeString("id-ID"), akun: "Kas/Bank", kategori: "Debet", uraian: `Angsuran ke-${angsuranKe}`, debet: totalBayar, kredit: 0, saldo: totalBayar, operator: "System" });
    if (angsuranBungaNum > 0) {
      addTransaksi({ id: 0, noBukti: `Bunga-${String(Date.now()).slice(-6)}`, tanggal: formAngsuran.tanggal, jam: new Date().toLocaleTimeString("id-ID"), akun: "Pendapatan Bunga", kategori: "Kredit", uraian: `Bunga Angsuran`, debet: 0, kredit: angsuranBungaNum, saldo: angsuranBungaNum, operator: "System" });
    }

    setSubmittedAngsuran(true);
    setTimeout(() => setSubmittedAngsuran(false), 3000);
  };

  const formatRupiah = (value: string) => value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formatRupiahNum = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  const activePinjaman = pinjaman.filter(p => p.status === "Disetujui" && p.outstanding > 0);

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
            <Link href="/pinjaman" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: 15 }}>Pinjaman</Link>
            <Link href="/anggota" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Anggota</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{ padding: "120px 24px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
            <h1 style={{ fontSize: 36, fontFamily: "var(--font-heading)", marginBottom: 12, color: "var(--color-text-primary)" }}>Manajemen Pinjaman</h1>
            <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>Pencairan, Tracking, dan Angsuran Pinjaman Anggota</p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "var(--color-surface)", padding: 8, borderRadius: 12 }}>
            <button onClick={() => setActiveTab("pencairan")} style={{ flex: 1, padding: "14px 24px", border: "none", borderRadius: 8, background: activeTab === "pencairan" ? "var(--color-primary)" : "transparent", color: activeTab === "pencairan" ? "white" : "var(--color-text-primary)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>📝 Pencairan</button>
            <button onClick={() => setActiveTab("daftar")} style={{ flex: 1, padding: "14px 24px", border: "none", borderRadius: 8, background: activeTab === "daftar" ? "var(--color-primary)" : "transparent", color: activeTab === "daftar" ? "white" : "var(--color-text-primary)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>📋 Daftar</button>
            <button onClick={() => setActiveTab("angsuran")} style={{ flex: 1, padding: "14px 24px", border: "none", borderRadius: 8, background: activeTab === "angsuran" ? "var(--color-primary)" : "transparent", color: activeTab === "angsuran" ? "white" : "var(--color-text-primary)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>💳 Angsuran</button>
          </div>

          {activeTab === "pencairan" && (
            <div className="card" style={{ padding: 40 }}>
              {submittedPencairan && <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>✓ Pencairan Pinjaman Berhasil! Jurnal Otomatis Dibuat.</div>}
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12 }}>Data Peminjam</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pilih Anggota *</label><select value={formData.idAnggota} onChange={handleSelectAnggota} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.idAnggota ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}><option value="">Pilih Anggota</option>{anggota.map(a => <option key={a.id} value={a.id}>{a.nama} ({a.nik || `AG-${String(a.id).padStart(3, "0")}`})</option>)}</select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>NBA</label><input type="text" value={formData.nomorAnggota} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, background: "#f9f9f9", color: "#666" }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nama</label><input type="text" value={formData.nama} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, background: "#f9f9f9", color: "#666" }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Nama Suami/Istri</label><input type="text" value={formData.namaSuamiIstri} onChange={e => setFormData({ ...formData, namaSuamiIstri: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16 }} placeholder="Nama Suami/Istri" /></div>
                  <div style={{ gridColumn: "1 / -1" }}><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Alamat</label><input type="text" value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16 }} placeholder="Alamat" /></div>
                </div>

                <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12, marginTop: 32 }}>Detail Pinjaman</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Sistem *</label><select value={formData.sistem} onChange={handleSistemChange} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, background: "white" }}><option value="flat">Flat (Angsuran Tetap)</option><option value="musiman">Musiman (Saldo Menurun)</option></select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Bunga/Jasa *</label>{formData.sistem === "musiman" ? <input type="text" value="2,5% per bulan" readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, background: "#f9f9f9", color: "#666" }} /> : <select value={formData.bunga} onChange={e => setFormData({ ...formData, bunga: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, background: "white" }}>{currentBungaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>}</div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal Pinjaman</label><input type="date" value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jenis Agunan *</label><select value={formData.jenisPinjaman} onChange={e => setFormData({ ...formData, jenisPinjaman: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.jenisPinjaman ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}><option value="">Pilih</option><option value="pendiri">Pendiri</option><option value="simpanan">Simpanan</option><option value="bpkb">BPKB</option><option value="akta-tanah">Akta Tanah</option><option value="sertifikat">Sertifikat</option><option value="surat-desa">Surat Desa</option></select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Besar Pinjaman (Rp) *</label><input type="text" value={formData.jumlah} onChange={e => setFormData({ ...formData, jumlah: formatRupiah(e.target.value) })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.jumlah ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} placeholder="Rp 0" /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jangka Waktu (Bulan) *</label><select value={formData.tenor} onChange={e => handleTenorInput(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.tenor ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}>{formData.sistem === "musiman" ? [1,2,3,4,5,6].map(b => <option key={b} value={b}>{b} Bulan</option>) : Array.from({length: 36}, (_, i) => i + 1).map(b => <option key={b} value={b}>{b} Bulan</option>)}</select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Denda (%/Bulan)</label><input type="text" value="3% per bulan" readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, background: "#f9f9f9", color: "#666" }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tujuan Penggunaan</label><input type="text" value={formData.tujuan} onChange={e => setFormData({ ...formData, tujuan: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16 }} placeholder="Contoh: Modal Usaha" /></div>
                </div>

                <h3 style={{ fontSize: 18, marginBottom: 24, borderBottom: "2px solid var(--color-primary)", paddingBottom: 12, marginTop: 32 }}>Informasi Kredit & Pencairan</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jenis Kredit *</label><select value={formData.jenisKredit} onChange={e => setFormData({ ...formData, jenisKredit: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.jenisKredit ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}><option value="">Pilih</option><option value="invest">Investment/Kapital Kerja</option><option value="kmk">KMK</option><option value="kpr">KPR</option><option value="konsumtif">Konsumtif</option></select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Jenis Pencairan *</label><select value={formData.jenisPencairan} onChange={e => setFormData({ ...formData, jenisPencairan: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.jenisPencairan ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16, background: "white" }}><option value="">Pilih</option><option value="tls">Tunai ke Siswa</option><option value="tk">Tunai ke Kultum</option><option value="transfer">Transfer</option><option value="potong">Potong Gaji</option></select></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>No. Perjanjian *</label><input type="text" value={formData.noPerjanjian} onChange={e => setFormData({ ...formData, noPerjanjian: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.noPerjanjian ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} placeholder="PK/2024/001" /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal Realisasi *</label><input type="date" value={formData.tanggalRealisasi} onChange={e => setFormData({ ...formData, tanggalRealisasi: e.target.value })} style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: formErrors.tanggalRealisasi ? "2px solid #e74c3c" : "2px solid #eee", fontSize: 16 }} /></div>
                  <div><label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Tanggal Jatuh Tempo</label><input type="text" value={calculateJatuhTempo()} readOnly style={{ width: "100%", padding: "14px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 16, background: "#f9f9f9", color: "#666" }} /></div>
                  <div><label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}><input type="checkbox" checked={formData.bpjstk} onChange={e => setFormData({ ...formData, bpjstk: e.target.checked })} /> Iuran BPJSTK PBPU Rp 20.000/bln</label></div>
                </div>

                {preview && (
                  <div style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)", borderRadius: 12, padding: 24, marginBottom: 24, color: "white" }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>Kalkulasi Pinjaman</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center", marginBottom: 16 }}>
                      <div><div style={{ fontSize: 12, opacity: 0.8 }}>Pokok</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiahNum(parseInt(formData.jumlah.replace(/\D/g, "")))}</div></div>
                      <div><div style={{ fontSize: 12, opacity: 0.8 }}>Bunga Total</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiahNum(preview.totalBunga)}</div></div>
                      <div><div style={{ fontSize: 12, opacity: 0.8 }}>Angsuran/Bulan</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatRupiahNum(preview.angsuranPerBulan)}</div></div>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 16 }}>
                      <div style={{ fontSize: 14, marginBottom: 12 }}>Potongan Otomatis:</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13 }}>
                        <div>Admin 2%: {formatRupiahNum(preview.biaya.biayaAdmin)}</div>
                        <div>Dana Risiko 1%: {formatRupiahNum(preview.biaya.danaRisiko)}</div>
                        <div>Dana Sosial 1%: {formatRupiahNum(preview.biaya.danaSosial)}</div>
                        {preview.biaya.insentif > 0 && <div>Insentif PJ 1%: {formatRupiahNum(preview.biaya.insentif)}</div>}
                        {preview.biaya.legalisasi > 0 && <div>Legalisasi: {formatRupiahNum(preview.biaya.legalisasi)}</div>}
                        <div>Fee Notaris: {formatRupiahNum(preview.biaya.feeNotaris)}</div>
                        <div>Materai: {formatRupiahNum(preview.biaya.materai)}</div>
                        {preview.biaya.bpjstk > 0 && <div>BPJSTK: {formatRupiahNum(preview.biaya.bpjstk)}</div>}
                      </div>
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 12, marginTop: 12, display: "flex", justifyContent: "space-between" }}>
                        <div>Total Potongan:</div>
                        <div style={{ fontWeight: 700 }}>{formatRupiahNum(preview.biaya.totalPotongan)}</div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                        <div>Jumlah Dicairkan:</div>
                        <div style={{ fontWeight: 700, fontSize: 18 }}>{formatRupiahNum(preview.jumlahDicairkan)}</div>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 16 }}>💰 Cairkan Pinjaman</button>
              </form>
            </div>
          )}

          {activeTab === "daftar" && (
            <div className="card" style={{ padding: 40 }}>
              <h3 style={{ fontSize: 18, marginBottom: 24 }}>Daftar Peminjam</h3>
              {pinjaman.length === 0 ? <div style={{ textAlign: "center", padding: 48 }}><p>Belum ada peminjam.</p></div> : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr><th>#</th><th>Nama</th><th>No. Perjanjian</th><th>Plafon</th><th>Outstanding</th><th>Tenor</th><th>Jatuh Tempo</th><th>Status</th></tr></thead>
                  <tbody>{pinjaman.map((p, i) => (
                    <tr key={p.id}><td>{i+1}</td><td>{p.nama}</td><td>{p.noPerjanjian || "-"}</td><td>{formatRupiahNum(p.jumlah)}</td><td style={{ color: "#e74c3c" }}>{formatRupiahNum(p.outstanding || p.jumlah)}</td><td>{p.tenor} bln</td><td>{p.tanggalJatuhTempo || "-"}</td><td><span style={{ padding: "4px 8px", borderRadius: 12, fontSize: 11, background: p.status==="Disetujui"?"#d4edda":"#fff3cd" }}>{p.status}</span></td></tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "angsuran" && (
            <div className="card" style={{ padding: 40 }}>
              <form onSubmit={handleSubmitAngsuran}>
                <h3 style={{ fontSize: 18, marginBottom: 24 }}>Input Angsuran</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div><label>Pinjaman *</label><select value={formAngsuran.idPinjaman} onChange={(e) => handlePinjamanChange(e.target.value)} style={{ width: "100%", padding: 14, borderRadius: 8, border: "2px solid #eee" }}><option value="">Pilih</option>{activePinjaman.map((p) => <option key={p.id} value={p.id}>{p.nama} - {formatRupiahNum(p.outstanding || p.jumlah)}</option>)}</select></div>
                  <div><label>Tanggal</label><input type="date" value={formAngsuran.tanggal} onChange={e=>setFormAngsuran({...formAngsuran,tanggal:e.target.value})} style={{width:"100%",padding:14,borderRadius:8,border:"2px solid #eee"}}/></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
                  <div><label>Pokok (Rp) *</label><input type="text" value={formAngsuran.angsuranPokok} onChange={e=>setFormAngsuran({...formAngsuran,angsuranPokok:formatRupiah(e.target.value)})} style={{width:"100%",padding:14,borderRadius:8,border:"2px solid #eee"}}/></div>
                  <div><label>Bunga (Rp) *</label><input type="text" value={formAngsuran.angsuranBunga} onChange={e=>setFormAngsuran({...formAngsuran,angsuranBunga:formatRupiah(e.target.value)})} style={{width:"100%",padding:14,borderRadius:8,border:"2px solid #eee"}}/></div>
                </div>
                <div style={{marginBottom:24}}><label>Hari Terlambat</label><input type="number" value={formAngsuran.hariTerlambat} onChange={e=>setFormAngsuran({...formAngsuran,hariTerlambat:e.target.value})} style={{width:"100%",padding:14,borderRadius:8,border:"2px solid #eee"}} placeholder="0"/><small style={{color:"#666"}}> (3% x hari / 30)</small>
                {(formAngsuran.idPinjaman && parseInt(formAngsuran.hariTerlambat) > 0) && (() => {
                  const selected =pinjaman.find(p => p.id.toString() === formAngsuran.idPinjaman);
                  if (!selected) return null;
                  const denda = Math.floor(selected.jumlah * 0.03 / 30 * parseInt(formAngsuran.hariTerlambat));
                  return <div style={{marginTop:8, color: "#e74c3c", fontWeight: 600}}>Denda: {formatRupiahNum(denda)}</div>;
                })()}
                </div>
                {formAngsuran.angsuranPokok && formAngsuran.angsuranBunga && (
                  <div style={{ background: "#e8f5e9", padding: 16, borderRadius: 8, marginBottom: 24 }}>
                    <div style={{fontSize:14,marginBottom:8}}>Total Pembayaran:</div>
                    <div style={{fontSize:24,fontWeight:700,color:"#27ae60"}}>
                      {formatRupiahNum(
                        (parseInt(formAngsuran.angsuranPokok.replace(/\D/g,""))||0) + 
                        (parseInt(formAngsuran.angsuranBunga.replace(/\D/g,""))||0) + 
                        ((formAngsuran.idPinjaman && parseInt(formAngsuran.hariTerlambat) > 0) ? Math.floor((pinjaman.find(p=>p.id.toString()===formAngsuran.idPinjaman)?.jumlah||0) * 0.03 / 30 * parseInt(formAngsuran.hariTerlambat)) : 0)
                      )}
                    </div>
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{width:"100%"}}>💳 Simpan</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}