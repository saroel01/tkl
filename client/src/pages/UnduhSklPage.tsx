import React, { useState } from 'react';
import { Input, Button, Typography, Alert, Spin, Row, Col, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const UnduhSklPage: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
    setError(null); // Clear error when token changes
    setSuccessMessage(null); // Clear success message
  };

  const handleDownload = async () => {
    if (!token.trim()) {
      setError('Token tidak boleh kosong.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/skl/download/${token.trim()}`);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || `Gagal mengunduh SKL. Status: ${response.status}`);
        setLoading(false);
        return;
      }

      // Handle PDF download
      const blob = await response.blob();
      const filenameHeader = response.headers.get('Content-Disposition');
      let filename = 'SKL_Siswa.pdf'; // Default filename
      if (filenameHeader) {
        const parts = filenameHeader.split('filename=');
        if (parts.length > 1) {
          filename = parts[1].replace(/"/g, ''); // Remove quotes
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`SKL berhasil diunduh: ${filename}`);
      setLoading(false);

    } catch (err) {
      console.error('Error downloading SKL:', err);
      setError('Terjadi kesalahan saat mencoba mengunduh SKL. Periksa koneksi internet Anda atau coba lagi nanti.');
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 150px)', padding: '20px' }}>
      <Col xs={24} sm={16} md={12} lg={10} xl={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>Unduh SKL</Title>
            <Paragraph>
              Masukkan token unik Anda untuk mengunduh Surat Keterangan Lulus (SKL).
            </Paragraph>
          </div>

          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          {successMessage && <Alert message={successMessage} type="success" showIcon style={{ marginBottom: 16 }} />}

          <Input
            placeholder="Masukkan Token SKL Anda"
            value={token}
            onChange={handleTokenChange}
            onPressEnter={handleDownload}
            size="large"
            style={{ marginBottom: 16 }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            loading={loading}
            disabled={loading}
            block
            size="large"
          >
            {loading ? 'Mengunduh...' : 'Unduh SKL'}
          </Button>
          
          <Paragraph type="secondary" style={{marginTop: 20, textAlign: 'center', fontSize: '12px'}}>
            Jika Anda mengalami kesulitan atau token tidak valid, silakan hubungi pihak sekolah.
          </Paragraph>
        </Card>
      </Col>
    </Row>
  );
};

export default UnduhSklPage;
