import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Siswa } from '../entity/Siswa';
import { PengaturanSekolah } from '../entity/PengaturanSekolah';
import { generateSklPdfDefinition, createPdfBlob } from '../services/pdfService';
import { StatusKelulusan } from '../entity/Siswa'; // Impor enum jika diperlukan untuk logika

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
