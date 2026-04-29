"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useData, Anggota } from "../context/DataContext";
import AppLogo from "../components/AppLogo";
import * as XLSX from "xlsx";

export default function AnggotaKeluarPage() {
  const { anggota, simpanan, addSimpanan, addTransaksi, updateAnggota, deleteAnggota, addAnggota } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [selectedAnggotaId, setSelectedAnggotaId] = useState<number>(0);
  const [manualInput, setManualInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [exitDate, setExitDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTanggalKeluar, setEditTanggalKeluar] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
 
    const [foundAnggota, setFoundAnggota] = useState<Anggota | null>(null);
    const [simpananList, setSimpananList] = useState<any[]>([]);
 
    // Handle manual input change
    useEffect(() => {
      if (manualInput.trim() === "") {
        setFoundAnggota(null);
        return;
      }
      const matched = anggota.find((a: Anggota) =>
        String(a.nomorNBA).toLowerCase().includes(manualInput.toLowerCase().replace(/^nba-?/, "")) ||
        a.nama.toLowerCase().includes(manualInput.toLowerCase())
      );
      if (matched && matched.statusKeanggotaan !== "Non-Aktif") {
        setFoundAnggota(matched);
        const aggSimpanan = simpanan.filter((s: any) => s.idAnggota === matched.id && s.status !== false);
        setSimpananList(aggSimpanan);
      } else {
        setFoundAnggota(null);
        setSimpananList([]);
      }
    }, [manualInput, anggota, simpanan]);
 
    const handlePengunduran = async (anggotaId: number) => {
      if (!exitDate) {
        alert("Silakan pilih tanggal pengunduran.");
        return;
      }
 
      const agg = anggota.find((a: Anggota) => a.id === anggotaId);
      if (!agg) {
        alert("Anggota tidak ditemukan.");
        return;
      }
 
      if (!confirm(`Yakin mengundurkan diri ${agg.nama} pada ${exitDate}?`)) return;
 
      // Update status anggota
      updateAnggota(anggotaId, {
        statusKeanggotaan: "Non-Aktif",
        tanggalPengunduran: exitDate,
      });
 
      // Get current simpanan for this anggota
      const aggSimpanan = simpanan.filter((s: any) => s.idAnggota === anggotaId && (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib") && s.status !== false);
      const totalSimpanan = aggSimpanan.reduce((sum: number, s: any) => sum + s.jumlah, 0);
      const biayaPengunduran = 50000;
 
      if (totalSimpanan < biayaPengunduran) {
        alert("Simpanan pokok & wajib tidak mencukupi untuk biaya pengunduran Rp " + biayaPengunduran.toLocaleString("id-ID"));
        return;
      }
 
      // Create withdrawal transactions
      const targetDate = exitDate;
      aggSimpanan.forEach((s, i) => {
        addSimpanan({
          id: 0,
          idAnggota: anggotaId,
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
 
    // Handle Excel import for anggota keluar
    const handleImportExcelKeluar = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
 
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          if (!data) {
            alert("File tidak terbaca!");
            return;
          }
 
          const workbook = XLSX.read(data, { type: "binary" });
 
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            alert("Tidak ada sheet di file Excel!");
            return;
          }
 
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
 
          if (!sheet) {
            alert("Sheet tidak ditemukan!");
            return;
          }
 
          const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
 
          if (!jsonData || jsonData.length === 0) {
            alert("Tidak ada data di file Excel!");
            return;
          }
 
          // Required columns
          const requiredMap: Record<string, string> = {
            "no. nba": "No. NBA",
            "nama anggota": "Nama Anggota",
            "tanggal keluar": "Tanggal Keluar",
          };
 
          const sampleRow = jsonData[0];
          const actualColumns = Object.keys(sampleRow);
 
          const normalizedActual: Record<string, string> = {};
          actualColumns.forEach(col => {
            const key = col.toLowerCase().trim().replace(/_/g, " ");
            normalizedActual[key] = col;
          });
 
          const missingColumns: string[] = [];
          Object.entries(requiredMap).forEach(([key, displayName]) => {
            if (!normalizedActual[key]) {
              missingColumns.push(displayName);
            }
          });
 
          if (missingColumns.length > 0) {
            alert(
              `Kolom wajib tidak ditemukan:\n${missingColumns.join("\n")}\n\n` +
              `Kolom yang ada di file Anda:\n${actualColumns.join(", ")}\n\n` +
              `Silakan download template yang benar.`
            );
            return;
          }
 
          const validateRow = (row: any, index: number): { isValid: boolean; errors: string[]; data?: any } => {
            const errors: string[] = [];
 
            const get = (col: string) => {
              const normalizedKey = col.toLowerCase().replace(/_/g, " ");
              return row[normalizedActual[normalizedKey] || col] ?? "";
            };
 
            const noNBA = String(get("no. nba") || "").trim();
            const nama = String(get("nama anggota") || "").trim();
            const tanggalKeluarRaw = get("tanggal keluar");
 
            if (!noNBA) errors.push("No. NBA wajib diisi");
            if (!nama) errors.push("Nama Anggota wajib diisi");
            if (!tanggalKeluarRaw) errors.push("Tanggal Keluar wajib diisi");
 
            const parseExcelDate = (date: any): string | null => {
              if (!date) return null;
              if (typeof date === "string" && /\d{1,2}-\d{1,2}-\d{4}/.test(date)) return date;
              if (typeof date === "string" && /\d{4}-\d{1,2}-\d{1,2}/.test(date)) {
                const parts = date.split("-");
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
              if (typeof date === "number") {
                const excelEpoch = new Date(Math.round((date - 25569) * 86400 * 1000));
                const d = String(excelEpoch.getDate()).padStart(2, "0");
                const m = String(excelEpoch.getMonth() + 1).padStart(2, "0");
                const y = excelEpoch.getFullYear();
                return `${d}-${m}-${y}`;
              }
              return null;
            };
 
            const tanggalKeluar = parseExcelDate(tanggalKeluarRaw);
            if (!tanggalKeluar) errors.push("Format Tanggal Keluar tidak valid (gunakan DD-MM-YYYY)");
 
            if (noNBA && nama) {
              const anggotaExists = anggota.some((a: Anggota) =>
                String(a.nomorNBA).trim().toLowerCase() === noNBA.toLowerCase() &&
                a.nama.toLowerCase() === nama.toLowerCase()
              );
              if (!anggotaExists) {
                errors.push(`Anggota dengan No. NBA "${noNBA}" dan Nama "${nama}" tidak ditemukan`);
              }
            }
 
            return {
              isValid: errors.length === 0,
              errors,
              data: {
                noNBA,
                nama,
                tanggalKeluar,
                nik: String(get("nomor identitas (ktp)") || get("nik") || ""),
                tempatLahir: String(get("tempat lahir") || ""),
                tanggalLahir: parseExcelDate(get("tanggal lahir")) || "",
                jkelamin: String(get("jenis kelamin") || "").toLowerCase().includes("laki") ? "laki" : "perempuan",
                statusPerkawinan: String(get("status perkawinan") || "").toLowerCase().includes("kawin") ? "kawin" :
                              String(get("status perkawinan") || "").toLowerCase().includes("belum") ? "belum" : "cerai",
                alamat: String(get("alamat") || ""),
                noHP: String(get("no hp") || ""),
                pekerjaan: String(get("pekerjaan") || ""),
                pendapatan: String(get("pendapatan perbulan") || "")
              }
            };
          };
 
          const results = jsonData.map((row, idx) => validateRow(row, idx + 1));
          const validRows = results.filter(r => r.isValid);
          const invalidRows = results.filter(r => !r.isValid);
 
          if (invalidRows.length > 0) {
            const errorReport = invalidRows.slice(0, 20).map(r => {
              const rowNum = jsonData.findIndex((row, i) => results[i] === r) + 2;
              return `Baris ${rowNum}:\n  ${r.errors.join("\n  ")}`;
            }).join("\n\n");
 
            const moreMsg = invalidRows.length > 20 ? `\n...dan ${invalidRows.length - 20} baris error lainnya` : "";
            alert(
              `IMPORT GAGAL - Ada ${invalidRows.length} baris dengan error:\n\n` +
              `${errorReport}${moreMsg}\n\n` +
              `Total data valid: ${validRows.length} dari ${jsonData.length}\n` +
              `Silakan perbaiki file Excel dan coba lagi.`
            );
            return;
          }
 
          if (!confirm(`Yakin mengimpor ${validRows.length} data anggota keluar?`)) return;
 
          validRows.forEach((result, idx) => {
            const data = result.data!;
            const noNBA = String(jsonData[idx]["No. NBA"] || "").trim();
 
            const existingAnggota = anggota.find((a: Anggota) =>
              String(a.nomorNBA).trim().toLowerCase() === noNBA.toLowerCase()
            );
 
            if (existingAnggota) {
              updateAnggota(existingAnggota.id, {
                statusKeanggotaan: "Non-Aktif",
                tanggalPengunduran: data.tanggalKeluar
              });
 
              const aggSimpanan = simpanan.filter((s: any) => s.idAnggota === existingAnggota.id &&
                                                   (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib"));
 
              const targetDate = data.tanggalKeluar;
              const biayaPengunduran = 50000;
 
              aggSimpanan.forEach((s, i) => {
                addSimpanan({
                  id: 0,
                  idAnggota: existingAnggota.id,
                  nama: existingAnggota.nama,
                  nomorAnggota: existingAnggota.nomorNBA || "",
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
                  uraian: `Penarikan Simpanan ${s.jenisSimpanan} ${existingAnggota.nama}`,
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
                uraian: `Biaya Pengunduran Diri ${existingAnggota.nama}`,
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
                uraian: `Biaya Pengunduran Diri ${existingAnggota.nama}`,
                debet: 0,
                kredit: biayaPengunduran,
                saldo: 0,
                operator: "Admin",
              });
            } else {
              const newAnggota: Anggota = {
                id: anggota.length + idx + 1,
                nomorNBA: data.noNBA,
                nik: data.nik || "",
                nama: data.nama,
                tempatLahir: data.tempatLahir || "",
                tanggalLahir: data.tanggalLahir || "",
                jkelamin: data.jkelamin || "laki",
                status: data.statusPerkawinan || "belum",
                namaPasangan: "",
                jumlahAnak: "",
                namaIbuKandung: "",
                namaSaudara: "",
                telpSaudara: "",
                hubungan: "",
                pekerjaan: data.pekerjaan || "",
                alamat: data.alamat || "",
                telepon: data.noHP || "",
                email: "",
                tempatKerja: "",
                pendapatan: data.pendapatan || "",
                tanggalJoin: data.tanggalKeluar,
                statusKeanggotaan: "Non-Aktif",
                tanggalPengunduran: data.tanggalKeluar
              };
              addAnggota(newAnggota);
            }
          });
 
          alert(`✅ Berhasil import ${validRows.length} data anggota keluar!`);
          setImportMode(false);
 
        } catch (error) {
          console.error("Import error:", error);
          alert("Gagal import data. Pastikan file Excel tidak rusak dan format benar.");
        }
      };
      reader.readAsBinaryString(file);
      if (e.target) (e.target as HTMLInputElement).value = "";
    };
 
    const nonAktifList = useMemo(() => {
      return anggota.filter((a: Anggota) => a.statusKeanggotaan === "Non-Aktif");
    }, [anggota]);
 
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
         <button
           onClick={() => setImportMode(true)}
           style={{
             flex: 1,
             padding: "12px 20px",
             background: importMode ? "#dc2626" : "#f3f4f6",
             color: importMode ? "white" : "#374151",
             border: "none",
             borderRadius: 8,
             fontWeight: 600,
             fontSize: 14,
             cursor: "pointer"
           }}
         >
           📥 Import Excel
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
                       setExitDate(new Date().toISOString().split('T')[0]);
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
                 marginTop: 8
               }}>
                 Tidak ada anggota yang cocok
               </div>
             )}
             <div style={{ marginTop: 16 }}>
               <button
                 onClick={() => {
                   if (selectedAnggotaId === 0) {
                     alert("Silakan pilih anggota dari daftar.");
                     return;
                   }
                   if (!exitDate) {
                     alert("Silakan pilih tanggal pengunduran.");
                     return;
                   }
                   handlePengunduran(selectedAnggotaId);
                 }}
                 style={{
                   width: "100%",
                   padding: 14,
                   background: "#dc2626",
                   color: "white",
                   border: "none",
                   borderRadius: 8,
                   fontSize: 16,
                   fontWeight: 700,
                   cursor: "pointer"
                 }}
               >
                 🚪 Proses Pengunduran Anggota Terpilih
               </button>
             </div>
            </div>
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
                                  }) as unknown as React.ReactNode}
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", marginBottom: 20 }}>Daftar Anggota Non-Aktif</h3>
            <div style={{ display: "grid", gap: 12 }}>
              {nonAktifList.map((a) => (
                <div key={a.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{a.nama}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>No. NBA: {a.nomorNBA} | NIK: {a.nik || "-"}</div>
                  <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>Tanggal Keluar: {a.tanggalPengunduran}</div>
                </div>
              ))}
            </div>
          </div>
         )}
      
       </div>
   );
}
