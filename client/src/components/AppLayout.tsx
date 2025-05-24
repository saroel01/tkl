import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { SettingOutlined, HomeOutlined, UserOutlined, BookOutlined, EditOutlined } from '@ant-design/icons'; // Added BookOutlined and EditOutlined

const { Header, Content, Footer, Sider } = Layout;

const AppLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', textAlign: 'center', lineHeight: '32px', color: 'white' }}>
          LOGO APP
        </div>
        <Menu theme="dark" defaultSelectedKeys={[location.pathname]} selectedKeys={[location.pathname]} mode="inline">
          <Menu.Item key="/admin" icon={<HomeOutlined />}>
            <Link to="/admin">Beranda Admin</Link>
          </Menu.Item>
          <Menu.SubMenu key="admin-pages-submenu" icon={<SettingOutlined />} title="Pengaturan & Data">
            <Menu.Item key="/admin/pengaturan-sekolah">
              <Link to="/admin/pengaturan-sekolah">Pengaturan Sekolah</Link>
            </Menu.Item>
            <Menu.Item key="/admin/manajemen-siswa" icon={<UserOutlined />}>
              <Link to="/admin/manajemen-siswa">Manajemen Siswa</Link>
            </Menu.Item>
            <Menu.Item key="/admin/manajemen-mapel" icon={<BookOutlined />}>
              <Link to="/admin/manajemen-mapel">Manajemen Mapel</Link>
            </Menu.Item>
            <Menu.Item key="/admin/manajemen-nilai" icon={<EditOutlined />}>
              <Link to="/admin/manajemen-nilai">Manajemen Nilai</Link>
            </Menu.Item>
            {/* Tambahkan menu admin lain di sini */}
          </Menu.SubMenu>
          {/* Tambahkan menu siswa di sini */}
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center' }}>
          <span style={{fontWeight: 'bold'}}>Aplikasi Pengumuman Kelulusan</span>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            <Outlet /> {/* Tempat konten halaman akan dirender */}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Aplikasi Kelulusan ©2025</Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
