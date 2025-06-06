import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Siswa, StatusKelulusan } from '../entity/Siswa';
import { Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export const getAllSiswa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siswaRepository = AppDataSource.getRepository(Siswa);
    const { page = 1, limit = 10, search = '', status_kelulusan = '', kelas = '', jurusan = '' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    let whereConditions: any = {};
    if (search) {
      whereConditions = [
        { nisn: Like(`%${search}%`) },
        { nama_lengkap: Like(`%${search}%`) },
        { nomor_peserta_ujian: Like(`%${search}%`) },
      ];
    }
    if (status_kelulusan && Object.values(StatusKelulusan).includes(status_kelulusan as StatusKelulusan)) {
      if (Array.isArray(whereConditions) && whereConditions.length > 0) {
        whereConditions = whereConditions.map(cond => ({ ...cond, status_kelulusan: status_kelulusan as StatusKelulusan }));
      } else {
        whereConditions.status_kelulusan = status_kelulusan as StatusKelulusan;
      }
    }
    if (kelas) {
       if (Array.isArray(whereConditions) && whereConditions.length > 0) {
        whereConditions = whereConditions.map(cond => ({ ...cond, kelas: Like(`%${kelas}%`) }));
      } else {
        whereConditions.kelas = Like(`%${kelas}%`);
      }
    }
    if (jurusan) {
      if (Array.isArray(whereConditions) && whereConditions.length > 0) {
        whereConditions = whereConditions.map(cond => ({ ...cond, jurusan: Like(`%${jurusan}%`) }));
      } else {
        whereConditions.jurusan = Like(`%${jurusan}%`);
      }
    }

    const [data, total] = await siswaRepository.findAndCount({
      where: Array.isArray(whereConditions) && whereConditions.length === 0 ? undefined : whereConditions,
      order: { nama_lengkap: 'ASC' },
      skip: skip,
      take: Number(limit),
    });

    res.status(200).json({ 
      data,
      total,
      page: Number(page),
      last_page: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Error fetching siswa:', error);
    next(error);
  }
};

export const getSiswaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siswaRepository = AppDataSource.getRepository(Siswa);
    const siswa = await siswaRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!siswa) {
      res.status(404).json({ message: 'Siswa tidak ditemukan' });
      return;
    }
    res.status(200).json(siswa);
  } catch (error) {
    console.error('Error fetching siswa by ID:', error);
    next(error);
  }
};

export const createSiswa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('Attempting to create siswa. Received body:', JSON.stringify(req.body, null, 2));
  try {
    const siswaRepository = AppDataSource.getRepository(Siswa);
    const siswa = siswaRepository.create(req.body as Siswa);
    await siswaRepository.save(siswa);
    res.status(201).json({ message: 'Siswa berhasil dibuat', siswa });
  } catch (error) {
    console.error('Error creating siswa. Body was:', JSON.stringify(req.body, null, 2));
    console.error('Full error object during createSiswa:', error);
    if ((error as any).code === 'SQLITE_CONSTRAINT' && (error as any).message.includes('UNIQUE constraint failed: siswa.nisn')) {
      res.status(400).json({ message: 'NISN sudah terdaftar.' });
      return;
    }
    next(error);
  }
};

export const updateSiswa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log(`Attempting to update siswa with id: ${req.params.id}. Received body:`, JSON.stringify(req.body, null, 2));
  try {
    const siswaRepository = AppDataSource.getRepository(Siswa);
    const siswa = await siswaRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!siswa) {
      res.status(404).json({ message: 'Siswa tidak ditemukan' });
      return;
    }

    const originalStatus = siswa.status_kelulusan; // Status before any changes

    // Apply updates from req.body to the siswa entity
    // This will update siswa.status_kelulusan if it's in req.body
    siswaRepository.merge(siswa, req.body as Partial<Siswa>); 

    const newStatus = siswa.status_kelulusan; // Status after potential update from req.body

    // Check if status_kelulusan was actually provided in the request,
    // otherwise, no status-dependent token logic should run.
    if (req.body.status_kelulusan !== undefined) {
        if (newStatus === StatusKelulusan.LULUS && originalStatus !== StatusKelulusan.LULUS) {
            // Status changed to LULUS (and was not LULUS before)
            siswa.token_skl = uuidv4();
            console.log(`Generated new SKL token for siswa ID ${siswa.id}: ${siswa.token_skl} due to status change to LULUS.`);
        } else if (newStatus === StatusKelulusan.LULUS && originalStatus === StatusKelulusan.LULUS && !siswa.token_skl) {
            // Status is LULUS, was LULUS, but token is missing (e.g. old data)
            siswa.token_skl = uuidv4();
            console.log(`Generated SKL token for siswa ID ${siswa.id}: ${siswa.token_skl} because status is LULUS and token was missing.`);
        } else if (newStatus !== StatusKelulusan.LULUS && originalStatus === StatusKelulusan.LULUS) {
            // Status changed from LULUS to something else
            siswa.token_skl = null;
            console.log(`Cleared SKL token for siswa ID ${siswa.id} as status changed from LULUS to ${newStatus}.`);
        }
    }

    await siswaRepository.save(siswa);
    res.status(200).json({ message: 'Siswa berhasil diperbarui', siswa });
  } catch (error) {
    console.error(`Error updating siswa with id: ${req.params.id}. Body was:`, JSON.stringify(req.body, null, 2));
    console.error('Full error object during updateSiswa:', error);
     if ((error as any).code === 'SQLITE_CONSTRAINT' && (error as any).message.includes('UNIQUE constraint failed: siswa.nisn')) {
      res.status(400).json({ message: 'NISN sudah terdaftar untuk siswa lain.' });
      return;
    }
    next(error);
  }
};

export const deleteSiswa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siswaRepository = AppDataSource.getRepository(Siswa);
    const result = await siswaRepository.delete(parseInt(req.params.id));
    if (result.affected === 0) {
      res.status(404).json({ message: 'Siswa tidak ditemukan' });
      return;
    }
    res.status(200).json({ message: 'Siswa berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting siswa:', error);
    next(error);
  }
};
