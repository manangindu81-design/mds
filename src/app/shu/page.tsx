"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useData, Pengurus, Pengawas, Karyawan } from "../context/DataContext";
import Letterhead from "../components/Letterhead";

// SHU Allocation categories with percentages
const SHU_ALLOCATIONS = [
  { key: "cadangan_umum", label: "Dana Cadangan Umum", percentage: 5 },
  { key: "cadangan_resiko", label: "Dana Cadangan Resiko", percentage: 5 },
  { key: "jasa_modal", label: "Jasa Modal", percentage: 55 },
  { key: "jasa_transaksi", label: "Jasa Transaksi", percentage: 20 },
  { key: "pengurus_pengawas", label: "Dana Pengurus/Pengawas", percentage: 5 },
  { key: "kesejahteraan_karyawan", label: "Dana Kesejahteraan Karyawan", percentage: 5 },
  { key: "pendidikan", label: "Dana Pendidikan", percentage: 2 },
  { key: "sosial", label: "Dana Sosial", percentage: 2 },
  { key: "pembangunan_daerah", label: "Dana Pembangunan Daerah Kerja", percentage: 1 },
] as const;

interface AllocationBreakdown {
  category: string;
  label: string;
  percentage: number;
  amount: number;
}

export default function SHUPage() {
  const { anggota, simpanan, transaksi, pinjaman, angsuran, pengurus, pengawas, karyawan } = useData();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const startYear = 2023;
    const result: number[] = [];
    for (let y = startYear; y <= currentYear; y++) {
      result.push(y);
    }
    return result.sort((a, b) => b - a);
  }, [currentYear]);

   const shuCalculation = useMemo(() => {
     const yearStr = String(selectedYear);
     
     // Helper to extract 4-digit year from date string (supports YYYY-MM-DD, DD/MM/YYYY, etc.)
     const extractYear = (dateStr: string): string | null => {
       const match = dateStr.match(/\d{4}/);
       return match ? match[0] : null;
     };
     
     // Filter transaksi untuk tahun terpilih
     const yearlyTransaksi = (transaksi || []).filter(t => {
       const tgl = t.tanggal;
       if (!tgl) return false;
       const year = extractYear(tgl);
       return year === yearStr;
     });

     console.log(`[SHU ${selectedYear}] Total transaksi tahun ini:`, yearlyTransaksi.length);
     if (yearlyTransaksi.length > 0) {
       console.log('[SHU] Sample transaksi:', yearlyTransaksi.slice(0, 3).map(t => ({
         tanggal: t.tanggal,
         akun: t.akun,
         kategori: t.kategori,
         uraian: t.uraian,
         debet: t.debet,
         kredit: t.kredit
       })));
     }

     let totalBunga = 0;    // Interest income from loans
     let totalAdmin = 0;    // Admin fees
     let totalDenda = 0;    // Penalties/fines
     let totalBiaya = 0;    // Operating expenses

     // Income from transaksi entries
     yearlyTransaksi.forEach(t => {
       const akun = (t.akun || "").toLowerCase();
       const kategori = (t.kategori || "").toLowerCase();
       const uraian = (t.uraian || "").toLowerCase();
       const debet = t.debet || 0;
       const kredit = t.kredit || 0;

       // Income detection: check for keywords in akun, kategori, uraian
       const hasBunga = akun.includes("bunga") || kategori.includes("bunga") || uraian.includes("bunga");
       const hasAdmin = akun.includes("admin") || kategori.includes("admin") || uraian.includes("admin");
       const hasDenda = akun.includes("denda") || kategori.includes("denda") || uraian.includes("denda");
       const hasPendapatan = akun.includes("pendapatan") || kategori.includes("pendapatan") || uraian.includes("pendapatan");

       // Expense detection
       const hasBeban = akun.includes("beban") || kategori.includes("beban") || uraian.includes("beban");
       const hasBiaya = akun.includes("biaya") || kategori.includes("biaya") || uraian.includes("biaya");

       // Classify income (kredit side)
       if (hasPendapatan || hasBunga || hasAdmin || hasDenda) {
         if (hasBunga) {
           totalBunga += kredit;
         } else if (hasAdmin) {
           totalAdmin += kredit;
         } else if (hasDenda) {
           totalDenda += kredit;
         } else {
           // Other income default to Bunga (or you could add separate category)
           totalBunga += kredit;
         }
       }

       // Classify expense (debet side)
       if (hasBeban || hasBiaya) {
         totalBiaya += debet;
       }
     });

     // Income from angsuran (interest + penalties) — these are already part of loan repayments
     const yearlyAngsuran = (angsuran || []).filter(a => {
       const tgl = a.tanggal;
       if (!tgl) return false;
       const year = extractYear(tgl);
       return year === yearStr;
     });

     let angsuranBungaTotal = 0;
     let angsuranDendaTotal = 0;
     yearlyAngsuran.forEach(a => {
       angsuranBungaTotal += (a.angsuranBunga || 0);
       angsuranDendaTotal += (a.denda || 0);
     });
     totalBunga += angsuranBungaTotal;
     totalDenda += angsuranDendaTotal;

     // Income from loan admin fees (one-time at disbursement) — use pinjaman.tanggalRealisasi
     const yearlyPinjaman = (pinjaman || []).filter(p => {
       const tgl = p.tanggalRealisasi;
       if (!tgl) return false;
       const year = extractYear(tgl);
       return year === yearStr;
     });
     let pinjamanAdminTotal = 0;
     yearlyPinjaman.forEach(p => {
       pinjamanAdminTotal += (p.biayaAdmin || 0);
     });
     totalAdmin += pinjamanAdminTotal;

     const totalPendapatan = totalBunga + totalAdmin + totalDenda;
     const shuBersih = totalPendapatan - totalBiaya;

     console.log(`[SHU ${selectedYear}] Bunga: ${totalBunga}, Admin: ${totalAdmin}, Denda: ${totalDenda}, Beban: ${totalBiaya}, SHU Bersih: ${shuBersih}`);

     return {
       totalBunga,
       totalAdmin,
       totalDenda,
       totalPendapatan,
       totalBiaya,
       shuBersih
     };
   }, [selectedYear, transaksi, angsuran, pinjaman]);

   // Calculate SHU allocation breakdown
   const allocationBreakdown = useMemo((): AllocationBreakdown[] => {
     const shuBersih = shuCalculation.shuBersih;
     if (shuBersih <= 0) {
       return SHU_ALLOCATIONS.map(alloc => ({
         category: alloc.key,
         label: alloc.label,
         percentage: alloc.percentage,
         amount: 0
       }));
     }
     return SHU_ALLOCATIONS.map(alloc => ({
       category: alloc.key,
       label: alloc.label,
       percentage: alloc.percentage,
       amount: Math.round(shuBersih * (alloc.percentage / 100))
     }));
   }, [shuCalculation.shuBersih]);

   // Personnel allocation: split Pengurus/Pengawas (5%) and Karyawan (5%) among individuals
   const personnelAllocation = useMemo(() => {
     const shuBersih = shuCalculation.shuBersih;
     if (shuBersih <= 0) return { pengurus: [], pengawas: [], karyawan: [] };

     const pengurusList = pengurus || [];
     const pengawasList = pengawas || [];
     const karyawanList = karyawan || [];

     // Find allocation amounts
     const pengurusPengawasAlloc = allocationBreakdown.find(a => a.category === "pengurus_pengawas");
     const kesejahteraanKaryawanAlloc = allocationBreakdown.find(a => a.category === "kesejahteraan_karyawan");

     const pengurusPengawasAmount = pengurusPengawasAlloc?.amount || 0;
     const kesejahteraanKaryawanAmount = kesejahteraanKaryawanAlloc?.amount || 0;

     const totalPengurusPengawas = pengurusList.length + pengawasList.length;
     const totalKaryawan = karyawanList.length;

     // Split equally
     const perPengurusPengawas = totalPengurusPengawas > 0 ? Math.round(pengurusPengawasAmount / totalPengurusPengawas) : 0;
     const perKaryawan = totalKaryawan > 0 ? Math.round(kesejahteraanKaryawanAmount / totalKaryawan) : 0;

     return {
       pengurus: pengurusList.map((p: Pengurus) => ({ ...p, alokasi: perPengurusPengawas })),
       pengawas: pengawasList.map((p: Pengawas) => ({ ...p, alokasi: perPengurusPengawas })),
       karyawan: karyawanList.map((k: Karyawan) => ({ ...k, alokasi: perKaryawan }))
     };
   }, [shuCalculation.shuBersih, pengurus, pengawas, karyawan, allocationBreakdown]);

  // Calculate SHU per anggota with full allocation breakdown
  const shuDistribution = useMemo(() => {
    if (!anggota || anggota.length === 0) return [];
    
    const anggotaList = anggota || [];
    const simpananList = simpanan || [];
    
    // Derive total SHU from allocationBreakdown sum
    const totalSHU = allocationBreakdown.reduce((sum, a) => sum + a.amount, 0);
    if (totalSHU <= 0) return [];
    
    // Create allocation map for quick lookup
    const allocationMap = new Map<string, {label: string, percentage: number, amount: number}>();
    allocationBreakdown.forEach(alloc => {
      allocationMap.set(alloc.category, {
        label: alloc.label,
        percentage: alloc.percentage,
        amount: alloc.amount
      });
    });

    // Calculate total simpanan per anggota
    const anggotaSimpananMap = new Map<number, number>();
    
    anggotaList.forEach((a: any) => {
      const total = simpananList
        .filter((s: any) => s.idAnggota === a.id && s.jumlah > 0)
        .reduce((sum: number, s: any) => sum + s.jumlah, 0);
      anggotaSimpananMap.set(a.id, total);
    });

    const totalSimpananSemua = Array.from(anggotaSimpananMap.values()).reduce((sum, val) => sum + val, 0);

    const distribution: any[] = [];
    if (totalSimpananSemua > 0) {
      anggotaList.forEach((a: any) => {
        const simpananAnggota = anggotaSimpananMap.get(a.id) || 0;
        const proporsi = simpananAnggota / totalSimpananSemua;
        const persentase = proporsi * 100;

        // Calculate allocation breakdown per anggota
        const allocDetail: Record<string, {label: string, percentage: number, totalAmount: number, received: number}> = {};
        let totalTerima = 0;
        
        SHU_ALLOCATIONS.forEach(alloc => {
          const allocData = allocationMap.get(alloc.key);
          const amount = allocData ? allocData.amount : 0;
          const isDistributable = alloc.key === "jasa_modal" || alloc.key === "jasa_transaksi";
          const received = isDistributable ? Math.round(amount * proporsi) : 0;
          
          allocDetail[alloc.key] = {
            label: alloc.label,
            percentage: alloc.percentage,
            totalAmount: amount,
            received
          };
          
          if (isDistributable) {
            totalTerima += received;
          }
        });

        distribution.push({
          id: a.id,
          nomorNBA: a.nomorNBA,
          nama: a.nama,
          simpanan: simpananAnggota,
          proporsi,
          persentase,
          ...allocDetail,
          totalTerima
        });
      });
    }

    return distribution.sort((a, b) => b.totalTerima - a.totalTerima);
  }, [anggota, simpanan, allocationBreakdown]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

   return (
     <div>
       <Letterhead
         title="SISA HASIL USAHA (SHU)"
         subtitle="Perhitungan dan Distribusi SHU"
       />

       <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
         <Link href="/dashboard" style={{ padding: "10px 20px", background: "#1B4D3E", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
           ← Kembali ke Dashboard
         </Link>
       </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 4, color: "#1B4D3E" }}>📅 Tahun Penghitungan SHU</h3>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Pilih tahun untuk menghitung distribusi SHU</p>
          </div>
          <div style={{ minWidth: 200 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 12, color: "#1B4D3E" }}>
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "2px solid #1B4D3E",
                fontSize: 14,
                background: "white",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SHU Calculation Summary */}
      <div style={{
        background: "linear-gradient(135deg, #1B4D3E 0%, #2D7A5F 100%)",
        borderRadius: 16,
        padding: 32,
        color: "white",
        marginBottom: 24,
        boxShadow: "0 8px 32px rgba(27, 77, 62, 0.3)"
      }}>
        <h3 style={{ fontSize: 18, marginBottom: 24, textAlign: "center" }}>
          📊 Ringkasan SHU {selectedYear}
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Total Pendapatan</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {formatRupiah(shuCalculation.totalBunga + shuCalculation.totalAdmin + shuCalculation.totalDenda)}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Bunga Pinjaman</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fbbf24" }}>+{formatRupiah(shuCalculation.totalBunga)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Admin & Penalti</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fbbf24" }}>+{formatRupiah(shuCalculation.totalAdmin + shuCalculation.totalDenda)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>Total Beban</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#f87171" }}>-{formatRupiah(shuCalculation.totalBiaya)}</div>
          </div>
        </div>

        <div style={{
          marginTop: 20,
          padding: 20,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 12,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 13, opacity: 0.9 }}>SHU Bersih (Didistribusikan)</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>
            {formatRupiah(shuCalculation.shuBersih)}
          </div>
        </div>
      </div>

      {/* SHU Allocation Breakdown */}
      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, color: "#1B4D3E", marginBottom: 24 }}>
          📈 Alokasi SHU {selectedYear}
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {allocationBreakdown.map((alloc) => (
            <div key={alloc.category} style={{
              background: alloc.category === "jasa_modal" || alloc.category === "jasa_transaksi" 
                ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              padding: 20,
              borderRadius: 12,
              border: `2px solid ${alloc.category === "jasa_modal" ? "#f59e0b" : alloc.category === "jasa_transaksi" ? "#3b82f6" : "#e5e7eb"}`,
              position: "relative"
            }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {alloc.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1B4D3E", marginBottom: 4 }}>
                {formatRupiah(alloc.amount)}
              </div>
              <div style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: alloc.category === "jasa_modal" || alloc.category === "jasa_transaksi"
                  ? "#f59e0b"
                  : "#1B4D3E",
                color: "white"
              }}>
                {alloc.percentage}%
              </div>
              {alloc.category === "jasa_modal" || alloc.category === "jasa_transaksi" ? (
                <div style={{ fontSize: 10, color: "#92400e", marginTop: 6 }}>
                  {alloc.category === "jasa_modal" 
                    ? "Distribusi ke anggota berdasarkan simpanan"
                    : "Distribusi ke anggota berdasarkan transaksi"
                  }
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 6 }}>
                  Cadangan KSP
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{
          marginTop: 24,
          padding: 20,
          background: "#f0f9ff",
          borderRadius: 12,
          border: "2px solid #1B4D3E"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Jasa ke Anggota</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#059669" }}>
                {formatRupiah(allocationBreakdown.filter(a => a.category === "jasa_modal" || a.category === "jasa_transaksi").reduce((sum, a) => sum + a.amount, 0))}
                 <div style={{ fontSize: 11, fontWeight: 400, color: "#6b7280" }}>
                   (Jasa Modal 55% + Jasa Transaksi 20%)
                 </div>
               </div>
             </div>
             <div>
               <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Cadangan & Dana</div>
               <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>
                 {formatRupiah(allocationBreakdown.filter(a => a.category !== "jasa_modal" && a.category !== "jasa_transaksi").reduce((sum, a) => sum + a.amount, 0))}
                 <div style={{ fontSize: 11, fontWeight: 400, color: "#6b7280" }}>
                   (7 kategori: 25%)
                 </div>
               </div>
             </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total SHU Bersih</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1B4D3E" }}>
                {formatRupiah(shuCalculation.shuBersih)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHU Distribution to Members - Only Jasa Modal & Jasa Transaksi */}
      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, color: "#1B4D3E", marginBottom: 4 }}>📋 Distribusi Jasa ke Anggota</h3>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              Berdasarkan proporsi saldo simpanan (Pokok + Wajib) - Total Jasa 75% dari SHU
            </p>
          </div>
          <div style={{ 
            padding: "8px 16px", 
            background: "#fef3c7", 
            borderRadius: 8, 
            fontSize: 13, 
            fontWeight: 600,
            color: "#92400e"
          }}>
            Total Jasa: {formatRupiah(allocationBreakdown.filter(a => a.category === "jasa_modal" || a.category === "jasa_transaksi").reduce((sum, a) => sum + a.amount, 0))}
          </div>
        </div>

        {shuDistribution.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #ddd", fontSize: 11 }}>#</th>
                  <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #ddd", fontSize: 11 }}>No. NBA</th>
                  <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #ddd", fontSize: 11 }}>Nama</th>
                  <th style={{ padding: 8, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 11, color: "#059669" }}>Simpanan</th>
                  <th style={{ padding: 4, textAlign: "center", borderBottom: "2px solid #ddd", fontSize: 10 }}>Prop</th>
                  {/* Distributable to members */}
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#059669" }}>Jasa<br/>Mod</th>
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#3b82f6" }}>Jasa<br/>Trans</th>
                  {/* KSP reserves - not distributable */}
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#dc2626" }}>Cad<br/>Umum</th>
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#dc2626" }}>Cad<br/>Resiko</th>
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#dc2626" }}>Peng<br/>Pengawas</th>
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#dc2626" }}>Kesej</th>
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#dc2626" }}>Pend</th>
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#dc2626" }}>Sos</th>
                  <th style={{ padding: 4, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 10, color: "#dc2626" }}> Pemb</th>
                  <th style={{ padding: 8, textAlign: "right", borderBottom: "2px solid #ddd", fontSize: 11, color: "#1B4D3E" }}>Total<br/>Terima</th>
                </tr>
              </thead>
              <tbody>
                {shuDistribution.map((item: any, index: number) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 8, color: "#6b7280", fontSize: 11, verticalAlign: "middle" }}>{index + 1}</td>
                    <td style={{ padding: 8, fontFamily: "monospace", fontSize: 11, color: "#1B4D3E", verticalAlign: "middle" }}>
                      {item.nomorNBA}
                    </td>
                    <td style={{ padding: 8, fontWeight: 500, color: "#1f2937", fontSize: 11, verticalAlign: "middle" }}>
                      {item.nama}
                    </td>
                    <td style={{ padding: 8, textAlign: "right", fontWeight: 600, color: "#059669", fontSize: 11, verticalAlign: "middle" }}>
                      {formatRupiah(item.simpanan)}
                    </td>
                    <td style={{ padding: 4, textAlign: "center", verticalAlign: "middle" }}>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        background: "#e0e7ff",
                        color: "#4338ca"
                      }}>
                        {item.persentase.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#059669", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.jasa_modal?.received || 0)}
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#3b82f6", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.jasa_transaksi?.received || 0)}
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#dc2626", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.cadangan_umum?.received || 0)}
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#dc2626", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.cadangan_resiko?.received || 0)}
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#dc2626", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.pengurus_pengawas?.received || 0)}
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#dc2626", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.kesejahteraan_karyawan?.received || 0)}
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#dc2626", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.pendidikan?.received || 0)}
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#dc2626", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.sosial?.received || 0)}
                    </td>
                    <td style={{ padding: 4, textAlign: "right", fontWeight: 500, color: "#dc2626", fontSize: 10, verticalAlign: "middle" }}>
                      {formatRupiah(item.pembangunan_daerah?.received || 0)}
                    </td>
                    <td style={{ padding: 8, textAlign: "right", fontWeight: 700, color: "#1B4D3E", fontSize: 12, verticalAlign: "middle" }}>
                      {formatRupiah(item.totalTerima)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f0f9ff", fontWeight: 600 }}>
                  <td colSpan={3} style={{ padding: 8, textAlign: "right", fontSize: 11 }}>TOTAL</td>
                  <td style={{ padding: 8, textAlign: "right", color: "#059669", fontSize: 11 }}>
                    {formatRupiah(shuDistribution.reduce((sum: number, item: any) => sum + item.simpanan, 0))}
                  </td>
                  <td style={{ padding: 4, textAlign: "center", fontSize: 10 }}>
                    100%
                  </td>
                  {/* Distributable to members */}
                  <td style={{ padding: 4, textAlign: "right", color: "#059669", fontSize: 10 }}>
                    {formatRupiah(allocationBreakdown.find(a => a.category === "jasa_modal")?.amount || 0)}
                  </td>
                  <td style={{ padding: 4, textAlign: "right", color: "#3b82f6", fontSize: 10 }}>
                    {formatRupiah(allocationBreakdown.find(a => a.category === "jasa_transaksi")?.amount || 0)}
                  </td>
                  {/* Non-distributable: show — (KSP reserves) */}
                  <td style={{ padding: 4, textAlign: "right", color: "#dc2626", fontSize: 10 }}>—</td>
                  <td style={{ padding: 4, textAlign: "right", color: "#dc2626", fontSize: 10 }}>—</td>
                  <td style={{ padding: 4, textAlign: "right", color: "#dc2626", fontSize: 10 }}>—</td>
                  <td style={{ padding: 4, textAlign: "right", color: "#dc2626", fontSize: 10 }}>—</td>
                  <td style={{ padding: 4, textAlign: "right", color: "#dc2626", fontSize: 10 }}>—</td>
                  <td style={{ padding: 4, textAlign: "right", color: "#dc2626", fontSize: 10 }}>—</td>
                  <td style={{ padding: 8, textAlign: "right", color: "#1B4D3E", fontSize: 12 }}>
                    {formatRupiah(allocationBreakdown.filter(a => a.category === "jasa_modal" || a.category === "jasa_transaksi").reduce((sum, a) => sum + a.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 64, background: "#f9fafb", borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <p style={{ color: "#6b7280", fontSize: 14 }}>Tidak ada data distribusi SHU untuk tahun {selectedYear}.</p>
            <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 8 }}>
              SHU Bersih harus lebih dari 0 dan ada anggota dengan simpanan.
            </p>
          </div>
        )}
      </div>

      {/* Personnel SHU Allocation */}
      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 32 }}>👥</span>
          <div>
            <h3 style={{ fontSize: 18, color: "#1B4D3E", marginBottom: 4 }}>📋 Alokasi SHU ke Personel</h3>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              Distribusi Dana Pengurus/Pengawas (5%) dan Dana Kesejahteraan Karyawan (5%)
            </p>
          </div>
        </div>

        {(personnelAllocation.pengurus.length > 0 || personnelAllocation.pengawas.length > 0 || personnelAllocation.karyawan.length > 0) ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {/* Pengurus & Pengawas */}
            {personnelAllocation.pengurus.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#dc2626", marginBottom: 12, borderBottom: "2px solid #dc2626", paddingBottom: 8 }}>
                  Dana Pengurus/Pengawas (5%)
                </h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <tbody>
                    {personnelAllocation.pengurus.map((p) => (
                      <tr key={`pengurus-${p.id}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: 8, fontWeight: 500, color: "#1f2937" }}>{p.jabatan}</td>
                        <td style={{ padding: 8, color: "#374151" }}>{p.nama} {p.gelar ? `(${p.gelar})` : ""}</td>
                        <td style={{ padding: 8, textAlign: "right", fontWeight: 600, color: "#059669" }}>
                          {formatRupiah(p.alokasi)}
                        </td>
                      </tr>
                    ))}
                    {personnelAllocation.pengawas.map((p) => (
                      <tr key={`pengawas-${p.id}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: 8, fontWeight: 500, color: "#1f2937" }}>{p.jabatan}</td>
                        <td style={{ padding: 8, color: "#374151" }}>{p.nama} {p.gelar ? `(${p.gelar})` : ""}</td>
                        <td style={{ padding: 8, textAlign: "right", fontWeight: 600, color: "#059669" }}>
                          {formatRupiah(p.alokasi)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "#f0fdf4", fontWeight: 600 }}>
                      <td colSpan={2} style={{ padding: 8, textAlign: "right", color: "#059669" }}>Total</td>
                      <td style={{ padding: 8, textAlign: "right", color: "#059669" }}>
                        {formatRupiah(
                          personnelAllocation.pengurus.reduce((sum, p) => sum + p.alokasi, 0) +
                          personnelAllocation.pengawas.reduce((sum, p) => sum + p.alokasi, 0)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Karyawan */}
            {personnelAllocation.karyawan.length > 0 && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#2563eb", marginBottom: 12, borderBottom: "2px solid #2563eb", paddingBottom: 8 }}>
                  Dana Kesejahteraan Karyawan (5%)
                </h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <tbody>
                    {personnelAllocation.karyawan.map((k) => (
                      <tr key={`karyawan-${k.id}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: 8, fontWeight: 500, color: "#1f2937" }}>{k.jabatan}</td>
                        <td style={{ padding: 8, color: "#374151" }}>{k.nama}</td>
                        <td style={{ padding: 8, textAlign: "right", fontWeight: 600, color: "#059669" }}>
                          {formatRupiah(k.alokasi)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "#f0fdf4", fontWeight: 600 }}>
                      <td colSpan={2} style={{ padding: 8, textAlign: "right", color: "#059669" }}>Total</td>
                      <td style={{ padding: 8, textAlign: "right", color: "#059669" }}>
                        {formatRupiah(personnelAllocation.karyawan.reduce((sum, k) => sum + k.alokasi, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 32, background: "#f9fafb", borderRadius: 12 }}>
            <p style={{ color: "#6b7280", fontSize: 13 }}>Data personel (pengurus, pengawas, karyawan) belum lengkap atau SHU Bersih masih 0.</p>
          </div>
        )}

        {/* Summary note */}
        <div style={{ marginTop: 20, padding: 16, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e", border: "1px solid #fcd34d" }}>
          <strong>Catatan:</strong> Alokasi di atas dibagi secara equal untuk setiap orang. 
          Dana Pengurus/Pengawas (5% dari SHU Bersih) dibagi ke {personnelAllocation.pengurus.length + personnelAllocation.pengawas.length} orang.
          Dana Kesejahteraan Karyawan (5%) dibagi ke {personnelAllocation.karyawan.length} orang.
        </div>
      </div>

      {/* Info Box */}
      <div style={{ background: "#f0f9ff", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginTop: 24 }}>
        <h4 style={{ fontSize: 14, marginBottom: 12, color: "#1e40af" }}>
          ℹ️ Cara Perhitungan & Alokasi SHU
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <strong style={{ fontSize: 12, display: "block", marginBottom: 8 }}>Perhitungan SHU:</strong>
            <ul style={{ fontSize: 12, color: "#6b7280", marginLeft: 20, lineHeight: 1.8 }}>
              <li><strong>Total Pendapatan</strong> = Bunga + Admin + Denda (transaksi {selectedYear})</li>
              <li><strong>Total Beban</strong> = Biaya operasional KSP</li>
              <li><strong>SHU Bersih</strong> = Pendapatan - Beban</li>
            </ul>
          </div>
          <div>
            <strong style={{ fontSize: 12, display: "block", marginBottom: 8 }}>Alokasi SHU:</strong>
            <ul style={{ fontSize: 12, color: "#6b7280", marginLeft: 20, lineHeight: 1.8 }}>
              <li><strong>Jasa Modal (55%)</strong> - Dibagikan ke anggota berdasarkan simpanan</li>
              <li><strong>Jasa Transaksi (20%)</strong> - Dibagikan ke anggota berdasarkan simpanan</li>
               <li><strong>Cadangan & Dana (30%)</strong> - 7 kategori untuk KSP</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 12, background: "#e0e7ff", borderRadius: 8, fontSize: 12 }}>
          <strong>Bagian Anggota (75%):</strong> Dihitung dari proporsi saldo simpanan (Pokok + Wajib). 
          Setiap anggota mendapat SHU = Total Jasa × (Saldo Simpanan Anggota ÷ Total Simpanan Semua Anggota)
        </div>
      </div>
    </div>
  );
}
