import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Spin, Card, Row, Col, Typography, Switch, DatePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import moment from 'moment';

const { Title } = Typography;

interface PengaturanSekolahData {
  id?: number;
  nama_sekolah: string;
  logo_sekolah_path?: string;
  logo_dinas_path?: string;
  tanggal_rilis?: string | null; // ISO string or null
  akses_aktif: boolean;
  // Fields to add:
  nama_dinas?: string | null;
  alamat_sekolah_lengkap?: string | null;
  kontak_sekolah?: string | null;
  website_sekolah?: string | null;
  npsn_sekolah?: string | null;
  nama_kepala_sekolah?: string | null;
  nip_kepala_sekolah?: string | null;
  kota_penerbitan_skl?: string | null;
  tahun_ajaran?: string | null;
  jenis_ujian_skl?: string | null;
}

const PengaturanSekolahPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [logoSekolahFile, setLogoSekolahFile] = useState<UploadFile[]>([]);
  const [logoDinasFile, setLogoDinasFile] = useState<UploadFile[]>([]);
  const [currentLogoSekolahUrl, setCurrentLogoSekolahUrl] = useState<string | undefined>(undefined);
  const [currentLogoDinasUrl, setCurrentLogoDinasUrl] = useState<string | undefined>(undefined);

  const API_BASE_URL = 'http://localhost:3001'; // Sesuaikan jika port backend berbeda

  useEffect(() => {
    const fetchPengaturan = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/pengaturan-sekolah`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data pengaturan');
        }
        const data: PengaturanSekolahData = await response.json();
        form.setFieldsValue({
          ...data,
          tanggal_rilis: data.tanggal_rilis ? moment(data.tanggal_rilis) : null,
        });
        if (data.logo_sekolah_path) {
          setCurrentLogoSekolahUrl(`${API_BASE_URL}${data.logo_sekolah_path}`);
        }
        if (data.logo_dinas_path) {
          setCurrentLogoDinasUrl(`${API_BASE_URL}${data.logo_dinas_path}`);
        }
      } catch (error) {
        message.error((error as Error).message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };
    fetchPengaturan();
  }, [form]);

  const onFinish = async (values: any) => {
    setSaving(true);
    const formData = new FormData();
    formData.append('nama_sekolah', values.nama_sekolah);
    formData.append('akses_aktif', values.akses_aktif ? 'true' : 'false');
    if (values.tanggal_rilis) {
      formData.append('tanggal_rilis', values.tanggal_rilis.toISOString());
    } else {
      formData.append('tanggal_rilis', ''); // Send empty if null to clear
    }

    // Append other SKL-related fields
    const fieldsToAppend = [
      'nama_dinas', 'alamat_sekolah_lengkap', 'kontak_sekolah', 
      'website_sekolah', 'npsn_sekolah', 'nama_kepala_sekolah', 
      'nip_kepala_sekolah', 'kota_penerbitan_skl', 'tahun_ajaran', 'jenis_ujian_skl'
    ];

    fieldsToAppend.forEach(field => {
      if (values[field] !== undefined && values[field] !== null) {
        formData.append(field, values[field]);
      } else {
        formData.append(field, ''); // Send empty string for null/undefined to clear on backend
      }
    });

    if (logoSekolahFile.length > 0 && logoSekolahFile[0].originFileObj) {
      formData.append('logo_sekolah', logoSekolahFile[0].originFileObj);
    }
    if (logoDinasFile.length > 0 && logoDinasFile[0].originFileObj) {
      formData.append('logo_dinas', logoDinasFile[0].originFileObj);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/pengaturan-sekolah`, {
        method: 'PUT',
        body: formData, // Tidak perlu header 'Content-Type' karena FormData akan menanganinya
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan pengaturan');
      }
      const result = await response.json();
      message.success(result.message || 'Pengaturan berhasil disimpan!');
      // Update current logo URLs if new ones were uploaded
      if (result.pengaturan?.logo_sekolah_path) {
        setCurrentLogoSekolahUrl(`${API_BASE_URL}${result.pengaturan.logo_sekolah_path}?t=${new Date().getTime()}`); // Cache buster
      }
      if (result.pengaturan?.logo_dinas_path) {
        setCurrentLogoDinasUrl(`${API_BASE_URL}${result.pengaturan.logo_dinas_path}?t=${new Date().getTime()}`); // Cache buster
      }
      setLogoSekolahFile([]);
      setLogoDinasFile([]);
    } catch (error) {
      message.error((error as Error).message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const logoSekolahProps: UploadProps = {
    onRemove: () => setLogoSekolahFile([]),
    beforeUpload: (file) => {
      const isPng = file.type === 'image/png';
      if (!isPng) {
        message.error('Anda hanya bisa mengunggah file PNG!');
      }
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (!isLt1M) {
        message.error('Logo harus lebih kecil dari 1MB!');
      }
      if (isPng && isLt1M) {
        setLogoSekolahFile([file]);
      }
      return false; // Mencegah upload otomatis
    },
    fileList: logoSekolahFile,
    listType: 'picture',
    maxCount: 1,
  };

  const logoDinasProps: UploadProps = {
    onRemove: () => setLogoDinasFile([]),
    beforeUpload: (file) => {
      const isPng = file.type === 'image/png';
      if (!isPng) {
        message.error('Anda hanya bisa mengunggah file PNG!');
      }
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (!isLt1M) {
        message.error('Logo harus lebih kecil dari 1MB!');
      }
      if (isPng && isLt1M) {
        setLogoDinasFile([file]);
      }
      return false; // Mencegah upload otomatis
    },
    fileList: logoDinasFile,
    listType: 'picture',
    maxCount: 1,
  };

  if (loading) {
    return <Spin tip="Memuat pengaturan..." style={{ display: 'block', marginTop: '50px' }} />;
  }

  return (
    <Card title={<Title level={3}>Pengaturan Sekolah</Title>}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              name="nama_sekolah"
              label="Nama Sekolah"
              rules={[{ required: true, message: 'Nama sekolah tidak boleh kosong!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item name="tanggal_rilis" label="Tanggal Rilis Pengumuman">
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="Logo Sekolah (PNG, maks 1MB)">
              {currentLogoSekolahUrl && (
                <img src={currentLogoSekolahUrl} alt="Logo Sekolah Saat Ini" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px', display: 'block' }} />
              )}
              <Upload {...logoSekolahProps}>
                <Button icon={<UploadOutlined />}>Pilih Logo Sekolah</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="Logo Dinas (PNG, maks 1MB)">
              {currentLogoDinasUrl && (
                <img src={currentLogoDinasUrl} alt="Logo Dinas Saat Ini" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px', display: 'block' }} />
              )}
              <Upload {...logoDinasProps}>
                <Button icon={<UploadOutlined />}>Pilih Logo Dinas</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="akses_aktif" label="Aktifkan Halaman Pengumuman" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Title level={4} style={{ marginTop: '20px', marginBottom: '10px' }}>Detail untuk SKL</Title>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="nama_dinas" label="Nama Dinas">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="kontak_sekolah" label="Kontak Sekolah (Telepon/Email)">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="alamat_sekolah_lengkap" label="Alamat Lengkap Sekolah">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="website_sekolah" label="Website Sekolah">
              <Input placeholder="https://sekolah.sch.id" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="npsn_sekolah" label="NPSN Sekolah">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="tahun_ajaran" label="Tahun Ajaran SKL">
              <Input placeholder="Contoh: 2023/2024" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="nama_kepala_sekolah" label="Nama Kepala Sekolah">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="nip_kepala_sekolah" label="NIP Kepala Sekolah">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="kota_penerbitan_skl" label="Kota Penerbitan SKL">
              <Input placeholder="Contoh: Jakarta" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="jenis_ujian_skl" label="Jenis Ujian di SKL">
              <Input placeholder="Contoh: Ujian Sekolah" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            Simpan Pengaturan
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PengaturanSekolahPage;
