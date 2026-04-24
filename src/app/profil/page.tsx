"use client";
import { useState } from "react";
import Link from "next/link";
import { useData } from "../context/DataContext";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function ProfilPage() {
  const { pengurus, pengawas, karyawan } = useData();
  const [activeTab, setActiveTab] = useState<"pengurus" | "pengawas" | "karyawan">("pengurus");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
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
          <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 12, padding: "0 16px" }}>INFORMASI KOPERASI</div>
          <button
            onClick={() => setActiveTab("pengurus")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 16px",
              background: activeTab === "pengurus" ? "rgba(255,255,255,0.15)" : "none",
              border: "none",
              borderRadius: 8,
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            <span>👔</span>
            <span>Pengurus</span>
          </button>
          <button
            onClick={() => setActiveTab("pengawas")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 16px",
              background: activeTab === "pengawas" ? "rgba(255,255,255,0.15)" : "none",
              border: "none",
              borderRadius: 8,
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            <span>👁️</span>
            <span>Pengawas</span>
          </button>
          <button
            onClick={() => setActiveTab("karyawan")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 16px",
              background: activeTab === "karyawan" ? "rgba(255,255,255,0.15)" : "none",
              border: "none",
              borderRadius: 8,
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            <span>💼</span>
            <span>Karyawan</span>
          </button>
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
              {activeTab === "pengurus" && "Pengurus Koperasi"}
              {activeTab === "pengawas" && "Pengawas Koperasi"}
              {activeTab === "karyawan" && "Karyawan Koperasi"}
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              KSP Mulia Dana Sejahtera — Organisasi
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {activeTab === "pengurus" && (
            <div style={{ padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 32 }}>👔</span>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1B4D3E" }}>Pengurus Koperasi</h2>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>Pengurus periode saat ini</p>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>No</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>Jabatan</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>Nama</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>Gelar</th>
                  </tr>
                </thead>
                <tbody>
                  {pengurus.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 12, color: "#6b7280", fontSize: 13 }}>{index + 1}</td>
                      <td style={{ padding: 12, fontWeight: 500, color: "#1f2937", fontSize: 14 }}>{item.jabatan}</td>
                      <td style={{ padding: 12, fontSize: 14, color: "#374151" }}>{item.nama}</td>
                      <td style={{ padding: 12, fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>{item.gelar || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "pengawas" && (
            <div style={{ padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 32 }}>👁️</span>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1B4D3E" }}>Pengawas Koperasi</h2>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>Pengawas periode saat ini</p>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>No</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>Jabatan</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>Nama</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>Gelar</th>
                  </tr>
                </thead>
                <tbody>
                  {pengawas.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 12, color: "#6b7280", fontSize: 13 }}>{index + 1}</td>
                      <td style={{ padding: 12, fontWeight: 500, color: "#1f2937", fontSize: 14 }}>{item.jabatan}</td>
                      <td style={{ padding: 12, fontSize: 14, color: "#374151" }}>{item.nama}</td>
                      <td style={{ padding: 12, fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>{item.gelar || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "karyawan" && (
            <div style={{ padding: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 32 }}>💼</span>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1B4D3E" }}>Karyawan Koperasi</h2>
                  <p style={{ fontSize: 13, color: "#6b7280" }}>Staf kantor periode saat ini</p>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>No</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>Jabatan</th>
                    <th style={{ textAlign: "left", padding: 12, borderBottom: "2px solid #374151" }}>Nama</th>
                  </tr>
                </thead>
                <tbody>
                  {karyawan.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 12, color: "#6b7280", fontSize: 13 }}>{index + 1}</td>
                      <td style={{ padding: 12, fontWeight: 500, color: "#1f2937", fontSize: 14 }}>{item.jabatan}</td>
                      <td style={{ padding: 12, fontSize: 14, color: "#374151" }}>{item.nama}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
