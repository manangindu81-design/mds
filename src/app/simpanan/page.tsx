"use client";
import { useState, useRef } from "react";
import { useData, Simpanan as SimpananType } from "../context/DataContext";

const formatRupiah = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const formatRupiahNum = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const getJenisLabel = (jenis: string) => {
  const labels: Record<string, string> = {
    pokok: "Simpanan Pokok",
    wajib: "Simpanan Wajib",
    sukarela: "Simpanan Sukarela",
    sibuhar: "Sibuhar (3%/th)",
    simapan: "Simapan (5%/th)",
    sihat: "Sihat (6%/th)",
    sihar: "Sihar (4%/th)",
    berjangka: "Simpanan Berjangka",
  };
  return labels[jenis] || jenis;
};

const getAkunLabel = (metode: string) => {
  const labels: Record<string, string> = {
    tunai: "Kas",
    "bri-tigabinanga": "Bank BRI Cab. Tigabinanga",
    "bri-berastagi": "Bank BRI Cab. Berastagi",
    "bpr-logo-asri": "Bank BPR Logo Asri",
  };
  return labels[metode] || "Kas";
};

const getKategoriSimpanan = (jenis: string) => {
  switch (jenis) {
    case "pokok": return "Setoran Simpanan Pokok";
    case "wajib": return "Setoran Simpanan Wajib";
    case "sibuhar": return "Setoran Sibuhar";
    case "simapan": return "Setoran Simapan";
    case "sihat": return "Setoran Sihat";
    case "sihar": return "Setoran Sihar";
    case "berjangka": return "Setoran Berjangka";
    default: return "Setoran Anggota";
  }
};

