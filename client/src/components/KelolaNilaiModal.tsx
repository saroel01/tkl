import React, { useState, useEffect, useCallback } from 'react';
import type { MataPelajaran, NilaiSiswa, Siswa, NilaiSiswaPayloadItem } from '../types'; // Sesuaikan path jika perlu
import { getAllMataPelajaran, getNilaiBySiswaId, saveNilaiSiswaBatch } from '../api'; // Sesuaikan path jika perlu

interface KelolaNilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: Siswa | null; // Bisa null jika belum ada siswa yang dipilih
}

const KelolaNilaiModal: React.FC<KelolaNilaiModalProps> = ({ isOpen, onClose, siswa }) => {
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [nilaiInputs, setNilaiInputs] = useState<{ [mapelId: number]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    if (!siswa) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const [mapelData, nilaiData] = await Promise.all([
        getAllMataPelajaran(),
        getNilaiBySiswaId(siswa.id),
      ]);
      setMataPelajaranList(mapelData);
      
      const initialNilai: { [mapelId: number]: string } = {};
      mapelData.forEach(mapel => {
        const nilaiSiswa = nilaiData.find(n => n.mataPelajaran.id === mapel.id);
        initialNilai[mapel.id] = nilaiSiswa ? String(nilaiSiswa.nilai) : '';
      });
      setNilaiInputs(initialNilai);

    } catch (err) {
      setError('Gagal memuat data nilai atau mata pelajaran.');
      console.error(err);
    }
    setIsLoading(false);
  }, [siswa]);

  useEffect(() => {
    if (isOpen && siswa) {
      fetchInitialData();
    }
  }, [isOpen, siswa, fetchInitialData]);

  const handleInputChange = (mapelId: number, value: string) => {
    setNilaiInputs(prev => ({ ...prev, [mapelId]: value }));
  };

  const handleSubmit = async () => {
    if (!siswa) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const payloadNilai: NilaiSiswaPayloadItem[] = mataPelajaranList.map(mapel => ({
      mapelId: mapel.id,
      nilai: nilaiInputs[mapel.id] === '' || isNaN(parseFloat(nilaiInputs[mapel.id])) 
             ? null 
             : parseFloat(nilaiInputs[mapel.id]),
    }));

    try {
      await saveNilaiSiswaBatch(siswa.id, { nilai: payloadNilai });
      setSuccessMessage('Nilai berhasil disimpan!');
      // Optionally, refetch data or close modal after a delay
      // setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError('Gagal menyimpan nilai.');
      console.error(err);
    }
    setIsLoading(false);
  };

  if (!isOpen || !siswa) return null;

  // Basic Modal Styling (Anda mungkin menggunakan library UI seperti Tailwind, Chakra, MUI, dll)
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    zIndex: 1000,
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxHeight: '80vh',
    overflowY: 'auto',
    width: '500px', // Adjust as needed
  };

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  };

  return (
    <>
      <div style={backdropStyle} onClick={onClose}></div>
      <div style={modalStyle}>
        <h3>Kelola Nilai untuk: {siswa.nama_lengkap}</h3>
        {isLoading && <p>Memuat...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        
        {!isLoading && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {mataPelajaranList.length === 0 && !isLoading && <p>Tidak ada mata pelajaran tersedia.</p>}
            {mataPelajaranList.map(mapel => (
              <div key={mapel.id} style={{ marginBottom: '10px' }}>
                <label htmlFor={`nilai-${mapel.id}`} style={{ display: 'block', marginBottom: '5px' }}>
                  {mapel.nama_mapel} ({mapel.kelompok_mapel})
                </label>
                <input
                  type="number" // Lebih baik gunakan number, tapi handle string untuk kosong
                  id={`nilai-${mapel.id}`}
                  value={nilaiInputs[mapel.id] || ''}
                  onChange={(e) => handleInputChange(mapel.id, e.target.value)}
                  placeholder="Masukkan nilai"
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  min="0"
                  max="100" // Sesuaikan jika rentang nilai berbeda
                />
              </div>
            ))}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button type="button" onClick={onClose} style={{ marginRight: '10px' }}>Batal</button>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Nilai'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default KelolaNilaiModal;
