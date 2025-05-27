import { generateSklPdfDefinition, createPdfBlob } from './pdfService';
import { Siswa, StatusKelulusan } from '../entity/Siswa';
import { PengaturanSekolah } from '../entity/PengaturanSekolah';
import { NilaiSiswa } from '../entity/NilaiSiswa'; 
import { MataPelajaran } from '../entity/MataPelajaran'; 
import * as fs from 'fs';
import * as path from 'path';

// Default Pengaturan
const mockPengaturan: PengaturanSekolah = {
    id: 1,
    nama_dinas: 'DINAS PENDIDIKAN PROVINSI ABC',
    nama_sekolah: 'SMK NEGERI 1 CONTOH KOTA',
    npsn_sekolah: '12345678',
    alamat_sekolah_lengkap: 'Jl. Pendidikan No. 1, Kota Contoh, 12345',
    kontak_sekolah: '021-1234567', 
    website_sekolah: 'www.smkn1contoh.sch.id',
    logo_sekolah_path: 'dummy_logo_sekolah.png', 
    logo_dinas_path: 'dummy_logo_dinas.png',   
    nama_kepala_sekolah: 'DRS. BUDI PEKERTI',
    nip_kepala_sekolah: '197001012000121001',
    kota_penerbitan_skl: 'Kota Contoh',
    tanggal_rilis: new Date('2024-06-01'), 
    tahun_ajaran: '2023/2024',
    jenis_ujian_skl: 'UJIAN SEKOLAH',
    akses_aktif: true,
    created_at: new Date(),
    updated_at: new Date(),
};

// Mock MataPelajaran
const mpMatematika: MataPelajaran = { id: 1, nama_mapel: 'Matematika', kelompok_mapel: 'A', urutan_mapel: 1, created_at: new Date(), updated_at: new Date() };
const mpBahasaIndonesia: MataPelajaran = { id: 2, nama_mapel: 'Bahasa Indonesia', kelompok_mapel: 'A', urutan_mapel: 2, created_at: new Date(), updated_at: new Date() };
const mpProduktif: MataPelajaran = { id: 3, nama_mapel: 'Dasar-dasar Kejuruan', kelompok_mapel: 'C', urutan_mapel: 1, created_at: new Date(), updated_at: new Date() };

// Siswa Scenarios
const siswa_valid_grades: Siswa = {
    id: 1, 
    nisn: '001001001', 
    nama_lengkap: 'SISWA VALID LENGKAP', 
    tempat_lahir: 'Kota Valid', 
    tanggal_lahir: '2005-01-01', 
    token_skl: 'valid1', 
    status_kelulusan: StatusKelulusan.LULUS, 
    kelas: 'XII RPL 1', 
    jurusan: 'Rekayasa Perangkat Lunak', 
    catatan_admin: null, 
    catatan_skl: 'Selamat atas kelulusannya!', 
    nomor_peserta_ujian: 'UPS-001',
    nilai_siswa: [ 
        { id: 1, nilai: 85, siswa: null!, mataPelajaran: mpMatematika, created_at: new Date(), updated_at: new Date() } as NilaiSiswa,
        { id: 2, nilai: 90, siswa: null!, mataPelajaran: mpBahasaIndonesia, created_at: new Date(), updated_at: new Date() } as NilaiSiswa,
        { id: 3, nilai: 88, siswa: null!, mataPelajaran: mpProduktif, created_at: new Date(), updated_at: new Date() } as NilaiSiswa,
    ],
    created_at: new Date(), 
    updated_at: new Date(),
};
if (siswa_valid_grades.nilai_siswa) {
    siswa_valid_grades.nilai_siswa.forEach(ns => ns.siswa = siswa_valid_grades);
}


const siswa_no_grades: Siswa = { 
   ...siswa_valid_grades, 
    id: 2, 
    nisn: '002002002', 
    nama_lengkap: 'SISWA TANPA NILAI', 
    token_skl: 'valid2', 
    nilai_siswa: [] 
};

