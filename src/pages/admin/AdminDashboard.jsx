import { useState, useEffect } from 'react';
import api, { formatIDR } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, ordersRes, categoriesRes] = await Promise.all([
          api.products.getAll(),
          api.orders.getAll({ page: 1, limit: 1000 }),
          api.categories.getAll()
        ]);

        const ordersPayload = ordersRes.data;
        const orders = Array.isArray(ordersPayload) ? ordersPayload : (ordersPayload?.data || []);
        const totalOrders = Array.isArray(ordersPayload)
          ? ordersPayload.length
          : (ordersPayload?.pagination?.totalItems ?? orders.length);

        setStats({
          totalProducts: productsRes.data.length,
          totalOrders,
          totalCategories: categoriesRes.data.length,
          pendingOrders: orders.filter(order => order.status === 'pending').length
        });
        
        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Produk', value: stats.totalProducts, icon: '📱', color: 'bg-blue-500' },
    { title: 'Total Pesanan', value: stats.totalOrders, icon: '🛍️', color: 'bg-green-500' },
    { title: 'Kategori', value: stats.totalCategories, icon: '📝', color: 'bg-purple-500' },
    { title: 'Pesanan Pending', value: stats.pendingOrders, icon: '⏱️', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Selamat datang di panel admin RN STORE</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Pesanan Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Produk</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-600">#{order.id}</td>
                  <td className="py-3 px-4 text-gray-900">{order.customer_name}</td>
                  <td className="py-3 px-4 text-gray-600">{order.product_name}</td>
                  <td className="py-3 px-4 text-gray-900 font-semibold">
                    Rp {formatIDR(order.total_price || 0)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;