import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography, Spin, Alert, Statistic, Row, Col, Button } from 'antd';
import { ClockCircleOutlined, LockOutlined, UnlockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { PengaturanSekolah } from '../../types'; // Assuming PengaturanSekolah is in index.ts

const { Title, Paragraph, Text } = Typography;
const { Countdown } = Statistic;

const PengumumanPage: React.FC = () => {
  const [pengaturan, setPengaturan] = useState<PengaturanSekolah | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [countdownFinished, setCountdownFinished] = useState<boolean>(false);

  useEffect(() => {
    const fetchPengaturan = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/pengaturan-sekolah');
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Gagal memuat pengaturan sekolah.');
        }
        const data: PengaturanSekolah = await response.json();
        setPengaturan(data);

        if (data.tanggal_rilis) {
            const releaseDate = new Date(data.tanggal_rilis).getTime();
            if (new Date().getTime() >= releaseDate) {
                setCountdownFinished(true);
            }
        }

      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPengaturan();
    // Optional: Set up an interval to re-fetch settings if dynamic updates are critical
    // const intervalId = setInterval(fetchPengaturan, 60000); // Fetch every 60 seconds
    // return () => clearInterval(intervalId);
  }, []);

  const handleCountdownFinish = () => {
    setCountdownFinished(true);
    // Potentially re-fetch settings here to ensure the latest state if needed,
    // though `akses_aktif` would be the primary driver post-countdown.
  };

  if (loading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col>
          <Spin size="large" tip="Memuat informasi pengumuman..." />
        </Col>
      </Row>
    );
  }

  if (error) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '20px' }}>
        <Col xs={24} sm={18} md={12}>
          <Alert message="Error" description={error} type="error" showIcon />
        </Col>
      </Row>
    );
  }

  if (!pengaturan) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '20px' }}>
        <Col xs={24} sm={18} md={12}>
         <Alert message="Informasi Tidak Tersedia" description="Pengaturan sekolah belum dikonfigurasi." type="warning" showIcon />
        </Col>
      </Row>
    );
  }

  // Scenario 1: Admin sets access inactive
  if (!pengaturan.akses_aktif) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
        <Col xs={22} sm={16} md={12} lg={10}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <LockOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: 24 }} />
              <Title level={3}>Pengumuman Ditutup</Title>
              <Paragraph>
                Pengumuman kelulusan saat ini ditutup oleh administrator.
                Silakan hubungi pihak sekolah untuk informasi lebih lanjut.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  const releaseDate = pengaturan.tanggal_rilis ? new Date(pengaturan.tanggal_rilis).getTime() : 0;
  const now = new Date().getTime();

  // Scenario 2: Access active, current time is before release date (Countdown)
  if (now < releaseDate && !countdownFinished) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
        <Col xs={22} sm={16} md={12} lg={10}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ClockCircleOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 24 }} />
              <Title level={3}>Pengumuman Kelulusan Akan Segera Dibuka</Title>
              <Paragraph>
                Hitung mundur menuju waktu pengumuman:
              </Paragraph>
              <Countdown 
                title="" 
                value={releaseDate} 
                onFinish={handleCountdownFinish} 
                valueStyle={{ fontSize: '2.5em' }}
              />
              <Paragraph style={{ marginTop: 24 }}>
                Pengumuman kelulusan akan tersedia pada <Text strong>{new Date(releaseDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}</Text>.
                Silakan kembali lagi nanti.
              </Paragraph>
               <Alert 
                message="Halaman Terkunci" 
                description="Anda belum dapat melihat status kelulusan atau mengunduh SKL sampai waktu pengumuman tiba."
                type="info" 
                showIcon 
                style={{marginTop: 20}}
              />
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  // Scenario 3: Access active, current time is at or after release date (Announcement Open)
  // This also covers countdownFinished === true
  return (
    <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
      <Col xs={22} sm={16} md={12} lg={10}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <UnlockOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: 24 }} />
            <Title level={3}>Pengumuman Kelulusan Telah Dibuka!</Title>
            <Paragraph>
              Selamat! Waktu yang dinantikan telah tiba. Anda sekarang dapat memeriksa status kelulusan Anda.
            </Paragraph>
            <Paragraph>
              Untuk melihat detail kelulusan dan mengunduh Surat Keterangan Lulus (SKL), silakan gunakan token unik yang telah diberikan oleh sekolah.
            </Paragraph>
            <Button type="primary" size="large" icon={<DownloadOutlined />} style={{ marginTop: 16 }}>
              <Link to="/unduh-skl">Ke Halaman Unduh SKL</Link>
            </Button>
             <Alert 
                icon={<InfoCircleOutlined />}
                message="Informasi Penting" 
                description="Pastikan Anda telah menerima token SKL dari pihak sekolah. Jika Anda belum menerimanya atau mengalami kendala, segera hubungi administrasi sekolah."
                type="info" 
                showIcon 
                style={{marginTop: 24, textAlign: 'left'}}
              />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default PengumumanPage;
