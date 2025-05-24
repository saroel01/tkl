export enum StatusKelulusan {
  LULUS = 'LULUS',
  TIDAK_LULUS = 'TIDAK LULUS',
  PROSES = 'PROSES',
  BELUM_DITENTUKAN = 'BELUM DITENTUKAN',
}

export interface Siswa {
  id: number;
  nisn: string;
  nama_lengkap: string;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null; // YYYY-MM-DD
  nama_orang_tua_wali?: string | null;
  kelas: string;
  jurusan?: string | null;
  status_kelulusan: StatusKelulusan;
  catatan_admin?: string | null;
  foto_siswa_path?: string | null;
  nomor_ijazah?: string | null;
  nomor_skhun?: string | null;
  nomor_peserta_ujian?: string | null;
  token_skl?: string | null; // Added from previous tasks, ensure it's here
  catatan_skl?: string | null; // New field for SKL specific notes
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
}

export interface SiswaPaginatedResponse {
  data: Siswa[];
  total: number;
  page: number;
  last_page: number;
}
