import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { Siswa } from '../entity/Siswa';
import { PengaturanSekolah } from '../entity/PengaturanSekolah';
import * as fs from 'fs';
import * as path from 'path';

// Fungsi untuk mengubah path gambar menjadi base64 data URL
const imagePathToBase64 = (filePath: string): string | null => {
  try {
    const absolutePath = path.resolve(filePath);
    if (fs.existsSync(absolutePath)) {
      const img = fs.readFileSync(absolutePath);
      const fileExtension = path.extname(absolutePath).toLowerCase();
      let mimeType = '';
      if (fileExtension === '.png') {
        mimeType = 'image/png';
      } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
        mimeType = 'image/jpeg';
      } else {
        console.warn(`Unsupported image type: ${fileExtension} for file ${absolutePath}`);
        return null;
      }
      return `data:${mimeType};base64,${img.toString('base64')}`;
    }
    console.warn(`Image not found at path: ${absolutePath}`);
    return null;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

export const generateSklPdfDefinition = async (siswa: Siswa, pengaturan: PengaturanSekolah | null): Promise<TDocumentDefinitions> => {
  // Path ke direktori font (relatif terhadap server/src/services)
  const fontDescriptors = {
    Roboto: {
      normal: path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf'),
      bold: path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-Bold.ttf'),
      italics: path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-Italic.ttf'),
      bolditalics: path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-BoldItalic.ttf'),
    }
  };

  // Memastikan semua file font ada, jika tidak, pdfmake akan error atau fallback ke font default
  Object.values(fontDescriptors.Roboto).forEach(fontPath => {
    if (!fs.existsSync(fontPath)) {
      console.warn(`Font file not found: ${fontPath}. PDF generation might use default fonts or fail if Roboto is not in vfs_fonts.js.`);
      // Pertimbangkan untuk throw error jika font sangat krusial dan tidak ada fallback yang diinginkan
    }
  });

  const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');

  const logoSekolahBase64 = pengaturan?.logo_sekolah_path ? imagePathToBase64(path.join(uploadsDir, pengaturan.logo_sekolah_path)) : null;
  const logoDinasBase64 = pengaturan?.logo_dinas_path ? imagePathToBase64(path.join(uploadsDir, pengaturan.logo_dinas_path)) : null;

  const content: Content = [];

  // --- KOP SURAT --- 
  const kopTableBody: any[][] = [];
  const kopRow: any[] = [];
  if (logoDinasBase64) {
    kopRow.push({ image: logoDinasBase64, width: 60, height: 60, fit: [60,60], alignment: 'left', margin: [0,0,10,0] });
  } else {
    kopRow.push({ text: '', width: 70 }); // Placeholder jika tidak ada logo
  }

  kopRow.push({
    text: [
      { text: (pengaturan?.nama_dinas || 'PEMERINTAH DAERAH PROVINSI [NAMA DINAS]').toUpperCase() + '\n', style: 'kopDinas', bold: true },
      { text: (pengaturan?.nama_sekolah || 'NAMA SEKOLAH').toUpperCase() + '\n', style: 'kopNamaSekolah', bold: true },
      { text: (pengaturan?.alamat_sekolah_lengkap || 'Alamat Lengkap Sekolah, Kota, Kodepos') + '\n', style: 'kopAlamat' },
      { text: 'NPSN: ' + (pengaturan?.npsn_sekolah || 'XXXXXXXX') + '\n', style: 'kopDetail' },
      { text: ( (pengaturan?.kontak_sekolah ? `${pengaturan.kontak_sekolah} | ` : '') + (pengaturan?.website_sekolah ? `Website: ${pengaturan.website_sekolah}` : 'email@sekolah.sch.id') ), style: 'kopDetail' }
    ],
    alignment: 'center',
    margin: [0, 0, 0, 0]
  });

  if (logoSekolahBase64) {
    kopRow.push({ image: logoSekolahBase64, width: 60, height: 60, fit: [60,60], alignment: 'right', margin: [10,0,0,0] });
  } else {
    kopRow.push({ text: '', width: 70 }); // Placeholder jika tidak ada logo
  }
  kopTableBody.push(kopRow);

  content.push({
    table: {
      widths: ['auto', '*', 'auto'],
      body: kopTableBody
    },
    layout: 'noBorders',
    marginBottom: 5,
  });

  content.push({
    canvas: [{
      type: 'line',
      x1: 0, y1: 5, 
      x2: 595 - 2 * 40, y2: 5, 
      lineWidth: 1.5
    }],
    marginBottom: 15,
  });

  // --- JUDUL SURAT --- 
  content.push({
    text: 'SURAT KETERANGAN LULUS',
    style: 'judulSurat',
    alignment: 'center',
    decoration: 'underline',
    marginBottom: 5,
  });
  content.push({
    text: `Nomor: 421.3 / ${siswa.id?.toString().padStart(3, '0') || 'XXX' } / SKL-SMK/${new Date().getFullYear()}`,
    style: 'nomorSurat',
    alignment: 'center',
    marginBottom: 20,
  });

  // --- ISI SURAT --- 
  content.push({
    text: [
      { text: 'Yang bertanda tangan di bawah ini, Kepala ' },
      { text: pengaturan?.nama_sekolah || 'Nama Sekolah Contoh', bold: true },
      { text: ', menerangkan bahwa:' }
    ],
    style: 'paragraf',
    marginBottom: 10,
  });

  // --- Student Biodata and Photo Placeholder ---
  const biodataTable = {
    style: 'dataSiswa', // Apply existing style if suitable, or make a new one
    table: {
        widths: ['auto', '*'], // Adjusted widths for biodata labels and values
        body: [
            [{ text: 'Nama Lengkap', style: 'labelSiswa'}, { text: `: ${siswa.nama_lengkap.toUpperCase()}`, style: 'valueSiswa', bold: true}],
            [{ text: 'Tempat, Tanggal Lahir', style: 'labelSiswa'}, `: ${siswa.tempat_lahir || '-'}, ${siswa.tanggal_lahir ? new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}`],
            [{ text: 'NISN', style: 'labelSiswa'}, `: ${siswa.nisn}`],
            [{ text: 'Nomor Peserta Ujian', style: 'labelSiswa'}, `: ${siswa.nomor_peserta_ujian || '-'}`],
            [{ text: 'Kelas / Kompetensi Keahlian', style: 'labelSiswa'}, `: ${siswa.kelas} / ${siswa.jurusan || '-'}`],
        ]
    },
    layout: 'noBorders'
  };

  const photoPlaceholder = {
    width: 85, // Approx 3cm in points
    height: 113, // Approx 4cm in points
    margin: [0, 0, 0, 10], // Right margin for spacing if needed
    stack: [ // Use stack to overlay text on a rectangle (if needed, or just use table border)
        {
            canvas: [{ type: 'rect', x: 0, y: 0, w: 85, h: 113, lineColor: '#000000', lineWidth: 1 }],
        },
        {
            text: 'Pas Foto\n3x4 cm',
            style: 'placeholderText',
            alignment: 'center',
            margin: [0, 45, 0, 0] // Adjust margin to center text vertically
        }
    ]
  };
  
  content.push({
    columns: [
      biodataTable, // Biodata on the left
      { width: '*', text: '' }, // Spacer column to push photo to the right, or fixed width
      photoPlaceholder // Photo placeholder on the right
    ],
    columnGap: 10, // Gap between biodata and photo
    marginBottom: 10,
  });


  content.push({
    text: [
      { text: 'Berdasarkan kriteria kelulusan dan hasil ujian sekolah, siswa tersebut dinyatakan: '}
    ],
    style: 'paragraf',
    marginBottom: 10,
  });

  content.push({
    text: siswa.status_kelulusan.toUpperCase(),
    style: 'statusLulus',
    alignment: 'center',
    bold: true,
    marginBottom: 10,
  });

  content.push({
    text: [
      { text: 'dari Satuan Pendidikan ' },
      { text: pengaturan?.nama_sekolah || 'Nama Sekolah Contoh', bold: true },
      { text: ` Tahun Pelajaran ${pengaturan?.tahun_ajaran || ((new Date().getFullYear()-1) + '/' + new Date().getFullYear())}.`} 
    ],
    style: 'paragraf',
    marginBottom: 10,
  });
  
  if (siswa.catatan_admin) {
    content.push({
        text: [
            {text: 'Catatan: ', bold: true},
            {text: siswa.catatan_admin}
        ],
        style: 'paragraf', 
        italics: true,
        marginBottom: 20,
    });
  }

  // --- CATATAN SKL (Keterangan Tambahan dari Admin untuk SKL) ---
  if (siswa.catatan_skl && siswa.catatan_skl.trim() !== '') {
    content.push({
      text: [
        { text: 'Keterangan Tambahan: ', style: 'paragraf', bold: true },
        { text: siswa.catatan_skl, style: 'paragraf', italics: true }
      ],
      marginBottom: 15, // Margin after this section
    });
  }

    // --- DAFTAR NILAI ---
  const nilaiSiswa = siswa.nilai_siswa; 

  if (nilaiSiswa && nilaiSiswa.length > 0) {
    content.push({
      text: (pengaturan?.jenis_ujian_skl || 'DAFTAR NILAI HASIL UJIAN').toUpperCase(),
      style: 'gradesTableTitle',
      alignment: 'center',
      marginBottom: 8,
      marginTop: 15,
    });

    const sortedNilai = [...nilaiSiswa].sort((a, b) => {
      const mpA = a.mataPelajaran;
      const mpB = b.mataPelajaran;
      const kelompokA = mpA.kelompok_mapel || 'Ω'; 
      const kelompokB = mpB.kelompok_mapel || 'Ω';
      if (kelompokA.localeCompare(kelompokB) !== 0) return kelompokA.localeCompare(kelompokB);
      const urutanA = mpA.urutan_mapel ?? Number.MAX_SAFE_INTEGER;
      const urutanB = mpB.urutan_mapel ?? Number.MAX_SAFE_INTEGER;
      if (urutanA !== urutanB) return urutanA - urutanB;
      return (mpA.nama_mapel || '').localeCompare(mpB.nama_mapel || '');
    });

    const groupedNilai: { [key: string]: typeof sortedNilai } = {};
    sortedNilai.forEach(ns => {
      const kelompok = ns.mataPelajaran.kelompok_mapel || 'Mata Pelajaran Lainnya';
      if (!groupedNilai[kelompok]) {
        groupedNilai[kelompok] = [];
      }
      groupedNilai[kelompok].push(ns);
    });

    const tableBody: any[][] = [
      [
        { text: 'NO.', style: 'gradesTableHeader', alignment: 'center' },
        { text: 'MATA PELAJARAN', style: 'gradesTableHeader' },
        { text: 'NILAI', style: 'gradesTableHeader', alignment: 'center' },
      ],
    ];

    let nomorUrutGlobal = 1;
    const sortedGroupKeys = Object.keys(groupedNilai).sort((a,b) => {
        // Custom sort logic for groups if needed, e.g., ensure 'Kelompok A' comes before 'Kelompok B'
        // For now, simple localeCompare, with 'Mata Pelajaran Lainnya' last
        if (a === 'Mata Pelajaran Lainnya') return 1;
        if (b === 'Mata Pelajaran Lainnya') return -1;
        return a.localeCompare(b);
    });

    for (const kelompok of sortedGroupKeys) {
      tableBody.push([
        { text: kelompok.toUpperCase(), colSpan: 3, style: 'gradesTableGroupHeader', alignment: 'left', margin: [0, 3, 0, 1] },
        {},
        {},
      ]);

      groupedNilai[kelompok].forEach((ns) => {
        tableBody.push([
          { text: nomorUrutGlobal.toString(), style: 'gradesTableCell', alignment: 'center' },
          { text: ns.mataPelajaran.nama_mapel, style: 'gradesTableCell' },
          { text: ns.nilai?.toString() ?? '-', style: 'gradesTableCell', alignment: 'center' },
        ]);
        nomorUrutGlobal++;
      });
    }

    // Calculate average grade
    let sumOfGrades = 0;
    let countOfGrades = 0;
    if (nilaiSiswa && nilaiSiswa.length > 0) {
        nilaiSiswa.forEach(ns => {
            if (ns.nilai !== null && typeof ns.nilai === 'number' && !isNaN(ns.nilai)) {
                sumOfGrades += ns.nilai;
                countOfGrades++;
            }
        });
    }

    const averageGrade = countOfGrades > 0 ? (sumOfGrades / countOfGrades).toFixed(2) : 'N/A';

    // Add average grade row to tableBody
    if (countOfGrades > 0) { // Only add if there are grades to average
        tableBody.push([
            { text: 'Rata-rata Nilai Akhir', colSpan: 2, style: 'gradesTableAverageLabel', alignment: 'right', margin: [0, 2, 0, 2] },
            {}, // Empty cell due to colSpan
            { text: averageGrade, style: 'gradesTableAverageValue', alignment: 'center', margin: [0, 2, 0, 2] },
        ]);
    }
    
    content.push({
      table: {
        widths: ['auto', '*', 'auto'],
        body: tableBody,
        headerRows: 1,
      },
      layout: 'lightHorizontalLines', // Existing layout
      style: 'gradesTable', // Existing style for the table
      marginBottom: 20,
    });
  } else {
    content.push({
      text: 'Data nilai tidak tersedia.',
      style: 'paragraf',
      italics: true,
      alignment: 'center',
      marginBottom: 20,
      marginTop: 15,
    });
  }

  content.push({
    text: 'Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.',
    style: 'paragraf',
    marginBottom: 30,
  });

  // --- TANDA TANGAN --- 
  const ttdDate = pengaturan?.tanggal_rilis ? new Date(pengaturan.tanggal_rilis).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  content.push({
    columns: [
      { width: '*', text: '' }, 
      {
        width: 'auto',
        alignment: 'center',
        text: [
          { text: `${pengaturan?.kota_penerbitan_skl || '[Kota Penerbitan SKL]'}, ${ttdDate}\n` },
          { text: `Kepala Sekolah,\n\n\n\n\n` }, 
          { text: (pengaturan?.nama_kepala_sekolah || '[Nama Kepala Sekolah]').toUpperCase(), bold: true, decoration: 'underline' },
          { text: `\nNIP. ${pengaturan?.nip_kepala_sekolah || '-'}` }
        ],
        style: 'paragraf'
      }
    ],
    marginBottom: 20,
  });
  
  const docDefinition: TDocumentDefinitions = {
    info: {
        title: `SKL_${siswa.nisn}_${siswa.nama_lengkap.replace(/\s+/g, '_')}`,
        author: pengaturan?.nama_sekolah || 'Sekolah',
        subject: 'Surat Keterangan Lulus',
        keywords: 'SKL, Siswa, Kelulusan',
    },
    pageSize: 'A4',
    pageMargins: [40, 30, 40, 30], 
    content: content,
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.3,
    },
    styles: {
      kopDinas: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 1]
      },
      kopNamaSekolah: { // Style for the main school name in the header
        fontSize: 18,
        bold: true,
        alignment: 'center',
        margin: [0, 1, 0, 1]
      },
      kopAlamat: {
        fontSize: 10,
        alignment: 'center',
        margin: [0,0,0,1]
      },
      kopDetail: {
        fontSize: 9,
        alignment: 'center',
        margin: [0,0,0,1]
      },
      judulSurat: {
        fontSize: 14,
        bold: true,
      },
      nomorSurat: {
        fontSize: 12,
      },
      paragraf: {
        fontSize: 11,
        alignment: 'justify',
      },
      dataSiswa: {
        margin: [20, 0, 0, 0],
        fontSize: 11,
      },
      labelSiswa: {},
      valueSiswa: {},
      statusLulus: {
        fontSize: 18,
      },
      // Grades Table Styles
      gradesTableTitle: {
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 5] // bottom margin
      },
      gradesTable: {
        fontSize: 10,
      },
      gradesTableHeader: {
        bold: true,
        fontSize: 10,
        fillColor: '#EEEEEE',
        margin: [0, 2, 0, 2] // vertical padding
      },
      gradesTableGroupHeader: {
        bold: true,
        italics: false, // Decided against italics for group header for cleaner look
        fontSize: 10,
        // fillColor: '#FAFAFA', // Optional: very light background for group headers
        margin: [0, 3, 0, 1] // top, right, bottom, left margins
      },
      gradesTableCell: {
        fontSize: 9,
        margin: [0, 2, 0, 2] // vertical padding for cells
      },
      gradesTableAverageLabel: { // Style for the average label
        bold: true,
        fontSize: 10,
        fillColor: '#EEEEEE', // Optional: same as header or different
      },
      gradesTableAverageValue: { // Style for the average value
        bold: true,
        fontSize: 10,
        fillColor: '#EEEEEE', // Optional
      },
      placeholderText: { // Style for "Pas Foto 3x4 cm" text
        fontSize: 8,
        color: 'grey'
      }
    },
    footer: function(currentPage: number, pageCount: number): Content { 
      return {
        text: currentPage.toString() + ' dari ' + pageCount,
        alignment: 'center',
        fontSize: 8,
        margin: [0, 10, 0, 0] // margin atas agar tidak terlalu dekat dengan konten
      };
    }
  };
  return docDefinition;
};

