import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import payorbitLogo from '../../assets/images/payorbit.png';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Please input your password!'));
    }
    if (value.length < 8) {
      return Promise.reject(new Error('Password must be at least 8 characters long!'));
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
      return Promise.reject(
        new Error('Password must contain uppercase, lowercase, number and special character!')
      );
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Resetting password with token');
      const response = await api.post('/auth/reset-password/', {
        token: values.token,
        new_password: values.new_password,
        new_password2: values.new_password2,
      });

      console.log('Reset password response:', response.data);

      if (response.data.success) {
        message.success(response.data.message || 'Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        message.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.token?.[0] ||
        error.message ||
        'Failed to reset password. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0">
        <div className="text-center mb-8">
          <img
            src={payorbitLogo}
            alt="Payorbit Logo"
            className="w-24 h-24 mx-auto mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 text-base">
            Enter the token and your new password
          </p>
        </div>

        <Form
          name="reset-password"
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="token"
            label="Reset Token"
            rules={[{ required: true, message: 'Please input the reset token!' }]}
          >
            <Input
              prefix={<SafetyCertificateOutlined className="text-gray-400" />}
              placeholder="Enter reset token"
              className="rounded-lg h-12"
            />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="New Password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="New Password"
              className="rounded-lg h-12"
            />
          </Form.Item>

          <Form.Item
            name="new_password2"
            label="Confirm New Password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Confirm New Password"
              className="rounded-lg h-12"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-lg text-base font-semibold"
            >
              Reset Password
            </Button>
          </Form.Item>

          <div className="text-center">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/forgot-password')}
              className="text-blue-600 hover:text-blue-700 mr-4"
            >
              Back
            </Button>
            <Button
              type="link"
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-blue-600"
            >
              Back to Login
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
