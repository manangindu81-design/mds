"use client";
import { useState } from "react";
import Link from "next/link";
import { useData } from "../context/DataContext";

const laporanTypes = [
  { 
    id: "neraca", 
    title: "Neraca", 
    subtitle: "Laporan Posisi Keuangan",
    icon: "⚖️",
    color: "#1B4D3E" 
  },
  { 
    id: "phu", 
    title: "Perhitungan Hasil Usaha", 
    subtitle: "PHU",
    icon: "📈",
    color: "#2D7A5F" 
  },
  { 
    id: "kas", 
    title: "Laporan Arus Kas", 
    subtitle: "Cash Flow",
    icon: "💵",
    color: "#D4AF37" 
  },
  { 
    id: "ekuitas", 
    title: "Laporan Perubahan Ekuitas", 
    subtitle: "Modal",
    icon: "📊",
    color: "#0A2E25" 
  },
  { 
    id: "calk", 
    title: "Catatan atas Laporan Keuangan", 
    subtitle: "CaLK",
    icon: "📒",
    color: "#1B4D3E" 
  },
  { 
    id: "promosi", 
    title: "Laporan Promosi Ekonomi Anggota", 
    subtitle: "Kesejahteraan Anggota",
    icon: "🤝",
    color: "#2D7A5F" 
  },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function LaporanPage() {
  const [activeReport, setActiveReport] = useState("neraca");
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => 2023 + i);
  const [periode, setPeriode] = useState(String(currentYear));
  const { anggota, simpanan, pinjaman, angsuran, transaksi } = useData();
  
  // === RATE BUNGA SIMPANAN (PER TAON) ===
  const RATE_SIBUHAR = 0.03; // 3%
  const RATE_SIMAPAN = 0.05; // 5%
  const RATE_SIHAT = 0.06; // 6%
  const RATE_SIHAR = 0.04; // 4%
  
  // === SIMPANAN (KEWAJIBAN) ===
  const simpananPokok = simpanan.filter(s => s.jenisSimpanan === "pokok").reduce((acc, s) => acc + s.jumlah, 0);
  const simpananWajib = simpanan.filter(s => s.jenisSimpanan === "wajib").reduce((acc, s) => acc + s.jumlah, 0);
  const simpananSibuhar = simpanan.filter(s => s.jenisSimpanan === "sibuhar").reduce((acc, s) => acc + s.jumlah, 0);
  const simpananSimapan = simpanan.filter(s => s.jenisSimpanan === "simapan").reduce((acc, s) => acc + s.jumlah, 0);
  const simpananSihat = simpanan.filter(s => s.jenisSimpanan === "sihat").reduce((acc, s) => acc + s.jumlah, 0);
  const simpananSihar = simpanan.filter(s => s.jenisSimpanan === "sihar").reduce((acc, s) => acc + s.jumlah, 0);
  const simpananBerjangka = simpanan.filter(s => s.jenisSimpanan === "berjangka").reduce((acc, s) => acc + s.jumlah, 0);
  const totalSimpanan = simpanan.reduce((acc, s) => acc + s.jumlah, 0);
  
  // === HITUNG BEBAN BUNGA SIMPANAN (Per Tahun) ===
  const bebanBungaSibuhar = simpananSibuhar * RATE_SIBUHAR;
  const bebanBungaSimapan = simpananSimapan * RATE_SIMAPAN;
  const bebanBungaSihat = simpananSihat * RATE_SIHAT;
  const bebanBungaSihar = simpananSihar * RATE_SIHAR;
  const totalBebanBungaSimpanan = bebanBungaSibuhar + bebanBungaSimapan + bebanBungaSihat + bebanBungaSihar;
  
  // === PINJAMAN (ASET) ===
  const totalPinjamanDisetujui = pinjaman.filter(p => p.status === "Disetujui").reduce((acc, p) => acc + p.jumlah, 0);
  const totalPinjamanBerjalan = totalPinjamanDisetujui - angsuran.reduce((acc, a) => acc + a.totalBayar, 0);
  const totalPiutang = totalPinjamanBerjalan > 0 ? totalPinjamanBerjalan : 0;
  
  // === ANGSURAN & PENDAPATAN ===
  const totalAngsuran = angsuran.reduce((acc, a) => acc + a.totalBayar, 0);
  const totalBungaPinjaman = angsuran.reduce((acc, a) => acc + a.angsuranBunga, 0);
  const totalDenda = angsuran.reduce((acc, a) => acc + a.denda, 0);
  
  // === BIAYA ADMIN PINJAMAN ===
  const totalBiayaAdmin = pinjaman.filter(p => p.status === "Disetujui").reduce((acc, p) => acc + (p.biayaAdmin || 0), 0);
  
  // === PENDAPATAN USAHA ===
  const pendapatanBunga = totalBungaPinjaman;
  const pendapatanAdmin = totalBiayaAdmin;
  const pendapatanDenda = totalDenda;
  const totalPendapatan = pendapatanBunga + pendapatanAdmin + pendapatanDenda;
  
   // === KAS & BANK (ASET LANCAR) ===
   // Cash: net of debet and kredit
   const kasDebet = transaksi.filter(t => t.akun === "Kas").reduce((acc, t) => acc + (t.debet || 0), 0);
   const kasKredit = transaksi.filter(t => t.akun === "Kas").reduce((acc, t) => acc + (t.kredit || 0), 0);
   const saldoKas = kasDebet - kasKredit;
   
   // Bank accounts: only debet (deposits) as withdrawals use cash
   const bankBRITigabinanga = transaksi.filter(t => t.akun === "Bank BRI Cab. Tigabinanga").reduce((acc, t) => acc + (t.debet || 0), 0);
   const bankBRIBerastagi = transaksi.filter(t => t.akun === "Bank BRI Cab. Berastagi").reduce((acc, t) => acc + (t.debet || 0), 0);
   const bankBPRLogoAsri = transaksi.filter(t => t.akun === "Bank BPR Logo Asri").reduce((acc, t) => acc + (t.debet || 0), 0);
   const totalBank = bankBRITigabinanga + bankBRIBerastagi + bankBPRLogoAsri;
    const totalKasBank = saldoKas + totalBank;
   
    // === LAPORAN ARUS KAS (CASH FLOW) ===
    // Aktivitas Operasi: penerimaan bunga/admin/denda (Kas debet), pengeluaran beban bunga simpanan (Kas kredit)
    const arusOperasiMasuk = transaksi
      .filter(t => t.akun === "Kas" && (t.debet || 0) > 0 && (
        t.kategori?.includes("Bunga Pinjaman") ||
        t.kategori?.includes("Admin") ||
        t.kategori?.includes("Denda")
      ))
      .reduce((acc, t) => acc + (t.debet || 0), 0);
    
    const arusOperasiKeluar = transaksi
      .filter(t => t.akun === "Kas" && (t.kredit || 0) > 0 && (
        t.kategori?.includes("Beban") ||
        t.kategori?.includes("Bunga Simpanan")
      ))
      .reduce((acc, t) => acc + (t.kredit || 0), 0);
    
    const netOperasi = arusOperasiMasuk - arusOperasiKeluar;
    
    // Aktivitas Investasi: biasanya 0 (KSP tidak ada pembelian aset tetap signifikan)
    const netInvestasi = 0;
    
    // Aktivitas Pendanaan: setoran simpanan (masuk), penarikan & pencairan pinjaman (keluar)
    const arusPendanaanMasuk = transaksi
      .filter(t => t.akun === "Kas" && (t.debet || 0) > 0 && (
        t.kategori?.includes("Setoran Simpanan") ||
        t.kategori?.includes("Pendapatan Pengunduran")
      ))
      .reduce((acc, t) => acc + (t.debet || 0), 0);
    
    const arusPendanaanKeluar = transaksi
      .filter(t => t.akun === "Kas" && (t.kredit || 0) > 0 && (
        t.kategori?.includes("Penarikan") ||
        t.kategori?.includes("Pencairan Pinjaman")
      ))
      .reduce((acc, t) => acc + (t.kredit || 0), 0);
    
    const netPendanaan = arusPendanaanMasuk - arusPendanaanKeluar;
    const netCashChange = netOperasi + netInvestasi + netPendanaan;
    const saldoAwal = totalKasBank - netCashChange;
    const saldoAkhir = totalKasBank;
   
   // === SHU (SISA HASIL USAHA) ===
  // Beban = Beban Bunga Simpanan + Beban Operasional (jika ada input pengeluaran)
  const totalBeban = totalBebanBungaSimpanan; // Nanti bisa ditambah beban operasional
  const shuSebelumPajak = totalPendapatan - totalBeban;
  const shuSetelahPajak = shuSebelumPajak * 0.25; // Asumsi pajak 25%
  const shuBersih = shuSebelumPajak - (shuSebelumPajak * 0.25);
  
   // === VALIDASI NERACA (BALANCE CHECK) ===
   // Total Aset (Sisi Kiri) = Kas + Bank + Piutang
   const totalAset = totalKasBank + totalPiutang;
   
   // Kewajiban (Liabilities): Simpanan Berjangka-type (sibuhar, simapan, sihat, sihar, berjangka)
   const totalKewajiban = simpananSibuhar + simpananSimapan + simpananSihat + simpananSihar + simpananBerjangka;
   
   // Ekuitas (Equity): Modal Pokok + Modal Wajib + SHU
   const totalEkuitas = simpananPokok + simpananWajib + shuBersih;
   
   const totalKanan = totalKewajiban + totalEkuitas;
   
   // Check balance
   const selisih = totalAset - totalKanan;
   const isBalance = Math.abs(selisih) < 1; // Allow rounding diff

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }} className="no-print">
      {/* Sidebar */}
      <aside style={{ width: 260, background: "#1B4D3E", color: "white", padding: "24px 0", position: "fixed", height: "100vh" }} className="no-print">
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "white" }}>
            <span style={{ fontSize: 28 }}>🏛️</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>KSP Mulia</div>
              <div style={{ fontSize: 10, color: "#D4AF37", letterSpacing: 1 }}>Dana Sejahtera</div>
            </div>
          </Link>
        </div>

        <nav style={{ padding: "0 12px" }}>
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 12, padding: "0 16px" }}>LAPORAN KEUANGAN</div>
          {laporanTypes.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveReport(item.id)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                width: "100%", 
                padding: "12px 16px", 
                background: activeReport === item.id ? "rgba(255,255,255,0.15)" : "none",
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
              <span>{item.title}</span>
            </button>
          ))}
        </nav>

        <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
          <Link href="/" style={{ display: "block", padding: "12px", background: "rgba(255,255,255,0.1)", borderRadius: 8, textAlign: "center", textDecoration: "none", color: "white", fontSize: 14 }}>
            ← Menu Utama
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 260, padding: 24 }}>
        {/* Header */}
        <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="no-print">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a" }}>
              {laporanTypes.find(l => l.id === activeReport)?.title}
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              {laporanTypes.find(l => l.id === activeReport)?.subtitle}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <select 
              value={periode} 
              onChange={(e) => setPeriode(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: 8, border: "2px solid #e5e7eb", fontSize: 14, background: "white" }}
            >
              {yearOptions.map(year => (
                <option key={year} value={String(year)}>{year}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => window.print()} style={{ padding: "10px 20px", background: "#1B4D3E", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500 }}>
                🖨️ Cetak Langsung
              </button>
              <button onClick={() => alert("Untuk Export PDF: Gunakan fiturCetak (Ctrl+P) lalu pilih 'Simpan sebagai PDF' pada browser.")} style={{ padding: "10px 20px", background: "#6b7280", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500 }}>
                📄 Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          
          {/* NERACA */}
          {activeReport === "neraca" && (
            <div style={{ padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>NERACA (LAPORAN POSISI KEUANGAN)</h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Per {periode} Desember</p>
              </div>
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>ASET</th>
                    <th style={{ textAlign: "right", padding: 12, borderBottom: "2px solid #374151" }}> jumlah</th>
                  </tr>
                </thead>
                 <tbody>
                   <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>ASET LANCAR</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Kas</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(saldoKas)}</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Bank</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(totalBank)}</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Piutang Anggota (Pinjaman Berjalan)</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(totalPiutang)}</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Piutang Bukan Anggota</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Beban Dibayar Dimuka</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td colSpan={2} style={{ padding: "12px 0 8px", fontWeight: 600 }}>ASET TETAP</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Inventaris</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Akumulasi Penyusutan</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                   <tfoot>
                     <tr style={{ background: "#f9fafb", fontWeight: 700, borderTop: "2px solid #374151" }}>
                       <td style={{ padding: 12 }}>TOTAL ASET</td>
                       <td style={{ textAlign: "right", padding: 12 }}>{formatRupiah(totalKasBank + totalPiutang)}</td>
                     </tr>
                   </tfoot>
                </tbody>
              </table>

               <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32 }}>
                 <tbody>
                   <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>KEWAJIBAN (LIABILITIES)</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Sibuhar (Bunga Harian 3%)</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(simpananSibuhar)}</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Simapan (Masa Depan 5%)</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(simpananSimapan)}</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Sihat (Hari Tua 6%)</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(simpananSihat)}</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Sihar (Hari Raya 4%)</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(simpananSihar)}</td></tr>
                   <tr><td style={{ padding: "8px 12px 8px 24px" }}>Simpanan Berjangka Lainnya</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(simpananBerjangka)}</td></tr>
                   <tfoot>
                     <tr style={{ background: "#f9fafb", fontWeight: 700 }}>
                       <td style={{ padding: 12 }}>JUMLAH KEWAJIBAN</td>
                       <td style={{ textAlign: "right", padding: 12 }}>{formatRupiah(totalKewajiban)}</td>
                     </tr>
                   </tfoot>
                 </tbody>
               </table>

              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32 }}>
                <tbody>
                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>EKUITAS</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Modal Utama</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(simpananPokok)}</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Modal Disclosure</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(totalSimpanan)}</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Cadangan Laba</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Laba/Rugi Tahun Berjalan</td><td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(totalBungaPinjaman)}</td></tr>
                  <tfoot>
                    <tr style={{ background: "#f9fafb", fontWeight: 700 }}>
                      <td style={{ padding: 12 }}>TOTAL EKUITAS</td>
                      <td style={{ textAlign: "right", padding: 12 }}>{formatRupiah(totalSimpanan + totalBungaPinjaman)}</td>
                    </tr>
                    <tr style={{ background: "#374151", color: "white", fontWeight: 700 }}>
                      <td style={{ padding: 12 }}>TOTAL KEWAJIBAN + EKUITAS</td>
                      <td style={{ textAlign: "right", padding: 12 }}>{formatRupiah(totalSimpanan + totalPinjamanDisetujui + totalBungaPinjaman)}</td>
                    </tr>
                  </tfoot>
                </tbody>
              </table>
            </div>
          )}

          {/* PHU */}
          {activeReport === "phu" && (
            <div style={{ padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>PERHITUNGAN HASIL USAHA (PHU)</h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Per {periode} Desember</p>
              </div>
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td colSpan={4} style={{ padding: "12px 0", fontWeight: 600 }}>PENDAPATAN USAHA</td></tr>
                  <tr>
                    <td style={{ padding: "8px 12px 8px 24px" }}>Pendapatan Bunga Pinjaman</td>
                    <td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(totalBungaPinjaman)}</td>
                    <td rowSpan={4} style={{ width: 100 }}></td>
                    <td rowSpan={4}></td>
                  </tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Pendapatan Adm</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Pendapatan Lainnya</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr style={{ background: "#f9fafb", fontWeight: 600, borderTop: "1px solid #374151" }}>
                    <td style={{ padding: 12 }}>JUMLAH PENDAPATAN</td>
                    <td style={{ textAlign: "right", padding: 12 }}>{formatRupiah(totalBungaPinjaman)}</td>
                  </tr>

<tr><td colSpan={4} style={{ padding: "12px 0", fontWeight: 600 }}>BEBAN USAHA</td></tr>
                  <tr>
                    <td style={{ padding: "8px 12px 8px 24px" }}>Beban Bunga Simpanan</td>
                    <td style={{ textAlign: "right", padding: "8px 12px" }}>{formatRupiah(totalBebanBungaSimpanan)}</td>
                    <td rowSpan={4} style={{ width: 100 }}></td>
                    <td rowSpan={4}></td>
                  </tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Beban Operasional</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Beban Penyusutan</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Beban Lainnya</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr style={{ background: "#f9fafb", fontWeight: 600, borderTop: "1px solid #374151" }}>
                    <td style={{ padding: 12 }}>JUMLAH BEBAN</td>
                    <td style={{ textAlign: "right", padding: 12 }}>{formatRupiah(totalBeban)}</td>
                  </tr>

                  <tr style={{ background: "#d4edda", fontWeight: 700, borderTop: "2px solid #374151" }}>
                    <td style={{ padding: 12 }}>SHU SEBELUM PAJAK</td>
                    <td style={{ textAlign: "right", padding: 12 }}>{formatRupiah(shuSebelumPajak)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 12px 8px 24px" }}>Beban Pajak</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td>
                  </tr>
                  <tr style={{ background: "#1B4D3E", color: "white", fontWeight: 700 }}>
                    <td style={{ padding: 12 }}>SHU SETELAH PAJAK</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Pembagian SHU</div>
                  <table style={{ width: "100%", marginTop: 8 }}>
                    <tr><td style={{ padding: "4px 0" }}>Cadangan %</td><td style={{ textAlign: "right" }}>25%</td></tr>
                    <tr><td style={{ padding: "4px 0" }}>Jasa Anggota %</td><td style={{ textAlign: "right" }}>30%</td></tr>
                    <tr><td style={{ padding: "4px 0" }}>Dana Sosial %</td><td style={{ textAlign: "right" }}>5%</td></tr>
                    <tr><td style={{ padding: "4px 0" }}>Dana Pendidikan %</td><td style={{ textAlign: "right" }}>5%</td></tr>
                    <tr><td style={{ padding: "4px 0" }}>Pengurus %</td><td style={{ textAlign: "right" }}>10%</td></tr>
                    <tr><td style={{ padding: "4px 0" }}>Karyawan %</td><td style={{ textAlign: "right" }}>5%</td></tr>
                    <tr><td style={{ padding: "4px 0" }}>Dana Mutual %</td><td style={{ textAlign: "right" }}>20%</td></tr>
                  </table>
                </div>
                <div style={{ background: "#f9fafb", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Keterangan</div>
                  <p style={{ fontSize: 13, marginTop: 8, color: "#374151" }}>
                    SHU dibukkan setelah melalui RAT dan dibagi sesuai ratio yang ditentukan.
                  </p>
                </div>
              </div>
              
              {/* Balance Check Notification */}
              <div style={{ 
                marginTop: 24, 
                padding: 16, 
                borderRadius: 8, 
                background: isBalance ? "#d4edda" : "#f8d7da",
                border: isBalance ? "2px solid #28a745" : "2px solid #dc3545"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{isBalance ? "✅" : "⚠️"}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: isBalance ? "#155724" : "#721c24" }}>
                      {isBalance ? "Neraca Balance!" : "Ada Selisih!"}
                    </div>
                    <div style={{ fontSize: 12, color: isBalance ? "#155724" : "#721c24" }}>
                      Total Aset: {formatRupiah(totalAset)} | Total Kanan: {formatRupiah(totalKanan)} | Selisih: {formatRupiah(selisih)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KAS */}
          {activeReport === "kas" && (
            <div style={{ padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>LAPORAN ARUS KAS</h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Per {periode} Desember</p>
              </div>
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>ARUS KAS DARI AKTIVITAS OPERASI</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Penerimaan Piutang Anggota</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Penerimaan Piutang Bukan Anggota</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Penerimaan Bunga Pinjaman</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Penyaluran Pinjaman</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Pembayaran Beban Operasional</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr style={{ background: "#f9fafb", fontWeight: 600 }}>
                    <td style={{ padding: 12 }}>KAS NET DARI AKTIVITAS OPERASI</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>

                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>ARUS KAS DARI AKTIVITAS INVESTASI</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Pembelian Aktiva</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr style={{ background: "#f9fafb", fontWeight: 600 }}>
                    <td style={{ padding: 12 }}>KAS NET DARI AKTIVITAS INVESTASI</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>

                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>ARUS KAS DARI AKTIVITAS PENDANAAN</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Setoran Simpanan Pokok</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Setoran Simpanan Wajib</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Setoran Simpanan Sukarela</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Pencairan Pinjaman</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr style={{ background: "#f9fafb", fontWeight: 600 }}>
                    <td style={{ padding: 12 }}>KAS NET DARI AKTIVITAS PENDANAAN</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>

                  <tr style={{ background: "#1B4D3E", color: "white", fontWeight: 700, borderTop: "2px solid #374151" }}>
                    <td style={{ padding: 12 }}>KENAIKAN/PENURUNAN NET KAS</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px" }}>Saldo Kas Awal Tahun</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                  <tr style={{ background: "#1B4D3E", color: "white", fontWeight: 700 }}>
                    <td style={{ padding: 12 }}>SALDO KAS AKHIR TAHUN</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* EKUITAS */}
          {activeReport === "ekuitas" && (
            <div style={{ padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>LAPORAN PERUBAHAN EKUITAS</h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Per {periode} Desember</p>
              </div>
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>URAIAN</th>
                    <th style={{ textAlign: "right", padding: 12, borderBottom: "2px solid #374151" }}>Modal Utama</th>
                    <th style={{ textAlign: "right", padding: 12, borderBottom: "2px solid #374151" }}>Cadangan</th>
                    <th style={{ textAlign: "right", padding: 12, borderBottom: "2px solid #374151" }}>SHU</th>
                    <th style={{ textAlign: "right", padding: 12, borderBottom: "2px solid #374151" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 12 }}>Saldo Awal</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12 }}>SetoranModal Baru</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12 }}>PenarikanModal</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12 }}>Cadangan Penguatan</td>
                    <td style={{ textAlign: "right", padding: 12 }}>-</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12 }}>SHU Tahun Berjalan</td>
                    <td style={{ textAlign: "right", padding: 12 }}>-</td>
                    <td style={{ textAlign: "right", padding: 12 }}>-</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 12 }}>Pembagian SHU</td>
                    <td style={{ textAlign: "right", padding: 12 }}>-</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>(Rp 0)</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                  <tr style={{ background: "#f9fafb", fontWeight: 700, borderTop: "2px solid #374151" }}>
                    <td style={{ padding: 12 }}>Saldo Akhir</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                    <td style={{ textAlign: "right", padding: 12 }}>Rp 0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* CaLK */}
          {activeReport === "calk" && (
            <div style={{ padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>CATATAN ATAS LAPORAN KEUANGAN</h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Per {periode} Desember</p>
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>1. PENDAHULUAN</h3>
                <p style={{ fontSize: 14, color: "#374151", paddingLeft: 16, lineHeight: 1.8 }}>
                  KSP Mulia Dana Sejahtera adalah Koperasi Simpan Pinjam yang didirikan berdasarkan Akta Pendirian No. ... tanggal ... dan telah mendapat pengesahan dari Kepala Dinas setempat.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>2. KEBIJAKAN AKUNTANSI</h3>
                <p style={{ fontSize: 14, color: "#374151", paddingLeft: 16, lineHeight: 1.8 }}>
                  Kebijakan akuntansi yang diterapkan meliputi basis akrual, penilaian aset dan kewajiban berdasarkan biaya historis, serta penyusutan menggunakan metode garis lurus.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>3. KAS DAN SETARA KAS</h3>
                 <table style={{ width: "100%", marginLeft: 16 }}>
                   <tr><td style={{ padding: "8px 0" }}>Kas Tunai</td><td style={{ textAlign: "right" }}>{formatRupiah(saldoKas)}</td></tr>
                   <tr><td style={{ padding: "8px 0" }}>Bank BRI Cab. Tigabinanga</td><td style={{ textAlign: "right" }}>{formatRupiah(bankBRITigabinanga)}</td></tr>
                   <tr><td style={{ padding: "8px 0" }}>Bank BRI Cab. Berastagi</td><td style={{ textAlign: "right" }}>{formatRupiah(bankBRIBerastagi)}</td></tr>
                   <tr><td style={{ padding: "8px 0" }}>Bank BPR Logo Asri</td><td style={{ textAlign: "right" }}>{formatRupiah(bankBPRLogoAsri)}</td></tr>
                   <tr style={{ fontWeight: 600 }}><td style={{ padding: "8px 0" }}>Jumlah</td><td style={{ textAlign: "right" }}>{formatRupiah(totalKasBank)}</td></tr>
                 </table>
              </div>

               <div style={{ marginBottom: 24 }}>
                 <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>4. PIUTANG</h3>
                 <table style={{ width: "100%", marginLeft: 16 }}>
                   <tr><td style={{ padding: "8px 0" }}>Piutang Anggota</td><td style={{ textAlign: "right" }}>{formatRupiah(totalPiutang)}</td></tr>
                   <tr><td style={{ padding: "8px 0" }}>Piutang Bukan Anggota</td><td style={{ textAlign: "right" }}>Rp 0</td></tr>
                   <tr><td style={{ padding: "8px 0" }}>Penyisihan Piutang</td><td style={{ textAlign: "right" }}>(Rp 0)</td></tr>
                   <tr style={{ fontWeight: 600 }}><td style={{ padding: "8px 0" }}>Jumlah Neto</td><td style={{ textAlign: "right" }}>{formatRupiah(totalPiutang)}</td></tr>
                 </table>
               </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>5. SIMPANAN ANGGOTA</h3>
                <table style={{ width: "100%", marginLeft: 16 }}>
                  <tr><td style={{ padding: "8px 0" }}>Simpanan Pokok</td><td style={{ textAlign: "right" }}>{formatRupiah(simpananPokok)}</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Simpanan Wajib</td><td style={{ textAlign: "right" }}>{formatRupiah(simpananWajib)}</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Sibuhar (Bunga Harian 3%)</td><td style={{ textAlign: "right" }}>{formatRupiah(simpananSibuhar)}</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Simapan (Masa Depan 5%)</td><td style={{ textAlign: "right" }}>{formatRupiah(simpananSimapan)}</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Sihat (Hari Tua 6%)</td><td style={{ textAlign: "right" }}>{formatRupiah(simpananSihat)}</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Sihar (Hari Raya 4%)</td><td style={{ textAlign: "right" }}>{formatRupiah(simpananSihar)}</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Simpanan Berjangka</td><td style={{ textAlign: "right" }}>{formatRupiah(simpananBerjangka)}</td></tr>
                  <tr style={{ fontWeight: 600 }}><td style={{ padding: "8px 0" }}>Jumlah</td><td style={{ textAlign: "right" }}>{formatRupiah(totalSimpanan)}</td></tr>
                </table>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>6. PINJAMAN ANGGOTA</h3>
                <table style={{ width: "100%", marginLeft: 16 }}>
                  <tr><td style={{ padding: "8px 0" }}>Pinjaman Biasa</td><td style={{ textAlign: "right" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Pinjaman Investasi</td><td style={{ textAlign: "right" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Pinjaman Konsumsi</td><td style={{ textAlign: "right" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 0" }}>Bunga Accrued</td><td style={{ textAlign: "right" }}>Rp 0</td></tr>
                  <tr style={{ fontWeight: 600 }}><td style={{ padding: "8px 0" }}>Jumlah</td><td style={{ textAlign: "right" }}>Rp 0</td></tr>
                </table>
              </div>
            </div>
          )}

          {/* PROMOSI */}
          {activeReport === "promosi" && (
            <div style={{ padding: 32 }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>LAPORAN PROMOSI EKONOMI ANGGOTA</h2>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Per {periode} Desember</p>
              </div>
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>A. SHU YANG DIBAGIKAN</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>SHU Dialokasikan</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>

                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>B. JASA ANGGOTA</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Jasa Transaksi Pinjaman</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Jasa Transaksi Simpanan</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Jasa Transaksi Anggota</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>

                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>C. BANTUAN SOSIAL</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Bantuan Pendidikan</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Bantuan Kesehatan</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Bantuan Sosial Lain</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>

                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>D. PENDIDIKAN ANGGOTA</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Pelatihan</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Sertifikasi</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>

                  <tr><td colSpan={2} style={{ padding: "12px 0", fontWeight: 600 }}>E. SERVICES TO MEMBERS</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Diskon Adm Pinjaman</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                  <tr><td style={{ padding: "8px 12px 8px 24px" }}>Bunga Simpanan Tinggi</td><td style={{ textAlign: "right", padding: "8px 12px" }}>Rp 0</td></tr>
                </tbody>
              </table>

              <div style={{ marginTop: 32, background: "#f9fafb", padding: 16, borderRadius: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Catatan</h3>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  Laporan Promosi Ekonomi Anggota merupakan pertanggungjawaban pengurus dalam upaya meningkatkan kesejahteraan anggota melalui distribusi SHU dan program-program lainnya.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}