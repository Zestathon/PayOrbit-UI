import React, { useState, useEffect } from 'react';
import { Layout, Table, Button, Typography, Card, message, Space } from 'antd';
import { EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import payrollService from '../../services/payroll.service';

const { Content } = Layout;
const { Title } = Typography;

const Summary = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchUploadedFiles(1, 10);
  }, []);

  const fetchUploadedFiles = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await payrollService.getUploadedFiles(page, pageSize);
      console.log('Fetched uploads:', response);

      // Handle different response formats
      let uploadsList = [];
      let totalCount = 0;

      if (response.success && Array.isArray(response.data)) {
        uploadsList = response.data;
        totalCount = response.count || response.data.length;
      } else if (Array.isArray(response)) {
        uploadsList = response;
        totalCount = response.length;
      } else if (response.results && Array.isArray(response.results)) {
        uploadsList = response.results;
        totalCount = response.count || response.results.length;
      }

      setUploads(uploadsList);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: totalCount,
      });
    } catch (error) {
      console.error('Error fetching uploads:', error);
      message.error('Failed to fetch uploaded files');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationConfig) => {
    fetchUploadedFiles(paginationConfig.current, paginationConfig.pageSize);
  };

  const handleView = (record) => {
    console.log('View file:', record);
    // Navigate to payroll details page with upload ID
    navigate(`/payroll-details/${record.id}`);
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'filename',
      key: 'filename',
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-800">{text}</div>
          <div className="text-sm text-gray-500">
            Uploaded: {new Date(record.upload_date).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Employees',
      dataIndex: 'total_employees',
      key: 'total_employees',
      align: 'center',
      render: (count) => (
        <span className="font-semibold text-blue-600">{count || 0}</span>
      ),
    },
    {
      title: 'View',
      key: 'view',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      <Content className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Space className="mb-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/dashboard')}
                size="large"
                className="border-2 border-gray-300 hover:border-blue-500"
              >
                Back to Dashboard
              </Button>
            </Space>

            <Title level={2} className="text-gray-800 mb-2">
              Uploaded Files Summary
            </Title>
            <p className="text-gray-600 text-lg">
              View all your uploaded payroll files and their status
            </p>
          </div>

          {/* Table Card */}
          <Card className="shadow-lg rounded-lg border-0">
            <Table
              columns={columns}
              dataSource={uploads}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} files`,
                pageSizeOptions: ['10', '30', '50', '100'],
              }}
              onChange={handleTableChange}
              className="custom-table"
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Summary;
