# Pengumuman Kelulusan Siswa — README

Aplikasi web untuk pengumuman kelulusan siswa, penerbitan dan unduh SKL (Surat Keterangan Lulus) secara daring, serta manajemen data siswa dan mata pelajaran yang dinamis.

---

## 1. Lingkup & Tujuan
- Hanya mencakup proses pengumuman kelulusan dan penerbitan SKL.
- Tidak termasuk modul absensi, keuangan, atau penilaian harian.

---

## 2. Fitur Utama & Instruksi Implementasi

| Kode      | Instruksi Implementasi                                                                                                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| FR‑01     | Admin dapat mengubah nama sekolah, mengunggah logo sekolah dan dinas. Keduanya tampil di halaman pengumuman & SKL.                         |
| FR‑02     | Admin dapat menambah, mengubah, dan menghapus data siswa (NISN, NIS, nama, kelas, TTL, nomor peserta, ortu/wali, peminatan).                |
| FR‑03     | Admin dapat mengelola nilai tiap mata pelajaran, dikelompokkan: Umum, Pilihan, Muatan Lokal.                                               |
| FR‑04     | Admin dapat menetapkan status kelulusan tiap siswa (Lulus/Tidak Lulus).                                                                    |
| FR‑05     | Admin dapat menambah, menghapus, dan mengedit daftar mata pelajaran; variasi mapel pilihan per kelas.                                      |
| FR‑06     | Sistem otomatis menghasilkan token SKL unik per siswa setelah kelulusan disimpan.                                                           |
| FR‑07     | Halaman pengumuman terkunci hingga tanggal rilis, lalu terbuka otomatis (countdown).                                                       |
| FR‑08     | Admin dapat menonaktifkan halaman pengumuman kapan saja setelah dibuka.                                                                    |
| FR‑09     | Siswa dapat mengunduh SKL (PDF) menggunakan token setelah pengumuman dibuka.                                                               |
| FR‑10     | Sistem menolak token salah/kedaluwarsa dan menampilkan pesan galat.                                                                        |

---

## 3. Alur Penggunaan

### Admin
1. Login ke dashboard admin.
2. Konfigurasi identitas sekolah & unggah logo (FR‑01).
3. Kelola daftar mata pelajaran (FR‑05).
4. Input/impor data siswa & nilai (FR‑02, FR‑03).
5. Tetapkan status kelulusan (FR‑04).
6. Atur tanggal & waktu rilis, sistem mulai countdown (FR‑07).
7. Bagikan token SKL ke siswa (FR‑06).
8. (Opsional) Tutup akses pengumuman (FR‑08).

### Siswa
1. Buka halaman pengumuman setelah countdown selesai.
2. Masukkan token SKL.
3. Unduh SKL jika token valid (FR‑09, FR‑10).

---

## 4. Struktur Data Inti

| Entitas                | Atribut                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Siswa**              | nisn, nis, nama, kelas, tempat_lahir, tanggal_lahir, nomor_peserta, nama_ortu, peminatan, status_lulus, token                  |
| **Nilai**              | nilai_id, siswa_id (FK), mapel_id (FK), kategori (umum/pilihan/muatan_lokal), nilai                                            |
| **Mata Pelajaran**     | mapel_id, nama_mapel, kategori, kelas_opsional[]                                                                               |
| **Pengaturan Sekolah** | nama_sekolah, logo_sekolah_path, logo_dinas_path, tanggal_rilis, akses_aktif                                                  |

---

## 5. Persyaratan Non‑Fungsional

| Kode       | Persyaratan                                                                                                         |
|------------|---------------------------------------------------------------------------------------------------------------------|
| NFR‑01     | Ketersediaan: Layanan harus dapat diakses 99% pada periode H‑7 hingga H+7 pengumuman.                              |
| NFR‑02     | Keamanan: Token SKL dienkripsi saat transit & disimpan; hanya siswa terkait yang dapat mengunduh SKL-nya.           |
| NFR‑03     | Kinerja: Respons API < 300 ms untuk baca data siswa; unduh SKL ≤ 3 detik untuk file ≤ 500 kB.                       |
| NFR‑04     | Skalabilitas: Sistem mampu menangani ≥ 5.000 permintaan unduh SKL bersamaan tanpa penurunan kinerja signifikan.     |
| NFR‑05     | Portabilitas: Aplikasi dapat dipasang di server mana pun yang mendukung runtime backend & database pilihan.         |
| NFR‑06     | Audit & Logging: Perubahan data siswa, nilai, status kelulusan dicatat lengkap.                                     |
| NFR‑07     | Akurat Waktu: Server menggunakan zona waktu sekolah (WIB/UTC+7) untuk penjadwalan.                                  |

---

## 6. Ketentuan PDF SKL
- Format: PDF, A4, potret.
- Isi wajib: identitas siswa, tabel nilai (umum/pilihan/muatan lokal), rata-rata nilai, status kelulusan, tanda tangan kepala sekolah, logo sekolah & dinas.
- Nama file: `SKL_<NISN>_<TOKEN>.pdf` (misal: `SKL_1234567890_ABC123XYZ.pdf`).

