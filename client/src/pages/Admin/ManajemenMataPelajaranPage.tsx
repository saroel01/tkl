import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, InputNumber, message, Spin, Card, Typography, Space, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { MataPelajaran, KategoriMapel } from '../../types/matapelajaran'; // Assuming this path is correct

const { Title } = Typography;
const { Option } = Select;

const API_BASE_URL = 'http://localhost:3001/api'; // Standardized API base

const ManajemenMataPelajaranPage: React.FC = () => {
  const [form] = Form.useForm();
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingMataPelajaran, setEditingMataPelajaran] = useState<MataPelajaran | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchMataPelajaran = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/matapelajaran`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal mengambil data mata pelajaran');
      }
      const data: MataPelajaran[] = await response.json();
      setMataPelajaranList(data);
    } catch (error) {
      message.error((error as Error).message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMataPelajaran();
  }, [fetchMataPelajaran]);

  const handleAdd = () => {
    setEditingMataPelajaran(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: MataPelajaran) => {
    setEditingMataPelajaran(record);
    form.setFieldsValue({
      ...record,
      urutan_mapel: record.urutan_mapel === null ? undefined : record.urutan_mapel, // InputNumber expects undefined for empty
      kategori_mapel: record.kategori_mapel === null ? undefined : record.kategori_mapel,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    setLoading(true); // Indicate loading for delete operation
    try {
      const response = await fetch(`${API_BASE_URL}/matapelajaran/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal menghapus mata pelajaran');
      }
      message.success('Mata pelajaran berhasil dihapus');
      fetchMataPelajaran(); // Refresh list
    } catch (error) {
      message.error((error as Error).message || 'Terjadi kesalahan saat menghapus data');
      setLoading(false); // Ensure loading is false on error
    }
    // setLoading(false) will be called in fetchMataPelajaran's finally block
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMataPelajaran(null);
    form.resetFields();
  };

  const onModalSubmit = async (values: any) => {
    setSaving(true);
    const method = editingMataPelajaran ? 'PUT' : 'POST';
    const url = editingMataPelajaran
      ? `${API_BASE_URL}/matapelajaran/${editingMataPelajaran.id}`
      : `${API_BASE_URL}/matapelajaran`;

    // Ensure urutan_mapel is null if empty, not 0 or NaN
    const payload = {
        ...values,
        urutan_mapel: (values.urutan_mapel === undefined || values.urutan_mapel === null || String(values.urutan_mapel).trim() === '') 
                      ? null 
                      : Number(values.urutan_mapel),
        kategori_mapel: values.kategori_mapel === undefined ? null : values.kategori_mapel,
        kelompok_mapel: values.kelompok_mapel || null,
    };
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
        throw new Error(errorData.message || `Gagal ${editingMataPelajaran ? 'memperbarui' : 'menambah'} mata pelajaran`);
      }
      const result = await response.json();
      message.success(result.message || `Mata pelajaran berhasil ${editingMataPelajaran ? 'diperbarui' : 'ditambahkan'}`);
      setIsModalVisible(false);
      setEditingMataPelajaran(null);
      fetchMataPelajaran(); // Refresh list
    } catch (error) {
      message.error((error as Error).message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'Nama Mata Pelajaran', dataIndex: 'nama_mapel', key: 'nama_mapel', sorter: (a: MataPelajaran, b: MataPelajaran) => a.nama_mapel.localeCompare(b.nama_mapel) },
    { title: 'Kategori', dataIndex: 'kategori_mapel', key: 'kategori_mapel', render: (kategori?: KategoriMapel | null) => kategori || '-' , sorter: (a: MataPelajaran, b: MataPelajaran) => (a.kategori_mapel || '').localeCompare(b.kategori_mapel || '')},
    { title: 'Kelompok', dataIndex: 'kelompok_mapel', key: 'kelompok_mapel', render: (kelompok?: string | null) => kelompok || '-' , sorter: (a: MataPelajaran, b: MataPelajaran) => (a.kelompok_mapel || '').localeCompare(b.kelompok_mapel || '')},
    { title: 'Urutan SKL', dataIndex: 'urutan_mapel', key: 'urutan_mapel', render: (urutan?: number | null) => urutan === null || urutan === undefined ? '-' : urutan, sorter: (a: MataPelajaran, b: MataPelajaran) => (a.urutan_mapel ?? Infinity) - (b.urutan_mapel ?? Infinity) },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_: any, record: MataPelajaran) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Apakah Anda yakin ingin menghapus mata pelajaran ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Button icon={<DeleteOutlined />} danger>Hapus</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title={<Title level={3}>Manajemen Mata Pelajaran</Title>}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: 16 }}
      >
        Tambah Mata Pelajaran
      </Button>
      <Spin spinning={loading}>
        <Table
          dataSource={mataPelajaranList}
          columns={columns}
          rowKey="id"
          bordered
          size="small"
        />
      </Spin>
      <Modal
        title={editingMataPelajaran ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null} // Custom footer handled by Form
        destroyOnClose // Reset form fields when modal is closed
      >
        <Form form={form} layout="vertical" onFinish={onModalSubmit} initialValues={{ urutan_mapel: null, kategori_mapel: null, kelompok_mapel: null }}>
          <Form.Item
            name="nama_mapel"
            label="Nama Mata Pelajaran"
            rules={[{ required: true, message: 'Nama mata pelajaran tidak boleh kosong!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="kategori_mapel" label="Kategori Mata Pelajaran">
            <Select placeholder="Pilih kategori" allowClear>
              {Object.values(KategoriMapel).map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="kelompok_mapel" label="Kelompok Mata Pelajaran">
            <Input placeholder="Contoh: Kelompok A Umum, Peminatan Matematika"/>
          </Form.Item>
          <Form.Item name="urutan_mapel" label="Nomor Urut di SKL">
            <InputNumber style={{ width: '100%' }} placeholder="Angka untuk urutan, misal: 1, 2, 3"/>
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleModalCancel}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                {editingMataPelajaran ? 'Simpan Perubahan' : 'Simpan Mata Pelajaran'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManajemenMataPelajaranPage;
