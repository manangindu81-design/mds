"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useData, Anggota } from "../context/DataContext";
import AppLogo from "../components/AppLogo";

export default function AnggotaKeluarPage() {
  const { anggota, simpanan, addSimpanan, addTransaksi, updateAnggota, deleteAnggota } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<number>(0);
  const [manualInput, setManualInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [exitDate, setExitDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTanggalKeluar, setEditTanggalKeluar] = useState("");

   const filteredAnggota = useMemo(() => {
     const list =anggota || [];
     const q = searchQuery.toLowerCase().trim();
     if (!q) {
       return list.filter((a: Anggota) => a.statusKeanggotaan !== "Non-Aktif");
     }
     return list.filter((a: Anggota) => {
       if (a.statusKeanggotaan === "Non-Aktif") return false;
       const nama = a.nama ? String(a.nama).toLowerCase() : "";
       const nomorNBA = a.nomorNBA ? String(a.nomorNBA).toLowerCase() : "";
       const nik = a.nik ? String(a.nik) : "";
       const matchNama = nama.includes(q);
       const matchNBA = nomorNBA.includes(q);
       const matchNIK = nik.includes(q);
       return matchNama || matchNBA || matchNIK;
     });
   }, [anggota, searchQuery]);

   // Auto-select first match on Enter
   const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === "Enter" && filteredAnggota.length > 0) {
       setSelectedAnggotaId(filteredAnggota[0].id);
     }
   };

   // Close dropdown when clicking outside
   const dropdownRef = useRef<HTMLDivElement>(null);
   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
         setShowDropdown(false);
       }
     };
     document.addEventListener("mousedown", handleClickOutside);
     return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

  const simpananList = useMemo(() => simpanan || [], [simpanan]);

  const nonAktifList = useMemo(() => {
    return (anggota || []).filter(a => a.statusKeanggotaan === "Non-Aktif");
  }, [anggota]);

  // Handle edit tanggal pengunduran
  const handleSaveEdit = (id: number) => {
    if (!editTanggalKeluar.trim()) {
      alert("Tanggal pengunduran wajib diisi!");
      return;
    }
    console.log(`[Keluar] Updating anggota ${id} dengan tanggalPengunduran:`, editTanggalKeluar);
    updateAnggota(id, {
      statusKeanggotaan: "Non-Aktif",
      tanggalPengunduran: editTanggalKeluar
    });
    setEditingId(null);
    setEditTanggalKeluar("");
    alert("Tanggal pengunduran berhasil diperbarui!");
  };

  const selectedMemberInfo = useMemo(() => {
    if (selectedAnggotaId <= 0) return null;
    const selected = (anggota || []).find((a: Anggota) => a.id === selectedAnggotaId);
    if (!selected) return null;
    const aggSimpanan = simpananList.filter((s: any) => s.idAnggota === selectedAnggotaId && (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib"));
    const totalSimpanan = aggSimpanan.reduce((sum: number, s: any) => sum + s.jumlah, 0);
    const pokok = aggSimpanan.filter((s: any) => s.jenisSimpanan === "pokok").reduce((sum: number, s: any) => sum + s.jumlah, 0);
    const wajib = aggSimpanan.filter((s: any) => s.jenisSimpanan === "wajib").reduce((sum: number, s: any) => sum + s.jumlah, 0);
    return { selected, totalSimpanan, pokok, wajib };
  }, [selectedAnggotaId, anggota, simpananList]);

  const foundAnggota = useMemo(() => {
    if (!manualInput.trim()) return null;
    const q = manualInput.trim();
    return (anggota || []).find((a: Anggota) => {
      if (a.statusKeanggotaan === "Non-Aktif") return false;
      const nomorNBA = a.nomorNBA ? String(a.nomorNBA) : "";
      return nomorNBA === q || nomorNBA.toLowerCase().includes(q.toLowerCase());
    });
  }, [anggota, manualInput]);

  const handlePengunduran = (id: number) => {
    const targetDate = exitDate; // Use selected exit date
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

Tanggal Pengunduran: ${targetDate}

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

      {/* Mode Selection */}
      <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <button
          onClick={() => setManualMode(false)}
          style={{
            flex: 1,
            padding: "12px 20px",
            background: !manualMode ? "#dc2626" : "#f3f4f6",
            color: !manualMode ? "white" : "#374151",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer"
          }}
        >
          🔍 Cari dari Daftar Anggota
        </button>
        <button
          onClick={() => setManualMode(true)}
          style={{
            flex: 1,
            padding: "12px 20px",
            background: manualMode ? "#dc2626" : "#f3f4f6",
            color: manualMode ? "white" : "#374151",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer"
          }}
        >
          ✏️ Input Manual (No. NBA)
        </button>
      </div>

       {!manualMode ? (
         /* SEARCH MODE */
         <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginBottom: 24 }}>
           <div style={{ marginBottom: 24, position: "relative" }}>
             <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#dc2626", fontSize: 14 }}>
               Cari Anggota (No. NBA, Nama, atau NIK)
             </label>
            <input
              type="text"
              placeholder="Ketik nama, No. NBA, atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                setTimeout(() => setShowDropdown(false), 200);
              }}
              onKeyDown={handleSearchKeyDown}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "2px solid #dc2626",
                fontSize: 14,
                marginBottom: 12
              }}
            />
            {/* Autocomplete Dropdown */}
            {showDropdown && filteredAnggota.length > 0 && (
              <div ref={dropdownRef} style={{
                maxHeight: 300,
                overflowY: "auto",
                border: "2px solid #dc2626",
                borderRadius: 8,
                background: "white",
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                zIndex: 1000,
                position: "absolute",
                width: "calc(100% - 4px)",
                top: "100%",
                marginTop: 4
              }}>
                {filteredAnggota.map((a: Anggota) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setSelectedAnggotaId(a.id);
                      setShowDropdown(false);
                      setSearchQuery(a.nomorNBA + " - " + a.nama);
                      setExitDate(new Date().toISOString().split('T')[0]); // Reset to today
                    }}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f3f4f6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#fef2f2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1f2937" }}>
                        {a.nomorNBA} - {a.nama}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        NIK: {a.nik || "-"} | Status: {a.statusKeanggotaan}
                      </div>
                    </div>
                    {selectedAnggotaId === a.id && (
                      <span style={{ color: "#dc2626", fontSize: 20 }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showDropdown && filteredAnggota.length === 0 && searchQuery && (
              <div style={{
                padding: 12,
                textAlign: "center",
                color: "#6b7280",
                fontSize: 13,
                border: "2px solid #e5e7eb",
                borderRadius: 8,
                background: "white",
                marginTop: 4
              }}>
                Tidak ada anggota aktif ditemukan
              </div>
            )}
          </div>

          {selectedMemberInfo && (
            <div style={{
              background: "#fef2f2",
              borderRadius: 12,
              padding: 20,
              marginTop: 20,
              border: "2px solid #fecaca"
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 12 }}>
                ⚠️ Konfirmasi Pengunduran
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1f2937", marginBottom: 4 }}>{selectedMemberInfo.selected.nama}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  No. NBA: {selectedMemberInfo.selected.nomorNBA || "-"} | NIK: {selectedMemberInfo.selected.nik || "-"}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                <div style={{ textAlign: "center", padding: 12, background: "#fef3c7", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#92400e" }}>Simpanan Pokok</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>Rp {selectedMemberInfo.pokok.toLocaleString("id-ID")}</div>
                </div>
                <div style={{ textAlign: "center", padding: 12, background: "#dbeafe", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#1e40af" }}>Simpanan Wajib</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>Rp {selectedMemberInfo.wajib.toLocaleString("id-ID")}</div>
                </div>
                <div style={{ textAlign: "center", padding: 12, background: "#dcfce7", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: "#166534" }}>Total</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}>Rp {selectedMemberInfo.totalSimpanan.toLocaleString("id-ID")}</div>
                </div>
              </div>
              <div style={{
                padding: 12,
                background: "#fee2e2",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                color: "#991b1b",
                textAlign: "center"
              }}>
                <strong>Biaya Pengunduran: Rp 50.000</strong>
              </div>
              <button
                onClick={() => handlePengunduran(selectedAnggotaId)}
                style={{
                  width: "100%",
                  padding: 14,
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                🚪 Proses Keluar
              </button>
            </div>
          )}
        </div>
      ) : (
        /* MANUAL INPUT MODE */
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginBottom: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#dc2626", fontSize: 14 }}>
              Masukkan No. NBA Anggota
            </label>
            <input
              type="text"
              placeholder="Contoh: 001, NBA-001, atau ketik nama di bawah..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "2px solid #dc2626",
                fontSize: 14,
                marginBottom: 12
              }}
            />
            {foundAnggota && (
              <div style={{
                padding: 20,
                background: "#f0fdf4",
                borderRadius: 12,
                border: "2px solid #22c55e",
                marginTop: 16
              }}>
                <div style={{ fontSize: 12, color: "#166534", marginBottom: 4 }}>Anggota Ditemukan</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1f2937", marginBottom: 4 }}>{foundAnggota.nama}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  No. NBA: {foundAnggota.nomorNBA} | NIK: {foundAnggota.nik}
                </div>
                 {(() => {
                   const aggSimpanan = simpananList.filter((s: any) => s.idAnggota === foundAnggota.id && (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib"));
                   const totalSimpanan = aggSimpanan.reduce((sum: number, s: any) => sum + s.jumlah, 0);
                   const pokok = aggSimpanan.filter((s: any) => s.jenisSimpanan === "pokok").reduce((sum: number, s: any) => sum + s.jumlah, 0);
                   const wajib = aggSimpanan.filter((s: any) => s.jenisSimpanan === "wajib").reduce((sum: number, s: any) => sum + s.jumlah, 0);
                   return (
                     <div style={{ marginTop: 16 }}>
                       <div style={{ fontSize: 12, color: "#166534", marginBottom: 8 }}>Detail Simpanan</div>
                       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                         <div style={{ textAlign: "center", padding: 8, background: "#fef3c7", borderRadius: 6 }}>
                           <div style={{ fontSize: 10, color: "#92400e" }}>Pokok</div>
                           <div style={{ fontSize: 12, fontWeight: 600 }}>Rp {pokok.toLocaleString("id-ID")}</div>
                         </div>
                         <div style={{ textAlign: "center", padding: 8, background: "#dbeafe", borderRadius: 6 }}>
                           <div style={{ fontSize: 10, color: "#1e40af" }}>Wajib</div>
                           <div style={{ fontSize: 12, fontWeight: 600 }}>Rp {wajib.toLocaleString("id-ID")}</div>
                         </div>
                         <div style={{ textAlign: "center", padding: 8, background: "#dcfce7", borderRadius: 6 }}>
                           <div style={{ fontSize: 10, color: "#166534" }}>Total</div>
                           <div style={{ fontSize: 12, fontWeight: 600 }}>Rp {totalSimpanan.toLocaleString("id-ID")}</div>
                         </div>
                       </div>

                       <div style={{ marginTop: 16 }}>
                         <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#dc2626" }}>
                           📅 Tanggal Pengunduran
                         </label>
                         <input
                           type="date"
                           value={exitDate}
                           onChange={(e) => setExitDate(e.target.value)}
                           style={{
                             width: "100%",
                             padding: 10,
                             borderRadius: 8,
                             border: "2px solid #dc2626",
                             fontSize: 14,
                             marginBottom: 8
                           }}
                         />
                         <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                           Biaya pengunduran: Rp 50.000 (dipotong dari total simpanan)
                         </div>
                       </div>
                     </div>
                   );
                 })()}
                 <button
                   onClick={() => handlePengunduran(foundAnggota.id)}
                  style={{
                    width: "100%",
                    padding: 14,
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 16
                  }}
                >
                  🚪 Proses Keluar Anggota Ini
                </button>
              </div>
            )}
            {manualInput && !foundAnggota && (
              <div style={{ padding: 12, textAlign: "center", color: "#991b1b", fontSize: 13, marginTop: 12 }}>
                ❌ Anggota dengan No. NBA &quot;{manualInput}&quot; tidak ditemukan atau sudah Non-Aktif
              </div>
            )}
          </div>
        </div>
      )}

       {/* List of recently processed (non-active) members */}
       {nonAktifList.length > 0 && (
         <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
           <h3 style={{ fontSize: 16, marginBottom: 20, color: "#6b7280" }}>
             Riwayat Anggota Yang Telah Keluar ({nonAktifList.length})
           </h3>
           <div style={{ maxHeight: 300, overflowY: "auto" }}>
             {nonAktifList.map((a: Anggota) => (
               <div key={a.id} style={{
                 padding: 12,
                 borderBottom: "1px solid #f3f4f6",
                 display: "flex",
                 justifyContent: "space-between",
                 alignItems: "center"
               }}>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{a.nama}</div>
                   <div style={{ fontSize: 11, color: "#6b7280" }}>
                     {a.nomorNBA || "-"} | NIK: {a.nik}
                   </div>
                   {editingId === a.id ? (
                     <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                       <input
                         type="date"
                         value={editTanggalKeluar}
                         onChange={(e) => setEditTanggalKeluar(e.target.value)}
                         style={{ padding: 6, borderRadius: 6, border: "2px solid #dc2626", fontSize: 12 }}
                       />
                       <button
                         onClick={() => handleSaveEdit(a.id)}
                         style={{ padding: "6px 12px", background: "#22c55e", color: "white", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                       >
                         💾 Simpan
                       </button>
                       <button
                         onClick={() => { setEditingId(null); setEditTanggalKeluar(""); }}
                         style={{ padding: "6px 12px", background: "#6b7280", color: "white", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                       >
                         ✕ Batal
                       </button>
                     </div>
                   ) : (
                     <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                       Tanggal keluar: {a.tanggalPengunduran || "Belum diisi"}
                     </div>
                   )}
                 </div>
                 <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                   <span style={{
                     fontSize: 11,
                     padding: "4px 10px",
                     background: "#fee2e2",
                     borderRadius: 4,
                     color: "#dc2626",
                     fontWeight: 600
                   }}>
                     Non-Aktif
                   </span>
                   {editingId !== a.id && (
                     <>
                       <button
                         onClick={() => {
                           setEditingId(a.id);
                           setEditTanggalKeluar(a.tanggalPengunduran || "");
                         }}
                         style={{ padding: "6px 12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                       >
                         ✏️ Edit
                       </button>
                       <button
                         onClick={() => {
                           if (confirm(`Yakin menghapus anggota "${a.nama}"? Data tidak bisa dikembalikan.`)) {
                             deleteAnggota(a.id);
                           }
                         }}
                         style={{ padding: "6px 12px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                       >
                         🗑️
                       </button>
                     </>
                   )}
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}
    </div>
  );
}
