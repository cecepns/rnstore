import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/admin/categories', name: 'Categories', icon: '📝' },
    { path: '/admin/products', name: 'Products', icon: '📱' },
    { path: '/admin/orders', name: 'Orders', icon: '🛍️' },
    { path: '/admin/banners', name: 'Banners', icon: '🖼️' },
    { path: '/admin/settings', name: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
              isActive(item.path) ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
            }`}
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            {item.name}
          </Link>
        ))}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-6 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-8"
        >
          <span className="mr-3 text-xl">🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;