export enum KategoriMapel {
  UMUM = 'UMUM',
  PILIHAN = 'PILIHAN',
  MUATAN_LOKAL = 'MUATAN LOKAL',
}

export interface MataPelajaran {
  id: number;
  nama_mapel: string;
  kategori_mapel?: KategoriMapel | null;
  kelompok_mapel?: string | null;
  urutan_mapel?: number | null;
  created_at?: string; // Assuming ISO string format from backend
  updated_at?: string; // Assuming ISO string format from backend
}
