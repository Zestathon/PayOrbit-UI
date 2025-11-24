import React, { useState, useEffect } from 'react';
import { Layout, Table, Button, Typography, Card, message, Space, Spin, Modal } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Layout/Navbar';
import payrollService from '../../services/payroll.service';

const { Content } = Layout;
const { Title } = Typography;

const PayrollDetails = () => {
  const navigate = useNavigate();
  const { uploadId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchEmployeeData(1, 10);
  }, [uploadId]);

  const fetchEmployeeData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await payrollService.getEmployeesByUploadId(uploadId, page, pageSize);
      console.log('Employee data response:', response);

      // Handle different response formats
      let employeesList = [];
      let info = null;
      let totalCount = 0;

      if (response.success && Array.isArray(response.data)) {
        employeesList = response.data;
        info = response.upload_info;
        totalCount = response.count || response.data.length;
        console.log('Parsed employees:', employeesList);
      } else if (Array.isArray(response)) {
        employeesList = response;
        totalCount = response.length;
      } else if (response.results && Array.isArray(response.results)) {
        employeesList = response.results;
        totalCount = response.count || response.results.length;
      } else if (response.employees && Array.isArray(response.employees)) {
        employeesList = response.employees;
        info = response.upload_info;
        totalCount = response.count || response.employees.length;
      }

      if (employeesList.length === 0) {
        message.warning('No employee data found');
      }

      setEmployees(employeesList);
      setUploadInfo(info);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: totalCount,
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      message.error('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationConfig) => {
    fetchEmployeeData(paginationConfig.current, paginationConfig.pageSize);
  };

  const handleDownloadRow = (employee) => {
    setSelectedEmployee(employee);
    setDownloadModalVisible(true);
  };

  const handleCloseModal = () => {
    setDownloadModalVisible(false);
    setSelectedEmployee(null);
  };

  const handleDownloadFormat = (format) => {
    if (selectedEmployee) {
      downloadEmployeePayroll(selectedEmployee, format);
      handleCloseModal();
    }
  };

  const downloadEmployeePayroll = async (employee, format) => {
    try {
      message.loading({ content: 'Preparing download...', key: 'download-row' });

      // Call export API with selected format
      const response = await payrollService.exportEmployee(employee.id, format);

      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      let filename = `employee_${employee.employee_id}_payroll.${extension}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Set appropriate content type based on format
      const contentType = format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // Create download link from blob
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || contentType
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success({ content: `${format.toUpperCase()} downloaded successfully!`, key: 'download-row' });
    } catch (error) {
      console.error('Download error:', error);
      message.error({ content: 'Failed to download. Please try again.', key: 'download-row' });
    }
  };

  // Generate columns for employee data with nested salary
  const generateColumns = () => {
    if (employees.length === 0) return [];

    const columns = [
      {
        title: 'Employee ID',
        dataIndex: 'employee_id',
        key: 'employee_id',
        fixed: 'left',
        width: 120,
        render: (text) => <span className="font-semibold text-blue-600">{text || '-'}</span>,
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 150,
        render: (text) => <span className="font-semibold text-gray-800">{text || '-'}</span>,
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: 200,
        render: (text) => <span className="text-gray-700">{text || '-'}</span>,
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
        width: 130,
        render: (text) => <span className="text-gray-700">{text || '-'}</span>,
      },
      {
        title: 'Designation',
        dataIndex: 'designation',
        key: 'designation',
        width: 150,
        render: (text) => <span className="text-gray-700">{text || '-'}</span>,
      },
      {
        title: 'Basic Pay',
        dataIndex: ['salary', 'basic_pay'],
        key: 'basic_pay',
        width: 120,
        render: (text) => <span className="text-gray-800">₹{text || '0.00'}</span>,
      },
      {
        title: 'HRA',
        dataIndex: ['salary', 'hra'],
        key: 'hra',
        width: 100,
        render: (text) => <span className="text-gray-800">₹{text || '0.00'}</span>,
      },
      {
        title: 'Variable Pay',
        dataIndex: ['salary', 'variable_pay'],
        key: 'variable_pay',
        width: 120,
        render: (text) => <span className="text-gray-800">₹{text || '0.00'}</span>,
      },
      {
        title: 'Allowances',
        dataIndex: ['salary', 'other_allowances'],
        key: 'other_allowances',
        width: 120,
        render: (text) => <span className="text-gray-800">₹{text || '0.00'}</span>,
      },
      {
        title: 'Gross Salary',
        dataIndex: ['salary', 'gross_salary'],
        key: 'gross_salary',
        width: 130,
        render: (text) => <span className="font-semibold text-green-600">₹{text || '0.00'}</span>,
      },
      {
        title: 'PF',
        dataIndex: ['salary', 'provident_fund'],
        key: 'provident_fund',
        width: 100,
        render: (text) => <span className="text-red-600">₹{text || '0.00'}</span>,
      },
      {
        title: 'Income Tax',
        dataIndex: ['salary', 'income_tax'],
        key: 'income_tax',
        width: 120,
        render: (text) => <span className="text-red-600">₹{text || '0.00'}</span>,
      },
      {
        title: 'Total Deductions',
        dataIndex: ['salary', 'total_deductions'],
        key: 'total_deductions',
        width: 150,
        render: (text) => <span className="font-semibold text-red-600">₹{text || '0.00'}</span>,
      },
      {
        title: 'Net Salary',
        dataIndex: ['salary', 'net_salary'],
        key: 'net_salary',
        width: 130,
        render: (text) => <span className="font-bold text-green-700">₹{text || '0.00'}</span>,
      },
      {
        title: 'Take Home Pay',
        dataIndex: ['salary', 'take_home_pay'],
        key: 'take_home_pay',
        width: 150,
        render: (text) => <span className="font-bold text-blue-700">₹{text || '0.00'}</span>,
      },
      {
        title: 'Download',
        key: 'download',
        align: 'center',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadRow(record)}
            size="small"
            className="border-2 border-green-600 text-green-600 hover:bg-green-50"
          />
        ),
      },
    ];

    return columns;
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      <Content className="p-6 md:p-8">
        <div className="max-w-full mx-auto">
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
              Payroll Details
            </Title>
            <p className="text-gray-600 text-lg">
              {uploadInfo ? `File: ${uploadInfo.filename}` : 'View detailed employee payroll data'}
            </p>
          </div>

          {/* Table Card */}
          <Card className="shadow-lg rounded-lg border-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={generateColumns()}
                dataSource={employees}
                rowKey={(record) => record.id || record.employee_id || Math.random()}
                scroll={{ x: 'max-content' }}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} employees`,
                  pageSizeOptions: ['10', '50', '100', '200'],
                }}
                onChange={handleTableChange}
                className="custom-table"
              />
            )}
          </Card>

          {/* Download Format Modal */}
          <Modal
            title={
              <span>
                <DownloadOutlined className="mr-2" />
                Select Download Format
              </span>
            }
            open={downloadModalVisible}
            onCancel={handleCloseModal}
            footer={null}
            centered
            closable={true}
          >
            <p className="mb-6 text-gray-600">
              Choose the format for downloading the payroll details:
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                type="default"
                icon={<FilePdfOutlined />}
                onClick={() => handleDownloadFormat('pdf')}
                size="large"
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 border-red-600 text-white hover:text-white"
              >
                PDF
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => handleDownloadFormat('excel')}
                size="large"
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 border-green-600"
              >
                Excel
              </Button>
            </div>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default PayrollDetails;
