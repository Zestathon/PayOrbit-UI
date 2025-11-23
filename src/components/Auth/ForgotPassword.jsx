import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import payorbitLogo from '../../assets/images/payorbit.png';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Requesting password reset for:', values.email);
      const response = await api.post('/auth/forgot-password/', {
        email: values.email,
      });

      console.log('Forgot password response:', response.data);

      if (response.data.success && response.data.data) {
        const { token, username, expires_at } = response.data.data;
        setResetToken(token);
        setTokenData({ username, expires_at, message: response.data.message });
        message.success('Password reset token generated successfully!');
      } else {
        message.error(response.data.message || 'Failed to generate reset token');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to process request. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to reset password page (user must manually enter token)
    navigate('/reset-password');
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
            Forgot Password?
          </h1>
          <p className="text-gray-600 text-base">
            {resetToken
              ? 'Your reset token has been generated'
              : 'Enter your email to receive a password reset token'}
          </p>
        </div>

        {!resetToken ? (
          <Form name="forgot-password" onFinish={onFinish} size="large" layout="vertical">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Email"
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
                Send Reset Token
              </Button>
            </Form.Item>

            <div className="text-center">
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700"
              >
                Back to Login
              </Button>
            </div>
          </Form>
        ) : (
          <div className="space-y-6">
            <Alert
              message="Token Generated Successfully"
              description={tokenData?.message}
              type="success"
              showIcon
              className="rounded-lg"
            />

            <div className="bg-gray-50 p-6 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-2 font-semibold">Your Reset Token:</p>
              <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                <code className="text-blue-600 font-mono text-sm break-all select-all">
                  {resetToken}
                </code>
              </div>
              <p className="text-xs text-gray-500">
                <strong>Username:</strong> {tokenData?.username}
              </p>
              <p className="text-xs text-red-600 mt-2">
                ⚠️ This token expires in 15 minutes. Please use it to reset your password.
              </p>
            </div>

            <Alert
              message="Important"
              description="Copy this token and use it in the next step to reset your password."
              type="info"
              showIcon
              className="rounded-lg"
            />

            <Button
              type="primary"
              onClick={handleContinue}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-lg text-base font-semibold"
            >
              Continue to Reset Password
            </Button>

            <div className="text-center">
              <Button
                type="link"
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-blue-600"
              >
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
