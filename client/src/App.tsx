import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import PengaturanSekolahPage from './pages/Admin/PengaturanSekolahPage';
import ManajemenSiswaPage from './pages/Admin/ManajemenSiswaPage';
import ManajemenMataPelajaranPage from './pages/Admin/ManajemenMataPelajaranPage'; // Import the new page
import './App.css'; // Anda mungkin ingin menyesuaikan atau menghapus ini
import { ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID'; // Import locale Bahasa Indonesia

// Halaman dummy untuk Beranda
const HomePage: React.FC = () => <div style={{textAlign: 'center', fontSize: '20px', marginTop: '50px'}}>Selamat Datang di Aplikasi Pengumuman Kelulusan</div>;

function App() {
  return (
    <ConfigProvider locale={idID}> {/* Bungkus dengan ConfigProvider untuk Ant Design locale */}
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="admin/pengaturan-sekolah" element={<PengaturanSekolahPage />} />
            <Route path="admin/manajemen-siswa" element={<ManajemenSiswaPage />} />
            <Route path="admin/manajemen-mapel" element={<ManajemenMataPelajaranPage />} /> {/* Add the new route */}
            {/* Tambahkan rute lain di sini di dalam AppLayout */}
          </Route>
          {/* Tambahkan rute yang tidak menggunakan AppLayout di sini (misal: halaman login siswa) */}
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect ke beranda jika rute tidak ditemukan */}
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