---

## 7. Aturan Countdown & Token
- Sebelum tanggal rilis, endpoint pengumuman mengembalikan pesan "Belum waktunya."
- Setelah tanggal rilis, akses terbuka otomatis.
- Token dihasilkan satu kali per siswa (UUID v4/hash), dan kedaluwarsa otomatis jika admin menutup pengumuman.

---

## 8. Batasan
1. Aplikasi hanya memproses data kelulusan.
2. Jumlah mata pelajaran per kategori maksimal 30.
3. Format logo: PNG transparan, ukuran < 1 MB.

---

## 9. Struktur Proyek & Stack

```
/client   # Frontend (React + TypeScript)
/server   # Backend (Node.js + TypeScript)
README.md
.env
```

- Backend: Node.js, TypeScript, Express, TypeORM
- Frontend: React, TypeScript, Ant Design
- Database: Pilihan (MySQL/PostgreSQL/SQLite)

---

## 10. Catatan
- Seluruh penjadwalan dan waktu mengikuti zona WIB (UTC+7).
- Semua perubahan data penting harus tercatat (audit trail).
- Pastikan keamanan token dan dokumen SKL.

## Tech Stack

### Backend
- Node.js + TypeScript
- Express
- TypeORM (ORM modern, mendukung TypeScript)
- SQLite atau PostgreSQL (database sederhana/file-based atau scalable)
- Multer (upload file)
- PDFMake (generate PDF SKL, mudah digunakan di TypeScript)
- JSON Web Token (autentikasi)

### Frontend
- React + TypeScript
- Ant Design (UI framework modern)
- Fetch API (HTTP client native browser)

## Instalasi
1. **Clone repository**
2. **Backend**
   - Masuk ke folder `server`
   - Install dependensi: `npm install`
   - Jalankan server: `npm run start` (port default: 3001)
3. **Frontend**
   - Masuk ke folder `client`
   - Install dependensi: `npm install`
   - Jalankan: `npm run dev` (port default: 5173)

## Alur Penggunaan
### Untuk Admin
1. Login ke halaman admin (jika ada autentikasi).
2. Upload logo sekolah/dinas.
3. Atur nama sekolah.
4. Input data siswa beserta nilai dan status kelulusan.
5. Buka pengumuman pada waktu yang ditentukan (countdown otomatis berjalan).
6. Bagikan token SKL ke masing-masing siswa.
7. Tutup pengumuman jika diperlukan.

### Untuk Siswa
1. Akses halaman pengumuman setelah waktu countdown selesai.
2. Masukkan token SKL yang diberikan admin.
3. Download SKL dalam format PDF.

## Struktur Data Siswa (Contoh)
```json
{
  "nisn": "1234567890",
  "nis": "1867",
  "nama": "Budi Santoso",
  "kelas": "12 IPS 1",
  "tempat_lahir": "Bandung",
  "tanggal_lahir": "2005-01-01",
  "nomor_peserta": "2023123456",
  "nama_ortu": "Siti Aminah",
  "peminatan": "IPS",
  "lulus": true,
  "nilai": {
    "umum": {
      "Pendidikan Agama dan Budi Pekerti": 93.5,
      "Pendidikan Pancasila": 92.5,
      "Bahasa Indonesia": 92.5,
      "Matematika (Umum)": 91.17,
      "Bahasa Inggris": 93.33,
      "Pendidikan Jasmani, Olahraga, dan Kesehatan": 92.83,
      "Seni dan Budaya": 93.33,
      "Sejarah": 93.0
    },
    "pilihan": {
      "Ekonomi": 93.25,
      "Geografi": 96.75,
      "Sosiologi": 92.5,
      "Matematika Tingkat Lanjut": 93.0,
      "Prakarya dan Kewirausahaan": 92.5
    },
    "muatan_lokal": {
      "Potensi Daerah": 93.83
    },
    "rata_rata": 93.14
  },
  "token": "ABC123XYZ"
}
```

## Contoh SKL
SKL (Surat Keterangan Lulus) akan di-generate otomatis dalam format PDF sesuai data siswa dan dapat diunduh menggunakan token unik. Format SKL mencakup identitas siswa, syarat kelulusan, tabel nilai yang dibagi menjadi kelompok mata pelajaran umum, pilihan, muatan lokal, serta menampilkan rata-rata nilai.

## Dependensi Utama
- **Backend**: express, sequelize, sqlite3, multer, pdfkit, jsonwebtoken
- **Frontend**: react, @mui/material, axios

## Catatan
- Pastikan waktu server backend sesuai dengan waktu lokal sekolah.
- Token SKL bersifat rahasia, hanya diberikan ke siswa yang bersangkutan.
- Daftar mata pelajaran dapat disesuaikan pada kode frontend/backend, dan juga dapat diatur secara dinamis melalui fitur admin. Kini, daftar mata pelajaran pilihan juga dapat diatur berbeda untuk setiap kelas, sehingga penyesuaian mapel lebih fleksibel dan sesuai kebutuhan masing-masing kelas.