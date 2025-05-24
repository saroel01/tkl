import axios from 'axios';
import type { MataPelajaran, NilaiSiswa, NilaiSiswaPayloadItem, PengaturanSekolah, Siswa } from './types'; // Path ke types/index.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// --- Layanan Mata Pelajaran ---
export const getAllMataPelajaran = async (): Promise<MataPelajaran[]> => {
  try {
    const response = await apiClient.get<MataPelajaran[]>('/matapelajaran');
    return response.data;
  } catch (error) {
    let descriptiveMessage = 'Gagal mengambil data mata pelajaran.';
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || 'Error Axios tidak spesifik saat mengambil mata pelajaran.';
      console.error('Error fetching mata pelajaran (Axios):', descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error('Error fetching mata pelajaran (Error):', descriptiveMessage);
    } else {
      console.error('Error fetching mata pelajaran (Unknown):', error);
    }
    throw new Error(descriptiveMessage);
  }
};

// --- Layanan Nilai Siswa ---
export const getNilaiBySiswaId = async (siswaId: number): Promise<NilaiSiswa[]> => {
  try {
    const response = await apiClient.get<NilaiSiswa[]>(`/nilai/siswa/${siswaId}`);
    return response.data;
  } catch (error) {
    let descriptiveMessage = `Gagal mengambil nilai untuk siswa ${siswaId}.`;
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || `Error Axios tidak spesifik saat mengambil nilai siswa ${siswaId}.`;
      console.error(`Error fetching nilai for siswa ${siswaId} (Axios):`, descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error(`Error fetching nilai for siswa ${siswaId} (Error):`, descriptiveMessage);
    } else {
      console.error(`Error fetching nilai for siswa ${siswaId} (Unknown):`, error);
    }
    throw new Error(descriptiveMessage);
  }
};

export const saveNilaiSiswaBatch = async (
  siswaId: number,
  payload: { nilai: NilaiSiswaPayloadItem[] }
): Promise<any> => {
  try {
    const response = await apiClient.post(`/nilai/siswa/${siswaId}`, payload);
    return response.data;
  } catch (error) {
    let descriptiveMessage = `Gagal menyimpan nilai untuk siswa ${siswaId}.`;
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || `Error Axios tidak spesifik saat menyimpan nilai siswa ${siswaId}.`;
      console.error(`Error saving nilai for siswa ${siswaId} (Axios):`, descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error(`Error saving nilai for siswa ${siswaId} (Error):`, descriptiveMessage);
    } else {
      console.error(`Error saving nilai for siswa ${siswaId} (Unknown):`, error);
    }
    throw new Error(descriptiveMessage);
  }
};

// --- Layanan Siswa (Contoh jika diperlukan) ---
export const getAllSiswa = async (): Promise<Siswa[]> => {
  try {
    const response = await apiClient.get<Siswa[]>('/siswa');
    return response.data;
  } catch (error) {
    let descriptiveMessage = 'Gagal mengambil data siswa.';
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || 'Error Axios tidak spesifik saat mengambil data siswa.';
      console.error('Error fetching siswa (Axios):', descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error('Error fetching siswa (Error):', descriptiveMessage);
    } else {
      console.error('Error fetching siswa (Unknown):', error);
    }
    throw new Error(descriptiveMessage);
  }
};

export const getSiswaById = async (id: number): Promise<Siswa> => {
  try {
    const response = await apiClient.get<Siswa>(`/siswa/${id}`);
    return response.data;
  } catch (error) {
    let descriptiveMessage = `Gagal mengambil data siswa dengan ID ${id}.`;
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || `Error Axios tidak spesifik saat mengambil siswa ID ${id}.`;
      console.error(`Error fetching siswa with id ${id} (Axios):`, descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error(`Error fetching siswa with id ${id} (Error):`, descriptiveMessage);
    } else {
      console.error(`Error fetching siswa with id ${id} (Unknown):`, error);
    }
    throw new Error(descriptiveMessage);
  }
};

export const createSiswa = async (data: Omit<Siswa, 'id'>): Promise<Siswa> => {
  try {
    const response = await apiClient.post<Siswa>('/siswa', data);
    return response.data;
  } catch (error) {
    let descriptiveMessage = 'Gagal membuat data siswa baru.';
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || 'Error Axios tidak spesifik saat membuat siswa.';
      console.error('Error creating siswa (Axios):', descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error('Error creating siswa (Error):', descriptiveMessage);
    } else {
      console.error('Error creating siswa (Unknown):', error);
    }
    throw new Error(descriptiveMessage);
  }
};

