"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useData, Anggota } from "../context/DataContext";

export default function SimpananKartuPage() {
  const { anggota, simpanan } = useData();
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<number>(0);

  const anggotaList = useMemo(() => anggota || [], [anggota]);

  const selectedAnggota = useMemo(() => {
    return anggotaList.find((a: Anggota) => a.id === selectedAnggotaId);
  }, [anggotaList, selectedAnggotaId]);

  const simpananHistory = useMemo(() => {
    if (!selectedAnggotaId) return [];
    return (simpanan || [])
      .filter((s: any) => s.idAnggota === selectedAnggotaId)
      .sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [simpanan, selectedAnggotaId]);

  const saldoPokok = useMemo(() => {
    return simpananHistory
      .filter((s: any) => s.jenisSimpanan === "pokok")
      .reduce((sum: number, s: any) => sum + s.jumlah, 0);
  }, [simpananHistory]);

  const saldoWajib = useMemo(() => {
    return simpananHistory
      .filter((s: any) => s.jenisSimpanan === "wajib")
      .reduce((sum: number, s: any) => sum + s.jumlah, 0);
  }, [simpananHistory]);

  const totalSaldo = saldoPokok + saldoWajib;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E", marginBottom: 8 }}>Kartu Simpanan Anggota</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Riwayat Simpanan Pokok & Wajib - KSP Mulia Dana Sejahtera</p>
      </div>

      <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <Link href="/anggota" style={{ padding: "10px 20px", background: "#1B4D3E", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
          ← Kembali ke Anggota
        </Link>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginBottom: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#1B4D3E", fontSize: 14 }}>
            Pilih Anggota
          </label>
          <select
            value={selectedAnggotaId}
            onChange={(e) => setSelectedAnggotaId(Number(e.target.value))}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "2px solid #1B4D3E",
              fontSize: 14,
              background: "white",
              cursor: "pointer"
            }}
          >
            <option value={0}>-- Pilih Anggota --</option>
            {anggotaList.map((a: Anggota) => (
              <option key={a.id} value={a.id}>
                {a.nomorNBA} - {a.nama} ({a.nik})
              </option>
            ))}
          </select>
        </div>

        {selectedAnggota && (
          <div style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
            border: "2px solid #22c55e"
          }}>
            <div style={{ fontSize: 12, color: "#166534", marginBottom: 8, fontWeight: 600 }}>DATA ANGGOTA</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#166534" }}>No. NBA</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1B4D3E" }}>{selectedAnggota.nomorNBA}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#166534" }}>Nama</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{selectedAnggota.nama}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#166534" }}>NIK</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{selectedAnggota.nik}</div>
              </div>
            </div>
          </div>
        )}

        {selectedAnggota && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 32,
              marginTop: 24
            }}>
              <div style={{
                background: "#fef3c7",
                padding: 20,
                borderRadius: 12,
                border: "2px solid #f59e0b",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 12, color: "#92400e", marginBottom: 4 }}>Simpanan Pokok</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1B4D3E" }}>{formatRupiah(saldoPokok)}</div>
              </div>
              <div style={{
                background: "#dbeafe",
                padding: 20,
                borderRadius: 12,
                border: "2px solid #3b82f6",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 12, color: "#1e40af", marginBottom: 4 }}>Simpanan Wajib</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1B4D3E" }}>{formatRupiah(saldoWajib)}</div>
              </div>
              <div style={{
                background: "#dcfce7",
                padding: 20,
                borderRadius: 12,
                border: "2px solid #22c55e",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 12, color: "#166534", marginBottom: 4 }}>TOTAL SALDO</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1B4D3E" }}>{formatRupiah(totalSaldo)}</div>
              </div>
            </div>

            {simpananHistory.length > 0 ? (
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 16, color: "#1B4D3E" }}>
                  📋 Riwayat Transaksi Simpanan
                  <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400, marginLeft: 8 }}>
                    ({simpananHistory.length} transaksi)
                  </span>
                </h3>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>No</th>
                        <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tanggal</th>
                        <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Jenis</th>
                        <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Metode</th>
                        <th style={{ padding: 12, textAlign: "right", borderBottom: "2px solid #ddd" }}>Jumlah</th>
                        <th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #ddd" }}>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simpananHistory.map((s: any, index: number) => (
                        <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: 12, color: "#6b7280", fontSize: 12 }}>{simpananHistory.length - index}</td>
                          <td style={{ padding: 12, fontSize: 12 }}>{s.tanggal}</td>
                          <td style={{ padding: 12 }}>
                            <span style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: s.jenisSimpanan === "pokok" ? "#fef3c7" : "#dbeafe",
                              color: s.jenisSimpanan === "pokok" ? "#92400e" : "#1e40af"
                            }}>
                              {s.jenisSimpanan.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: 12, fontSize: 12, textTransform: "capitalize" }}>{s.metode}</td>
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 600, color: s.jumlah < 0 ? "#dc2626" : "#059669" }}>
                            {formatRupiah(s.jumlah)}
                          </td>
                          <td style={{ padding: 12, textAlign: "center", fontSize: 11, color: "#6b7280" }}>
                            {s.jumlah < 0 ? "Penarikan" : "Setoran"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 48, background: "#f9fafb", borderRadius: 12 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p style={{ color: "#6b7280", fontSize: 14 }}>Belum ada transaksi simpanan untuk anggota ini.</p>
              </div>
            )}
          </>
        )}

        {!selectedAnggota && (
          <div style={{ textAlign: "center", padding: 64, background: "#f0f9ff", borderRadius: 12 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>👤</div>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 8 }}>Pilih anggota untuk melihat kartu simpanan</p>
            <p style={{ color: "#9ca3af", fontSize: 12 }}>Semua data akan diupdate secara otomatis</p>
          </div>
        )}
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", fontSize: 12, color: "#6b7280" }}>
        <strong>📌 Catatan:</strong>
        <ul style={{ marginTop: 8, marginLeft: 20, lineHeight: 1.8 }}>
          <li>Simpanan Pokok disetor saat pendaftaran anggota</li>
          <li>Simpanan Wajib disetor周期 (mingguan/bulanan)</li>
          <li>Penarikan hanya bisa dilakukan jika status aktif</li>
          <li>Data diupdate secara real-time dari semua modul</li>
        </ul>
      </div>
    </div>
  );
}
