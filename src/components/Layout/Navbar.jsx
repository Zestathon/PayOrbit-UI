import React, { useState } from 'react';
import { Layout, Button, Space, Avatar, message } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import payorbitLogo from '../../assets/images/payorbit.png';

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      message.success('Logout successful');
      // Force a complete page reload to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Logout failed');
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.username || 'User';
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <Header className="glass-navbar px-6 flex items-center justify-between sticky top-0 z-50 h-20 shadow-premium">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-3 hover-scale cursor-pointer">
          <img
            src={payorbitLogo}
            alt="Payorbit Logo"
            className="w-16 h-16 object-contain drop-shadow-lg"
          />
          <h1 className="text-2xl md:text-3xl font-bold hidden md:block gradient-text">
            Payorbit
          </h1>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-4">
        {/* User Info Display - Rectangular */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors duration-200"
        >
          <Avatar
            style={{
              backgroundColor: '#2563eb',
              verticalAlign: 'middle',
            }}
            size="large"
          >
            {getUserInitials()}
          </Avatar>
          <div className="hidden md:block">
            <div className="text-gray-800 font-semibold text-base hover:text-blue-600 transition-colors">
              {getUserDisplayName()}
            </div>
            <div className="text-gray-500 text-sm">
              {user?.email || 'User'}
            </div>
          </div>
        </div>

        {/* Premium Logout Button */}
        <Button
          icon={<LogoutOutlined style={{ fontSize: '18px' }} />}
          onClick={handleLogout}
          loading={loading}
          size="large"
          className="h-12 px-6 flex items-center gap-2 font-bold rounded-xl border-2 border-red-500 text-red-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:border-transparent shadow-md hover:shadow-lg hover-lift"
        >
          <span className="hidden md:inline text-base">Logout</span>
        </Button>
      </div>
    </Header>
  );
};

export default Navbar;
