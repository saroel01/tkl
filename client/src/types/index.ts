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
  logo_sekolah_url?: string;
  logo_dinas_url?: string;
  template_skl?: string;
  tempat_terbit_skl?: string;
  tanggal_terbit_skl?: string; // ISO string date
  tahun_ajaran?: string; // e.g., "2023/2024"
  jenis_ujian_skl?: string; // e.g., "Ujian Sekolah"
}
