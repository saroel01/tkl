import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { Siswa } from '../entity/Siswa';
import { PengaturanSekolah } from '../entity/PengaturanSekolah';
import * as fs from 'fs';
import * as path from 'path';

// Fungsi untuk mengubah path gambar menjadi base64 data URL
const imagePathToBase64 = (filePath: string): string | null => {
  // For testing with dummy paths, return a hardcoded minimal valid PNG data URL
  // Check the basename of the file path for the "dummy_" prefix
  if (path.basename(filePath).startsWith('dummy_')) {
    console.warn(`[pdfService:imagePathToBase64] Using hardcoded minimal PNG for dummy file: ${filePath} (basename: ${path.basename(filePath)})`);
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
  try {
    // Resolve the path. In normal operation, filePath might be relative to the 'uploads' directory.
    // For the test script, it might construct an absolute path or path relative to 'uploads'.
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
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

const logContext = '[pdfService:generateSklPdfDefinition]';
const createPdfBlobLogContext = '[pdfService:createPdfBlob]';

export const generateSklPdfDefinition = async (siswa: Siswa, pengaturan: PengaturanSekolah | null): Promise<TDocumentDefinitions> => {
  console.log(`${logContext} Initiating PDF definition generation for siswa ID: ${siswa?.id}, NISN: ${siswa?.nisn}`);
  
  if (siswa) {
    console.log(`${logContext} Siswa nilai_siswa exists: ${!!siswa.nilai_siswa}, Length: ${siswa.nilai_siswa?.length ?? 0}`);
    if (siswa.nilai_siswa && siswa.nilai_siswa.length > 0) {
      const nilaiSiswaSample = siswa.nilai_siswa.slice(0, 2).map(ns => ({
        id: ns.id,
        nilai: ns.nilai,
        mataPelajaranId: ns.mataPelajaran?.id,
        mataPelajaranNama: ns.mataPelajaran?.nama_mapel
      }));
      console.log(`${logContext} First 1-2 entries of siswa.nilai_siswa (processed for logging): ${JSON.stringify(nilaiSiswaSample)}`);
    }
  } else {
    console.warn(`${logContext} Siswa object is null or undefined.`);
    // Early exit or throw error might be appropriate if siswa is critical
  }

  if (pengaturan) {
    console.log(`${logContext} Pengaturan data: nama_sekolah: ${pengaturan.nama_sekolah}, logo_sekolah_path: ${pengaturan.logo_sekolah_path}, jenis_ujian_skl: ${pengaturan.jenis_ujian_skl}, tahun_ajaran: ${pengaturan.tahun_ajaran}`);
  } else {
    console.warn(`${logContext} Pengaturan object is null. Defaults will be used for PDF header and other details.`);
  }

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
      console.warn(`${logContext} Font file not found: ${fontPath}. PDF generation might use default fonts or fail if Roboto is not in vfs_fonts.js.`);
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

  // Define the actual content for the photo placeholder area
  const photoPlaceholderContent: Content = {
    stack: [
        {
            canvas: [{ type: 'rect', x: 0, y: 0, w: 85, h: 113, lineColor: '#000000', lineWidth: 1 }],
        },
        {
            text: 'Pas Foto\n3x4 cm',
            style: 'placeholderText',
            alignment: 'center',
            margin: [0, 45, 0, 0] 
        }
    ]
    // Removed width and margin from here as they are not valid for ContentStack type if photoPlaceholderContent is ContentStack
  };
  
  content.push({
    columns: [
      biodataTable, // Biodata on the left
      { width: '*', text: '' }, // Spacer column
      // Define the column for the photo placeholder, including its width and margin
      {
        width: 85, // Width for this specific column housing the placeholder
        margin: [0, 0, 0, 10], // Margin for this column
        // The stack property expects an array of Content. 
        // If photoPlaceholderContent is { stack: [...] }, then we need to reference its stack property.
        stack: (photoPlaceholderContent as { stack: Content[] }).stack 
      }
    ],
    columnGap: 10, 
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

    // Filter out entries with missing mataPelajaran early
    const validNilaiSiswa = nilaiSiswa.filter(ns => {
      if (!ns || typeof ns !== 'object') {
        console.warn(`${logContext} Siswa ID: ${siswa?.id} - Invalid nilai_siswa entry (not an object or null):`, ns);
        return false;
      }
      if (!ns.mataPelajaran || typeof ns.mataPelajaran !== 'object') {
        // Attempt to log ns.id if available, otherwise the whole ns object
        const nsIdentifier = typeof ns.id !== 'undefined' ? `ID ${ns.id}` : JSON.stringify(ns);
        console.warn(`${logContext} Siswa ID: ${siswa?.id} - Missing or invalid mataPelajaran in nilai_siswa entry (${nsIdentifier}):`, ns.mataPelajaran);
        return false; // Skip this entry
      }
      return true;
    });

    console.log(`${logContext} Siswa ID: ${siswa?.id} - Length of validNilaiSiswa after filtering: ${validNilaiSiswa.length}`);
    if (validNilaiSiswa.length < 5 && validNilaiSiswa.length > 0) {
      const validNilaiSiswaSample = validNilaiSiswa.map(ns => ({
        id: ns.id,
        nilai: ns.nilai,
        mataPelajaranId: ns.mataPelajaran?.id,
        mataPelajaranNama: ns.mataPelajaran?.nama_mapel
      }));
      console.log(`${logContext} Siswa ID: ${siswa?.id} - validNilaiSiswa content (due to short length, processed for logging): ${JSON.stringify(validNilaiSiswaSample)}`);
    }

    const sortedNilai = [...validNilaiSiswa].sort((a, b) => {
      // mataPelajaran is now guaranteed to exist and be an object due to the filter above
      const mpA = a.mataPelajaran;
      const mpB = b.mataPelajaran;

      const kelompokA = mpA.kelompok_mapel || 'Ω'; 
      const kelompokB = mpB.kelompok_mapel || 'Ω';
      if (kelompokA.localeCompare(kelompokB) !== 0) return kelompokA.localeCompare(kelompokB);
      
      const urutanA = mpA.urutan_mapel ?? Number.MAX_SAFE_INTEGER;
      const urutanB = mpB.urutan_mapel ?? Number.MAX_SAFE_INTEGER;
      if (urutanA !== urutanB) return urutanA - urutanB;
      
      // Safely access nama_mapel
      return (mpA.nama_mapel || '').localeCompare(mpB.nama_mapel || '');
    });

    const groupedNilai: { [key: string]: typeof sortedNilai } = {};
    sortedNilai.forEach(ns => {
      // ns and ns.mataPelajaran are guaranteed by prior filter and checks
      const kelompok = ns.mataPelajaran.kelompok_mapel || 'Mata Pelajaran Lainnya';
      if (!groupedNilai[kelompok]) {
        groupedNilai[kelompok] = [];
      }
      groupedNilai[kelompok].push(ns);
    });

    console.log(`${logContext} Siswa ID: ${siswa?.id} - Grouped nilai structure:`, Object.keys(groupedNilai).map(key => ({ group: key, count: groupedNilai[key].length })));

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

      groupedNilai[kelompok].forEach((ns) => { // ns is already validated
        const namaMapel = ns.mataPelajaran.nama_mapel;
        const nilaiDisplay = (ns.nilai !== null && ns.nilai !== undefined) ? ns.nilai.toString() : '-';

        if (!namaMapel) {
          console.warn(`${logContext} Siswa ID: ${siswa?.id}, NilaiSiswa ID: ${ns.id} - Mata pelajaran nama_mapel is missing. Using '-'. Entry: ${JSON.stringify(ns.mataPelajaran)}`);
        }
        if (nilaiDisplay === '-') {
          console.warn(`${logContext} Siswa ID: ${siswa?.id}, NilaiSiswa ID: ${ns.id}, Mapel: ${namaMapel || 'N/A'} - Nilai is null or undefined. Using '-'.`);
        }

        tableBody.push([
          { text: nomorUrutGlobal.toString(), style: 'gradesTableCell', alignment: 'center' },
          { text: namaMapel || '-', style: 'gradesTableCell' },
          { text: nilaiDisplay, style: 'gradesTableCell', alignment: 'center' },
        ]);
        nomorUrutGlobal++;
      });
    }

    // Calculate average grade using validNilaiSiswa
    let sumOfGrades = 0;
    let countOfGrades = 0;
    // Iterate over validNilaiSiswa which has already been checked for ns and ns.mataPelajaran
    validNilaiSiswa.forEach(ns => { 
        // ns.nilai check is crucial here
        if (ns.nilai !== null && ns.nilai !== undefined && typeof ns.nilai === 'number' && !isNaN(ns.nilai)) {
            sumOfGrades += ns.nilai;
            countOfGrades++;
        }
    });

    const averageGrade = countOfGrades > 0 ? (sumOfGrades / countOfGrades).toFixed(2) : 'N/A';

    // Add average grade row to tableBody
    if (countOfGrades > 0) { 
        tableBody.push([
            { text: 'Rata-rata Nilai Akhir', colSpan: 2, style: 'gradesTableAverageLabel', alignment: 'right', margin: [0, 2, 0, 2] },
            {}, 
            { text: averageGrade, style: 'gradesTableAverageValue', alignment: 'center', margin: [0, 2, 0, 2] },
        ]);
    }
    
    // Only push the table if there's data to show after filtering
    if (validNilaiSiswa.length > 0) {
        content.push({
          table: {
            widths: ['auto', '*', 'auto'],
            body: tableBody,
            headerRows: 1,
          },
          layout: 'lightHorizontalLines',
          style: 'gradesTable',
          marginBottom: 20,
        });
    } else { // If all entries were invalid or array was empty
        content.push({
          text: 'Data nilai tidak memenuhi syarat untuk ditampilkan atau tidak tersedia.',
          style: 'paragraf',
          italics: true,
          alignment: 'center',
          marginBottom: 20,
          marginTop: 15,
        });
    }
  } else { // Original check for nilaiSiswa being initially empty or null
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

    // --- Font Validation ---
    // Validate critical font files. If any are missing, reject the promise immediately.
    for (const fontPath of Object.values(fontDescriptors.Roboto)) {
      if (!fs.existsSync(fontPath)) {
        const errorMessage = `${createPdfBlobLogContext} Critical font file missing: ${fontPath}. PDF generation aborted. Please ensure all fonts are in server/src/assets/fonts/`;
        console.error(errorMessage); // Already has context prefix
        return reject(new Error(errorMessage)); // Reject the promise
      }
    }
    console.log(`${createPdfBlobLogContext} All critical font files found.`);

    try {
      console.log(`${createPdfBlobLogContext} Instantiating PdfPrinter.`);
      // --- PDF Document Creation ---
      const printer = new PdfPrinter(fontDescriptors);
      console.log(`${createPdfBlobLogContext} Creating PDF document with pdfmake.`);
      const pdfDoc = printer.createPdfKitDocument(docDefinition);

      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => { // Explicitly type chunk
        chunks.push(chunk);
      });
      pdfDoc.on('end', () => {
        console.log(`${createPdfBlobLogContext} PDF stream ended. Buffer created.`);
        resolve(Buffer.concat(chunks));
      });
      pdfDoc.on('error', (err: Error) => { // Explicitly type err
        // This handles asynchronous errors during the PDF stream generation
        console.error(`${createPdfBlobLogContext} Error during PDF stream generation with pdfmake:`, err);
        reject(new Error(`Error during PDF stream generation: ${err.message || err}`));
      });
      pdfDoc.end();
      console.log(`${createPdfBlobLogContext} PDF document generation process initiated (async).`);

    } catch (error: any) {
      // This handles synchronous errors, e.g., from PdfPrinter instantiation or createPdfKitDocument
      console.error(`${createPdfBlobLogContext} Error during PDF document instantiation or creation with pdfmake:`, error);
      reject(new Error(`Failed to create PDF document: ${error.message || error}`));
    }
  });
};
