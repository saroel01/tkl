import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Row, Col, DatePicker, Card, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined, DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { StatusKelulusan } from '../../types/siswa';
import type { Siswa, SiswaPaginatedResponse } from '../../types/siswa';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue } from 'antd/es/table/interface';

const API_URL = 'http://localhost:3001/api/siswa';

const ManajemenSiswaPage: React.FC = () => {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<Record<string, FilterValue | null>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchSiswa = useCallback(async (params: any = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: params.pagination?.current || pagination.current?.toString() || '1',
        limit: params.pagination?.pageSize || pagination.pageSize?.toString() || '10',
        search: params.searchTerm || searchTerm,
        status_kelulusan: params.filters?.status_kelulusan?.join(',') || '',
        kelas: params.filters?.kelas?.[0] || '',
        jurusan: params.filters?.jurusan?.[0] || '',
      });
      const response = await fetch(`${API_URL}?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Gagal mengambil data siswa');
      const data: SiswaPaginatedResponse = await response.json();
      setSiswaList(data.data);
      setPagination(prev => ({
        ...prev,
        current: data.page,
        total: data.total,
        pageSize: params.pagination?.pageSize || prev.pageSize
      }));
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchTerm]);

  useEffect(() => {
    fetchSiswa({ pagination, filters, searchTerm });
  }, [fetchSiswa, pagination.current, pagination.pageSize, filters, searchTerm]); // Dependensi diperbarui

  const handleTableChange = (
    newPagination: TablePaginationConfig,
    newFilters: Record<string, FilterValue | null>,
    // sorter: SorterResult<Siswa> | SorterResult<Siswa>[],
  ) => {
    setFilters(newFilters);
    // fetchSiswa akan dipicu oleh useEffect karena perubahan pagination dan filters
    setPagination(prev => ({...prev, ...newPagination})); 
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on new search
    // fetchSiswa akan dipicu oleh useEffect
  };

  const resetFiltersAndSearch = () => {
    setSearchTerm('');
    setFilters({});
    form.setFieldsValue({ search: '', kelasFilter: undefined, jurusanFilter: undefined, statusFilter: undefined });
    setPagination(prev => ({ ...prev, current: 1 }));
    // fetchSiswa akan dipicu oleh useEffect
  };

  const showModal = (siswa?: Siswa) => {
    setEditingSiswa(siswa || null);
    form.setFieldsValue(
      siswa
        ? { ...siswa, tanggal_lahir: siswa.tanggal_lahir ? moment(siswa.tanggal_lahir, 'YYYY-MM-DD') : null }
        : { status_kelulusan: StatusKelulusan.BELUM_DITENTUKAN }
    );
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSiswa(null);
    form.resetFields();
  };

  const onFinish = async (values: any) => {
    const payload = {
      ...values,
      tanggal_lahir: values.tanggal_lahir ? moment(values.tanggal_lahir).format('YYYY-MM-DD') : null,
    };

    try {
      let response;
      if (editingSiswa) {
        response = await fetch(`${API_URL}/${editingSiswa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal memperbarui siswa');
        }
        message.success('Siswa berhasil diperbarui');
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal menambah siswa');
        }
        message.success('Siswa berhasil ditambahkan');
      }
      fetchSiswa({ pagination: { ...pagination, current: editingSiswa ? pagination.current : 1 }, filters, searchTerm }); // Refresh table, go to page 1 if adding new
      handleCancel();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const handleDownloadSkl = (siswaId: number) => {
    // Pastikan URL backend sesuai dengan yang didefinisikan di server
    const downloadUrl = `http://localhost:3001/api/skl/${siswaId}/download`;
    // Membuka URL di tab baru akan memulai download jika Content-Disposition adalah attachment
    window.open(downloadUrl, '_blank');
    message.info('SKL sedang disiapkan untuk diunduh...');
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus siswa');
      message.success('Siswa berhasil dihapus');
      // Jika item terakhir di halaman saat ini dihapus, dan bukan halaman pertama, pindah ke halaman sebelumnya
      if (siswaList.length === 1 && pagination.current && pagination.current > 1) {
        setPagination(prev => ({...prev, current: prev.current ? prev.current -1 : 1}));
      } else {
        fetchSiswa({ pagination, filters, searchTerm }); // Or just refresh current page
      }
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  const columns: ColumnsType<Siswa> = [
    { title: 'No', dataIndex: 'id', key: 'id', render: (_text, _record, index) => ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 10) + index + 1, sorter: (a, b) => a.id - b.id },
    { title: 'NISN', dataIndex: 'nisn', key: 'nisn', sorter: (a,b) => a.nisn.localeCompare(b.nisn) },
    { title: 'Nama Lengkap', dataIndex: 'nama_lengkap', key: 'nama_lengkap', sorter: (a,b) => a.nama_lengkap.localeCompare(b.nama_lengkap) },
    { 
      title: 'Kelas', 
      dataIndex: 'kelas', 
      key: 'kelas', 
      // Tidak perlu filter di kolom karena sudah ada filter global
      sorter: (a,b) => a.kelas.localeCompare(b.kelas)
    },
    { 
      title: 'Jurusan', 
      dataIndex: 'jurusan', 
      key: 'jurusan', 
      // Tidak perlu filter di kolom karena sudah ada filter global
      sorter: (a,b) => (a.jurusan || '').localeCompare(b.jurusan || '')
    },
    {
      title: 'Status Kelulusan',
      dataIndex: 'status_kelulusan',
      key: 'status_kelulusan',
      filters: Object.values(StatusKelulusan).map(status => ({ text: status, value: status })),
      filteredValue: filters.status_kelulusan || null,
      render: (status: StatusKelulusan) => {
        let color = 'default';
        if (status === StatusKelulusan.LULUS) color = 'green';
        else if (status === StatusKelulusan.TIDAK_LULUS) color = 'red';
        else if (status === StatusKelulusan.PROSES) color = 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button icon={<DownloadOutlined />} onClick={() => handleDownloadSkl(record.id)} title="Download SKL" />
          <Popconfirm title="Yakin ingin menghapus siswa ini?" onConfirm={() => handleDelete(record.id)} okText="Ya" cancelText="Tidak">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Manajemen Data Siswa">
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="search">
                <Input
                    placeholder="Cari NISN, Nama, No. Ujian..."
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchTerm} // Bind value for controlled component
                    suffix={<SearchOutlined />}
                />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Form.Item name="kelasFilter">
                <Input 
                    placeholder="Filter Kelas (e.g., XII IPA 1)" 
                    onChange={(e) => setFilters(prev => ({...prev, kelas: [e.target.value]}))} 
                />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Form.Item name="jurusanFilter">
                <Input 
                    placeholder="Filter Jurusan (e.g., IPA)" 
                    onChange={(e) => setFilters(prev => ({...prev, jurusan: [e.target.value]}))} 
                />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Form.Item name="statusFilter">
                <Select 
                    placeholder="Filter Status Kelulusan" 
                    onChange={(value) => setFilters(prev => ({...prev, status_kelulusan: value ? [value] : null}))} 
                    allowClear
                >
                    {Object.values(StatusKelulusan).map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={3} style={{ textAlign: 'right' }}>
            <Space>
                <Button icon={<ClearOutlined />} onClick={resetFiltersAndSearch}>Reset</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Tambah Siswa
                </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {loading && <div style={{ textAlign: 'center', margin: '20px 0' }}><Spin size="large" /></div>}
      {!loading && <Table
        columns={columns}
        dataSource={siswaList}
        rowKey="id"
        pagination={pagination}
        loading={loading} // Ini mungkin redundan jika sudah ada Spin di atas
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }} // Untuk tabel responsif horizontal
      />}

      <Modal
        title={editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Footer akan di-handle oleh Form.Item
        destroyOnClose // Reset form fields when modal is closed
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status_kelulusan: StatusKelulusan.BELUM_DITENTUKAN }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nisn" label="NISN" rules={[{ required: true, message: 'NISN wajib diisi!' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nama_lengkap" label="Nama Lengkap" rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tempat_lahir" label="Tempat Lahir">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tanggal_lahir" label="Tanggal Lahir">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="nama_orang_tua_wali" label="Nama Orang Tua/Wali">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="kelas" label="Kelas" rules={[{ required: true, message: 'Kelas wajib diisi!' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jurusan" label="Jurusan">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="nomor_peserta_ujian" label="Nomor Peserta Ujian">
                    <Input />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="status_kelulusan" label="Status Kelulusan" rules={[{ required: true, message: 'Status kelulusan wajib diisi!' }]}>
                    <Select>
                    {Object.values(StatusKelulusan).map(status => (
                        <Select.Option key={status} value={status}>{status}</Select.Option>
                    ))}
                    </Select>
                </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nomor_ijazah" label="Nomor Ijazah">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nomor_skhun" label="Nomor SKHUN">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="catatan_admin" label="Catatan Admin">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="catatan_skl" label="Catatan SKL (Keterangan Tambahan di SKL)">
            <Input.TextArea rows={3} placeholder="Catatan ini akan ditampilkan di SKL jika diisi."/>
          </Form.Item>
          {/* Tambahkan field untuk upload foto jika diperlukan nanti */}
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Batal</Button>
              <Button type="primary" htmlType="submit">Simpan</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManajemenSiswaPage;