export default function SimpananPage() {
  const { simpanan, addSimpanan, addTransaksi, anggota } = useData();
  const [activeTab, setActiveTab] = useState<"input" | "data" | "import" | "kartu" | "jurnal">("input");
  const [selectedAnggota, setSelectedAnggota] = useState<number | "">(0);
  const [formData, setFormData] = useState({
    nama: "",
    nomorAnggota: "",
    tanggal: "",
    jenisSimpanan: "",
    jumlah: "",
    metodePembayaran: "",
    catatan: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lastSavedTransaction, setLastSavedTransaction] = useState<{
    noBukti: string; nama: string; jenisSimpanan: string; jumlah: number; metode: string; tanggal: string;
  } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nama.trim()) errors.nama = "Nama wajib diisi";
    if (!formData.nomorAnggota.trim()) errors.nomorAnggota = "Nomor anggota wajib diisi";
    if (!formData.tanggal) errors.tanggal = "Tanggal wajib diisi";
    if (!formData.jenisSimpanan) errors.jenisSimpanan = "Jenis simpanan wajib dipilih";
    if (!formData.jumlah) errors.jumlah = "Jumlah wajib diisi";
    if (!formData.metodePembayaran) errors.metodePembayaran = "Metode pembayaran wajib dipilih";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const jumlahNum = parseInt(formData.jumlah.replace(/\D/g, ""));
      const newSimpanan: SimpananType = {
        id: simpanan.length + 1,
        idAnggota: 0,
        nama: formData.nama,
        nomorAnggota: formData.nomorAnggota,
        tanggal: formData.tanggal,
        jenisSimpanan: formData.jenisSimpanan,
        jumlah: jumlahNum,
        metode: formData.metodePembayaran,
        bunga: 0,
      };
      addSimpanan(newSimpanan);
      
      const getAkun = (metode: string) => {
        if (metode === "tunai") return "Kas";
        if (metode === "bri-tigabinanga") return "Bank BRI Cab. Tigabinanga";
        if (metode === "bri-berastagi") return "Bank BRI Cab. Berastagi";
        if (metode === "bpr-logo-asri") return "Bank BPR Logo Asri";
        return "Kas";
      };
      
      // Mapping jenis simpanan ke kategori jurnal
      const getKategoriSimpanan = (jenis: string) => {
        switch (jenis) {
          case "pokok": return "Setoran Simpanan Pokok";
          case "wajib": return "Setoran Simpanan Wajib";
          case "sibuhar": return "Setoran Sibuhar";
          case "simapan": return "Setoran Simapan";
          case "sihat": return "Setoran Sihat";
          case "sihar": return "Setoran Sihar";
          case "berjangka": return "Setoran Berjangka";
          default: return "Setoran Anggota";
        }
      };
      
      addTransaksi({
        id: 0,
        noBukti: `SM-${formData.tanggal.replace(/-/g, "")}-${String(simpanan.length + 1).padStart(3, "0")}`,
        tanggal: formData.tanggal,
        jam: "10:00",
        akun: getAkun(formData.metodePembayaran),
        kategori: getKategoriSimpanan(formData.jenisSimpanan),
        uraian: `${formData.jenisSimpanan} - ${formData.nama}`,
        debet: jumlahNum,
        kredit: 0,
        saldo: 0,
        operator: "Admin",
      });
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ nama: "", nomorAnggota: "", tanggal: "", jenisSimpanan: "", jumlah: "", metodePembayaran: "", catatan: "" });
      }, 3000);
    }
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B4D3E", marginBottom: 8 }}>Input Simpanan</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Formulir pencatatan simpanan anggota</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "white", padding: 6, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflowX: "auto" }}>
        <button onClick={() => setActiveTab("input")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "input" ? "#1B4D3E" : "transparent", color: activeTab === "input" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📝 Input</button>
        <button onClick={() => setActiveTab("data")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "data" ? "#1B4D3E" : "transparent", color: activeTab === "data" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📋 Data ({simpanan.length})</button>
        <button onClick={() => setActiveTab("import")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "import" ? "#1B4D3E" : "transparent", color: activeTab === "import" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📥 Import</button>
        <button onClick={() => setActiveTab("kartu")} style={{ padding: "10px 16px", border: "none", borderRadius: 8, background: activeTab === "kartu" ? "#1B4D3E" : "transparent", color: activeTab === "kartu" ? "white" : "#1B4D3E", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>📒 Kartu Simpanan</button>
      </div>

      {activeTab === "input" && (
        <div>
        {submitted && (
        <div style={{ background: "#d4edda", color: "#155724", padding: 16, borderRadius: 8, marginBottom: 24, textAlign: "center" }}>
          ✓ Data simpanan berhasil disimpan!
        </div>
      )}

      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nama Lengkap *</label>
              <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.nama ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="Nama lengkap" />
              {formErrors.nama && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.nama}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Nomor Anggota *</label>
              <input type="text" value={formData.nomorAnggota} onChange={(e) => setFormData({ ...formData, nomorAnggota: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.nomorAnggota ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="AG-001" />
              {formErrors.nomorAnggota && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.nomorAnggota}</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Tanggal *</label>
              <input type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.tanggal ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} />
              {formErrors.tanggal && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.tanggal}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Jenis Simpanan *</label>
              <select value={formData.jenisSimpanan} onChange={(e) => setFormData({ ...formData, jenisSimpanan: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.jenisSimpanan ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}>
                <option value="">Pilih jenis</option>
                <option value="pokok">Simpanan Pokok</option>
                <option value="wajib">Simpanan Wajib</option>
                <option value="sibuhar">Sibuhar (Bunga Harian 3%/th)</option>
                <option value="simapan">Simapan (Masa Depan 5%/th, 100rb-1JT/bln, 1-10 thn)</option>
                <option value="sihat">Sihat (Hari Tua 6%/th, 100rb-1JT/bln, 1-15 thn)</option>
                <option value="sihar">Sihar (Hari Raya 4%/th, 100rb-500rb/bln, 12 bln)</option>
                <option value="berjangka">Simpanan Berjangka</option>
              </select>
              {formErrors.jenisSimpanan && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jenisSimpanan}</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Jumlah (Rp) *</label>
              <input type="text" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: formatRupiah(e.target.value) })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.jumlah ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14 }} placeholder="Rp 0" />
              {formErrors.jumlah && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.jumlah}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Metode *</label>
              <select value={formData.metodePembayaran} onChange={(e) => setFormData({ ...formData, metodePembayaran: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 8, border: formErrors.metodePembayaran ? "2px solid #e74c3c" : "2px solid #ddd", fontSize: 14, background: "white" }}>
                <option value="">Pilih metode</option>
                <option value="tunai">Tunai</option>
                <option value="bri-tigabinanga">Bank BRI Cab. Tigabinanga</option>
                <option value="bri-berastagi">Bank BRI Cab. Berastagi</option>
                <option value="bpr-logo-asri">Bank BPR Logo Asri</option>
              </select>
              {formErrors.metodePembayaran && <div style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{formErrors.metodePembayaran}</div>}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Catatan</label>
            <textarea value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} rows={3} style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, resize: "vertical" }} placeholder="Catatan tambahan (opsional)" />
          </div>

          <button type="submit" style={{ width: "100%", padding: 14, background: "#1B4D3E", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Simpan Data</button>
        </form>
        </div>
        </div>
        )}

        {activeTab === "data" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          {simpanan.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>Belum ada data simpanan.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Tanggal</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Jenis</th>
                  <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>Jumlah</th>
                  <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>Metode</th>
                </tr>
              </thead>
              <tbody>
                {simpanan.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 10 }}>{i + 1}</td>
                    <td style={{ padding: 10 }}>{s.tanggal}</td>
                    <td style={{ padding: 10 }}>{s.nama}</td>
                    <td style={{ padding: 10 }}>{getJenisLabel(s.jenisSimpanan)}</td>
                    <td style={{ padding: 10, textAlign: "right" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(s.jumlah)}</td>
                    <td style={{ padding: 10 }}>{s.metode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "import" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <p style={{ color: "#6b7280", textAlign: "center" }}>Fitur import simpanan dalam pengembangan.</p>
        </div>
      )}

      {activeTab === "kartu" && (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 18, marginBottom: 20, color: "#1B4D3E" }}>📒 Kartu Simpanan Anggota</h3>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 500, marginBottom: 8 }}>Pilih Anggota</label>
            <select 
              value={selectedAnggota} 
              onChange={(e) => setSelectedAnggota(e.target.value ? Number(e.target.value) : 0)}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #ddd", fontSize: 14, background: "white" }}
            >
              <option value={0}>-- Pilih Anggota --</option>
              {anggota.map(a => (
                <option key={a.id} value={a.id}>{a.nama} (NBA: {(a as any).nomorNBA || "-"})</option>
              ))}
            </select>
          </div>

          {Number(selectedAnggota) > 0 && (
            <>
              {(() => {
                const anggotaData = anggota.find(a => a.id === selectedAnggota);
                const mutasi = simpanan.filter(s => s.idAnggota === selectedAnggota);
                const totalSaldo = mutasi.reduce((sum, s) => sum + s.jumlah, 0);
                
                return (
                  <div>
                    <div style={{ background: "#f0fdf4", padding: 16, borderRadius: 8, marginBottom: 20 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{anggotaData?.nama}</h4>
                      <p style={{ fontSize: 13, color: "#6b7280" }}>No. NBA: {(anggotaData as any)?.nomorNBA || "-"}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1B4D3E", marginTop: 8 }}>Total Saldo: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalSaldo)}</p>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>TANGGAL</th>
                          <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>JENIS</th>
                          <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>DEBET (MASUK)</th>
                          <th style={{ padding: 10, textAlign: "right", borderBottom: "2px solid #ddd" }}>SALDO</th>
                          <th style={{ padding: 10, textAlign: "left", borderBottom: "2px solid #ddd" }}>METODE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mutasi.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>Belum ada transaksi simpanan.</td></tr>
                        ) : (
                          mutasi.map((s, i) => {
                            const saldoSekarang = mutasi.slice(0, i + 1).reduce((sum, m) => sum + m.jumlah, 0);
                            return (
                              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: 10 }}>{s.tanggal}</td>
                                <td style={{ padding: 10, fontWeight: 500 }}>{getJenisLabel(s.jenisSimpanan)}</td>
                                <td style={{ padding: 10, textAlign: "right", color: "#22c55e" }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(s.jumlah)}</td>
                                <td style={{ padding: 10, textAlign: "right", fontWeight: 600 }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(saldoSekarang)}</td>
                                <td style={{ padding: 10 }}>{s.metode}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>

                    <button 
                      onClick={() => window.print()}
                      style={{ marginTop: 20, padding: "12px 24px", background: "#1B4D3E", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                    >
                      🖨️ Cetak Kartu Simpanan
                    </button>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}