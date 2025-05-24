import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { NilaiSiswa } from '../entity/NilaiSiswa';
import { Siswa } from '../entity/Siswa';
import { MataPelajaran } from '../entity/MataPelajaran';

export const getNilaiBySiswaId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siswaId = parseInt(req.params.siswaId);
    if (isNaN(siswaId)) {
      res.status(400).json({ message: 'ID Siswa tidak valid.' });
      return;
    }

    const nilaiSiswaRepository = AppDataSource.getRepository(NilaiSiswa);
    const nilai = await nilaiSiswaRepository.find({
      where: { siswa: { id: siswaId } },
      relations: ['mataPelajaran'], // Sertakan mata pelajaran agar namanya bisa ditampilkan
      order: {
        mataPelajaran: {
          kelompok_mapel: 'ASC',
          urutan_mapel: 'ASC',
          nama_mapel: 'ASC'
        }
      }
    });

    if (!nilai) {
      res.status(404).json({ message: 'Data nilai tidak ditemukan untuk siswa ini.' });
      return;
    }

    res.status(200).json(nilai);
  } catch (error) {
    next(error);
  }
};

interface NilaiInput {
  mapelId: number;
  nilai: number | null; // Izinkan null jika nilai ingin dikosongkan/dihapus
}

export const createOrUpdateNilaiSiswaBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siswaId = parseInt(req.params.siswaId);
    const daftarNilai: NilaiInput[] = req.body.nilai; // Asumsi body: { nilai: [ {mapelId: 1, nilai: 80}, ... ] }

    if (isNaN(siswaId)) {
      res.status(400).json({ message: 'ID Siswa tidak valid.' });
      return;
    }

    if (!Array.isArray(daftarNilai) || daftarNilai.length === 0) {
      res.status(400).json({ message: 'Data nilai tidak valid atau kosong.' });
      return;
    }

    const siswaRepository = AppDataSource.getRepository(Siswa);
    const siswa = await siswaRepository.findOneBy({ id: siswaId });
    if (!siswa) {
      res.status(404).json({ message: 'Siswa tidak ditemukan.' });
      return;
    }

    const nilaiSiswaRepository = AppDataSource.getRepository(NilaiSiswa);
    const mapelRepository = AppDataSource.getRepository(MataPelajaran);
    
    const results = [];

    for (const item of daftarNilai) {
      if (typeof item.mapelId !== 'number' || (item.nilai !== null && typeof item.nilai !== 'number')) {
        results.push({ mapelId: item.mapelId, status: 'error', message: 'Format mapelId atau nilai tidak valid.' });
        continue;
      }

      const mataPelajaran = await mapelRepository.findOneBy({ id: item.mapelId });
      if (!mataPelajaran) {
        results.push({ mapelId: item.mapelId, status: 'error', message: 'Mata pelajaran tidak ditemukan.' });
        continue;
      }

      let nilaiRecord = await nilaiSiswaRepository.findOne({
        where: { siswa: { id: siswaId }, mataPelajaran: { id: item.mapelId } },
      });

      if (item.nilai === null) { // Jika nilai null, hapus record jika ada
        if (nilaiRecord) {
          await nilaiSiswaRepository.remove(nilaiRecord);
          results.push({ mapelId: item.mapelId, status: 'deleted' });
        }
        continue; // Lanjut ke item berikutnya
      }

      if (nilaiRecord) {
        // Update nilai jika sudah ada
        nilaiRecord.nilai = item.nilai;
      } else {
        // Buat record nilai baru jika belum ada
        nilaiRecord = nilaiSiswaRepository.create({
          siswa: siswa,
          mataPelajaran: mataPelajaran,
          nilai: item.nilai,
        });
      }
      await nilaiSiswaRepository.save(nilaiRecord);
      results.push({ mapelId: item.mapelId, id: nilaiRecord.id, status: 'saved' });
    }

    res.status(201).json({ message: 'Data nilai berhasil diproses.', results });
  } catch (error) {
    next(error);
  }
};
