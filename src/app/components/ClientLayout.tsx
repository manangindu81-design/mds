"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "../context/DataContext";

const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

const navItems = [
  { label: "Beranda", href: "/", icon: "🏠" },
  { label: "Anggota", href: "/anggota", icon: "👥" },
  { label: "Simpanan", href: "/simpanan", icon: "💰" },
  { label: "Pinjaman", href: "/pinjaman", icon: "🏦" },
  { label: "Transaksi", href: "/transaksi", icon: "💳" },
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Laporan", href: "/laporan", icon: "📑" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { anggota, simpanan, pinjaman } = useData();
  
  const totalSimpanan = simpanan.reduce((sum, s) => sum + s.jumlah, 0);
  const totalPinjaman = pinjaman.filter(p => p.status === "Disetujui").reduce((sum, p) => sum + p.jumlah, 0);
  const totalOutstanding = pinjaman.filter(p => p.status === "Disetujui").reduce((sum, p) => sum + (p.outstanding || 0), 0);

  return (
    <>
      <header style={{ 
        background: "linear-gradient(135deg, #1B4D3E 0%, #2D7A5F 100%)", 
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: 1400, 
          margin: "0 auto", 
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 36 }}>🏛️</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "white", letterSpacing: 0.5 }}>KSP Mulia Dana Sejahtera</div>
              <div style={{ fontSize: 10, color: "#D4AF37", letterSpacing: 2, fontWeight: 500 }}>TERDAFTAR & TERAWASI</div>
            </div>
          </Link>
          
          <nav style={{ display: "flex", gap: 4 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: isActive ? "#1B4D3E" : "rgba(255,255,255,0.85)",
                    background: isActive ? "white" : "transparent",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 14,
                    transition: "all 0.2s ease"
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {pathname !== "/" && (
        <div style={{ 
          background: "linear-gradient(135deg, #1B4D3E 0%, #2D7A5F 100%)", 
          padding: "40px 24px",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "white", marginBottom: 4 }}>
                {navItems.find(n => n.href === pathname)?.label || "Dashboard"}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>KSP Mulia Dana Sejahtera</p>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Anggota</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{anggota.length}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Simpanan</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{formatRupiah(totalSimpanan)}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Pinjaman</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{formatRupiah(totalOutstanding)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ padding: "40px 24px 64px", minHeight: "calc(100vh - 200px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </div>
      </main>

      <footer style={{ 
        background: "#1B4D3E", 
        color: "white", 
        padding: "32px 24px"
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: "0 auto", 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>KSP Mulia Dana Sejahtera</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Sistem Pengelolaan Data Koperasi Modern</div>
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            © {new Date().getFullYear()} - All Rights Reserved
          </div>
        </div>
      </footer>
    </>
  );
}