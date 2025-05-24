# Catatan Pengembangan Aplikasi Pengumuman Kelulusan

Dokumen ini digunakan untuk mencatat progres, keputusan desain, dan isu-isu yang muncul selama pengembangan aplikasi pengumuman kelulusan siswa.

---

## Gambaran Umum Proyek (diekstrak dari README.md)

### Fitur Utama

| Kode  | Instruksi Implementasi                                                                                                                      |
|-------|---------------------------------------------------------------------------------------------------------------------------------------------|
| FR‑01 | Admin dapat mengubah nama sekolah, mengunggah logo sekolah dan dinas. Keduanya tampil di halaman pengumuman & SKL.                         |
| FR‑02 | Admin dapat menambah, mengubah, dan menghapus data siswa (NISN, NIS, nama, kelas, TTL, nomor peserta, ortu/wali, peminatan).                |
| FR‑03 | Admin dapat mengelola nilai tiap mata pelajaran, dikelompokkan: Umum, Pilihan, Muatan Lokal.                                               |
| FR‑04 | Admin dapat menetapkan status kelulusan tiap siswa (Lulus/Tidak Lulus).                                                                    |
| FR‑05 | Admin dapat menambah, menghapus, dan mengedit daftar mata pelajaran; variasi mapel pilihan per kelas.                                      |
| FR‑06 | Sistem otomatis menghasilkan token SKL unik per siswa setelah kelulusan disimpan.                                                           |
| FR‑07 | Halaman pengumuman terkunci hingga tanggal rilis, lalu terbuka otomatis (countdown).                                                       |
| FR‑08 | Admin dapat menonaktifkan halaman pengumuman kapan saja setelah dibuka.                                                                    |
| FR‑09 | Siswa dapat mengunduh SKL (PDF) menggunakan token setelah pengumuman dibuka.                                                               |
| FR‑10 | Sistem menolak token salah/kedaluwarsa dan menampilkan pesan galat.                                                                        |

### Struktur Data Inti yang Direkomendasikan

| Entitas                | Atribut                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Siswa**              | nisn, nis, nama, kelas, tempat_lahir, tanggal_lahir, nomor_peserta, nama_ortu, peminatan, status_lulus, token                  |
| **Nilai**              | nilai_id, siswa_id (FK), mapel_id (FK), kategori (umum/pilihan/muatan_lokal), nilai                                            |
| **Mata Pelajaran**     | mapel_id, nama_mapel, kategori, kelas_opsional[]                                                                               |
| **Pengaturan Sekolah** | nama_sekolah, logo_sekolah_path, logo_dinas_path, tanggal_rilis, akses_aktif                                                  |

### Ketentuan PDF SKL
- Format: PDF, A4, potret.
- Isi wajib: identitas siswa, tabel nilai (umum/pilihan/muatan lokal), rata-rata nilai, status kelulusan, tanda tangan kepala sekolah, logo sekolah & dinas.
- Nama file: `SKL_<NISN>_<TOKEN>.pdf` (misal: `SKL_1234567890_ABC123XYZ.pdf`).
- **Struktur Mata Pelajaran di SKL (berdasarkan contoh desain):**
    - A. Kelompok Mata Pelajaran Umum
    - B. Kelompok Mata Pelajaran Pilihan
    - Muatan Lokal Potensi Daerah (jika ada)

### Aturan Countdown & Token
- Sebelum tanggal rilis, endpoint pengumuman mengembalikan pesan "Belum waktunya."
- Setelah tanggal rilis, akses terbuka otomatis.
- Token dihasilkan satu kali per siswa (UUID v4/hash), dan kedaluwarsa otomatis jika admin menutup pengumuman.

---

## Status Implementasi Fitur

- **FR‑01:** `[x]` Admin dapat mengubah nama sekolah, mengunggah logo sekolah dan dinas. Keduanya tampil di halaman pengumuman & SKL.
  - *Catatan Update: Backend dan Frontend mendukung semua field detail sekolah untuk SKL. SKL menampilkan data ini dengan benar.*
