"use client";
import { useData } from "./context/DataContext";

const menuItems = [
  { title: "Anggota", description: "Pendaftaran anggota baru", href: "/anggota", icon: "👥", color: "#1B4D3E" },
  { title: "Simpanan", description: "Input setoran simpanan", href: "/simpanan", icon: "💰", color: "#2D7A5F" },
  { title: "Pinjaman", description: "Pengajuan pinjaman", href: "/pinjaman", icon: "🏦", color: "#D4AF37" },
  { title: "Transaksi", description: "Transaksi harian", href: "/transaksi", icon: "💳", color: "#0A2E25" },
  { title: "Dashboard", description: "Statistik & laporan", href: "/dashboard", icon: "📊", color: "#1B4D3E" },
  { title: "Laporan", description: "Laporan keuangan", href: "/laporan", icon: "📑", color: "#2D7A5F" },
];

export default function Home() {
  const { anggota, simpanan, pinjaman, transaksi } = useData();
  
  const totalSimpanan = simpanan.reduce((sum, s) => sum + s.jumlah, 0);
  const totalPinjaman = pinjaman.filter(p => p.status === "Disetujui").reduce((sum, p) => sum + p.jumlah, 0);
  const today = new Date().toISOString().split("T")[0];
  const transaksiHariIni = transaksi.filter(t => t.tanggal === today).length;

  return (
    <div style={{ padding: "32px 0" }}>
      <div style={{ 
        background: "linear-gradient(135deg, #1B4D3E 0%, #2D7A5F 100%)", 
        borderRadius: 24, 
        padding: "48px 40px", 
        marginBottom: 32,
        color: "white",
        textAlign: "center"
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏛️</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
          KSP Mulia Dana Sejahtera
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 0 }}>
          Sistem Pengelolaan Data Koperasi Modern
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Total Anggota</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1B4D3E" }}>{anggota.length}</div>
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Total Simpanan</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e" }}>
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalSimpanan)}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏦</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Total Pinjaman</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#ef4444" }}>
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalPinjaman)}
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: 20, marginBottom: 24, color: "#1a1a1a" }}>Menu Utama</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px 24px",
                borderRadius: 12,
                background: item.color,
                textDecoration: "none",
                color: "white",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 28, marginRight: 16 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>{item.description}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}