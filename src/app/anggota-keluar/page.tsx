"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useData, Anggota } from "../context/DataContext";
import AppLogo from "../components/AppLogo";
import * as XLSX from "xlsx";

export default function AnggotaKeluarPage() {
  const { anggota, simpanan, addSimpanan, addTransaksi, updateAnggota, deleteAnggota } = useData();
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

        // Required columns (case-insensitive matching, supports space and underscore variants)
        const requiredMap: Record<string, string> = {
          "no. nba": "No. NBA",
          "nama anggota": "Nama Anggota",
          "tanggal keluar": "Tanggal Keluar",
        };

        const sampleRow = jsonData[0];
        const actualColumns = Object.keys(sampleRow);

        // Normalize column names (case-insensitive, handle space/underscore)
        const normalizedActual: Record<string, string> = {};
        actualColumns.forEach(col => {
          const key = col.toLowerCase().trim().replace(/_/g, " ");
          normalizedActual[key] = col;
        });

        // Check required columns (case-insensitive)
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

        // Validation function
        const validateRow = (row: any, index: number): { isValid: boolean; errors: string[]; data?: any } => {
          const errors: string[] = [];

          // Helper to get column value (handles space/underscore variants)
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

          // Validate date format
          const tanggalKeluar = parseExcelDate(tanggalKeluarRaw);
          if (!tanggalKeluar) errors.push("Format Tanggal Keluar tidak valid (gunakan DD-MM-YYYY)");

          // Check if anggota exists
          if (noNBA && nama) {
            const anggotaExists = anggota.some(a => 
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
              // Optional fields
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

        // Validate all rows first
        const results = jsonData.map((row, idx) => validateRow(row, idx + 1));
        const validRows = results.filter(r => r.isValid);
        const invalidRows = results.filter(r => !r.isValid);

        if (invalidRows.length > 0) {
          // Show detailed error report
          const errorReport = invalidRows.slice(0, 20).map(r => {
            const rowNum = jsonData.findIndex((row, i) => results[i] === r) + 2; // +2 because header is row 1, and index starts at 0
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

        // All rows valid, proceed with import
        if (!confirm(`Yakin mengimpor ${validRows.length} data anggota keluar?`)) return;

        validRows.forEach((result, idx) => {
          const data = result.data!;
          const noNBA = String(jsonData[idx]["No. NBA"] || "").trim();
          
          // Find existing anggota to update
          const existingAnggota = anggota.find(a => 
            String(a.nomorNBA).trim().toLowerCase() === noNBA.toLowerCase()
          );

          if (existingAnggota) {
            // Update existing anggota to non-active with the specified exit date
            updateAnggota(existingAnggota.id, {
              statusKeanggotaan: "Non-Aktif",
              tanggalPengunduran: data.tanggalKeluar
            });

            // Get current simpanan for this anggota to create withdrawal transactions
            const aggSimpanan = simpanan.filter(s => s.idAnggota === existingAnggota.id && 
                                                 (s.jenisSimpanan === "pokok" || s.jenisSimpanan === "wajib"));
            
            const targetDate = data.tanggalKeluar;
            const biayaPengunduran = 50000;

            // Create withdrawal transactions for each simpanan
            aggSimpanan.forEach((s, i) => {
              addSimpanan({
                id: 0,
                idAnggota: existingAnggota.id,
                nama: existingAnggota.nama,
                nomorAnggota: existingAnggota.nomorNBA || "",
                tanggal: targetDate,
                jenisSimpanan: s.jenisSimpanan,
                jumlah: -Math.abs(s.jumlah), // Negative for withdrawal
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

            // Add biaya pengunduran diri transaction
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
            // Create new anggota with non-active status if not found
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
              tanggalJoin: data.tanggalKeluar, // Use exit date as join date for historical data
              statusKeanggotaan: "Non-Aktif",
              tanggalPengunduran: data.tanggalKeluar
            };
            addAnggota(newAnggota);
          }
        });

        alert(`✅ Berhasil import ${validRows.length} data anggota keluar!`);
        setImportMode(false); // Exit import mode
        // Note: We stay on the same page to see the updated list

      } catch (error) {
        console.error("Import error:", error);
        alert("Gagal import data. Pastikan file Excel tidak rusak dan format benar.");
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) (e.target as HTMLInputElement).value = "";
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
           ) : (
         /* IMPORT MODE */
         <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
           <h3 style={{ fontSize: 18, marginBottom: 16 }}>Import Data Anggota Keluar dari Excel</h3>
           <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
             Upload file Excel dengan format kolom:<br/>
             <strong>Wajib:</strong> No. NBA, Nama Anggota, Tanggal Keluar<br/>
             <strong>Opsional:</strong> NIK, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Status Perkawinan, Alamat, No HP, Pekerjaan, Pendapatan Perbulan
           </p>
           
           <div style={{ border: "2px dashed #ddd", borderRadius: 12, padding: 40, textAlign: "center", marginBottom: 20 }}>
             <input
               type="file"
               accept=".xlsx, .xls, .csv"
               ref={fileInputRef}
               onChange={handleImportExcelKeluar}
               style={{ display: "none" }}
               id="excel-upload-keluar"
             />
             <label htmlFor="excel-upload-keluar" style={{ cursor: "pointer" }}>
               <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
               <div style={{ fontSize: 16, fontWeight: 600, color: "#dc2626" }}>Klik untuk upload file Excel</div>
               <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>Format: .xlsx, .xls, .csv</div>
             </label>
           </div>

           <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
             <button
               onClick={() => {
                 const templateData = [{
                   "No. NBA": "NBA-001",
                   "Nama Anggota": "Budi Santoso",
                   "Tanggal Keluar": "15-01-2024",
                   "NIK": "1234567890123456",
                   "Tempat Lahir": "Jakarta",
                   "Tanggal Lahir": "20-05-1980",
                   "Jenis Kelamin": "Laki-laki",
                   "Status Perkawinan": "Kawin",
                   "Alamat": "Jl. Merdeka No. 10",
                   "No HP": "081234567890",
                   "Pekerjaan": "PNS",
                   "Pendapatan Perbulan": "5000000"
                 }];
                 const ws = XLSX.utils.json_to_sheet(templateData);
                 const wb = XLSX.utils.book_new();
                 XLSX.utils.book_append_sheet(wb, ws, "Template");
                 XLSX.writeFile(wb, "template_import_anggota_keluar.xlsx");
               }}
               style={{ padding: "10px 20px", background: "#0d9488", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
             >
               📥 Download Template Excel
             </button>
           </div>
           
           <div style={{ padding: 16, background: "#fef2f2", borderRadius: 8 }}>
             <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 8 }}>📌 Format Import Excel - Kolom Wajib:</div>
             <table style={{ fontSize: 10, width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
               <thead>
                 <tr>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>No. NBA</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Nama Anggota</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Tanggal Keluar</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>NBA-001</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>Budi Santoso</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>15-01-2024</td>
                 </tr>
               </tbody>
             </table>
             
             <div style={{ fontSize: 14, fontWeight: 600, color: "#991b1b", marginBottom: 8 }}>📌 Kolom Opsional - Data Lengkap:</div>
             <table style={{ fontSize: 10, width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
               <thead>
                 <tr>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>NIK</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Tempat Lahir</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Tanggal Lahir</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Jenis Kelamin</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Status Perkawinan</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Alamat</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>No HP</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Pekerjaan</th>
                   <th style={{ border: "1px solid #ddd", padding: 4, background: "#f9fafb" }}>Pendapatan Perbulan</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>1234567890123456</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>Jakarta</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>20-05-1980</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>Laki-laki</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>Kawin</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>Jl. Merdeka No. 10</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>081234567890</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>PNS</td>
                   <td style={{ border: "1px solid #ddd", padding: 4 }}>5000000</td>
                 </tr>
               </tbody>
             </table>
           </div>
           
           <div style={{ marginTop: 24, padding: 16, background: "#fff3cd", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div>
               <div style={{ fontSize: 14, fontWeight: 600, color: "#856404" }}>⚠️ Hapus Semua Data</div>
               <div style={{ fontSize: 12, color: "#856404" }}>Jika Anda ingin import ulang, hapus dulu data lama</div>
             </div>
             <button 
               onClick={() => {
                 if (confirm("Apakah Anda yakin ingin menghapus semua data pengunduran diri? Data tidak bisa dikembalikan.")) {
                   // Note: We don't have a clearAllData function here, but we could add one or use the one from anggota context
                   alert("Fitur hapus semua data akan ditambahkan dalam versi selanjutnya.");
                 }
               }}
               style={{ padding: "10px 20px", background: "#dc3545", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
             >
               🗑️ Hapus Semua
             </button>
             
             <button 
               onClick={() => {
                 if (nonAktifList.length === 0) {
                   alert("Tidak ada data untuk diexport.");
                   return;
                 }
                  const exportData = nonAktifList.map(a => ({
                    "No. NBA": a.nomorNBA || "",
                    "Nama Anggota": a.nama,
                    "Tanggal Keluar": a.tanggalPengunduran || "",
                    "NIK": a.nik || "",
                    "Tempat Lahir": a.tempatLahir || "",
                    "Tanggal Lahir": a.tanggalLahir || "",
                    "Jenis Kelamin": a.jkelamin === "laki" ? "Laki-laki" : "Perempuan",
                    "Status Perkawinan": a.status === "kawin" ? "Kawin" : a.status === "belum" ? "Belum Kawin" : "Cerai",
                    "Alamat": a.alamat || "",
                    "No HP": a.telepon || "",
                    "Pekerjaan": a.pekerjaan || "",
                    "Pendapatan Perbulan": a.pendapatan || ""
                  }));
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Anggota Keluar");
                  XLSX.writeFile(wb, `data_anggota_keluar_${new Date().toISOString().split('T')[0]}.xlsx`);
                  alert(`Berhasil export ${exportData.length} data anggota keluar!`);
                }}
                style={{ padding: "10px 20px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
              >
                📤 Export Data
              </button>
               </div>
             ))}
           </div>
         </div>
       )}
    </div>
  );
}
