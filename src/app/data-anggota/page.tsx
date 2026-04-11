"use client";
import { useState } from "react";
import Link from "next/link";

const mockAnggota: { id: number; nomor: string; nik: string; nama: string; tempatLahir: string; tanggalLahir: string; jkelamin: string; status: string; alamat: string; rt: string; rw: string; kel: string; kec: string; kota: string; telepon: string; email: string; pekerjaan: string; tempatKerja: string; pendapatan: string; statusKeanggotaan: string; tanggalJoin: string; saldo: number }[] = [];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function DataAnggotaPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedAnggota, setSelectedAnggota] = useState<typeof mockAnggota[0] | null>(null);

  const filteredAnggota = mockAnggota.filter(a => {
    const matchSearch = search === "" || 
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.nomor.toLowerCase().includes(search.toLowerCase()) ||
      a.nik.includes(search);
    const matchStatus = filterStatus === "" || a.statusKeanggotaan === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalSaldo = mockAnggota.reduce((acc, a) => acc + a.saldo, 0);
  const anggotaAktif = mockAnggota.filter(a => a.statusKeanggotaan === "Aktif").length;

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Header */}
      <header style={{ background: "var(--color-surface)", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <span style={{ fontSize: 32 }}>🏛️</span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--color-primary)" }}>KSP Mulia Dana Sejahtera</div>
              <div style={{ fontSize: 11, color: "var(--color-secondary)", letterSpacing: 1 }}>TERDAFTAR & TERAWASI</div>
            </div>
          </Link>
          <nav style={{ display: "flex", gap: 24 }}>
            <Link href="/" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Beranda</Link>
            <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Dashboard</Link>
            <Link href="/data-anggota" style={{ textDecoration: "none", color: "var(--color-primary)", fontWeight: 600, fontSize: 15 }}>Data Anggota</Link>
            <Link href="/transaksi" style={{ textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, fontSize: 15 }}>Transaksi</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{ padding: "120px 24px 64px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Total Anggota</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-primary)" }}>{mockAnggota.length}</div>
          </div>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Anggota Aktif</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{anggotaAktif}</div>
          </div>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Total Saldo</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-primary)" }}>{formatRupiah(totalSaldo)}</div>
          </div>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Non-Aktif</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{mockAnggota.length - anggotaAktif}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedAnggota ? "1fr 400px" : "1fr", gap: 24 }}>
          {/* Table */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20 }}>Data Anggota</h3>
              <div style={{ display: "flex", gap: 12 }}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, nomor, NIK..."
                  style={{ padding: "10px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 14, width: 200 }}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "2px solid #eee", fontSize: 14, background: "white" }}
                >
                  <option value="">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>No. Anggota</th>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Nama</th>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Telepon</th>
                  <th style={{ textAlign: "left", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Pekerjaan</th>
                  <th style={{ textAlign: "center", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Status</th>
                  <th style={{ textAlign: "right", padding: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnggota.map((a) => (
                  <tr 
                    key={a.id} 
                    onClick={() => setSelectedAnggota(a)}
                    style={{ 
                      borderBottom: "1px solid #f5f5f5", 
                      cursor: "pointer",
                      background: selectedAnggota?.id === a.id ? "#f0f9f4" : "transparent"
                    }}
                  >
                    <td style={{ padding: 12, fontSize: 14, fontFamily: "monospace" }}>{a.nomor}</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{a.nama}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{a.telepon}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{a.pekerjaan}</td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <span style={{ 
                        padding: "4px 12px", 
                        borderRadius: 12, 
                        fontSize: 12, 
                        background: a.statusKeanggotaan === "Aktif" ? "#d4edda" : "#f8d7da",
                        color: a.statusKeanggotaan === "Aktif" ? "#155724" : "#721c24"
                      }}>
                        {a.statusKeanggotaan}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: "right", fontWeight: 500 }}>{formatRupiah(a.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 16, textAlign: "center", fontSize: 14, color: "var(--color-text-secondary)" }}>
              Menampilkan {filteredAnggota.length} dari {mockAnggota.length} anggota
            </div>
          </div>

          {/* Detail */}
          {selectedAnggota && (
            <div className="card" style={{ padding: 24, height: "fit-content", position: "sticky", top: 100 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 18 }}>Detail Anggota</h3>
                <button onClick={() => setSelectedAnggota(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
              </div>
              
              <div style={{ marginBottom: 16, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>
                  {selectedAnggota.nama.charAt(0)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{selectedAnggota.nama}</div>
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>{selectedAnggota.nomor}</div>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>NIK</div>
                  <div style={{ fontSize: 14, fontFamily: "monospace" }}>{selectedAnggota.nik}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Tempat, Tanggal Lahir</div>
                  <div style={{ fontSize: 14 }}>{selectedAnggota.tempatLahir}, {selectedAnggota.tanggalLahir}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Jenis Kelamin / Status</div>
                  <div style={{ fontSize: 14 }}>{selectedAnggota.jkelamin} / {selectedAnggota.status}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Alamat</div>
                  <div style={{ fontSize: 14 }}>
                    {selectedAnggota.alamat}, RT {selectedAnggota.rt}/RW {selectedAnggota.rw}<br />
                    {selectedAnggota.kel}, {selectedAnggota.kec}, {selectedAnggota.kota}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Telepon / Email</div>
                  <div style={{ fontSize: 14 }}>{selectedAnggota.telepon}<br />{selectedAnggota.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Pekerjaan</div>
                  <div style={{ fontSize: 14 }}>{selectedAnggota.pekerjaan} di {selectedAnggota.tempatKerja}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Pendapatan</div>
                  <div style={{ fontSize: 14 }}>{selectedAnggota.pendapatan} / bulan</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Tanggal Join</div>
                  <div style={{ fontSize: 14 }}>{selectedAnggota.tanggalJoin}</div>
                </div>
                <div style={{ padding: 12, background: "var(--color-primary)", borderRadius: 8, color: "white", textAlign: "center" }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Saldo Total</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{formatRupiah(selectedAnggota.saldo)}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <button style={{ padding: "12px", background: "var(--color-primary)", color: "white", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500 }}>
                  Edit
                </button>
                <button style={{ padding: "12px", background: "var(--color-secondary)", color: "var(--color-accent)", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 500 }}>
                  Transaksi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}