- **FR‑02:** `[x]` Admin dapat menambah, mengubah, dan menghapus data siswa.
  - *Catatan: Tidak ada perubahan pada iterasi ini.*
- **FR‑03:** `[/]` Admin dapat mengelola nilai tiap mata pelajaran, dikelompokkan: Umum, Pilihan, Muatan Lokal.
  - *Catatan Update: API untuk `NilaiSiswa` telah dibuat dan SKL dapat menampilkan nilai yang dikelompokkan. UI untuk manajemen `MataPelajaran` juga sudah ada. UI spesifik untuk input nilai per siswa belum dibuat.*
- **FR‑04:** `[x]` Admin dapat menetapkan status kelulusan tiap siswa (Lulus/Tidak Lulus).
  - *Catatan Update: Fungsionalitas penuh, termasuk bug fix untuk status `TIDAK_LULUS` dan integrasi dengan pembuatan token SKL.*
- **FR‑05:** `[x]` Admin dapat menambah, menghapus, dan mengedit daftar mata pelajaran; variasi mapel pilihan per kelas.
  - *Catatan Update: CRUD API dan UI Admin untuk `MataPelajaran` telah dibuat, termasuk pengelolaan `kategori_mapel` dan `kelompok_mapel`.*
- **FR‑06:** `[x]` Sistem otomatis menghasilkan token SKL unik per siswa setelah kelulusan disimpan.
  - *Catatan Update: Token SKL (UUID v4) otomatis dibuat/dihapus saat status kelulusan siswa diubah menjadi LULUS atau sebaliknya.*
- **FR‑07:** `[/]` Halaman pengumuman terkunci hingga tanggal rilis, lalu terbuka otomatis (countdown).
  - *Catatan: Tidak ada perubahan signifikan pada logika countdown di iterasi ini. Backend fields `tanggal_rilis` dan `akses_aktif` dapat dikelola via UI Pengaturan Sekolah.*
- **FR‑08:** `[/]` Admin dapat menonaktifkan halaman pengumuman kapan saja setelah dibuka.
  - *Catatan: Tidak ada perubahan signifikan pada logika ini di iterasi ini. Backend field `akses_aktif` dapat dikelola via UI Pengaturan Sekolah.*
- **FR‑09:** `[x]` Siswa dapat mengunduh SKL (PDF) menggunakan token setelah pengumuman dibuka.
  - *Catatan Update: SKL PDF sekarang berisi data yang lengkap dari Pengaturan Sekolah dan Nilai Siswa (dikelompokkan dengan benar). Token SKL dibuat (FR-06). Fungsionalitas download SKL oleh siswa menggunakan token (FR-10) belum diimplementasikan.*
- **FR‑10:** `[ ]` Sistem menolak token salah/kedaluwarsa dan menampilkan pesan galat.
  - *Catatan: Belum diimplementasikan.*

---

## Keputusan Desain

1.  **Penyimpanan Nilai dan Mata Pelajaran:**
    *   Akan dibuat entitas baru:
        *   **`MataPelajaran`**: Untuk menyimpan daftar mata pelajaran beserta kategorinya (Umum, Pilihan, Muatan Lokal), kelompok (misal "Kelompok A"), dan urutan tampil. Ini mendukung FR-05.
            *   Atribut: `id` (PK), `nama_mapel` (string), `kategori_mapel` (enum: 'UMUM', 'PILIHAN', 'MUATAN_LOKAL'), `kelompok_mapel` (string, contoh: "A. Kelompok Mata Pelajaran Umum", "B. Kelompok Mata Pelajaran Pilihan"), `urutan_mapel` (integer, untuk sorting di SKL, diimplementasikan sebagai `urutan_mapel`).
        *   **`NilaiSiswa`**: Untuk menyimpan nilai setiap siswa per mata pelajaran. Ini mendukung FR-03.
            *   Atribut: `id` (PK), `siswaId` (FK ke Siswa), `mataPelajaranId` (FK ke MataPelajaran), `nilai` (float/decimal).
    *   Entitas `Siswa` tidak akan menyimpan nilai secara langsung dalam bentuk JSON untuk menjaga normalisasi data dan kemudahan query.