const siswa_incomplete_grades: Siswa = {
   ...siswa_valid_grades, 
    id: 3, 
    nisn: '003003003', 
    nama_lengkap: 'SISWA NILAI INVALID', 
    token_skl: 'valid3',
    nilai_siswa: [
        { id: 4, nilai: 75, siswa: null!, mataPelajaran: mpMatematika, created_at: new Date(), updated_at: new Date() } as NilaiSiswa,
        { id: 5, nilai: 80, siswa: null!, mataPelajaran: null as any, created_at: new Date(), updated_at: new Date() } as NilaiSiswa, 
        { id: 6, nilai: null, siswa: null!, mataPelajaran: mpProduktif, created_at: new Date(), updated_at: new Date() } as NilaiSiswa, 
    ],
};
if (siswa_incomplete_grades.nilai_siswa) {
    siswa_incomplete_grades.nilai_siswa.forEach(ns => ns.siswa = siswa_incomplete_grades);
}

// Setup dummy files and directories
const projectRootDir = path.resolve(__dirname, '..', '..', '..'); 
const dummyLogoSekolahOriginalPath = path.join(projectRootDir, mockPengaturan.logo_sekolah_path);
const dummyLogoDinasOriginalPath = path.join(projectRootDir, mockPengaturan.logo_dinas_path);
const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const tinyPngBuffer = Buffer.from(tinyPngBase64, 'base64');

if (!fs.existsSync(dummyLogoSekolahOriginalPath)) {
    console.log(`Creating dummy PNG file at: ${dummyLogoSekolahOriginalPath}`);
    fs.writeFileSync(dummyLogoSekolahOriginalPath, tinyPngBuffer);
}
if (!fs.existsSync(dummyLogoDinasOriginalPath)) {
    console.log(`Creating dummy PNG file at: ${dummyLogoDinasOriginalPath}`);
    fs.writeFileSync(dummyLogoDinasOriginalPath, tinyPngBuffer);
}

const uploadsDir = path.resolve(projectRootDir, 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log(`Creating uploads directory at: ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadedLogoSekolahPath = path.join(uploadsDir, path.basename(mockPengaturan.logo_sekolah_path));
const uploadedLogoDinasPath = path.join(uploadsDir, path.basename(mockPengaturan.logo_dinas_path));

if (!fs.existsSync(uploadedLogoSekolahPath)) {
    console.log(`Copying dummy PNG logo to: ${uploadedLogoSekolahPath}`);
    fs.copyFileSync(dummyLogoSekolahOriginalPath, uploadedLogoSekolahPath);
}
if (!fs.existsSync(uploadedLogoDinasPath)) {
    console.log(`Copying dummy PNG logo to: ${uploadedLogoDinasPath}`);
    fs.copyFileSync(dummyLogoDinasOriginalPath, uploadedLogoDinasPath);
}

async function testPdfGeneration(siswa: Siswa, pengaturan: PengaturanSekolah, testName: string) {
    console.log(`
--- Starting Test: ${testName} ---`);
    try {
        const testPengaturan = {
            ...pengaturan,
            logo_sekolah_path: path.basename(pengaturan.logo_sekolah_path),
            logo_dinas_path: path.basename(pengaturan.logo_dinas_path),
        };

        const docDefinition = await generateSklPdfDefinition(siswa, testPengaturan);
        console.log(`[${testName}] Document definition generated successfully.`);
        const pdfBuffer = await createPdfBlob(docDefinition);
        console.log(`[${testName}] PDF blob created successfully. Buffer length: ${pdfBuffer.length}`);
        
        const outputDir = path.resolve(__dirname, 'test_outputs');
        if (!fs.existsSync(outputDir)) {
            console.log(`Creating output directory for PDFs: ${outputDir}`);
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, `${testName}.pdf`);
        fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`[${testName}] PDF saved to ${outputPath}`);

    } catch (error: any) {
        console.error(`[${testName}] PDF generation failed:`, error.message);
        if (error.stack) console.error(error.stack);
    }
}

async function runTests() {
    console.log("Starting PDF Generation Tests...");
    await testPdfGeneration(siswa_valid_grades, mockPengaturan, 'SiswaValidGrades');
    await testPdfGeneration(siswa_no_grades, mockPengaturan, 'SiswaNoGrades');
    await testPdfGeneration(siswa_incomplete_grades, mockPengaturan, 'SiswaIncompleteGrades');
    
    console.log(`
--- Test: Critical Font Missing (Manual Simulation Required) ---`);
    console.log("INFO: To test critical font missing, temporarily rename/remove a font file from server/src/assets/fonts, then re-run this script.");

    console.log(`
PDF Generation Tests Finished.`);
}

runTests();
