"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "../context/DataContext";

export default function SHUPage() {
  const { anggota, simpanan, transaksi } = useData();
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
    
    // Filter transaksi untuk tahun terpilih
    const yearlyTransaksi = (transaksi || []).filter(t => {
      const tgl = t.tanggal;
      return tgl && tgl.startsWith(yearStr);
    });

    let totalBunga = 0;
    let totalAdmin = 0;
    let totalDenda = 0;
    let totalBiaya = 0;

    yearlyTransaksi.forEach(t => {
      const akun = t.akun || "";
      const kategori = t.kategori || "";
      const uraian = t.uraian || "";
      const debet = t.debet || 0;
      const kredit = t.kredit || 0;

      if (kategori.toLowerCase().includes("bunga")) {
        totalBunga += kredit;
      } else if (kategori.toLowerCase().includes("admin")) {
        totalAdmin += kredit;
      } else if (kategori.toLowerCase().includes("denda")) {
        totalDenda += kredit;
      } else if (akun === "Kas" && kredit > 0 && kategori.includes("Angsuran")) {
        if (kategori.includes("Bunga")) totalBunga += kredit;
        else if (kategori.includes("Admin")) totalAdmin += kredit;
        else if (kategori.includes("Denda")) totalDenda += kredit;
      }

      if (akun?.toLowerCase().includes("biaya")) {
        totalBiaya += debet;
      }
    });

    const totalPendapatan = totalBunga + totalAdmin + totalDenda;
    const shuBersih = totalPendapatan - totalBiaya;

    return {
      totalBunga,
      totalAdmin,
      totalDenda,
      totalPendapatan,
      totalBiaya,
      shuBersih
    };
  }, [selectedYear, transaksi]);

  const shuDistribution = useMemo(() => {
    if (!anggota || anggota.length === 0) return [];
    
    const anggotaList = anggota || [];
    const simpananList = simpanan || [];
    
    // Calculate total simpanan per anggota
    const anggotaSimpananMap = new Map<number, number>();
    
    anggotaList.forEach((a: any) => {
      const total = simpananList
        .filter((s: any) => s.idAnggota === a.id && s.jumlah > 0)
        .reduce((sum: number, s: any) => sum + s.jumlah, 0);
      anggotaSimpananMap.set(a.id, total);
    });

    const totalSimpananSemua = Array.from(anggotaSimpananMap.values()).reduce((sum, val) => sum + val, 0);
    const shuBersih = shuCalculation.shuBersih;

    const distribution: any[] = [];
    if (totalSimpananSemua > 0 && shuBersih > 0) {
      anggotaList.forEach((a: any) => {
        const simpananAnggota = anggotaSimpananMap.get(a.id) || 0;
        const proporsi = simpananAnggota / totalSimpananSemua;
        const shuAnggota = Math.round(shuBersih * proporsi);
        const persentase = proporsi * 100;

        distribution.push({
          id: a.id,
          nomorNBA: a.nomorNBA,
          nama: a.nama,
          simpanan: simpananAnggota,
          proporsi,
          persentase,
          shuAnggota
        });
      });
    }

    return distribution.sort((a, b) => b.shuAnggota - a.shuAnggota);
  }, [anggota, simpanan, shuCalculation.shuBersih]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E", marginBottom: 8 }}>Sisa Hasil Usaha (SHU)</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Perhitungan dan Distribusi SHU - KSP Mulia Dana Sejahtera</p>
      </div>

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
          <div style={{ fontSize: 13, opacity: 0.9 }}>SHU Bersih (Didistribusikan ke Anggota)</div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>
            {formatRupiah(shuCalculation.shuBersih)}
          </div>
        </div>
      </div>

      {/* SHU Distribution Table */}
      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, color: "#1B4D3E", marginBottom: 4 }}>📋 Distribusi SHU per Anggota</h3>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              Berdasarkan proporsi saldo simpanan (Pokok + Wajib) hingga {selectedYear}
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
            Total: {formatRupiah(shuCalculation.shuBersih)}
          </div>
        </div>

        {shuDistribution.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th>
                  <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>No. NBA</th>
                  <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama Anggota</th>
                  <th style={{ padding: 12, textAlign: "right", borderBottom: "2px solid #ddd" }}>Saldo Simpanan</th>
                  <th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #ddd" }}>Proporsi</th>
                  <th style={{ padding: 12, textAlign: "right", borderBottom: "2px solid #ddd" }}>SHU</th>
                </tr>
              </thead>
              <tbody>
                {shuDistribution.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12, color: "#6b7280", fontSize: 12 }}>{index + 1}</td>
                    <td style={{ padding: 12, fontFamily: "monospace", fontSize: 12, color: "#1B4D3E" }}>
                      {item.nomorNBA}
                    </td>
                    <td style={{ padding: 12, fontWeight: 500, color: "#1f2937" }}>
                      {item.nama}
                    </td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: 600, color: "#059669" }}>
                      {formatRupiah(item.simpanan)}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: "#e0e7ff",
                        color: "#4338ca"
                      }}>
                        {item.persentase.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: "right", fontWeight: 700, color: "#1B4D3E", fontSize: 14 }}>
                      {formatRupiah(item.shuAnggota)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f0f9ff", fontWeight: 600 }}>
                  <td colSpan={3} style={{ padding: 12, textAlign: "right" }}>TOTAL</td>
                  <td style={{ padding: 12, textAlign: "right", color: "#059669" }}>
                    {formatRupiah(shuDistribution.reduce((sum, item) => sum + item.simpanan, 0))}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    100%
                  </td>
                  <td style={{ padding: 12, textAlign: "right", color: "#1B4D3E", fontSize: 16 }}>
                    {formatRupiah(shuDistribution.reduce((sum, item) => sum + item.shuAnggota, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 64, background: "#f9fafb", borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
            <p style={{ color: "#6b7280", fontSize: 14 }}>Tidak ada data SHU untuk tahun {selectedYear}.</p>
            <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 8 }}>
              Belum ada transaksi pendapatan/beban di tahun tersebut.
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={{ background: "#f0f9ff", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginTop: 24 }}>
        <h4 style={{ fontSize: 14, marginBottom: 12, color: "#1e40af" }}>
          ℹ️ Cara Perhitungan SHU
        </h4>
        <ul style={{ fontSize: 12, color: "#6b7280", marginLeft: 20, lineHeight: 1.8 }}>
          <li><strong>Total Pendapatan</strong> = Bunga Pinjaman + Admin/Denda/Biaya Lain (dari transaksi tahun {selectedYear})</li>
          <li><strong>Total Beban</strong> = Biaya operasional KSP (dari akun beban)</li>
          <li><strong>SHU Bersih</strong> = Total Pendapatan - Total Beban</li>
          <li><strong>Proporsi anggota</strong> = Saldo Simpanan (Pokok + Wajib) masing-masing / Total Simpanan Semua Anggota</li>
          <li><strong>SHU per anggota</strong> = SHU Bersih × Proporsi Anggota</li>
        </ul>
      </div>
    </div>
  );
}
