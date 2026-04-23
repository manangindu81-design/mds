# Context: KSP Mulia Dana Sejahtera

## Current State

**Project Status**: ✅ Aplikasi KSP Siap Pakai

Aplikasi Koperasi Simpan Pinjam (KSP) dengan sistem pengelolaan data anggota, simpanan, pinjaman, dan transaksi harian.

## Recently Completed

- [x] Landing page KSP Mulia Dana Sejahtera
- [x] Halaman input simpanan (/simpanan)
- [x] Halaman input pinjaman dengan sistem Flat & Musiman (/pinjaman)
- [x] Halaman pendataan anggota (/anggota)
- [x] Dashboard dengan statistik (/dashboard)
- [x] Transaksi harian dengan jurnal (/transaksi)
- [x] Data anggota lengkap (/data-anggota)
- [x] Sistem pinjaman: Flat (1,5-2%, 1-36 bln) & Musiman (2,5%, 1-6 bln)
- [x] Auto jurnal: Piutang, Kas, Pendapatan(Bunga, Admin, Denda)
- [x] Fix JSX syntax error di anggota/page.tsx - edit functionality works now
- [x] Dashboard enhancement: Quick Actions, Trend Charts, Jatuh Tempo, Aktivitas Terbaru
- [x] Add "Hapus Semua" buttons in Anggota, Simpanan, and Pinjaman pages with confirmation

## Struktur Aplikasi

| Menu | URL | Fitur |
|------|-----|-------|
| Beranda | / | Landing page |
| Anggota | /anggota | Pendaftaran & Edit |
| Keluar | /anggota-keluar | Pengunduran diri anggota |
| Simpanan | /simpanan | Input setoran/penarikan |
| Kartu Simpanan | /simpanan-kartu | Riwayat simpanan per anggota |
| Pinjaman | /pinjaman | Pengajuan & angsuran |
| SHU | /shu | Perhitungan Sisa Hasil Usaha |
| Transaksi | /transaksi | Kas masuk/keluar + jurnal |
| Dashboard | /dashboard | Stats & tabel data |
| Laporan | /laporan | Laporan keuangan |

## Teknik

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- Bun package manager

## Focus Sekarang

- Aplikasi KSP sudah production-ready
- Semua error sudah diperbaiki (typecheck ✅, lint ✅, build ✅)
- Dashboard sudah lengkap: Quick Actions, Trend Chart 6 bulan, Jatuh Tempo warnings, Aktivitas terbaru
- Edit anggota berfungsi dengan baik
- Import Excel anggota berfungsi dengan mapping kolom yang benar
- Menu **Kartu Simpanan** dengan pencarian anggota (No. NBA/Nama/NIK) dan riwayat transaksi real-time
- Menu **Keluar** dengan 2 mode: Cari dari daftar + Input manual No. NBA, lengkap dengan preview simpanan dan biaya pengunduran
- Menu **SHU** dengan alokasi 9 kategori (5-5-55-20-5-5-2-2-1%) dan distribusi per anggota (Jasa Modal 55% + Jasa Transaksi 20%)
- **SHU sekarang menghitung dari transaksi, angsuran (bunga/denda), dan biaya admin pinjaman**, sehingga数据显示 nonzero untuk tahun-tahun aktif
- **Hapus Simpanan Selection** (`/simpanan` → Data tab): fitur hapus transaksi simpanan berdasarkan jenis dengan checkbox. Bisa pilih satu atau lebih jenis (Pokok, Wajib, Sukarela, dll) dan hapus secara massal.

## Riwayat Perubahan

| Tanggal | Perubahan |
|--------|-----------|
| 2024 | Aplikasi KSP selesai |
| 2026-04-14 | Fix JSX syntax error - edit anggota berfungsi |
| 2026-04-14 | Fix font optimization - Next.js font/google |
| 2026-04-15 | Fix TypeScript errors di laporan/page.tsx - replace totalBunga with totalBungaPinjaman |
| 2026-04-15 | Enhance edit anggota - populate all fields including family & work info |
| 2026-04-15 | Add Status, Alamat, Pendapatan columns to anggota table to match Excel import |
| 2026-04-15 | Enhance anggota import - support all fields including family, work, PNS data |
| 2026-04-15 | Add download template Excel button for anggota import |
| 2026-04-15 | Fix date format in template to Indonesian format (DD-MM-YYYY) and parse multiple formats |
| 2026-04-16 | Fix import Excel - skip empty rows, use counter instead of array index |
| 2026-04-16 | Verify all menus connected to DataContext and synchronized |
| 2026-04-17 | Add dashboard enhancements: Quick Actions, Trend Charts (Simpanan vs Pinjaman 6 bulan), Peringatan Jatuh Tempo (7 hari), Aktivitas Terbaru |
| 2026-04-20 | Add search functionality to all pages (anggota, simpanan, pinjaman, transaksi) |
| 2026-04-20 | Add Keluar page for member resignation with auto simpanan withdrawal (Rp 50.000 fee) |
| 2026-04-23 | Add Kartu Simpanan page - per-anggota transaction history with real-time balance |
| 2026-04-23 | Add SHU page with 9-category allocation (5-5-55-20-5-5-2-2-1%) and per-member distribution |
| 2026-04-23 | Upgrade Keluar page - dual mode (search + manual input by No. NBA) with live simpanan preview |
| 2026-04-23 | Fix SHU calculation: aggregates from transaksi, angsuran (bunga/denda), and pinjaman admin fees; robust date parsing; non-zero results |
| 2026-04-23 | Add selective delete feature: choose which simpanan types to delete (checkbox UI) in Data tab, avoiding full wipe | |