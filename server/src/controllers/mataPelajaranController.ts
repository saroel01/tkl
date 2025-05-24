import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { MataPelajaran, KategoriMapel } from '../entity/MataPelajaran';
import { FindOneOptions } from 'typeorm';

export const getAllMataPelajaran = async (req: Request, res: Response): Promise<void> => {
  try {
    const mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
    const mataPelajaran = await mataPelajaranRepository.find({ order: { urutan_mapel: 'ASC', nama_mapel: 'ASC' } });
    res.json(mataPelajaran);
  } catch (error) {
    console.error('Error getAllMataPelajaran:', error);
    res.status(500).json({ message: 'Gagal mengambil data mata pelajaran', error: (error as Error).message });
  }
};

export const getMataPelajaranById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id, 10))) {
        res.status(400).json({ message: 'ID mata pelajaran tidak valid' });
        return;
    }
    const mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
    const options: FindOneOptions<MataPelajaran> = { where: { id: parseInt(id, 10) } };
    const mataPelajaran = await mataPelajaranRepository.findOne(options);

    if (!mataPelajaran) {
      res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
      return;
    }
    res.json(mataPelajaran);
  } catch (error) {
    console.error('Error getMataPelajaranById:', error);
    res.status(500).json({ message: 'Gagal mengambil data mata pelajaran', error: (error as Error).message });
  }
};

export const createMataPelajaran = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama_mapel, kelompok_mapel, urutan_mapel, kategori_mapel } = req.body;

    if (!nama_mapel || String(nama_mapel).trim() === '') {
      res.status(400).json({ message: 'Nama mata pelajaran wajib diisi' });
      return;
    }

    if (kategori_mapel && !Object.values(KategoriMapel).includes(kategori_mapel as KategoriMapel)) {
      res.status(400).json({ message: `Nilai kategori_mapel tidak valid. Nilai yang diperbolehkan: ${Object.values(KategoriMapel).join(', ')}` });
      return;
    }

    const mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
    const newMataPelajaran = mataPelajaranRepository.create({
      nama_mapel: String(nama_mapel).trim(),
      kelompok_mapel: kelompok_mapel ? String(kelompok_mapel).trim() : null,
      urutan_mapel: urutan_mapel !== undefined && urutan_mapel !== null && String(urutan_mapel).trim() !== '' ? parseInt(String(urutan_mapel), 10) : null,
      kategori_mapel: kategori_mapel ? kategori_mapel as KategoriMapel : null,
    });

    await mataPelajaranRepository.save(newMataPelajaran);
    res.status(201).json({ message: 'Mata pelajaran berhasil dibuat', mataPelajaran: newMataPelajaran });
  } catch (error: any) {
    console.error('Error createMataPelajaran:', error);
    if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: mata_pelajaran.nama_mapel')) {
        res.status(400).json({ message: `Mata pelajaran dengan nama "${String(req.body.nama_mapel).trim()}" sudah ada.` });
    } else {
        res.status(500).json({ message: 'Gagal membuat mata pelajaran baru.', error: error.message });
    }
  }
};

export const updateMataPelajaran = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id, 10))) {
        res.status(400).json({ message: 'ID mata pelajaran tidak valid' });
        return;
    }
    const { nama_mapel, kelompok_mapel, urutan_mapel, kategori_mapel } = req.body;

    if (kategori_mapel && !Object.values(KategoriMapel).includes(kategori_mapel as KategoriMapel)) {
      res.status(400).json({ message: `Nilai kategori_mapel tidak valid. Nilai yang diperbolehkan: ${Object.values(KategoriMapel).join(', ')}` });
      return;
    }
    
    const mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
    const options: FindOneOptions<MataPelajaran> = { where: { id: parseInt(id, 10) } };
    const mataPelajaran = await mataPelajaranRepository.findOne(options);

    if (!mataPelajaran) {
      res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
      return;
    }

    if (nama_mapel !== undefined) mataPelajaran.nama_mapel = String(nama_mapel).trim();
    if (kelompok_mapel !== undefined) mataPelajaran.kelompok_mapel = kelompok_mapel ? String(kelompok_mapel).trim() : null;
    if (urutan_mapel !== undefined) mataPelajaran.urutan_mapel = urutan_mapel !== null && String(urutan_mapel).trim() !== '' ? parseInt(String(urutan_mapel), 10) : null;
    if (kategori_mapel !== undefined) mataPelajaran.kategori_mapel = kategori_mapel ? kategori_mapel as KategoriMapel : null;
    
    // Check for uniqueness if nama_mapel is being changed
    if (nama_mapel !== undefined && nama_mapel !== mataPelajaran.nama_mapel) {
        const existing = await mataPelajaranRepository.findOne({ where: { nama_mapel: String(nama_mapel).trim() } });
        if (existing && existing.id !== parseInt(id, 10)) {
            res.status(400).json({ message: `Mata pelajaran dengan nama "${String(nama_mapel).trim()}" sudah ada.` });
            return;
        }
    }

    await mataPelajaranRepository.save(mataPelajaran);
    res.json({ message: 'Mata pelajaran berhasil diperbarui', mataPelajaran });
  } catch (error: any) {
    console.error('Error updateMataPelajaran:', error);
     if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: mata_pelajaran.nama_mapel')) {
        res.status(400).json({ message: `Mata pelajaran dengan nama "${req.body.nama_mapel}" sudah ada.` });
    } else {
        res.status(500).json({ message: 'Gagal memperbarui mata pelajaran.', error: error.message });
    }
  }
};

export const deleteMataPelajaran = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id, 10))) {
        res.status(400).json({ message: 'ID mata pelajaran tidak valid' });
        return;
    }
    const mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
    
    // Check if related NilaiSiswa records exist
    // This requires NilaiSiswa entity and its relation to be defined correctly.
    // For now, we assume cascade delete or manual management of related NilaiSiswa.
    // If not handled by cascade, this delete might fail due to foreign key constraints.

    const deleteResult = await mataPelajaranRepository.delete(parseInt(id, 10));

    if (deleteResult.affected === 0) {
      res.status(404).json({ message: 'Mata pelajaran tidak ditemukan' });
      return;
    }

    res.json({ message: 'Mata pelajaran berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteMataPelajaran:', error);
    // Handle foreign key constraint error specifically if needed
    // e.g., if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') { ... }
    res.status(500).json({ message: 'Gagal menghapus mata pelajaran. Mungkin masih terkait dengan data nilai siswa.', error: (error as Error).message });
  }
};