2.  **Desain SKL (Surat Keterangan Lulus):**
    *   Telah diimplementasikan menggunakan `pdfmake` di `server/src/services/pdfService.ts`.
    *   Desain mengikuti poin-poin wajib yang disebutkan:
        *   Kop surat (logo dinas, nama dinas, nama sekolah, alamat, kontak).
        *   Nomor surat (format dasar diimplementasikan).
        *   Pernyataan kelulusan.
        *   Data diri siswa.
        *   Tabel nilai dengan kolom: No, Mata Pelajaran, Nilai, serta pengelompokan berdasarkan `kelompok_mapel`.
        *   Status kelulusan.
        *   Tempat dan tanggal penerbitan SKL.
        *   Tanda tangan Kepala Sekolah (nama, NIP).
        *   *Catatan: Fitur seperti rata-rata nilai, keterangan tambahan spesifik SKL (selain catatan admin siswa), dan placeholder pas foto belum ditambahkan pada iterasi ini.*
    *   Data untuk kop surat dan tanda tangan kepala sekolah diambil dari entitas `PengaturanSekolah`.

3.  **Pengelolaan Token SKL:**
    *   Token unik (UUID v4) di-generate untuk setiap siswa ketika status kelulusan diatur menjadi `LULUS`.
    *   Disimpan di entitas `Siswa` pada kolom `token_skl`. Token dihapus jika status berubah dari `LULUS`.
    *   *Catatan: Logika validasi token (FR-10) dan penggunaan token oleh siswa untuk mengunduh SKL belum diimplementasikan.*

---

## Isu dan Pertimbangan

- **[SELESAI]** ~~Perlu penambahan kolom pada entitas `PengaturanSekolah` untuk detail kop surat SKL (nama dinas, alamat lengkap sekolah, kontak sekolah, nama kepala sekolah, NIP kepala sekolah).~~
  - *Catatan: Entitas `PengaturanSekolah` telah diverifikasi memiliki semua kolom yang dibutuhkan. Controller API dan UI Admin telah diperbarui untuk mendukung pengelolaan semua field ini, memastikan data SKL lengkap.*
- **[SELESAI SEBAGIAN]** ~~Perlu pembuatan entitas `MataPelajaran` dan `NilaiSiswa` beserta API dan UI untuk pengelolaannya (FR-03, FR-05).~~
  - *Catatan `MataPelajaran` (FR-05): Entitas diperbarui (penambahan `kategori_mapel`), CRUD API lengkap telah dibuat, dan UI Admin dasar untuk manajemen mata pelajaran telah ditambahkan.*
  - *Catatan `NilaiSiswa` (FR-03): Entitas telah diverifikasi, CRUD API dasar (termasuk batch update per siswa) telah dibuat. UI Admin spesifik untuk input/edit nilai per siswa belum menjadi fokus di iterasi ini, namun SKL sudah dapat menampilkan nilai dengan benar.*
- **[SELESAI]** ~~Perlu penambahan kolom `token_skl` pada entitas `Siswa`.~~
  - *Catatan: Kolom `token_skl` telah diverifikasi ada di entitas `Siswa` dan migrasinya. Logika untuk pembuatan token SKL otomatis saat siswa dinyatakan LULUS (FR-06) juga telah diimplementasikan.*

---

## Log Pengembangan

