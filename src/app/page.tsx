"use client";
import Link from "next/link";

const menuItems = [
  { 
    title: "Anggota", 
    description: "Pendaftaran anggota baru", 
    href: "/anggota", 
    icon: "👥",
    color: "#1B4D3E" 
  },
  { 
    title: "Simpanan", 
    description: "Input setoran simpanan", 
    href: "/simpanan", 
    icon: "💰",
    color: "#2D7A5F" 
  },
  { 
    title: "Pinjaman", 
    description: "Pengajuan pinjaman", 
    href: "/pinjaman", 
    icon: "🏦",
    color: "#D4AF37" 
  },
  { 
    title: "Transaksi", 
    description: "Transaksi harian", 
    href: "/transaksi", 
    icon: "💳",
    color: "#0A2E25" 
  },
  { 
    title: "Data Anggota", 
    description: "Daftar data anggota", 
    href: "/data-anggota", 
    icon: "📋",
    color: "#1B4D3E" 
  },
  { 
    title: "Dashboard", 
    description: "Statistik & laporan", 
    href: "/dashboard", 
    icon: "📊",
    color: "#2D7A5F" 
  },
];

export default function Home() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f5f7fa",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Header */}
      <header style={{ 
        background: "#1B4D3E", 
        color: "white", 
        padding: "20px 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: "0 auto", 
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🏛️</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>KSP Mulia Dana Sejahtera</div>
              <div style={{ fontSize: 10, color: "#D4AF37", letterSpacing: 1 }}>SISTEM PENGELOLAAN DATA</div>
            </div>
          </div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ 
          background: "white", 
          borderRadius: 16, 
          padding: 32, 
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <h1 style={{ fontSize: 24, marginBottom: 8, color: "#1a1a1a" }}>
            Menu Utama
          </h1>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            Pilih menu untuk mulai input data
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                style={{
                  display: "block",
                  padding: 24,
                  borderRadius: 12,
                  background: item.color,
                  textDecoration: "none",
                  color: "white",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>{item.description}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Anggota</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E" }}>5</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Simpanan</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>Rp 19.500.000</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Total Pinjaman</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>Rp 13.000.000</div>
          </div>
          <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Transaksi Hari Ini</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#373151" }}>3</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        background: "#1B4D3E", 
        color: "white", 
        padding: "24px 0",
        marginTop: 48
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: "0 auto", 
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
          opacity: 0.8
        }}>
          <div>KSP Mulia Dana Sejahtera © 2024</div>
          <div>Sistem Pengelolaan Data Koperasi</div>
        </div>
      </footer>
    </div>
  );
}