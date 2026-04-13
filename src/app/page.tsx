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
  const { anggota, simpanan, pinjaman } = useData();
  
  const totalSimpanan = simpanan.reduce((sum, s) => sum + s.jumlah, 0);
  const totalPinjaman = pinjaman.filter(p => p.status === "Disetujui").reduce((sum, p) => sum + p.jumlah, 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Total Anggota</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E" }}>{anggota.length}</div>
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Total Simpanan</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalSimpanan)}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏦</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Total Pinjaman</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalPinjaman)}
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: 16, marginBottom: 20, color: "#1a1a1a" }}>Menu Utama</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 20px",
                borderRadius: 10,
                background: item.color,
                textDecoration: "none",
                color: "white",
              }}
            >
              <div style={{ fontSize: 24, marginRight: 12 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>{item.description}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}