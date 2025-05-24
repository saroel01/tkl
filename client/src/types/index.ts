// Definisikan tipe data yang digunakan di frontend di sini

export interface Siswa {
  id: number;
  nama_lengkap: string;
  nisn: string;
  nis: string;
  tempat_lahir: string;
  tanggal_lahir: string; // ISO string date
  nama_ayah: string;
  nama_ibu: string;
  // Tambahkan properti lain jika diperlukan oleh UI
}

export interface MataPelajaran {
  id: number;
  nama_mapel: string;
  kelompok_mapel: string; // e.g., 'A', 'B', 'C.1'
  urutan_mapel: number;
}

// Tipe data NilaiSiswa seperti yang diterima dari GET /api/nilai/siswa/:siswaId
export interface NilaiSiswa {
  id: number; // ID dari record NilaiSiswa
  nilai: number;
  mataPelajaran: MataPelajaran; // Objek MataPelajaran yang berelasi
  // siswaId tidak secara eksplisit ada di sini karena sudah dalam konteks query
}

// Tipe data untuk payload saat mengirim nilai (POST /api/nilai/siswa/:siswaId)
export interface NilaiSiswaPayloadItem {
  mapelId: number;
  nilai: number | null; // Kirim null jika ingin menghapus/mengosongkan nilai
}

export interface PengaturanSekolah {
  id: number;
  nama_sekolah?: string;
  alamat_sekolah?: string;
  telepon_sekolah?: string;
  email_sekolah?: string;
  website_sekolah?: string;
  nama_kepala_sekolah?: string;
  nip_kepala_sekolah?: string;
  logo_sekolah_url?: string; // Corresponds to logo_sekolah_path from backend after prepending base URL or serving statically
  logo_dinas_url?: string;   // Corresponds to logo_dinas_path from backend
  
  // Fields for general announcement control (FR-07, FR-08)
  tanggal_rilis?: string | null; // ISO string date for announcement release
  akses_aktif?: boolean;         // Admin toggle for announcement active state

  // Fields for SKL document content / Admin settings related to SKL document
  template_skl?: string;         // Content template for SKL (if dynamic) - maybe not used if PDF is server-generated
  tempat_terbit_skl?: string;    // Place of SKL issuance (e.g., "Lhokseumawe")
  tanggal_terbit_skl?: string | null; // Date of SKL issuance (printed on SKL) - ISO string date
  tahun_ajaran?: string;         // Academic year (e.g., "2023/2024")
  jenis_ujian_skl?: string;      // Type of exam for SKL (e.g., "Ujian Sekolah")

  // Additional fields from backend entity that might be useful for admin UI or other display purposes
  nama_dinas?: string | null;
  alamat_sekolah_lengkap?: string | null;
  kontak_sekolah?: string | null;
  website_sekolah?: string | null;
  npsn_sekolah?: string | null;
  // nama_kepala_sekolah and nip_kepala_sekolah are already present
}
