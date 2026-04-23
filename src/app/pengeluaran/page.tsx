"use client";
import { useState } from "react";
import { useData, Pengeluaran } from "../context/DataContext";

const formatRupiah = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const formatRupiahNum = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const getKategoriLabel = (kategori: string) => {
  const labels: Record<string, string> = {
    "bunga-sukarela-berjangka": "Beban Bunga Simpanan Sukarela Berjangka (Sisujang)",
    "bunga-sibuhar": "Beban Bunga Simpanan Bunga Harian (Sibuhar)",
    "bunga-simapan": "Beban Bunga Simpanan Masa Depan (Simapan)",
    "bunga-sihat": "Beban Bunga Simpanan Hari Tua (Sihat)",
    "bunga-sihar": "Beban Bunga Simpanan Hari Raya (Sihar)",
    "perlengkapan-kantor": "Biaya Perlengkapan Kantor",
    "atk": "Biaya Alat Tulis Kantor (ATK)",
    "gaji-manager": "Biaya Gaji Manager",
    "gaji-admin": "Biaya Gaji Admin",
    "gaji-kasir": "Biaya Gaji Kasir",
    "gaji-marketing": "Biaya Gaji Marketing",
    "entertainment": "Biaya Entertainment",
    "insentif-baru-pendiri": "Biaya Insentif Anggota Baru (Pendiri)",
    "insentif-baru-karyawan": "Biaya Insentif Anggota Baru (Karyawan)",
    "iptw-pinjaman": "Biaya Insentif Pembayaran Tepat Waktu (IPTW) Pinjaman",
  };
  return labels[kategori] || kategori;
};

const allKategoriPengeluaran = [
  { value: "bunga-sukarela-berjangka", label: "Beban Bunga Simpanan Sukarela Berjangka (Sisujang)" },
  { value: "bunga-sibuhar", label: "Beban Bunga Simpanan Bunga Harian (Sibuhar)" },
  { value: "bunga-simapan", label: "Beban Bunga Simpanan Masa Depan (Simapan)" },
  { value: "bunga-sihat", label: "Beban Bunga Simpanan Hari Tua (Sihat)" },
  { value: "bunga-sihar", label: "Beban Bunga Simpanan Hari Raya (Sihar)" },
  { value: "perlengkapan-kantor", label: "Biaya Perlengkapan Kantor" },
  { value: "atk", label: "Biaya Alat Tulis Kantor (ATK)" },
  { value: "gaji-manager", label: "Biaya Gaji Manager" },
  { value: "gaji-admin", label: "Biaya Gaji Admin" },
  { value: "gaji-kasir", label: "Biaya Gaji Kasir" },
  { value: "gaji-marketing", label: "Biaya Gaji Marketing" },
  { value: "entertainment", label: "Biaya Entertainment" },
  { value: "insentif-baru-pendiri", label: "Biaya Insentif Anggota Baru (Pendiri)" },
  { value: "insentif-baru-karyawan", label: "Biaya Insentif Anggota Baru (Karyawan)" },
  { value: "iptw-pinjaman", label: "Biaya Insentif Pembayaran Tepat Waktu (IPTW) Pinjaman" },
];

const allMetodePembayaran = [
  { value: "tunai", label: "Tunai" },
  { value: "bri-tigabinanga", label: "Transfer BRI Cab. Tigabinanga" },
  { value: "bri-berastagi", label: "Transfer BRI Cab. Berastagi" },
  { value: "bpr-logo-asri", label: "Transfer BPR Logo Asri" },
];

