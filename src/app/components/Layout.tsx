"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Beranda", href: "/", icon: "🏠" },
  { label: "Anggota", href: "/anggota", icon: "👥" },
  { label: "Simpanan", href: "/simpanan", icon: "💰" },
  { label: "Pinjaman", href: "/pinjaman", icon: "🏦" },
  { label: "Transaksi", href: "/transaksi", icon: "💳" },
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Laporan", href: "/laporan", icon: "📑" },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
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
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "white", letterSpacing: 0.5 }}>KSP Mulia Dana Sejahtera</div>
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

      {title && (
        <div style={{ 
          background: "linear-gradient(135deg, #1B4D3E 0%, #2D7A5F 100%)", 
          padding: "60px 24px 40px",
          textAlign: "center"
        }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h1 style={{ 
              fontSize: 42, 
              fontFamily: "var(--font-heading)", 
              marginBottom: 12, 
              color: "white",
              fontWeight: 700
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <main style={{ padding: isHome ? "48px 24px" : "0 24px 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </div>
      </main>

      <footer style={{ 
        background: "#1B4D3E", 
        color: "white", 
        padding: "32px 24px",
        marginTop: 64
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
            <div style={{ fontSize: 13, opacity: 0.7 }}>Sistem Pengelolaan Data Koperasi</div>
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            © {new Date().getFullYear()} - All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Card({ children, style, padding = 40 }: { children: React.ReactNode; style?: React.CSSProperties; padding?: number }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      padding,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      ...style
    }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <h3 style={{ 
      fontSize: 20, 
      marginBottom: 24, 
      borderBottom: "3px solid var(--color-primary)", 
      paddingBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 8
    }}>
      {icon && <span>{icon}</span>}
      {children}
    </h3>
  );
}

export function FormGroup({ children, columns = 2 }: { children: React.ReactNode; columns?: number }) {
  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: `repeat(${columns}, 1fr)`, 
      gap: 20, 
      marginBottom: 24 
    }}>
      {children}
    </div>
  );
}

export function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>
        {label} {required && <span style={{ color: "#e74c3c" }}>*</span>}
      </label>
      {children}
      {error && <div style={{ color: "#e74c3c", fontSize: 13, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 10,
        border: props.error ? "2px solid #e74c3c" : "2px solid #e5e7eb",
        fontSize: 15,
        outline: "none",
        transition: "border-color 0.2s",
        ...props.style
      }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: 10,
        border: props.error ? "2px solid #e74c3c" : "2px solid #e5e7eb",
        fontSize: 15,
        outline: "none",
        background: "white",
        ...props.style
      }}
    />
  );
}

export function Button({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const bg = variant === "primary" ? "var(--color-primary)" : "#6b7280";
  return (
    <button
      {...props}
      style={{
        padding: "14px 24px",
        borderRadius: 10,
        border: "none",
        background: bg,
        color: "white",
        fontWeight: 600,
        fontSize: 15,
        cursor: "pointer",
        transition: "transform 0.1s, box-shadow 0.2s",
        ...props.style
      }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "green" }: { children: React.ReactNode; variant?: "green" | "yellow" | "red" | "blue" }) {
  const colors = {
    green: { bg: "#d4edda", color: "#155724" },
    yellow: { bg: "#fff3cd", color: "#856404" },
    red: { bg: "#f8d7da", color: "#721c24" },
    blue: { bg: "#d1ecf1", color: "#0c5460" }
  };
  return (
    <span style={{
      padding: "6px 14px",
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 500,
      background: colors[variant].bg,
      color: colors[variant].color
    }}>
      {children}
    </span>
  );
}

export function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || "var(--color-primary)" }}>{value}</div>
    </div>
  );
}

export const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);