import { getMockReq, getMockRes } from '@jest-mock/express';
import { AppDataSource } from '../../data-source';
import { NilaiSiswa } from '../../entity/NilaiSiswa';
import { Siswa, StatusKelulusan } from '../../entity/Siswa'; // Import StatusKelulusan
import { MataPelajaran, KategoriMapel } from '../../entity/MataPelajaran'; // Import KategoriMapel
import { batchUpdateNilaiSiswa } from '../nilaiSiswaController';

// Mock repository methods
const mockNilaiSiswaRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(), 
};
const mockSiswaRepository = {
  findOneBy: jest.fn(),
};
const mockMataPelajaranRepository = {
  findOneBy: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
    if (entity === NilaiSiswa) return mockNilaiSiswaRepository;
    if (entity === Siswa) return mockSiswaRepository;
    if (entity === MataPelajaran) return mockMataPelajaranRepository;
    return { findOneBy: jest.fn(), find: jest.fn(), save: jest.fn(), create: jest.fn() };
  });
});

const { res: mockRes, mockClear } = getMockRes();

describe('batchUpdateNilaiSiswa', () => {
  beforeEach(() => {
    mockClear();
    mockSiswaRepository.findOneBy.mockReset();
    mockMataPelajaranRepository.findOneBy.mockReset();
    mockNilaiSiswaRepository.find.mockReset();
    mockNilaiSiswaRepository.create.mockReset();
    mockNilaiSiswaRepository.save.mockReset();
  });

  const mockValidSiswa: Siswa = { 
    id: 1, nama_lengkap: 'Test Siswa', kelas: 'XII A', 
    nisn: '1234567890', // Corrected: Only nisn, removed nis
    tempat_lahir: 'Testville', tanggal_lahir: '2005-01-01',
    nama_orang_tua_wali: 'Orang Tua Test', status_kelulusan: StatusKelulusan.LULUS, 
    catatan_admin: null, foto_siswa_path: null, jurusan: 'IPA', nomor_ijazah: null, nomor_peserta_ujian: null, nomor_skhun: null, token_skl: null,
    created_at: new Date(), updated_at: new Date(), nilai_siswa: [] // Siswa entity has nilai_siswa relation
  };

  const mockMapel1: MataPelajaran = { 
    id: 101, nama_mapel: 'Matematika', kelompok_mapel: 'A', urutan_mapel: 1, 
    kategori_mapel: KategoriMapel.UMUM, created_at: new Date(), updated_at: new Date() // Removed nilai_siswa from MataPelajaran mock
  };
  const mockMapel2: MataPelajaran = { 
    id: 102, nama_mapel: 'Bahasa Indonesia', kelompok_mapel: 'A', urutan_mapel: 2, 
    kategori_mapel: KategoriMapel.UMUM, created_at: new Date(), updated_at: new Date() // Removed nilai_siswa from MataPelajaran mock
  };

  it('should create new grades for a student if none exist', async () => {
    mockSiswaRepository.findOneBy.mockResolvedValue(mockValidSiswa);
    mockMataPelajaranRepository.findOneBy.mockResolvedValueOnce(mockMapel1).mockResolvedValueOnce(mockMapel2);
    mockNilaiSiswaRepository.find.mockResolvedValue([]); 
    mockNilaiSiswaRepository.create.mockImplementation(dto => ({ ...dto, id: Math.random(), siswa: {id: dto.siswa.id}, mataPelajaran: {id: dto.mataPelajaran.id} } as NilaiSiswa));
    mockNilaiSiswaRepository.save.mockImplementation(entityOrEntities => Promise.resolve(entityOrEntities));

    const payload = [
      { mataPelajaranId: 101, nilai: 90 },
      { mataPelajaranId: 102, nilai: 85 },
    ];
    const mockReq = getMockReq({ params: { siswaId: '1' }, body: payload });

    await batchUpdateNilaiSiswa(mockReq, mockRes);

    expect(mockSiswaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(mockMataPelajaranRepository.findOneBy).toHaveBeenCalledWith({ id: 101 });
    expect(mockMataPelajaranRepository.findOneBy).toHaveBeenCalledWith({ id: 102 });
    expect(mockNilaiSiswaRepository.create).toHaveBeenCalledTimes(2);
    expect(mockNilaiSiswaRepository.save).toHaveBeenCalledTimes(2); 
    expect(mockNilaiSiswaRepository.save).toHaveBeenCalledWith(expect.objectContaining({ siswa: { id: mockValidSiswa.id }, mataPelajaran: { id: mockMapel1.id }, nilai: 90 }));
    expect(mockNilaiSiswaRepository.save).toHaveBeenCalledWith(expect.objectContaining({ siswa: { id: mockValidSiswa.id }, mataPelajaran: { id: mockMapel2.id }, nilai: 85 }));
    expect(mockRes.status).toHaveBeenCalledWith(200); 
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Nilai siswa berhasil disimpan/diperbarui',
      data: expect.arrayContaining([
        expect.objectContaining({ nilai: 90 }),
        expect.objectContaining({ nilai: 85 }),
      ]),
    }));
  });

  it('should update existing grades and create new ones', async () => {
    mockSiswaRepository.findOneBy.mockResolvedValue(mockValidSiswa);
    mockMataPelajaranRepository.findOneBy.mockResolvedValueOnce(mockMapel1).mockResolvedValueOnce(mockMapel2);

    const existingNilaiMatematika = { id: 1, siswa: mockValidSiswa, mataPelajaran: mockMapel1, nilai: 70 } as NilaiSiswa;
    mockNilaiSiswaRepository.findOne.mockImplementation(async ({ where }) => {
      if (where.siswa.id === mockValidSiswa.id && where.mataPelajaran.id === mockMapel1.id) {
        return existingNilaiMatematika;
      }
      return null; 
    });
    
    mockNilaiSiswaRepository.create.mockImplementation(dto => ({ ...dto, id: Math.random(), siswa: {id: dto.siswa.id}, mataPelajaran: {id: dto.mataPelajaran.id} } as NilaiSiswa));
    mockNilaiSiswaRepository.save.mockImplementation(entity => Promise.resolve(entity));

    const payload = [
      { mataPelajaranId: 101, nilai: 95 }, // Update
      { mataPelajaranId: 102, nilai: 88 }, // Create
    ];
    const mockReq = getMockReq({ params: { siswaId: '1' }, body: payload });
    await batchUpdateNilaiSiswa(mockReq, mockRes);

    expect(mockNilaiSiswaRepository.findOne).toHaveBeenCalledWith({ where: { siswa: { id: 1 }, mataPelajaran: {id: 101} } });
    expect(mockNilaiSiswaRepository.findOne).toHaveBeenCalledWith({ where: { siswa: { id: 1 }, mataPelajaran: {id: 102} } });
    
    expect(mockNilaiSiswaRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: existingNilaiMatematika.id, nilai: 95 }));
    expect(mockNilaiSiswaRepository.create).toHaveBeenCalledWith(expect.objectContaining({ siswa: { id: mockValidSiswa.id }, mataPelajaran: { id: mockMapel2.id }, nilai: 88 }));
    expect(mockNilaiSiswaRepository.save).toHaveBeenCalledWith(expect.objectContaining({ siswa: { id: mockValidSiswa.id }, mataPelajaran: { id: mockMapel2.id }, nilai: 88 }));
    
    expect(mockRes.status).toHaveBeenCalledWith(200); 
  });

  it('should handle null nilai (updates existing to null)', async () => {
    mockSiswaRepository.findOneBy.mockResolvedValue(mockValidSiswa);
    mockMataPelajaranRepository.findOneBy.mockResolvedValue(mockMapel1);
    
    const existingNilai = { id: 1, siswa: mockValidSiswa, mataPelajaran: mockMapel1, nilai: 70 } as NilaiSiswa;
    mockNilaiSiswaRepository.findOne.mockResolvedValue(existingNilai);
    mockNilaiSiswaRepository.save.mockImplementation(entity => Promise.resolve(entity));

    const payload = [{ mataPelajaranId: 101, nilai: null }];
    const mockReq = getMockReq({ params: { siswaId: '1' }, body: payload });
    await batchUpdateNilaiSiswa(mockReq, mockRes); 

    expect(mockNilaiSiswaRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: existingNilai.id, nilai: null }));
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Nilai siswa berhasil disimpan/diperbarui',
      data: expect.arrayContaining([expect.objectContaining({ nilai: null })])
    }));
  });

  it('should return 404 if siswaId is not found', async () => {
    mockSiswaRepository.findOneBy.mockResolvedValue(null);
    const payload = [{ mataPelajaranId: 101, nilai: 90 }];
    const mockReq = getMockReq({ params: { siswaId: '999' }, body: payload });

    await batchUpdateNilaiSiswa(mockReq, mockRes); 

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Siswa tidak ditemukan' }); 
  });

  it('should return 400 if a mapelId is invalid', async () => {
    mockSiswaRepository.findOneBy.mockResolvedValue(mockValidSiswa);
    mockMataPelajaranRepository.findOneBy.mockResolvedValueOnce(mockMapel1).mockResolvedValueOnce(null);

    const payload = [
      { mataPelajaranId: 101, nilai: 90 }, 
      { mataPelajaranId: 999, nilai: 85 }, 
    ];
    const mockReq = getMockReq({ params: { siswaId: '1' }, body: payload });
    await batchUpdateNilaiSiswa(mockReq, mockRes); 

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Beberapa item nilai gagal divalidasi.',
        errors: expect.arrayContaining([`Mata pelajaran dengan ID 999 tidak ditemukan.`]),
    }));
  });

  it('should return 400 if payload is not a valid array structure', async () => {
    mockSiswaRepository.findOneBy.mockResolvedValue(mockValidSiswa); 
    
    const mockReq = getMockReq({ params: { siswaId: '1' }, body: { nilai: {} } }); 
    await batchUpdateNilaiSiswa(mockReq, mockRes); 
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Request body harus berupa array nilai atau objek dengan properti "nilai" berupa array' });
  });

  it('should return 200 with empty data if payload is an empty array', async () => {
    mockSiswaRepository.findOneBy.mockResolvedValue(mockValidSiswa); 
    const mockReq = getMockReq({ params: { siswaId: '1' }, body: [] }); 
    await batchUpdateNilaiSiswa(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200); 
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Nilai siswa berhasil disimpan/diperbarui', data: [] });
  });

   it('should handle invalid siswaId format in params', async () => {
    const mockReq = getMockReq({ params: { siswaId: 'invalid-id' }, body: [{ mataPelajaranId: 101, nilai: 90 }] });
    await batchUpdateNilaiSiswa(mockReq, mockRes); 
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Siswa ID tidak valid' });
  });
});
