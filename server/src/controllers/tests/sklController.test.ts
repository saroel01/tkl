import { getMockReq, getMockRes } from '@jest-mock/express';
import { AppDataSource } from '../../data-source';
import { PengaturanSekolah } from '../../entity/PengaturanSekolah';
import { Siswa, StatusKelulusan } from '../../entity/Siswa';
import { downloadSklByTokenController } from '../sklController';
import { generateSklPdfDefinition, createPdfBlob } from '../../services/pdfService';

// Mock the actual repository functions that will be used.
const mockSiswaRepository = {
  findOne: jest.fn(),
};
const mockPengaturanRepository = {
  find: jest.fn(),
};

// Before each test, reset the mocks and mock AppDataSource.getRepository to return our specific mocks
beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
    if (entity === Siswa) {
      return mockSiswaRepository;
    }
    if (entity === PengaturanSekolah) {
      return mockPengaturanRepository;
    }
    // Fallback for other entities if any
    return { findOne: jest.fn(), find: jest.fn() };
  });
});

const { res: mockRes, next: mockNext, mockClear } = getMockRes();

describe('downloadSklByTokenController', () => {
  beforeEach(() => {
    mockClear(); // Clears mockRes and mockNext calls
  });

  const mockValidPengaturan = {
    id: 1,
    akses_aktif: true,
    tanggal_rilis: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  } as PengaturanSekolah;

  const mockValidSiswa = {
    id: 1,
    nisn: '1234567890',
    nama_lengkap: 'Test Siswa',
    status_kelulusan: StatusKelulusan.LULUS,
    token_skl: 'valid-token',
    nilai_siswa: [], // Assuming this is needed for PDF generation
    kelas: 'XII A', // Added missing property
    created_at: new Date(), // Added missing property
    updated_at: new Date(), // Added missing property
    // Add any other mandatory fields from the Siswa entity if needed
  } as Siswa;

  it('should download SKL PDF for valid token, active announcement, past release, and LULUS status', async () => {
    mockPengaturanRepository.find.mockResolvedValue([mockValidPengaturan]);
    mockSiswaRepository.findOne.mockResolvedValue(mockValidSiswa);
    (generateSklPdfDefinition as jest.Mock).mockResolvedValue({}); // Mock PDF definition
    (createPdfBlob as jest.Mock).mockResolvedValue(Buffer.from('pdf content')); // Mock PDF blob

    const mockReq = getMockReq({ params: { token: 'valid-token' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);

    expect(mockPengaturanRepository.find).toHaveBeenCalledTimes(1);
    expect(mockSiswaRepository.findOne).toHaveBeenCalledWith({
      where: { token_skl: 'valid-token' },
      relations: ['nilai_siswa', 'nilai_siswa.mataPelajaran'],
    });
    expect(generateSklPdfDefinition).toHaveBeenCalledWith(mockValidSiswa, mockValidPengaturan);
    expect(createPdfBlob).toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="SKL_${mockValidSiswa.nisn}_${mockValidSiswa.token_skl}.pdf"`);
    expect(mockRes.send).toHaveBeenCalledWith(Buffer.from('pdf content'));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 404 for invalid token', async () => {
    mockPengaturanRepository.find.mockResolvedValue([mockValidPengaturan]);
    mockSiswaRepository.findOne.mockResolvedValue(null); // Token not found

    const mockReq = getMockReq({ params: { token: 'invalid-token' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token tidak valid.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if student is not LULUS', async () => {
    const mockSiswaTidakLulus = { ...mockValidSiswa, status_kelulusan: StatusKelulusan.TIDAK_LULUS };
    mockPengaturanRepository.find.mockResolvedValue([mockValidPengaturan]);
    mockSiswaRepository.findOne.mockResolvedValue(mockSiswaTidakLulus);

    const mockReq = getMockReq({ params: { token: 'valid-token' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Siswa dengan token ini tidak dinyatakan lulus.' });
  });

  it('should return 403 if akses_aktif is false', async () => {
    const mockPengaturanTidakAktif = { ...mockValidPengaturan, akses_aktif: false };
    mockPengaturanRepository.find.mockResolvedValue([mockPengaturanTidakAktif]);
    mockSiswaRepository.findOne.mockResolvedValue(mockValidSiswa);

    const mockReq = getMockReq({ params: { token: 'valid-token' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Pengumuman belum dibuka atau sudah ditutup oleh administrator.' });
  });

  it('should return 403 if tanggal_rilis is in the future', async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day in future
    const mockPengaturanFutureRilis = { ...mockValidPengaturan, tanggal_rilis: futureDate };
    mockPengaturanRepository.find.mockResolvedValue([mockPengaturanFutureRilis]);
    mockSiswaRepository.findOne.mockResolvedValue(mockValidSiswa);

    const mockReq = getMockReq({ params: { token: 'valid-token' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    const tglRilisFormatted = futureDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    expect(mockRes.json).toHaveBeenCalledWith({ message: `Pengumuman kelulusan akan dibuka pada ${tglRilisFormatted}.` });
  });
  
  it('should return 403 if tanggal_rilis is not set', async () => {
    const mockPengaturanNoTanggal = { ...mockValidPengaturan, tanggal_rilis: null } as unknown as PengaturanSekolah;
    mockPengaturanRepository.find.mockResolvedValue([mockPengaturanNoTanggal]);
    mockSiswaRepository.findOne.mockResolvedValue(mockValidSiswa);

    const mockReq = getMockReq({ params: { token: 'valid-token' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Tanggal rilis pengumuman belum diatur oleh administrator.' });
  });

  it('should return 400 for empty token string', async () => {
    // No need to mock repositories as it should fail before db access
    const mockReq = getMockReq({ params: { token: '' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token tidak boleh kosong.' });
  });

  it('should return 500 if PengaturanSekolah is not configured', async () => {
    mockPengaturanRepository.find.mockResolvedValue([]); // No pengaturan found
    // mockSiswaRepository.findOne.mockResolvedValue(mockValidSiswa); // Not strictly needed as it fails before this

    const mockReq = getMockReq({ params: { token: 'valid-token' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Pengaturan sekolah belum dikonfigurasi. Tidak dapat memproses permintaan SKL.' });
  });
  
  it('should call next with error if pdf generation fails', async () => {
    mockPengaturanRepository.find.mockResolvedValue([mockValidPengaturan]);
    mockSiswaRepository.findOne.mockResolvedValue(mockValidSiswa);
    const pdfError = new Error('PDF generation failed');
    (createPdfBlob as jest.Mock).mockRejectedValue(pdfError);

    const mockReq = getMockReq({ params: { token: 'valid-token' } });
    await downloadSklByTokenController(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(pdfError);
  });
});
