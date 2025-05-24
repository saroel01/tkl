import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { MataPelajaran } from '../entity/MataPelajaran';

export const getAllMataPelajaran = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
    const mataPelajaran = await mataPelajaranRepository.find({
      order: {
        kelompok_mapel: 'ASC',
        urutan_mapel: 'ASC',
        nama_mapel: 'ASC',
      },
    });
    res.status(200).json(mataPelajaran);
  } catch (error) {
    next(error);
  }
};
