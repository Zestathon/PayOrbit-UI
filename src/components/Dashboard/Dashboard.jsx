import React, { useState, useEffect } from 'react';
import { Layout, Card, Upload, Button, message, Typography, Space, Row, Col, Statistic } from 'antd';
import { UploadOutlined, InboxOutlined, DownloadOutlined, FileTextOutlined, FileOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import uploadExcelFile from '../../services/upload.service';
import payrollService from '../../services/payroll.service';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

const Dashboard = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    uploads: { total: 0 },
    employees: { total: 0 },
    disbursement: { total: 0 }
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const response = await payrollService.getDashboardStats();
      console.log('Dashboard stats response:', response);

      // Handle nested response structure
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setStats(response);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('Failed to fetch dashboard statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const requiredColumns = [
    'Employee ID',
    'Employee Name',
    'Basic Salary',
    'Allowances',
    'Deductions',
    'Working Days',
    'Present Days',
  ];

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select an Excel file first');
      return;
    }

    setUploading(true);

    console.log('Starting file upload...', {
      fileName: fileList[0].name,
      fileSize: fileList[0].size,
      fileType: fileList[0].type
    });

    try {
      const response = await uploadExcelFile(fileList[0]);

      // Log the complete API response
      console.log('Upload API Response:', response);
      console.log('Upload Status:', response.success);
      console.log('Upload Message:', response.message);
      console.log('Upload Data:', response.data);

      if (response.success) {
        console.log('File uploaded successfully!', {
          uploadId: response.data.id,
          totalEmployees: response.data.total_employees,
          status: response.data.status,
          filename: response.data.filename,
          uploadDate: response.data.upload_date
        });

        message.success(response.message || `File processed successfully! ${response.data.total_employees} employees loaded.`);

        // Show warnings if any
        if (response.warnings && response.warnings.length > 0) {
          console.warn('Upload Warnings:', response.warnings);
          response.warnings.forEach(warning => {
            message.warning(warning);
          });
        }

        setFileList([]);

        // Refresh stats after successful upload
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        errors: error.errors,
        fullError: error
      });

      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach(err => {
          message.error(err);
        });
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Failed to upload file. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Download the custom Excel template from public folder
    const link = document.createElement('a');
    link.href = '/sample_payroll_template.xlsx';
    link.download = 'sample_payroll_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Template downloaded successfully!');
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';

      if (!isExcel) {
        message.error('You can only upload Excel files (.xlsx, .xls)!');
        return Upload.LIST_IGNORE;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <Layout className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative Gradient Orbs */}
      <div className="gradient-orb gradient-orb-1 animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="gradient-orb gradient-orb-2 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="gradient-orb gradient-orb-3 animate-float" style={{ animationDelay: '4s' }}></div>

      <Navbar />
      <Content className="p-6 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeInUp">
            <Title level={1} className="!text-4xl md:!text-5xl !font-bold !mb-3 gradient-text">
              Welcome to Payorbit
            </Title>
            <Paragraph className="text-gray-600 text-lg md:text-xl !mb-0">
              Upload your employee payroll Excel file to get started with processing
            </Paragraph>
          </div>

          {/* Premium Statistics Cards */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={8}>
              <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <Card className="glass-stat-card rounded-2xl border-0 shadow-premium hover-lift overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                  <Statistic
                    title={
                      <span className="text-gray-700 text-base font-semibold flex items-center gap-2">
                        <FileOutlined className="text-2xl text-blue-600" />
                        Total Uploads
                      </span>
                    }
                    value={stats.uploads?.total || 0}
                    valueStyle={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '42px',
                      fontWeight: '800',
                      lineHeight: '1.2'
                    }}
                    loading={loadingStats}
                  />
                </Card>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <Card className="glass-stat-card rounded-2xl border-0 shadow-premium hover-lift overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-2xl"></div>
                  <Statistic
                    title={
                      <span className="text-gray-700 text-base font-semibold flex items-center gap-2">
                        <UserOutlined className="text-2xl text-green-600" />
                        Total Employees
                      </span>
                    }
                    value={stats.employees?.total || 0}
                    valueStyle={{
                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '42px',
                      fontWeight: '800',
                      lineHeight: '1.2'
                    }}
                    loading={loadingStats}
                  />
                </Card>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <Card className="glass-stat-card rounded-2xl border-0 shadow-premium hover-lift overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
                  <Statistic
                    title={
                      <span className="text-gray-700 text-base font-semibold flex items-center gap-2">
                        <DollarOutlined className="text-2xl text-purple-600" />
                        Total Amount Processed
                      </span>
                    }
                    value={stats.disbursement?.total || 0}
                    precision={2}
                    valueStyle={{
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '42px',
                      fontWeight: '800',
                      lineHeight: '1.2'
                    }}
                    loading={loadingStats}
                  />
                </Card>
              </div>
            </Col>
          </Row>

          {/* View Summary Button */}
          <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <Button
              type="default"
              icon={<FileTextOutlined />}
              onClick={() => navigate('/summary')}
              size="large"
              className="h-14 px-8 text-lg font-bold rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-glow-blue hover-lift"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              View Summary
            </Button>
          </div>

          {/* Premium Upload Card */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <Card
              className="glass-card rounded-3xl border-0 shadow-premium-lg mb-6 overflow-hidden"
              bodyStyle={{ padding: '48px' }}
            >
              <Space direction="vertical" size="large" className="w-full">
                {/* Upload Area */}
                <Dragger
                  {...uploadProps}
                  className="!rounded-2xl !border-2 !border-dashed !border-blue-300/50 hover:!border-blue-500 !bg-gradient-to-br !from-white/50 !to-blue-50/30 hover:!from-white/70 hover:!to-blue-50/50 !backdrop-blur-sm hover-scale"
                  style={{
                    padding: '60px 20px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <p className="ant-upload-drag-icon mb-6">
                    <InboxOutlined
                      className="!text-8xl animate-pulse-glow"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    />
                  </p>
                  <p className="ant-upload-text !text-2xl !font-bold !text-gray-800 !mb-3">
                    Click or drag Excel file to this area
                  </p>
                  <p className="ant-upload-hint !text-base !text-gray-600">
                    Support for .xlsx and .xls files only. Maximum file size: 10MB
                  </p>
                </Dragger>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Download Template Button */}
                  <Button
                    type="default"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadTemplate}
                    size="large"
                    className="h-14 text-lg font-bold rounded-xl border-2 glass-card hover-lift"
                    style={{
                      borderImage: 'linear-gradient(135deg, #667eea, #764ba2) 1',
                      color: '#667eea'
                    }}
                  >
                    Download Template
                  </Button>

                  {/* Upload Button */}
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    onClick={handleUpload}
                    loading={uploading}
                    disabled={fileList.length === 0}
                    size="large"
                    className="h-14 text-lg font-bold rounded-xl shadow-glow-blue hover-lift"
                  >
                    {uploading ? 'Uploading...' : 'Upload and Process'}
                  </Button>
                </div>
              </Space>
            </Card>
          </div>

        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