export const updateSiswa = async (id: number, data: Partial<Siswa>): Promise<Siswa> => {
  try {
    const response = await apiClient.put<Siswa>(`/siswa/${id}`, data);
    return response.data;
  } catch (error) {
    let descriptiveMessage = `Gagal memperbarui data siswa dengan ID ${id}.`;
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || `Error Axios tidak spesifik saat memperbarui siswa ID ${id}.`;
      console.error(`Error updating siswa with id ${id} (Axios):`, descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error(`Error updating siswa with id ${id} (Error):`, descriptiveMessage);
    } else {
      console.error(`Error updating siswa with id ${id} (Unknown):`, error);
    }
    throw new Error(descriptiveMessage);
  }
};

export const deleteSiswa = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/siswa/${id}`);
  } catch (error) {
    let descriptiveMessage = `Gagal menghapus data siswa dengan ID ${id}.`;
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || `Error Axios tidak spesifik saat menghapus siswa ID ${id}.`;
      console.error(`Error deleting siswa with id ${id} (Axios):`, descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error(`Error deleting siswa with id ${id} (Error):`, descriptiveMessage);
    } else {
      console.error(`Error deleting siswa with id ${id} (Unknown):`, error);
    }
    throw new Error(descriptiveMessage);
  }
};

// --- Layanan Pengaturan Sekolah ---
export const getPengaturanSekolah = async (): Promise<PengaturanSekolah | null> => {
  try {
    const response = await apiClient.get<PengaturanSekolah[]>('/pengaturan-sekolah');
    // API mengembalikan array, ambil item pertama jika ada
    return response.data && response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn('Pengaturan sekolah tidak ditemukan (404). Mengembalikan null.');
        return null; 
      }
      const serverMessage = (error.response?.data as any)?.message;
      const descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || 'Error Axios tidak spesifik saat mengambil pengaturan sekolah.';
      console.error('Error fetching pengaturan sekolah (Axios):', descriptiveMessage, error.response?.data);
      throw new Error(descriptiveMessage);
    } else if (error instanceof Error) {
      console.error('Error fetching pengaturan sekolah (Error):', error.message);
      throw error; 
    } else {
      console.error('Error fetching pengaturan sekolah (Unknown):', error);
      throw new Error('Gagal mengambil pengaturan sekolah karena kesalahan tidak diketahui.');
    }
  }
};

export const updatePengaturanSekolah = async (data: Partial<PengaturanSekolah>): Promise<PengaturanSekolah> => {
  try {
    // Asumsi ID pengaturan adalah 1 atau selalu ada satu record
    // Jika API mendukung POST untuk create jika tidak ada, atau PUT dengan ID tertentu
    const response = await apiClient.put<PengaturanSekolah>(`/pengaturan-sekolah/1`, data); // Sesuaikan ID jika perlu
    return response.data;
  } catch (error) {
    let descriptiveMessage = 'Gagal memperbarui pengaturan sekolah.';
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || 'Error Axios tidak spesifik saat memperbarui pengaturan sekolah.';
      console.error('Error updating pengaturan sekolah (Axios):', descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error('Error updating pengaturan sekolah (Error):', descriptiveMessage);
    } else {
      console.error('Error updating pengaturan sekolah (Unknown):', error);
    }
    throw new Error(descriptiveMessage);
  }
};

// --- Layanan SKL ---
export const downloadSklPdf = async (siswaId: number, namaSiswa: string): Promise<void> => {
  try {
    const response = await apiClient.get(`/skl/generate/${siswaId}`, {
      responseType: 'blob', // Penting untuk file download
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SKL_${namaSiswa.replace(/\s+/g, '_')}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    let descriptiveMessage = `Gagal mengunduh SKL PDF untuk siswa ${siswaId}.`;
    if (axios.isAxiosError(error)) {
      const serverMessage = (error.response?.data as any)?.message;
      descriptiveMessage = typeof serverMessage === 'string' ? serverMessage : error.message || `Error Axios tidak spesifik saat mengunduh SKL siswa ${siswaId}.`;
      console.error(`Error downloading SKL PDF for siswa ${siswaId} (Axios):`, descriptiveMessage, error.response?.data);
    } else if (error instanceof Error) {
      descriptiveMessage = error.message;
      console.error(`Error downloading SKL PDF for siswa ${siswaId} (Error):`, descriptiveMessage);
    } else {
      console.error(`Error downloading SKL PDF for siswa ${siswaId} (Unknown):`, error);
    }
    alert(descriptiveMessage + ' Periksa konsol untuk detail.');
    throw new Error(descriptiveMessage);
  }
};


export default apiClient;
