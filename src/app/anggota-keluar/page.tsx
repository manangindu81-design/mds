"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useData, Anggota } from "../context/DataContext";

export default function AnggotaKeluarPage() {
  const { anggota, simpanan, addSimpanan, addTransaksi, updateAnggota } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredAnggota = useMemo(() => {
    const list = anggota || [];
    if (!searchQuery) return list.filter(a => a.statusKeanggotaan !== "Non-Aktif");
    const q = searchQuery.toLowerCase();
    return list.filter(a => 
      a.statusKeanggotaan !== "Non-Aktif" &&
      ((a.nama && a.nama.toLowerCase().includes(q)) ||
      (a.nomorNBA && a.nomorNBA.toLowerCase().includes(q)) ||
      (a.nik && a.nik.includes(searchQuery)))
    );
  }, [anggota, searchQuery]);
  
  const nonAktifList = useMemo(() => {
    return (anggota || []).filter(a => a.statusKeanggotaan === "Non-Aktif");
  }, [anggota]);

  const handlePengunduran = (id: number) => {
    const targetDate = new Date().toISOString().split("T")[0];
    const biayaPengunduran = 50000;
    
    const agg = (anggota || []).find((a: Anggota) => a.id === id);
    if (!agg) return;
    
    const simpananList = simpanan || [];
    const aggSimpanan = simpananList.filter((s: any) => s.idAnggota === id && (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib"));
    const totalSimpanan = aggSimpanan.reduce((sum: number, s: any) => sum + s.jumlah, 0);
    
    const confirmMsg = `anggota: ${agg.nama}
No. NBA: ${agg.nomorNBA || "-"}

Simpanan Pokok: Rp ${aggSimpanan.filter((s: any) => s.jenisSimpanan === "pokok").reduce((sum: number, s: any) => sum + s.jumlah, 0).toLocaleString("id-ID")}
Simpanan Wajib: Rp ${aggSimpanan.filter((s: any) => s.jenisSimpanan === "wajib").reduce((sum: number, s: any) => sum + s.jumlah, 0).toLocaleString("id-ID")}
Total Simpanan: Rp ${totalSimpanan.toLocaleString("id-ID")}

Biaya Pengunduran Diri: Rp ${biayaPengunduran.toLocaleString("id-ID")}

Yakin ingin memproses?`;
    
    if (!confirm(confirmMsg)) return;
    
    updateAnggota(id, {
      statusKeanggotaan: "Non-Aktif",
      tanggalPengunduran: targetDate
    });
    
    aggSimpanan.forEach((s: any, i: number) => {
      addSimpanan({
        id: 0,
        idAnggota: id,
        nama: agg.nama,
        nomorAnggota: agg.nomorNBA || "",
        tanggal: targetDate,
        jenisSimpanan: s.jenisSimpanan,
        jumlah: -Math.abs(s.jumlah),
        metode: "tunai",
        bunga: 0,
      });
      
      addTransaksi({
        id: 0,
        noBukti: `PD-${targetDate.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
        tanggal: targetDate,
        jam: "10:00",
        akun: "Kas",
        kategori: `Penarikan Simpanan ${s.jenisSimpanan.charAt(0).toUpperCase() + s.jenisSimpanan.slice(1)}`,
        uraian: `Penarikan Simpanan ${s.jenisSimpanan} ${agg.nama}`,
        debet: 0,
        kredit: Math.abs(s.jumlah),
        saldo: 0,
        operator: "Admin",
      });
      
      addTransaksi({
        id: 0,
        noBukti: `PP-${targetDate.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`,
        tanggal: targetDate,
        jam: "10:00",
        akun: "Pendapatan Pengunduran Diri Anggota",
        kategori: "Pendapatan Pengunduran Diri",
        uraian: `Pendapatan Pengunduran Diri ${agg.nama}`,
        debet: 0,
        kredit: Math.abs(s.jumlah),
        saldo: 0,
        operator: "Admin",
      });
    });
    
    addTransaksi({
      id: 0,
      noBukti: `BP-${targetDate.replace(/-/g, "")}-001`,
      tanggal: targetDate,
      jam: "10:00",
      akun: "Kas",
      kategori: "Biaya Pengunduran Diri",
      uraian: `Biaya Pengunduran Diri ${agg.nama}`,
      debet: biayaPengunduran,
      kredit: 0,
      saldo: 0,
      operator: "Admin",
    });
    
    addTransaksi({
      id: 0,
      noBukti: `BP-${targetDate.replace(/-/g, "")}-002`,
      tanggal: targetDate,
      jam: "10:00",
      akun: "Pendapatan Pengunduran Diri Anggota",
      kategori: "Pendapatan Pengunduran Diri",
      uraian: `Biaya Pengunduran Diri ${agg.nama}`,
      debet: 0,
      kredit: biayaPengunduran,
      saldo: 0,
      operator: "Admin",
    });
    
    alert(`Anggota "${agg.nama}" telah mengundurkan diri.\n\nSimpanan Pokok & Wajib: ${aggSimpanan.length} transaksi\nTotal Simpanan: Rp ${totalSimpanan.toLocaleString("id-ID")}\nBiaya Pengunduran: Rp ${biayaPengunduran.toLocaleString("id-ID")}`);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚪</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>Pengunduran Diri Anggota</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>KSP Mulia Dana Sejahtera</p>
      </div>

      <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <Link href="/anggota" style={{ padding: "10px 20px", background: "#1B4D3E", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
          ← Kembali ke Anggota
        </Link>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom: 24 }}>
          <input 
            type="text" 
            placeholder="Cari berdasarkan No. NBA, Nama, atau NIK..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #dc2626", fontSize: 14 }}
          />
        </div>

        {searchQuery && filteredAnggota.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, background: "#fef2f2", borderRadius: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ color: "#991b1b", fontSize: 14 }}>Tidak ada anggota aktif yang cocok dengan pencarian.</p>
          </div>
        )}

        {filteredAnggota.length > 0 && (
          <div style={{ background: "#fef2f2", borderRadius: 12, padding: 20, marginBottom: 20, border: "2px solid #fecaca" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 12 }}>
              ⚠️ Perhatian - Proses Pengunduran Diri
            </div>
            <ul style={{ fontSize: 12, color: "#b91c1c", marginLeft: 20, lineHeight: 1.8 }}>
              <li>Simpanan Pokok & Wajib akan otomatis dicairkan</li>
              <li>Biaya Pengunduran Diri Rp 50.000 akan dipotong</li>
              <li>Status anggota diubah menjadi Non-Aktif</li>
              <li>Data tidak bisa dikembalikan setelah diproses</li>
            </ul>
          </div>
        )}

        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {filteredAnggota.map((a: Anggota) => {
            const simpananList = simpanan || [];
            const aggSimpanan = simpananList.filter((s: any) => s.idAnggota === a.id && (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib"));
            const totalSimpanan = aggSimpanan.reduce((sum: number, s: any) => sum + s.jumlah, 0);
            const pokok = aggSimpanan.filter((s: any) => s.jenisSimpanan === "pokok").reduce((sum: number, s: any) => sum + s.jumlah, 0);
            const wajib = aggSimpanan.filter((s: any) => s.jenisSimpanan === "wajib").reduce((sum: number, s: any) => sum + s.jumlah, 0);
            
            return (
              <div key={a.id} style={{ padding: 16, border: "2px solid #e5e7eb", borderRadius: 10, marginBottom: 12, background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>{a.nama}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      No. NBA: <span style={{ fontFamily: "monospace" }}>{a.nomorNBA || "-"}</span> | NIK: {a.nik || "-"}
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePengunduran(a.id)}
                    style={{ padding: "8px 16px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    🚪 Proses Keluar
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Simpanan Pokok</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>Rp {pokok.toLocaleString("id-ID")}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Simpanan Wajib</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>Rp {wajib.toLocaleString("id-ID")}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Total</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>Rp {totalSimpanan.toLocaleString("id-ID")}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {nonAktifList.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h4 style={{ fontSize: 14, color: "#6b7280", marginBottom: 16, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
              Riwayat Anggota Non-Aktif ({nonAktifList.length})
            </h4>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {nonAktifList.slice(0, 10).map((a: Anggota) => (
                <div key={a.id} style={{ padding: 10, borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{a.nama}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {a.nomorNBA || "-"} | Tanggal: {a.tanggalPengunduran || "-"}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: "4px 8px", background: "#f3f4f6", borderRadius: 4, color: "#9ca3af" }}>
                    Non-Aktif
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
