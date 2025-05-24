import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { PengaturanSekolah } from '../entity/PengaturanSekolah';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const getPengaturanSekolah = async (req: Request, res: Response): Promise<void> => {
  try {
    const pengaturanRepository = AppDataSource.getRepository(PengaturanSekolah);
    let pengaturan = await pengaturanRepository.findOneBy({ id: 1 }); // Asumsi hanya ada 1 baris pengaturan

    if (!pengaturan) {
      // Jika belum ada, buat pengaturan default
      pengaturan = pengaturanRepository.create({
        // id: 1, // id akan auto-increment
        nama_sekolah: 'Nama Sekolah Default',
        akses_aktif: false,
      });
      await pengaturanRepository.save(pengaturan);
    }
    res.json(pengaturan);
    return;
  } catch (error) {
    console.error('Error getPengaturanSekolah:', error);
    res.status(500).json({ message: 'Gagal mengambil pengaturan sekolah', error });
    return;
  }
};

export const updatePengaturanSekolah = async (req: Request, res: Response): Promise<void> => {
  try {
    const pengaturanRepository = AppDataSource.getRepository(PengaturanSekolah);
    let pengaturan = await pengaturanRepository.findOneBy({ id: 1 });

    if (!pengaturan) {
      res.status(404).json({ message: 'Pengaturan sekolah tidak ditemukan.' });
      return;
    }

    const { nama_sekolah, tanggal_rilis, akses_aktif } = req.body;

    pengaturan.nama_sekolah = nama_sekolah !== undefined ? nama_sekolah : pengaturan.nama_sekolah;
    pengaturan.tanggal_rilis = tanggal_rilis !== undefined ? new Date(tanggal_rilis) : pengaturan.tanggal_rilis;
    pengaturan.akses_aktif = akses_aktif !== undefined ? (akses_aktif === 'true' || akses_aktif === true) : pengaturan.akses_aktif;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files?.logo_sekolah?.[0]) {
      // Hapus logo lama jika ada
      if (pengaturan.logo_sekolah_path) {
        const oldLogoPath = path.join(UPLOAD_DIR, path.basename(pengaturan.logo_sekolah_path));
        if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
      }
      pengaturan.logo_sekolah_path = `/uploads/${files.logo_sekolah[0].filename}`;
    }

    if (files?.logo_dinas?.[0]) {
      // Hapus logo lama jika ada
      if (pengaturan.logo_dinas_path) {
        const oldLogoPath = path.join(UPLOAD_DIR, path.basename(pengaturan.logo_dinas_path));
        if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
      }
      pengaturan.logo_dinas_path = `/uploads/${files.logo_dinas[0].filename}`;
    }

    await pengaturanRepository.save(pengaturan);
    res.json({ message: 'Pengaturan sekolah berhasil diperbarui', pengaturan });
    return;

  } catch (error) {
    console.error('Error updatePengaturanSekolah:', error);
    res.status(500).json({ message: 'Gagal memperbarui pengaturan sekolah', error });
    return;
  }
};
