import React, { useState, useEffect } from 'react';
import { Select, Button, message, Spin, Row, Col, Card, Typography, InputNumber, Form } from 'antd';
import { NilaiSiswa, NilaiSiswaPayloadItem } from '../../types'; // NilaiSiswa types from index.ts
import { MataPelajaran } from '../../types/matapelajaran'; // Specific MataPelajaran type
import { Siswa } from '../../types/siswa'; // Specific Siswa type

// It seems MataPelajaran from matapelajaran.ts is more detailed, let's adjust later if needed.

const { Title, Text } = Typography;
const { Option } = Select;

const ManajemenNilaiSiswaPage: React.FC = () => {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState<number | null>(null);
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [nilaiSiswa, setNilaiSiswa] = useState<Map<number, number | null>>(new Map()); // mapelId -> nilai
  const [loadingSiswa, setLoadingSiswa] = useState<boolean>(false);
  const [loadingMapel, setLoadingMapel] = useState<boolean>(false);
  const [loadingNilai, setLoadingNilai] = useState<boolean>(false);
  const [savingNilai, setSavingNilai] = useState<boolean>(false);

  const [form] = Form.useForm();

  // Fetch Siswa List
  useEffect(() => {
    setLoadingSiswa(true);
    fetch('/api/siswa') // Assuming this endpoint exists and returns Siswa[]
      .then(res => res.json())
      .then(data => { // Data can be Siswa[] or SiswaPaginatedResponse
        if (data && Array.isArray(data.data) && typeof data.total === 'number') { // Check for SiswaPaginatedResponse structure
            setSiswaList(data.data);
        } else if (Array.isArray(data)) { // Fallback for simple Siswa[] array
            setSiswaList(data);
        } else {
            setSiswaList([]);
            console.error("Unexpected data structure for siswa list:", data);
            message.error('Format daftar siswa tidak dikenali.');
        }
      })
      .catch(err => {
        console.error("Error fetching siswa list:", err);
        message.error('Gagal memuat daftar siswa.');
      })
      .finally(() => setLoadingSiswa(false));
  }, []);

  // Fetch Mata Pelajaran List
  useEffect(() => {
    setLoadingMapel(true);
    fetch('/api/mata-pelajaran') // Assuming this endpoint exists and returns MataPelajaran[]
      .then(res => res.json())
      .then((data: MataPelajaran[] | { data: MataPelajaran[] }) => { // Backend might return { data: [...] }
        if (Array.isArray(data)) {
          setMataPelajaranList(data);
        } else if (data && Array.isArray(data.data)) {
          setMataPelajaranList(data.data);
        } else {
          setMataPelajaranList([]);
          console.error("Unexpected data structure for mata pelajaran list:", data);
          message.error('Format daftar mata pelajaran tidak dikenali.');
        }
      })
      .catch(err => {
        console.error("Error fetching mata pelajaran list:", err);
        message.error('Gagal memuat daftar mata pelajaran.');
      })
      .finally(() => setLoadingMapel(false));
  }, []);

  // Fetch NilaiSiswa when selectedSiswaId changes
  useEffect(() => {
    if (selectedSiswaId) {
      setLoadingNilai(true);
      fetch(`/api/nilai/siswa/${selectedSiswaId}`)
        .then(res => res.json())
        .then((data: NilaiSiswa[]) => {
          const newNilaiMap = new Map<number, number | null>();
          const formValues: { [key: string]: number | null } = {};
          if (Array.isArray(data)) {
            data.forEach(n => {
              if (n.mataPelajaran && typeof n.mataPelajaran.id === 'number') {
                newNilaiMap.set(n.mataPelajaran.id, n.nilai);
                formValues[`nilai_${n.mataPelajaran.id}`] = n.nilai;
              }
            });
          }
          setNilaiSiswa(newNilaiMap);
          form.setFieldsValue(formValues); // Set form values after processing all nilai
        })
        .catch(err => {
          console.error("Error fetching nilai siswa:", err);
          message.error('Gagal memuat nilai siswa.');
          setNilaiSiswa(new Map()); // Reset on error
          form.resetFields(); // Reset form on error
        })
        .finally(() => setLoadingNilai(false));
    } else {
      setNilaiSiswa(new Map()); // Reset if no student is selected
      form.resetFields(); // Reset form if no student is selected
    }
  }, [selectedSiswaId, form]);

  const handleSiswaChange = (value: number) => {
    setSelectedSiswaId(value);
  };

  const handleNilaiChange = (mapelId: number, newValue: number | null) => {
    // This function will be called by InputNumber's onChange
    // The actual update to state/form is handled by Form's onValuesChange or onFinish
  };

  const onFinish = (values: any) => {
    if (!selectedSiswaId) {
      message.error('Silakan pilih siswa terlebih dahulu.');
      return;
    }

    setSavingNilai(true);
    // Filter out mapel that might not be in the form (e.g. if mapel list changes)
    const payload: NilaiSiswaPayloadItem[] = mataPelajaranList
      .map(mapel => {
        const nilaiKey = `nilai_${mapel.id}`;
        // Check if the key exists in values, as Form might not include untouched fields if not initially set
        const nilai = values.hasOwnProperty(nilaiKey) ? values[nilaiKey] : nilaiSiswa.get(mapel.id);
        return {
          mapelId: mapel.id,
          // Ensure null is sent if value is undefined or truly null
          nilai: (nilai === undefined || nilai === '') ? null : Number(nilai), 
        };
      });

    fetch(`/api/nilai/siswa/${selectedSiswaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Gagal menyimpan nilai.');
        }
        return res.json();
      })
      .then(() => {
        message.success('Nilai berhasil disimpan!');
        // Optionally, re-fetch nilai to confirm
      })
      .catch(err => {
        console.error("Error saving nilai siswa:", err);
        message.error(err.message || 'Gagal menyimpan nilai siswa.');
      })
      .finally(() => setSavingNilai(false));
  };
  
  // Group mata pelajaran
  const groupedMataPelajaran = mataPelajaranList.reduce((acc, mapel) => {
    const kategori = mapel.kategori_mapel || 'Lainnya';
    const kelompok = mapel.kelompok_mapel || 'Umum'; // Default group if not specified
    if (!acc[kategori]) acc[kategori] = {};
    if (!acc[kategori][kelompok]) acc[kategori][kelompok] = [];
    acc[kategori][kelompok].push(mapel);
    return acc;
  }, {} as Record<string, Record<string, MataPelajaran[]>>);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Manajemen Nilai Siswa</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Text>Pilih Siswa:</Text>
          <Select
            showSearch
            style={{ width: '100%', maxWidth: 400, marginTop: 8 }}
            placeholder="Cari atau pilih siswa berdasarkan NISN atau Nama"
            loading={loadingSiswa}
            onChange={handleSiswaChange}
            filterOption={(input, option) =>
              option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
              option?.value.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {siswaList.map(siswa => (
              <Option key={siswa.id} value={siswa.id}>{`${siswa.nisn} - ${siswa.nama_lengkap}`}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      {selectedSiswaId && (loadingMapel || loadingNilai) && <div style={{display: 'flex', justifyContent: 'center', marginTop: 20}}><Spin /></div>}

      {selectedSiswaId && !loadingMapel && !loadingNilai && mataPelajaranList.length > 0 && (
        <Form form={form} onFinish={onFinish} layout="vertical" style={{ marginTop: 24 }}>
          {Object.entries(groupedMataPelajaran).sort(([katA], [katB]) => katA.localeCompare(katB)).map(([kategori, kelompokMap]) => (
            <Card key={kategori} title={kategori === 'null' ? 'Tanpa Kategori' : kategori} style={{ marginBottom: 16 }}>
              {Object.entries(kelompokMap).sort(([kelA], [kelB]) => kelA.localeCompare(kelB)).map(([kelompok, mapels]) => (
                <div key={kelompok}>
                  <Title level={5} style={{ marginTop: 8, marginBottom: 8 }}>{kelompok === 'null' ? 'Tanpa Kelompok' : `Kelompok: ${kelompok}`}</Title>
                  {mapels.sort((a,b) => (a.urutan_mapel || 0) - (b.urutan_mapel || 0)).map(mapel => (
                    <Form.Item
                      key={mapel.id}
                      name={`nilai_${mapel.id}`}
                      label={`${mapel.nama_mapel}`}
                      // initialValue is set by form.setFieldsValue when nilaiSiswa is fetched
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: '100px' }} // Adjusted width
                        placeholder="Nilai"
                        onChange={(value) => handleNilaiChange(mapel.id, value)} // handleNilaiChange might not be strictly necessary if form handles all state
                      />
                    </Form.Item>
                  ))}
                </div>
              ))}
            </Card>
          ))}
          <Button type="primary" htmlType="submit" loading={savingNilai}>
            Simpan Semua Nilai
          </Button>
        </Form>
      )}
       {selectedSiswaId && !loadingMapel && mataPelajaranList.length === 0 && !loadingNilai && (
        <Text style={{ marginTop: 20, display: 'block' }}>Tidak ada mata pelajaran yang tersedia untuk ditampilkan.</Text>
      )}
    </div>
  );
};

export default ManajemenNilaiSiswaPage;