### 2024-05-29 (Current Iteration - SKL Enhancements & Admin UIs)
- **Tugas:** Pengembangan Fitur Lanjutan dan Penyempurnaan Aplikasi.
  - Memperbarui entitas, controller API, dan UI Admin untuk `PengaturanSekolah` guna mendukung semua field detail SKL (FR-01).
  - Memperbarui entitas `MataPelajaran` (menambah `kategori_mapel`), membuat CRUD API, dan UI Admin dasar untuk manajemen mata pelajaran (FR-05).
  - Membuat CRUD API untuk `NilaiSiswa` untuk pengelolaan nilai siswa (FR-03 backend).
  - Mengimplementasikan logika pembuatan token SKL otomatis (`token_skl` di entitas `Siswa`) ketika status kelulusan siswa diubah (FR-06).
  - Memverifikasi dan memastikan `pdfService.ts` dapat menghasilkan SKL dengan data yang lengkap dan format yang benar (FR-09).
  - Melakukan pengujian menyeluruh dan memperbaiki bug (misalnya, penetapan status `TIDAK_LULUS` pada FR-04).
- **Status:** Selesai.
- **Catatan:** Aplikasi kini memiliki fungsionalitas yang lebih lengkap untuk pengelolaan data sekolah, mata pelajaran, nilai (via API), dan pembuatan SKL yang akurat. UI Admin untuk mata pelajaran telah ditambahkan. Kualitas dan kelengkapan data SKL meningkat signifikan.

### 2025-05-24

- **Tugas:** Penyempurnaan Penanganan Error Axios & Persiapan Sesi Baru.
  - Menyempurnakan penanganan error pada `client/src/api.ts` untuk mengatasi lint error terkait `error is of type unknown` dengan memastikan akses properti `response.data` aman.
  - Memperbaiki impor tipe di `client/src/components/KelolaNilaiModal.tsx` untuk `verbatimModuleSyntax`.
  - Mengidentifikasi kebutuhan instalasi `axios` di direktori `client` sebagai langkah selanjutnya untuk mengatasi error modul tidak ditemukan.
- **Status:** Selesai.
- **Catatan:** Persiapan untuk memulai sesi pengembangan baru.

### 2025-05-24

- **Tugas:** Inisiasi proyek dan pembuatan `README_dev.md`.
- **Status:** Selesai.
- **Catatan:** Membaca `README.md` untuk memahami lingkup proyek.

### 2025-05-24

- **Tugas:** Inisialisasi proyek backend (Node.js + TypeScript).
  - Membuat struktur folder `server`.
  - Inisialisasi `package.json`.
  - Instalasi dependensi dasar (TypeScript, Express, ts-node, nodemon).
  - Membuat `tsconfig.json`.
  - Menambahkan skrip `start` dan `dev` ke `package.json`.
  - Membuat file entry point `server/src/index.ts`.
- **Status:** Selesai.
- **Catatan:** Backend dasar siap untuk pengembangan lebih lanjut.

### 2025-05-24

- **Tugas:** Inisialisasi proyek frontend (React + TypeScript).
  - Membuat struktur folder `client`.
  - Inisialisasi proyek React + TypeScript menggunakan Vite.
  - Instalasi dependensi dasar.
  - Instalasi Ant Design sebagai UI Framework.
- **Status:** Selesai.
- **Catatan:** Frontend dasar siap untuk pengembangan lebih lanjut.

### 2025-05-24

- **Tugas:** Setup TypeORM dan koneksi database (SQLite) untuk backend.
  - Instalasi dependensi `typeorm`, `sqlite3`, `reflect-metadata`.
  - Membuat file konfigurasi `server/src/data-source.ts`.
  - Memperbarui `server/src/index.ts` untuk inisialisasi koneksi database.
  - Membuat folder `entity`, `migration`, `subscriber` di `server/src`.
- **Status:** Selesai.
- **Catatan:** TypeORM terintegrasi dan siap digunakan dengan database SQLite.

### 2025-05-24

- **Tugas:** Implementasi Backend Fitur FR-01 (Pengaturan Identitas Sekolah).
  - Instalasi `multer` untuk unggah file.
  - Membuat entity `PengaturanSekolah`.
  - Membuat controller `pengaturanSekolahController.ts` (get & update, termasuk upload logo).
  - Membuat rute `pengaturanSekolahRoutes.ts` dengan konfigurasi Multer.
  - Mendaftarkan rute dan middleware static files di `server/src/index.ts`.
  - Memperbaiki lint errors pada entity dan controller.
