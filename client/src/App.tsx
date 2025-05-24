import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import PengaturanSekolahPage from './pages/Admin/PengaturanSekolahPage';
import ManajemenSiswaPage from './pages/Admin/ManajemenSiswaPage';
import ManajemenMataPelajaranPage from './pages/Admin/ManajemenMataPelajaranPage';
import ManajemenNilaiSiswaPage from './pages/Admin/ManajemenNilaiSiswaPage';
import UnduhSklPage from './pages/UnduhSklPage';
import PengumumanPage from './pages/PengumumanPage'; // Import the new PengumumanPage
import './App.css';
import { ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';

// Dummy Admin Dashboard (can be expanded later)
const AdminDashboard: React.FC = () => <div style={{padding: 24, textAlign: 'center'}}><h2>Selamat Datang di Panel Admin</h2><p>Pilih menu di samping untuk mengelola aplikasi.</p></div>;

function App() {
  return (
    <ConfigProvider locale={idID}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PengumumanPage />} />
          <Route path="/unduh-skl" element={<UnduhSklPage />} />

          {/* Admin Routes with AppLayout */}
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<AdminDashboard />} /> {/* Default admin page */}
            <Route path="pengaturan-sekolah" element={<PengaturanSekolahPage />} />
            <Route path="manajemen-siswa" element={<ManajemenSiswaPage />} />
            <Route path="manajemen-mapel" element={<ManajemenMataPelajaranPage />} />
            <Route path="manajemen-nilai" element={<ManajemenNilaiSiswaPage />} />
            {/* Catch-all for /admin sub-routes not found, redirect to admin dashboard */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
          
          {/* Catch-all for top-level routes not found, redirect to public home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