export const createPdfBlob = (docDefinition: TDocumentDefinitions): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const fontDescriptors = {
        Roboto: {
            normal: path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-Regular.ttf'),
            bold: path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-Bold.ttf'),
            italics: path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-Italic.ttf'),
            bolditalics: path.resolve(__dirname, '..', 'assets', 'fonts', 'Roboto-BoldItalic.ttf'),
        }
    };

    // Validasi keberadaan file font sebelum membuat printer
    Object.values(fontDescriptors.Roboto).forEach(fontPath => {
        if (!fs.existsSync(fontPath)) {
            const errorMessage = `Font file not found: ${fontPath}. PDF generation requires this font. Please ensure fonts are in server/src/assets/fonts/`;
            console.error(errorMessage);
            // reject(new Error(errorMessage)); // Langsung reject jika font krusial tidak ada
            // Untuk saat ini, kita biarkan pdfmake mencoba fallback atau error sendiri, 
            // tapi warning di console sudah cukup jelas.
        }
    });

    const printer = new PdfPrinter(fontDescriptors);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    
    const chunks: Buffer[] = [];
    pdfDoc.on('data', (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    pdfDoc.on('error', (err) => {
      console.error('Error during PDF generation:', err);
      reject(err);
    });
    pdfDoc.end();
  });
};
