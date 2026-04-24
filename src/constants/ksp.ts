// KSP Mulia Dana Sejahtera - Official Identity Data
export const KSP_IDENTITY = {
  nama: "Koperasi Simpan Pinjam Mulia Dana Sejahtera",
  slogan: "Melayani Dengan Ceria dan Kasih",
  aktaPendirian: {
    nomor: "03",
    tanggal: "09 November 2023",
  },
  pengesahan: {
    nomor: "AHU-0005532.AH.01.39",
    tahun: 2025,
    lembaga: "MenKum Ham",
  },
  nib: {
    nomor: "1111230014031",
    tanggal: "11 November 2023",
  },
  npwp: "99.043.935.8-128.000",
  alamat: {
    jalan: "Jl. Veteran No. 85",
    kelurahan: "Kel. Tambak Lau Mulgap I",
    kecamatan: "Kec. Berastagi",
    kabupaten: "Kab. Karo",
    provinsi: "Sumatera Utara",
    kodePos: "22152",
  },
  email: "koperasimuliads@gmail.com",
  kontak: {
    whatsapp: "089505117507",
  },
} as const;

// Helper to format full address
export function getAlamatLengkap(): string {
  const a = KSP_IDENTITY.alamat;
  return `${a.jalan}, ${a.kelurahan}, ${a.kecamatan}, ${a.kabupaten}, ${a.provinsi}-${a.kodePos}`;
}

// Logo and banner asset paths (to be placed in /public folder)
export const LOGO_PATH = "/logo.png"; // Company logo
export const BANNER_PATH = "/banner.jpg"; // Official letterhead banner
