import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Siswa, StatusKelulusan } from '../entity/Siswa';
import { PengaturanSekolah } from '../entity/PengaturanSekolah';
import { generateSklPdfDefinition, createPdfBlob } from '../services/pdfService';
// StatusKelulusan sudah diimpor dari Siswa

export const downloadSklByTokenController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ message: 'Token tidak boleh kosong.' });
      return;
    }

    const pengaturanRepository = AppDataSource.getRepository(PengaturanSekolah);
    const pengaturanArray = await pengaturanRepository.find();
    const pengaturan = pengaturanArray.length > 0 ? pengaturanArray[0] : null;

    if (!pengaturan) {
      // Jika tidak ada pengaturan, anggap akses ditutup atau belum dikonfigurasi
      // Sesuai FR-10, jika akses_aktif false atau tanggal rilis belum tercapai.
      // Jika pengaturan tidak ada, ini bisa dianggap sebagai kondisi di mana pengumuman belum siap.
      res.status(500).json({ message: 'Pengaturan sekolah belum dikonfigurasi. Tidak dapat memproses permintaan SKL.' });
      return;
    }

    // Menggunakan nama kolom yang benar dari entity PengaturanSekolah: akses_aktif
    if (!pengaturan.akses_aktif) { 
      res.status(403).json({ message: 'Pengumuman belum dibuka atau sudah ditutup oleh administrator.' });
      return;
    }

    const sekarang = new Date();
    // Menggunakan nama kolom yang benar dari entity PengaturanSekolah: tanggal_rilis
    const tanggalRilis = pengaturan.tanggal_rilis ? new Date(pengaturan.tanggal_rilis) : null; 

    if (!tanggalRilis) {
      res.status(403).json({ message: 'Tanggal rilis pengumuman belum diatur oleh administrator.' });
      return;
    }

    if (sekarang < tanggalRilis) {
      const tglRilisFormatted = tanggalRilis.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      res.status(403).json({ message: `Pengumuman kelulusan akan dibuka pada ${tglRilisFormatted}.` });
      return;
    }

    const siswaRepository = AppDataSource.getRepository(Siswa);
    // Mencari siswa berdasarkan token_skl dan memuat relasi yang diperlukan untuk PDF
    const siswa = await siswaRepository.findOne({ 
      where: { token_skl: token },
      relations: ['nilai_siswa', 'nilai_siswa.mataPelajaran'] 
    });

    if (!siswa) {
      res.status(404).json({ message: 'Token tidak valid.' });
      return;
    }

    if (siswa.status_kelulusan !== StatusKelulusan.LULUS) {
      res.status(403).json({ message: 'Siswa dengan token ini tidak dinyatakan lulus.' });
      return;
    }

    // Semua validasi lolos, generate PDF
    const docDefinition = await generateSklPdfDefinition(siswa, pengaturan);
    const pdfBuffer = await createPdfBlob(docDefinition);

    const filename = `SKL_${siswa.nisn}_${siswa.token_skl}.pdf`; // Sesuai spesifikasi FR-09

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error in downloadSklByTokenController:', error);
    if (error instanceof Error && error.message.includes('Font file not found')) {
        next(new Error('Gagal generate PDF: File font tidak ditemukan di server. Harap hubungi administrator.'));
    } else {
        next(error); 
    }
  }
};


export const generateSklController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siswaId = parseInt(req.params.siswaId);
    if (isNaN(siswaId)) {
      res.status(400).json({ message: 'ID Siswa tidak valid.' });
      return;
    }

    const siswaRepository = AppDataSource.getRepository(Siswa);
    const siswa = await siswaRepository.findOne({ where: { id: siswaId }, relations: ['nilai_siswa', 'nilai_siswa.mataPelajaran'] });

    if (!siswa) {
      res.status(404).json({ message: 'Data siswa tidak ditemukan.' });
      return;
    }

    // Logika tambahan: Mungkin hanya siswa yang LULUS yang boleh dapat SKL
    // if (siswa.status_kelulusan !== StatusKelulusan.LULUS) {
    //   res.status(403).json({ message: 'SKL hanya dapat digenerate untuk siswa yang berstatus LULUS.' });
    //   return;
    // }

    const pengaturanRepository = AppDataSource.getRepository(PengaturanSekolah);
    const pengaturanArray = await pengaturanRepository.find(); // Ambil semua, asumsi hanya ada 1 row
    const pengaturan = pengaturanArray.length > 0 ? pengaturanArray[0] : null;

    if (!pengaturan) {
        console.warn('Pengaturan sekolah tidak ditemukan. SKL akan digenerate dengan data default.');
        // Anda bisa memilih untuk mengembalikan error jika pengaturan wajib ada
        // res.status(500).json({ message: 'Pengaturan sekolah tidak ditemukan, tidak dapat generate SKL.' });
        // return;
    }

    console.log('Data Siswa untuk PDF:', JSON.stringify(siswa, null, 2));
    console.log('Data Pengaturan untuk PDF:', JSON.stringify(pengaturan, null, 2));
    // Pastikan untuk memeriksa apakah siswa.nilai_siswa ada dan berisi data
    if (siswa && siswa.nilai_siswa) {
      console.log('Jumlah Nilai Siswa:', siswa.nilai_siswa.length);
      siswa.nilai_siswa.forEach(nilai => {
        console.log('Detail Nilai:', JSON.stringify(nilai, null, 2));
        // Khususnya periksa apakah mataPelajaran ada di setiap objek nilai
        if (nilai.mataPelajaran) {
          console.log('Detail Mata Pelajaran terkait:', JSON.stringify(nilai.mataPelajaran, null, 2));
        } else {
          console.log('Mata Pelajaran TIDAK ADA untuk nilai ID:', nilai.id);
        }
      });
    } else {
      console.log('Siswa tidak memiliki data nilai_siswa atau siswa adalah null.');
    }

    const docDefinition = await generateSklPdfDefinition(siswa, pengaturan);
    const pdfBuffer = await createPdfBlob(docDefinition);

    const filename = `SKL_${siswa.nisn}_${siswa.nama_lengkap.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); // Gunakan attachment untuk download
    // res.setHeader('Content-Disposition', `inline; filename="${filename}"`); // Gunakan inline untuk tampil di browser
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating SKL PDF:', error);
    // Menggunakan next(error) agar ditangani oleh global error handler
    // Pastikan global error handler bisa menangani error dari service PDF juga
    if (error instanceof Error && error.message.includes('Font file not found')) {
        next(new Error('Gagal generate PDF: File font tidak ditemukan di server. Harap hubungi administrator.'));
    } else {
        next(error); // Teruskan error lain ke global error handler
    }
  }
};
