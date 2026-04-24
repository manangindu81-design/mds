"use client";
import { useState } from "react";
import Link from "next/link";
import { useData } from "../context/DataContext";
import AppLogo from "../components/AppLogo";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function DashboardPage() {
  const { anggota, simpanan, pinjaman, angsuran, transaksi } = useData();
  const [activeTab, setActiveTab] = useState("overview");

  const totalanggota = anggota.length;
  const anggotaAktif = anggota.filter(a => a.statusKeanggotaan === "Aktif" || !a.statusKeanggotaan).length;
  const totalSimpanan = simpanan.reduce((sum, s) => sum + s.jumlah, 0);
  const totalPinjamanDisetujui = pinjaman.filter(p => p.status === "Disetujui" && p.outstanding > 0).reduce((sum, p) => sum + p.jumlah, 0);
  const totalPinjamanMenunggu = pinjaman.filter(p => p.status === "Menunggu").reduce((sum, p) => sum + p.jumlah, 0);

  const komposisiPinjaman = () => {
    const disetujui = pinjaman.filter(p => p.status === "Disetujui");
    if (disetujui.length === 0) return [];
    
    const grouped: Record<string, number> = {};
    disetujui.forEach(p => {
      const jenis = p.jenisPinjaman || "umum";
      grouped[jenis] = (grouped[jenis] || 0) + p.jumlah;
    });
    
    const total = Object.values(grouped).reduce((a, b) => a + b, 0);
    const colors: Record<string, string> = {
      bisnis: "#1B4D3E",
      umum: "#2D7A5F",
      pendidikan: "#D4AF37",
      produktif: "#0A2E25",
      "dana-sehat": "#5B8C5A"
    };
    
    return Object.entries(grouped).map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, " "),
      value: Math.round((value / total) * 100),
      color: colors[label] || "#2D7A5F"
    }));
  };

  const statistikSimpanan = () => {
    if (simpanan.length === 0) return [];
    
    const monthly: Record<string, number> = {};
    simpanan.forEach(s => {
      const bulan = s.tanggal?.substring(0, 7) || new Date().toISOString().substring(0, 7);
      monthly[bulan] = (monthly[bulan] || 0) + s.jumlah;
    });
    
    const sortedMonths = Object.keys(monthly).sort().slice(-6);
    const maxValue = Math.max(...Object.values(monthly), 1);
    
    return sortedMonths.map(bulan => ({
      month: new Date(bulan + "-01").toLocaleDateString("id-ID", { month: "short" }),
      value: monthly[bulan],
      height: (monthly[bulan] / maxValue) * 180
    }));
  };

  const composition = komposisiPinjaman();
  const monthlyStats = statistikSimpanan();

  // === TREN 6 BULAN TERAKHIR (SIMPANAN & PINJAMAN) ===
  const getTrendData = () => {
    const monthlySimpanan: Record<string, number> = {};
    const monthlyPinjaman: Record<string, number> = {};
    
    // Get last 6 months
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().substring(0, 7));
    }
    
    // Calculate monthly savings
    simpanan.forEach(s => {
      const bulan = s.tanggal?.substring(0, 7);
      if (bulan && months.includes(bulan)) {
        monthlySimpanan[bulan] = (monthlySimpanan[bulan] || 0) + s.jumlah;
      }
    });
    
    // Calculate monthly loans (disbursed)
    const loansDisbursed = pinjaman.filter(p => p.status === "Disetujui");
    loansDisbursed.forEach(p => {
      const bulan = p.tanggal?.substring(0, 7);
      if (bulan && months.includes(bulan)) {
        monthlyPinjaman[bulan] = (monthlyPinjaman[bulan] || 0) + p.jumlah;
      }
    });
    
    // Build trend data
    return months.map(bulan => ({
      month: new Date(bulan + "-01").toLocaleDateString("id-ID", { month: "short" }),
      simpanan: monthlySimpanan[bulan] || 0,
      pinjaman: monthlyPinjaman[bulan] || 0
    }));
  };
  
  const trendData = getTrendData();
  const maxTrendValue = Math.max(
    ...trendData.map(d => Math.max(d.simpanan, d.pinjaman)),
    1
  );

  // === JATUH TEMPO ANGSURAN (7 HARI KE DEPAN) ===
  const getJatuhTempo = () => {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);
    
    return angsuran
      .filter(a => {
        const dueDate = new Date(a.tanggal);
        return dueDate >= today && dueDate <= next7Days;
      })
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
      .slice(0, 5);
  };
  
  const jatuhTempo = getJatuhTempo();

  // === LOG AKTIVITAS (5 TRANSAKSI TERAKHIR) ===
  const recentActivity = [...transaksi]
    .sort((a, b) => new Date(b.tanggal + " " + b.jam).getTime() - new Date(a.tanggal + " " + a.jam).getTime())
    .slice(0, 5);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
      default:
        return (
          <>
            {/* Quick Actions */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <Link href="/simpanan" style={{ flex: 1, padding: "16px 20px", background: "linear-gradient(135deg, #1B4D3E 0%, #2D7A5F 100%)", borderRadius: 12, textDecoration: "none", color: "white", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 12px rgba(27,77,62,0.3)" }}>
                <span style={{ fontSize: 24 }}>💵</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Setoran Baru</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Input setoran anggota</div>
                </div>
              </Link>
              <Link href="/pinjaman" style={{ flex: 1, padding: "16px 20px", background: "linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)", borderRadius: 12, textDecoration: "none", color: "white", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 12px rgba(212,175,55,0.3)" }}>
                <span style={{ fontSize: 24 }}>🏦</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Pinjaman Baru</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Ajukan pinjaman</div>
                </div>
              </Link>
              <Link href="/transaksi" style={{ flex: 1, padding: "16px 20px", background: "linear-gradient(135deg, #0A2E25 0%, #1B4D3E 100%)", borderRadius: 12, textDecoration: "none", color: "white", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 12px rgba(10,46,37,0.3)" }}>
                <span style={{ fontSize: 24 }}>📝</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Transaksi</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Kas masuk/keluar</div>
                </div>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 4 }}>Total Anggota</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--color-primary)" }}>{totalanggota}</div>
                <div style={{ fontSize: 12, color: "#22c55e" }}>+{anggotaAktif} Aktif</div>
              </div>
              
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 4 }}>Total Simpanan</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-primary)" }}>{formatRupiah(totalSimpanan)}</div>
                <div style={{ fontSize: 12, color: "#22c55e" }}>Dana Masuk</div>
              </div>
              
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏦</div>
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 4 }}>Pinjaman Aktif</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-primary)" }}>{formatRupiah(totalPinjamanDisetujui)}</div>
                <div style={{ fontSize: 12, color: "#22c55e" }}>Outstanding</div>
              </div>
              
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 4 }}>Menunggu Persetujuan</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-secondary)" }}>{formatRupiah(totalPinjamanMenunggu)}</div>
                <div style={{ fontSize: 12, color: "var(--color-secondary)" }}>Sedang Diproses</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, marginBottom: 24 }}>Statistik Simpanan per Bulan</h3>
                {monthlyStats.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-secondary)" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
                    <p>Belum ada data simpanan. Input simpanan terlebih dahulu.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, paddingBottom: 24 }}>
                    {monthlyStats.map((item, index) => (
                      <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ 
                          width: "100%", 
                          height: `${item.height}px`, 
                          background: "linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
                          borderRadius: 4,
                          transition: "height 0.3s"
                        }} />
                        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{item.month}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, marginBottom: 24 }}>Komposisi Pinjaman</h3>
                {composition.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-secondary)" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
                    <p>Belum ada pinjaman aktif.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {composition.map((item, index) => (
                      <div key={index}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 14 }}>{item.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{item.value}%</span>
                        </div>
                        <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${item.value}%`, height: "100%", background: item.color, borderRadius: 4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Trend Chart: Simpanan vs Pinjaman */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, marginBottom: 24 }}>Tren Simpanan vs Pinjaman (6 Bulan Terakhir)</h3>
              {trendData.every(d => d.simpanan === 0 && d.pinjaman === 0) ? (
                <div style={{ textAlign: "center", padding: 32, color: "var(--color-text-secondary)" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📈</div>
                  <p>Belum ada data untuk menampilkan tren.</p>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 220 }}>
                  {trendData.map((item, index) => (
                    <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ width: "100%", display: "flex", gap: 4, justifyContent: "center", height: `${Math.min((Math.max(item.simpanan, item.pinjaman) / maxTrendValue) * 180, 180)}px` }}>
                        <div style={{ 
                          width: 20, 
                          height: `${(item.simpanan / maxTrendValue) * 180}px`, 
                          background: "linear-gradient(180deg, #1B4D3E 0%, #2D7A5F 100%)",
                          borderRadius: 4
                        }} title={`Simpanan: ${formatRupiah(item.simpanan)}`} />
                        <div style={{ 
                          width: 20, 
                          height: `${(item.pinjaman / maxTrendValue) * 180}px`, 
                          background: "linear-gradient(180deg, #D4AF37 0%, #B8962E 100%)",
                          borderRadius: 4
                        }} title={`Pinjaman: ${formatRupiah(item.pinjaman)}`} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{item.month}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 24, marginTop: 16, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, background: "#1B4D3E", borderRadius: 2 }} />
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Simpanan</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, background: "#D4AF37", borderRadius: 2 }} />
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Pinjaman</span>
                </div>
              </div>
            </div>

            {/* Jatuh Tempo & Aktivitas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
              {/* Jatuh Tempo Angsuran */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18 }}>Peringatan Jatuh Tempo</h3>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>7 hari ke depan</span>
                </div>
                {jatuhTempo.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: "var(--color-text-secondary)" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <p>Tidak ada angsuran jatuh tempo.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {jatuhTempo.map((item, index) => {
                      const pinjam = pinjaman.find(p => p.id === item.idPinjaman);
                      return (
                        <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#fff3cd", borderRadius: 8, border: "1px solid #ffeeba" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{pinjam?.nama || "Unknown"}</div>
                            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Angsuran ke-{item.angsuranKe}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{formatRupiah(item.totalBayar)}</div>
                            <div style={{ fontSize: 12, color: "#856404" }}>{new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Log Aktivitas */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18 }}>Aktivitas Terbaru</h3>
                  <button onClick={() => setActiveTab("transaksi")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}>Lihat Semua →</button>
                </div>
                {recentActivity.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: "var(--color-text-secondary)" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                    <p>Belum ada aktivitas.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {recentActivity.map((item, index) => {
                      const isMasuk = (item.debet || 0) > 0;
                      return (
                        <div key={index} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: index < recentActivity.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          <div style={{ fontSize: 20 }}>{isMasuk ? "📥" : "📤"}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.uraian}</div>
                            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{item.tanggal} • {item.jam}</div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: isMasuk ? "#22c55e" : "#ef4444" }}>
                            {isMasuk ? "+" : "-"}{formatRupiah(item.debet || item.kredit || 0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Simpanan & Pinjaman Terbaru */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18 }}>Simpanan Terbaru</h3>
                  <button onClick={() => setActiveTab("simpanan")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}>Lihat Semua →</button>
                </div>
                {simpanan.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: "var(--color-text-secondary)" }}>
                    <p>Belum ada data simpanan.</p>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #eee" }}>
                        <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                        <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Jenis</th>
                        <th style={{ textAlign: "right", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simpanan.slice(0, 4).map((item, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "12px 0", fontSize: 14 }}>{item.nama}</td>
                          <td style={{ padding: "12px 0", fontSize: 14 }}>{item.jenisSimpanan}</td>
                          <td style={{ padding: "12px 0", fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(item.jumlah)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18 }}>Pinjaman Terbaru</h3>
                  <button onClick={() => setActiveTab("pinjaman")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}>Lihat Semua →</button>
                </div>
                {pinjaman.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: "var(--color-text-secondary)" }}>
                    <p>Belum ada data pinjaman.</p>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #eee" }}>
                        <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                        <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Jenis</th>
                        <th style={{ textAlign: "right", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pinjaman.slice(0, 4).map((item, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                          <td style={{ padding: "12px 0", fontSize: 14 }}>{item.nama}</td>
                          <td style={{ padding: "12px 0", fontSize: 14 }}>{item.jenisPinjaman}</td>
                          <td style={{ padding: "12px 0", fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(item.jumlah)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        );

      case "anggota":
        return (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Data Anggota</h3>
              <Link href="/anggota" style={{ background: "var(--color-primary)", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", textDecoration: "none", fontWeight: 500, display: "inline-block" }}>+ Tambah Anggota</Link>
            </div>
            {anggota.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-secondary)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                <p>Belum ada anggota. Daftar anggota terlebih dahulu.</p>
                <Link href="/anggota" style={{ display: "inline-block", marginTop: 16, color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>→ Daftar Anggota</Link>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>NIK</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Telepon</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Pekerjaan</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {anggota.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: 12, fontSize: 14, fontFamily: "monospace" }}>{item.nik}</td>
                      <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{item.nama}</td>
                      <td style={{ padding: 12, fontSize: 14 }}>{item.telepon}</td>
                      <td style={{ padding: 12, fontSize: 14 }}>{item.pekerjaan}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: 12, 
                          fontSize: 12, 
                          background: item.statusKeanggotaan === "Aktif" ? "#d4edda" : "#f8d7da",
                          color: item.statusKeanggotaan === "Aktif" ? "#155724" : "#721c24"
                        }}>
                          {item.statusKeanggotaan || "Aktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case "simpanan":
        return (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Data Simpanan</h3>
              <Link href="/simpanan" style={{ background: "var(--color-primary)", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", textDecoration: "none", fontWeight: 500, display: "inline-block" }}>+ Input Simpanan</Link>
            </div>
            {simpanan.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-secondary)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
                <p>Belum ada data simpanan.</p>
                <Link href="/simpanan" style={{ display: "inline-block", marginTop: 16, color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>→ Input Simpanan</Link>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>ID</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Nama Anggota</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Jenis</th>
                    <th style={{ textAlign: "right", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Jumlah</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {simpanan.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: 12, fontSize: 14 }}>#{item.id}</td>
                      <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{item.nama}</td>
                      <td style={{ padding: 12, fontSize: 14 }}>{item.jenisSimpanan}</td>
                      <td style={{ padding: 12, fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(item.jumlah)}</td>
                      <td style={{ padding: 12, fontSize: 14 }}>{item.tanggal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "var(--color-primary)", color: "white" }}>
                    <td colSpan={3} style={{ padding: 12, fontSize: 14, fontWeight: 600 }}>TOTAL</td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: "right", fontWeight: 700 }}>{formatRupiah(totalSimpanan)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        );

      case "pinjaman":
        return (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Data Pinjaman</h3>
              <Link href="/pinjaman" style={{ background: "var(--color-primary)", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", textDecoration: "none", fontWeight: 500, display: "inline-block" }}>+ Input Pinjaman</Link>
            </div>
            {pinjaman.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-secondary)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏦</div>
                <p>Belum ada data pinjaman.</p>
                <Link href="/pinjaman" style={{ display: "inline-block", marginTop: 16, color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>→ Input Pinjaman</Link>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>ID</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                    <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Jenis</th>
                    <th style={{ textAlign: "right", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Jumlah</th>
                    <th style={{ textAlign: "center", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Tenor</th>
                    <th style={{ textAlign: "center", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pinjaman.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: 12, fontSize: 14 }}>#{item.id}</td>
                      <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{item.nama}</td>
                      <td style={{ padding: 12, fontSize: 14 }}>{item.jenisPinjaman}</td>
                      <td style={{ padding: 12, fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(item.jumlah)}</td>
                      <td style={{ padding: 12, fontSize: 14, textAlign: "center" }}>{item.tenor} bln</td>
                      <td style={{ padding: 12, textAlign: "center" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: 12, 
                          fontSize: 12, 
                          background: item.status === "Disetujui" ? "#d4edda" : item.status === "Menunggu" ? "#fff3cd" : "#f8d7da",
                          color: item.status === "Disetujui" ? "#155724" : item.status === "Menunggu" ? "#856404" : "#721c24"
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background)" }}>
      <aside style={{ width: 260, background: "var(--color-primary)", color: "white", padding: "24px 0", position: "fixed", height: "100vh" }}>
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "white" }}>
            <AppLogo width={32} height={32} />
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600 }}>KSP Mulia</div>
              <div style={{ fontSize: 11, color: "#b8d4c8", letterSpacing: 1 }}>DANA SEJAHTERA</div>
            </div>
          </Link>
        </div>

        <nav style={{ padding: "0 12px" }}>
          {[
            { id: "overview", label: "📊", text: "Dashboard" },
            { id: "anggota", label: "👥", text: "Anggota" },
            { id: "simpanan", label: "💰", text: "Simpanan" },
            { id: "pinjaman", label: "🏦", text: "Pinjaman" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                width: "100%", 
                padding: "14px 16px", 
                background: activeTab === item.id ? "rgba(255,255,255,0.15)" : "none",
                border: "none",
                borderRadius: 8,
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 15,
                marginBottom: 4,
                transition: "background 0.2s"
              }}
            >
              <span>{item.label}</span>
              <span>{item.text}</span>
            </button>
          ))}
        </nav>

        <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Status Sistem</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Semua layanan aktif</div>
            <div style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", marginTop: 8 }} />
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 260, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontFamily: "var(--font-heading)", color: "var(--color-text-primary)" }}>
              {activeTab === "overview" && "Dashboard"}
              {activeTab === "anggota" && "Data Anggota"}
              {activeTab === "simpanan" && "Data Simpanan"}
              {activeTab === "pinjaman" && "Data Pinjaman"}
            </h1>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>KSP Mulia Dana Sejahtera - {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/" style={{ padding: "12px 24px", background: "var(--color-surface)", borderRadius: 8, textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              ← Kembali ke Website
            </Link>
          </div>
        </div>

        {renderContent()}
      </main>

      <style>{`
        @media (max-width: 768px) {
          aside { display: none; }
          main { marginLeft: 0; }
        }
      `}</style>
    </div>
  );
}