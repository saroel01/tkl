import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { SettingOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

const AppLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', textAlign: 'center', lineHeight: '32px', color: 'white' }}>
          LOGO APP
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/">Beranda</Link>
          </Menu.Item>
          <Menu.SubMenu key="sub1" icon={<SettingOutlined />} title="Admin">
            <Menu.Item key="admin-pengaturan">
              <Link to="/admin/pengaturan-sekolah">Pengaturan Sekolah</Link>
            </Menu.Item>
            <Menu.Item key="admin-siswa" icon={<UserOutlined />}>
              <Link to="/admin/manajemen-siswa">Manajemen Siswa</Link>
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
