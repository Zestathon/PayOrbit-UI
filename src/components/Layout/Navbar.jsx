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
        {/* Premium User Info Display */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-5 py-3 glass-card rounded-2xl cursor-pointer hover-lift shadow-md relative overflow-hidden group"
          style={{
            border: '1px solid rgba(102, 126, 234, 0.2)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(102,126,234,0.1) 100%)'
          }}
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative">
            <Avatar
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                verticalAlign: 'middle',
              }}
              size="large"
              className="shadow-lg ring-2 ring-white ring-offset-2"
            >
              {getUserInitials()}
            </Avatar>
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
          </div>

          <div className="hidden md:block relative">
            <div className="text-gray-800 font-bold text-base group-hover:text-blue-700 transition-colors">
              {getUserDisplayName()}
            </div>
            <div className="text-gray-500 text-sm font-medium">
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