export default function PengeluaranPage() {
  const { pengeluaran, addPengeluaran, deletePengeluaran } = useData();
  const [activeTab, setActiveTab] = useState<"input" | "data">("input");
  const [formData, setFormData] = useState({
    tanggal: "",
    kategori: "",
    uraian: "",
    jumlah: "",
    metodePembayaran: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteFilter, setDeleteFilter] = useState<Set<string>>(new Set());
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const filteredPengeluaran = (searchQuery: string) => {
    if (!searchQuery) return pengeluaran;
    const q = searchQuery.toLowerCase();
    return pengeluaran.filter(p =>
      (p.kategori && p.kategori.toLowerCase().includes(q)) ||
      (p.uraian && p.uraian.toLowerCase().includes(q)) ||
      (p.metodePembayaran && p.metodePembayaran.toLowerCase().includes(q))
    );
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!formData.kategori) errors.kategori = "Kategori pengeluaran wajib dipilih";
    if (!formData.uraian.trim()) errors.uraian = "Uraian/deskripsi wajib diisi";
    if (!formData.jumlah) errors.jumlah = "Jumlah wajib diisi";
    if (!formData.metodePembayaran) errors.metodePembayaran = "Metode pembayaran wajib dipilih";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const jumlahNum = parseInt(formData.jumlah.replace(/\D/g, ""));

      const newPengeluaran: Pengeluaran = {
        id: pengeluaran.length + 1,
        tanggal: formData.tanggal,
        kategori: formData.kategori,
        uraian: formData.uraian.trim(),
        jumlah: jumlahNum,
        metodePembayaran: formData.metodePembayaran,
        operator: "Admin",
      };
      addPengeluaran(newPengeluaran);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ tanggal: "", kategori: "", uraian: "", jumlah: "", metodePembayaran: "" });
      }, 3000);
    }
  };

  const getMetodeLabel = (metode: string) => {
    const found = allMetodePembayaran.find(m => m.value === metode);
    return found ? found.label : metode;
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💸</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E", marginBottom: 8 }}>Pengeluaran</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Pencatatan biaya dan pengeluaran KSP</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "white", padding: 6, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflowX: "auto" }}>
        <button onClick={() => setActiveTab("input")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "input" ? "#1B4D3E" : "transparent", color: activeTab === "input" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📝 Input</button>
        <button onClick={() => setActiveTab("data")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "data" ? "#1B4D3E" : "transparent", color: activeTab === "data" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📋 Data ({pengeluaran.length})</button>
      </div>

      {activeTab === "input" && (
        <div>
          {submitted && (
            <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>
              ✓ Data pengeluaran berhasil disimpan!
            </div>
          )}

          <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Tanggal *</label>
                  <input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.tanggal ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} />
                  {formErrors.tanggal && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.tanggal}</div>}
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Kategori Pengeluaran *</label>
                  <select value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.kategori ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}>
                    <option value="">Pilih kategori</option>
                    {allKategoriPengeluaran.map(k => (
                      <option key={k.value} value={k.value}>{k.label}</option>
                    ))}
                  </select>
                  {formErrors.kategori && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.kategori}</div>}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Uraian / Deskripsi *</label>
                <input type="text" value={formData.uraian} onChange={(e) => setFormData({ ...formData, uraian: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.uraian ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="Contoh: Bunga Simpanan Sibuhar bulan Januari 2024" />
                {formErrors.uraian && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.uraian}</div>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Jumlah (Rp) *</label>
                  <input type="text" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: formatRupiah(e.target.value) })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.jumlah ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="Rp 0" />
                  {formErrors.jumlah && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jumlah}</div>}
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Metode Pembayaran *</label>
                  <select value={formData.metodePembayaran} onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.metodePembayaran ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}>
                    <option value="">Pilih metode</option>
                    {allMetodePembayaran.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  {formErrors.metodePembayaran && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.metodePembayaran}</div>}
                </div>
              </div>

              <button type="submit" style={{ width: "100%", padding: 14, background: "#1B4D3E", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Simpan Pengeluaran</button>
            </form>

            {pengeluaran.length > 0 && (
              <div style={{ marginTop: 32, padding: 20, background: "#fef2f2", borderRadius: 12, border: "2px solid #fecaca" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#991b1b", marginBottom: 12 }}>
                  ⚠️ Hapus Semua Data Pengeluaran
                </div>
                <div style={{ fontSize: 12, color: "#7f1d1d", marginBottom: 16 }}>
                  Menghapus semua data pengeluaran. Tindakan ini tidak bisa dibatalkan.
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus SEMUA data pengeluaran? Total ${pengeluaran.length} transaksi akan dihapus.`)) {
                      pengeluaran.forEach(p => deletePengeluaran(p.id));
                      alert("Semua data pengeluaran berhasil dihapus!");
                    }
                  }}
                  style={{ width: "100%", padding: 12, background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                >
                  🗑️ Hapus Semua Pengeluaran
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          {pengeluaran.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>Belum ada data pengeluaran.</div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Cari berdasarkan kategori, uraian, atau metode..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "2px solid #ddd", fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16, padding: 16, background: "#fef2f2", borderRadius: 12, border: "2px solid #fecaca" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
                    🗑️ Hapus Pengeluaran Berdasarkan Kategori
                  </div>
                  <button
                    onClick={() => setShowDeleteOptions(!showDeleteOptions)}
                    style={{ padding: "6px 12px", background: "#6b7280", color: "white", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                  >
                    {showDeleteOptions ? "⊖ Tutup" : "+ Pilih Kategori"}
                  </button>
                </div>

                {showDeleteOptions && (
                  <div>
                    <div style={{ fontSize: 11, color: "#7f1d1d", marginBottom: 12 }}>
                      Pilih satu atau lebih kategori pengeluaran yang akan dihapus:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8, marginBottom: 16 }}>
                      {allKategoriPengeluaran.map(kat => {
                        const count = pengeluaran.filter(p => p.kategori === kat.value).length;
                        if (count === 0) return null;
                        const isChecked = deleteFilter.has(kat.value);
                        return (
                          <label key={kat.value} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, background: "white", borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newFilter = new Set(deleteFilter);
                                if (e.target.checked) newFilter.add(kat.value);
                                else newFilter.delete(kat.value);
                                setDeleteFilter(newFilter);
                              }}
                              style={{ width: 16, height: 16 }}
                            />
                            <span style={{ fontSize: 13, color: "#374151" }}>{kat.label}</span>
                            <span style={{ fontSize: 11, color: "#6b7280", marginLeft: "auto" }}>({count})</span>
                          </label>
                        );
                      })}
                    </div>

                    {deleteFilter.size > 0 && (
                      <div style={{ padding: 12, background: "#fee2e2", borderRadius: 8, marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: "#991b1b", marginBottom: 4 }}>
                          Akan dihapus: {Array.from(deleteFilter).map(k => allKategoriPengeluaran.find(kat => kat.value === k)?.label).join(", ")}
                        </div>
                        <div style={{ fontSize: 11, color: "#dc2626" }}>
                          Total transaksi: {pengeluaran.filter(p => deleteFilter.has(p.kategori)).length} data
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (deleteFilter.size === 0) {
                          alert("Pilih minimal satu kategori untuk dihapus!");
                          return;
                        }
                        const toDelete = pengeluaran.filter(p => deleteFilter.has(p.kategori));
                        const confirmMsg = `Yakin menghapus ${toDelete.length} transaksi pengeluaran dari:\n${Array.from(deleteFilter).map(k => `  • ${allKategoriPengeluaran.find(kat => kat.value === k)?.label}`).join("\n")}\n\nTindakan ini tidak bisa dibatalkan!`;
                        if (!confirm(confirmMsg)) return;

                        toDelete.forEach(p => deletePengeluaran(p.id));
                        setDeleteFilter(new Set());
                        setShowDeleteOptions(false);
                        alert(`Berhasil menghapus ${toDelete.length} transaksi pengeluaran!`);
                      }}
                      style={{ width: "100%", padding: 12, background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                    >
                      🗑️ Hapus {deleteFilter.size > 0 ? `${pengeluaran.filter(p => deleteFilter.has(p.kategori)).length} Transaksi Terpilih` : "Transaksi Terpilih"}
                    </button>
                  </div>
                )}
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tanggal</th>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Kategori</th>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Uraian</th>
                    <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>Jumlah</th>
                    <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Metode</th>
                    <th style={{ padding: 10, textAlign: "center", borderBottom: "2px solid #ddd" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPengeluaran(searchQuery).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 10 }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td style={{ padding: 10 }}>{p.tanggal}</td>
                      <td style={{ padding: 10, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={getKategoriLabel(p.kategori)}>{getKategoriLabel(p.kategori)}</td>
                      <td style={{ padding: 10 }}>{p.uraian}</td>
                      <td style={{ padding: 10, textAlign: "right", color: "#dc2626", fontWeight: 600 }}>{formatRupiahNum(p.jumlah)}</td>
                      <td style={{ padding: 10 }}>{getMetodeLabel(p.metodePembayaran)}</td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus pengeluaran "${getKategoriLabel(p.kategori)}" sebesar Rp ${p.jumlah.toLocaleString("id-ID")}?`)) {
                              deletePengeluaran(p.id);
                              alert("Data pengeluaran berhasil dihapus!");
                            }
                          }}
                          style={{ padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPengeluaran(searchQuery).length > itemsPerPage && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 20, gap: 8 }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "8px 16px", background: currentPage === 1 ? "#ddd" : "#1B4D3E", color: currentPage === 1 ? "#888" : "white", border: "none", borderRadius: 6, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: 13 }}>← Prev</button>
                  <span style={{ padding: "8px 16px", fontSize: 13 }}>Halaman {currentPage} dari {Math.ceil(filteredPengeluaran(searchQuery).length / itemsPerPage)}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredPengeluaran(searchQuery).length / itemsPerPage), p + 1))} disabled={currentPage >= Math.ceil(filteredPengeluaran(searchQuery).length / itemsPerPage)} style={{ padding: "8px 16px", background: currentPage >= Math.ceil(filteredPengeluaran(searchQuery).length / itemsPerPage) ? "#ddd" : "#1B4D3E", color: currentPage >= Math.ceil(filteredPengeluaran(searchQuery).length / itemsPerPage) ? "#888" : "white", border: "none", borderRadius: 6, cursor: currentPage >= Math.ceil(filteredPengeluaran(searchQuery).length / itemsPerPage) ? "not-allowed" : "pointer", fontSize: 13 }}>Next →</button>
                </div>
              )}

              {pengeluaran.length > 0 && (
                <div style={{ marginTop: 24, padding: 16, background: "#fef2f2", borderRadius: 12, border: "2px solid #fecaca" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", marginBottom: 8 }}>
                    ⚠️ Hapus Semua Data Pengeluaran
                  </div>
                  <div style={{ fontSize: 11, color: "#7f1d1d", marginBottom: 12 }}>
                    Menghapus semua transaksi pengeluaran. Tindakan ini permanen.
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus SEMUA data pengeluaran? Total ${pengeluaran.length} transaksi akan dihapus.`)) {
                        pengeluaran.forEach(p => deletePengeluaran(p.id));
                        alert("Semua data pengeluaran berhasil dihapus!");
                      }
                    }}
                    style={{ width: "100%", padding: 12, background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                  >
                    🗑️ Hapus Semua Pengeluaran
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
