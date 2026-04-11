"use client";
import { useState } from "react";
import Link from "next/link";

const mockAnggota: { id: number; nik: string; nama: string; telepon: string; tanggalLahir: string; pekerjaan: string; status: string; joinDate: string }[] = [];

const mockSimpanan: { id: number; idAnggota: number; nama: string; jenis: string; jumlah: number; tanggal: string; metode: string }[] = [];

const mockPinjaman: { id: number; idAnggota: number; nama: string; jenis: string; jumlah: number; tenor: number; status: string; tanggal: string }[] = [];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const totalAnggota = 0;
  const anggotaAktif = 0;
  const totalSimpanan = 0;
  const totalPinjamanDisetujui = 0;
  const totalPinjamanMenunggu = 0;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
      default:
        return (
          <>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 4 }}>Total Anggota</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--color-primary)" }}>{totalAnggota}</div>
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
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 4 }}>Pinjaman Disetujui</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-primary)" }}>{formatRupiah(totalPinjamanDisetujui)}</div>
                <div style={{ fontSize: 12, color: "#22c55e" }}>Lunas</div>
              </div>
              
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 4 }}>Menunggu Persetujuan</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-secondary)" }}>{formatRupiah(totalPinjamanMenunggu)}</div>
                <div style={{ fontSize: 12, color: "var(--color-secondary)" }}>Sedang Diproses</div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, marginBottom: 24 }}>Statistik Simpanan per Bulan (2024)</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, paddingBottom: 24 }}>
                  {[
                    { month: "Jan", value: 4500000 },
                    { month: "Feb", value: 5200000 },
                    { month: "Mar", value: 4800000 },
                    { month: "Apr", value: 6200000 },
                    { month: "Mei", value: 5500000 },
                    { month: "Jun", value: 7000000 },
                  ].map((item, index) => (
                    <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ 
                        width: "100%", 
                        height: `${(item.value / 7000000) * 180}px`, 
                        background: "linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
                        borderRadius: 4,
                        transition: "height 0.3s"
                      }} />
                      <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, marginBottom: 24 }}>Komposisi Pinjaman</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "Bisnis", value: 45, color: "#1B4D3E" },
                    { label: "Umum", value: 30, color: "#2D7A5F" },
                    { label: "Pendidikan", value: 15, color: "#D4AF37" },
                    { label: "Produktif", value: 10, color: "#0A2E25" },
                  ].map((item, index) => (
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
              </div>
            </div>

            {/* Recent Data */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18 }}>Simpanan Terbaru</h3>
                  <button onClick={() => setActiveTab("simpanan")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}>Lihat Semua →</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #eee" }}>
                      <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                      <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Jenis</th>
                      <th style={{ textAlign: "right", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSimpanan.slice(0, 4).map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "12px 0", fontSize: 14 }}>{item.nama}</td>
                        <td style={{ padding: "12px 0", fontSize: 14 }}>{item.jenis}</td>
                        <td style={{ padding: "12px 0", fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(item.jumlah)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18 }}>Pinjaman Terbaru</h3>
                  <button onClick={() => setActiveTab("pinjaman")} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}>Lihat Semua →</button>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #eee" }}>
                      <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                      <th style={{ textAlign: "left", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Jenis</th>
                      <th style={{ textAlign: "right", padding: "12px 0", fontSize: 12, color: "var(--color-text-secondary)" }}>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPinjaman.slice(0, 4).map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "12px 0", fontSize: 14 }}>{item.nama}</td>
                        <td style={{ padding: "12px 0", fontSize: 14 }}>{item.jenis}</td>
                        <td style={{ padding: "12px 0", fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(item.jumlah)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case "anggota":
        return (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Data Anggota</h3>
              <button style={{ background: "var(--color-primary)", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500 }}>+ Tambah Anggota</button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>NIK</th>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Telepon</th>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Pekerjaan</th>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Status</th>
                  <th style={{ textAlign: "center", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mockAnggota.map((item, index) => (
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
                        background: item.status === "Aktif" ? "#d4edda" : "#f8d7da",
                        color: item.status === "Aktif" ? "#155724" : "#721c24"
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", fontWeight: 500 }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "simpanan":
        return (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Data Simpanan</h3>
              <Link href="/simpanan" style={{ background: "var(--color-primary)", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", textDecoration: "none", fontWeight: 500, display: "inline-block" }}>+ Input Simpanan</Link>
            </div>
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
                {mockSimpanan.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: 12, fontSize: 14 }}>#{item.id}</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{item.nama}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{item.jenis}</td>
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
          </div>
        );

      case "pinjaman":
        return (
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18 }}>Data Pinjaman</h3>
              <Link href="/pinjaman" style={{ background: "var(--color-primary)", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", textDecoration: "none", fontWeight: 500, display: "inline-block" }}>+ Input Pinjaman</Link>
            </div>
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
                {mockPinjaman.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: 12, fontSize: 14 }}>#{item.id}</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{item.nama}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{item.jenis}</td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(item.jumlah)}</td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: "center" }}>{item.tenor} bln</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <span style={{ 
                        padding: "4px 12px", 
                        borderRadius: 12, 
                        fontSize: 12, 
                        background: item.status === "Lunas" ? "#d4edda" : "#fff3cd",
                        color: item.status === "Lunas" ? "#155724" : "#856404"
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: "var(--color-primary)", color: "white", padding: "24px 0", position: "fixed", height: "100vh" }}>
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "white" }}>
            <span style={{ fontSize: 32 }}>🏛️</span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600 }}>KSP Mulia</div>
              <div style={{ fontSize: 11, color: "var(--color-secondary)", letterSpacing: 1 }}>DANA SEJAHTERA</div>
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

      {/* Main Content */}
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
            <Link href="/" style={{ padding: "12px 24px", background: "var(--color-surface)", borderRadius: 8, textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, boxShadow: "var(--shadow-card)" }}>
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