import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { NilaiSiswa } from '../entity/NilaiSiswa';
import { Siswa } from '../entity/Siswa';
import { MataPelajaran } from '../entity/MataPelajaran';
import { FindOneOptions } from 'typeorm';

// Get all grades for a specific student, populating subject details
export const getNilaiBySiswaId = async (req: Request, res: Response): Promise<void> => {
  try {
    const siswaId = parseInt(req.params.siswaId, 10);
    if (isNaN(siswaId)) {
      res.status(400).json({ message: 'Siswa ID tidak valid' });
      return;
    }

    const nilaiSiswaRepository = AppDataSource.getRepository(NilaiSiswa);
    const nilaiItems = await nilaiSiswaRepository.find({
      where: { siswa: { id: siswaId } },
      relations: ['mataPelajaran'], // Populate mataPelajaran details
      order: { mataPelajaran: { urutan_mapel: 'ASC', nama_mapel: 'ASC' } } 
    });

    // It's not an error if a student has no grades yet, return empty array
    res.json(nilaiItems);
  } catch (error) {
    console.error('Error getNilaiBySiswaId:', error);
    res.status(500).json({ message: 'Gagal mengambil data nilai siswa', error: (error as Error).message });
  }
};

// Batch update/create grades for a student
export const batchUpdateNilaiSiswa = async (req: Request, res: Response): Promise<void> => {
  try {
    const siswaId = parseInt(req.params.siswaId, 10);
    // The client might send an object like { nilai: [ ... ] }
    const gradesData = Array.isArray(req.body) ? req.body : (req.body.nilai || []);


    if (isNaN(siswaId)) {
      res.status(400).json({ message: 'Siswa ID tidak valid' });
      return;
    }

    if (!Array.isArray(gradesData)) {
      res.status(400).json({ message: 'Request body harus berupa array nilai atau objek dengan properti "nilai" berupa array' });
      return;
    }
    
    const siswaRepository = AppDataSource.getRepository(Siswa);
    const siswa = await siswaRepository.findOneBy({ id: siswaId });
    if (!siswa) {
      res.status(404).json({ message: 'Siswa tidak ditemukan' });
      return;
    }

    const mataPelajaranRepository = AppDataSource.getRepository(MataPelajaran);
    const nilaiSiswaRepository = AppDataSource.getRepository(NilaiSiswa);
    const updatedOrCreatedNilai: NilaiSiswa[] = [];
    const errors: string[] = [];

    for (const gradeItem of gradesData) {
      if (gradeItem.mataPelajaranId === undefined || gradeItem.mataPelajaranId === null ) {
        errors.push(`Item nilai tidak memiliki mataPelajaranId: ${JSON.stringify(gradeItem)}`);
        continue; 
      }
      const mataPelajaranId = parseInt(String(gradeItem.mataPelajaranId), 10);
      if (isNaN(mataPelajaranId)) {
        errors.push(`Mata Pelajaran ID "${gradeItem.mataPelajaranId}" tidak valid.`);
        continue;
      }

      const mataPelajaran = await mataPelajaranRepository.findOneBy({ id: mataPelajaranId });
      if (!mataPelajaran) {
        errors.push(`Mata pelajaran dengan ID ${mataPelajaranId} tidak ditemukan.`);
        continue; 
      }
      
      const nilai = (gradeItem.nilai === undefined || gradeItem.nilai === null || String(gradeItem.nilai).trim() === "") ? null : parseFloat(String(gradeItem.nilai));
      if (nilai !== null && isNaN(nilai)) {
          errors.push(`Nilai "${gradeItem.nilai}" untuk mata pelajaran ${mataPelajaran.nama_mapel} (ID ${mataPelajaranId}) tidak valid.`);
          continue;
      }
      if (nilai !== null && (nilai < 0 || nilai > 100)) {
          errors.push(`Nilai ${nilai} untuk mata pelajaran ${mataPelajaran.nama_mapel} (ID ${mataPelajaranId}) harus antara 0 dan 100.`);
          continue;
      }

      let record = await nilaiSiswaRepository.findOne({
        where: {
          siswa: { id: siswaId },
          mataPelajaran: { id: mataPelajaranId }
        }
      });

      if (record) {
        // Only update if the new value is different or if it's null (to allow clearing grades)
        if (record.nilai !== nilai || (nilai === null && record.nilai !== null) ) {
            record.nilai = nilai;
            const savedRecord = await nilaiSiswaRepository.save(record);
            updatedOrCreatedNilai.push(savedRecord);
        } else {
            // If value is the same, push existing record to indicate it was processed
            updatedOrCreatedNilai.push(record);
        }
      } else {
        // Only create if a value is provided (even if null, to explicitly set it as null)
        if (gradeItem.nilai !== undefined) { 
            record = nilaiSiswaRepository.create({
              siswa: { id: siswaId }, // Use shorthand for relation ID
              mataPelajaran: { id: mataPelajaranId }, // Use shorthand for relation ID
              nilai: nilai
            });
            const savedRecord = await nilaiSiswaRepository.save(record);
            updatedOrCreatedNilai.push(savedRecord);
        }
      }
    }
    
    if (errors.length > 0) {
        // If there were validation errors for some items but others might be processed
        res.status(400).json({ 
            message: 'Beberapa item nilai gagal divalidasi.', 
            errors, 
            processedItems: updatedOrCreatedNilai 
        });
        return;
    }

    res.status(200).json({ message: 'Nilai siswa berhasil disimpan/diperbarui', data: updatedOrCreatedNilai });
  } catch (error) {
    console.error('Error batchUpdateNilaiSiswa:', error);
    res.status(500).json({ message: 'Gagal menyimpan/memperbarui nilai siswa', error: (error as Error).message });
  }
};

// Delete a specific grade entry by its own ID
export const deleteNilaiSiswaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const nilaiId = parseInt(req.params.nilaiId, 10);
    if (isNaN(nilaiId)) {
      res.status(400).json({ message: 'ID nilai tidak valid' });
      return;
    }

    const nilaiSiswaRepository = AppDataSource.getRepository(NilaiSiswa);
    const deleteResult = await nilaiSiswaRepository.delete(nilaiId);

    if (deleteResult.affected === 0) {
      res.status(404).json({ message: 'Data nilai siswa tidak ditemukan' });
      return;
    }

    res.json({ message: 'Data nilai siswa berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteNilaiSiswaById:', error);
    res.status(500).json({ message: 'Gagal menghapus data nilai siswa', error: (error as Error).message });
  }
};