- **Status:** Selesai.
- **Catatan:** API untuk pengelolaan pengaturan sekolah (GET /api/pengaturan-sekolah, PUT /api/pengaturan-sekolah) sudah siap.

### 2025-05-24

- **Tugas:** Implementasi Frontend Fitur FR-01 (Pengaturan Identitas Sekolah).
  - Membuat folder `client/src/pages/Admin` dan `client/src/components`.
  - Membuat komponen `PengaturanSekolahPage.tsx` dengan form Ant Design (input nama, upload logo sekolah & dinas, tanggal rilis, switch status akses).
  - Implementasi pengambilan data (GET) dan pengiriman data (PUT dengan FormData) ke API backend.
  - Instalasi `react-router-dom`.
  - Membuat komponen `AppLayout.tsx` untuk tata letak dasar aplikasi.
  - Mengkonfigurasi routing di `App.tsx` untuk halaman pengaturan sekolah.
  - Menambahkan `ConfigProvider` Ant Design dengan locale Bahasa Indonesia di `App.tsx`.
  - Mengimpor CSS Ant Design di `main.tsx`.
- **Status:** Selesai.
- **Catatan:** Halaman admin untuk pengaturan sekolah dapat diakses di `/admin/pengaturan-sekolah`.

### 2025-05-24

- **Tugas:** Implementasi Backend Fitur FR-02 (Manajemen Data Siswa).
  - Membuat entity `Siswa` dengan kolom yang relevan (NISN, nama, kelas, jurusan, status_kelulusan, dll.).
  - Mengubah tipe kolom `status_kelulusan` dari `enum` ke `simple-enum` untuk kompatibilitas SQLite.
  - Membuat controller `siswaController.ts` untuk operasi CRUD (Create, Read All with pagination & filter, Read One, Update, Delete).
  - Menambahkan validasi untuk NISN unik.
  - Membuat rute `siswaRoutes.ts`.
  - Mendaftarkan rute siswa di `server/src/index.ts`.
  - Menambahkan global error handling middleware di `server/src/index.ts`.
  - Melakukan serangkaian tes backend menggunakan `curl` untuk memastikan fungsionalitas API.
- **Status:** Selesai.
- **Catatan:** API untuk manajemen data siswa (GET /api/siswa, GET /api/siswa/:id, POST /api/siswa, PUT /api/siswa/:id, DELETE /api/siswa/:id) sudah siap dan teruji.

### 2025-05-24

- **Tugas:** Implementasi Frontend Fitur FR-02 (Manajemen Data Siswa).
  - Membuat file `client/src/types/siswa.ts` untuk interface `Siswa`, `SiswaPaginatedResponse`, dan enum `StatusKelulusan`.
  - Membuat halaman `client/src/pages/Admin/ManajemenSiswaPage.tsx` menggunakan komponen Ant Design (Table, Modal, Form, dll.) untuk menampilkan, menambah, mengedit, dan menghapus data siswa.
  - Implementasi fitur pencarian, filter, dan paginasi pada tabel siswa.
  - Menambahkan rute `/admin/manajemen-siswa` di `client/src/App.tsx`.
  - Menambahkan link navigasi "Manajemen Siswa" di `client/src/components/AppLayout.tsx`.
  - Mengatasi berbagai lint errors terkait type-only imports dan penggunaan enum.
- **Status:** Selesai.
- **Catatan:** Halaman admin untuk manajemen data siswa dapat diakses di `/admin/manajemen-siswa`.

### 2025-05-24 (Update README_dev.md)
- **Tugas:** Menggabungkan informasi dari `README.md` ke `README_dev.md`, memperbarui status fitur, dan menambahkan bagian keputusan desain.
- **Status:** Selesai.
- **Catatan:** `README_dev.md` sekarang menjadi pusat informasi pengembangan proyek.
