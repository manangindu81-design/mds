"use client";
import { useState } from "react";
import Link from "next/link";
import { useData } from "../context/DataContext";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function ProfilPage() {
  const { pengurus, pengawas, karyawan, logoBase64, setLogoBase64 } = useData();
  const [activeTab, setActiveTab] = useState<"pengurus" | "pengawas" | "karyawan" | "logo">("pengurus");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result as string);
      alert("Logo berhasil diupload!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoBase64(null);
    alert("Logo dihapus");
  };

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
          <button
            onClick={() => setActiveTab("logo")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "12px 16px",
              background: activeTab === "logo" ? "rgba(255,255,255,0.15)" : "none",
              border: "none",
              borderRadius: 8,
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            <span>🖼️</span>
            <span>Logo KSP</span>
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

            {activeTab === "logo" && (
              <div style={{ padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 32 }}>🖼️</span>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1B4D3E" }}>Logo KSP</h2>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>Unggah logo resmi untuk kop surat dan laporan</p>
                  </div>
                </div>

                <div style={{ background: "#f9fafb", padding: 24, borderRadius: 12, border: "2px dashed #d1d5db" }}>
                  <div style={{ textAlign: "center" }}>
                    {logoBase64 ? (
                      <div>
                        <img
                          src={logoBase64}
                          alt="Logo KSP"
                          style={{
                            maxWidth: 300,
                            maxHeight: 200,
                            objectFit: "contain",
                            marginBottom: 16,
                            border: "2px solid #e5e7eb",
                            borderRadius: 8,
                            padding: 8,
                            background: "white"
                          }}
                        />
                        <div style={{ marginTop: 16 }}>
                          <button
                            onClick={handleRemoveLogo}
                            style={{
                              padding: "10px 24px",
                              background: "#dc2626",
                              color: "white",
                              border: "none",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: 14
                            }}
                          >
                            🗑️ Hapus Logo
                          </button>
                        </div>
                        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 12 }}>
                          Logo saat ini ditampilkan di header semua laporan.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🏛️</div>
                        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
                          Belum ada logo yang diupload. Upload logo untuk ditampilkan di header laporan.
                        </p>
                      </div>
                    )}

                    <div style={{ marginTop: 24 }}>
                      <label
                        htmlFor="logo-upload"
                        style={{
                          display: "inline-block",
                          padding: "12px 32px",
                          background: "#1B4D3E",
                          color: "white",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 14,
                          border: "none"
                        }}
                      >
                        📤 {logoBase64 ? "Ganti Logo" : "Upload Logo"}
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: "none" }}
                      />
                    </div>

                    <div style={{ marginTop: 16, fontSize: 12, color: "#9ca3af" }}>
                      Format yang didukung: PNG, JPG, JPEG, SVG<br />
                      Ukuran maksimal: 2MB
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, padding: 16, background: "#fef3c7", borderRadius: 8, fontSize: 12, color: "#92400e", border: "1px solid #fcd34d" }}>
                  <strong>Catatan:</strong> Logo yang diupload akan otomatis muncul di header semua laporan (Neraca, PHU, Arus Kas, dll) dan Slip SHU.
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
