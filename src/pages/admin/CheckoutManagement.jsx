import { useState, useEffect } from 'react';
import api, { formatIDR } from '../../utils/api';

const CheckoutManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (targetPage = 1) => {
    try {
      const response = await api.orders.getAll({ page: targetPage, limit: 10 });
      setOrders(response.data?.data || []);
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.orders.updateStatus(orderId, status);
      fetchOrders(page);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      try {
        await api.orders.delete(id);
        // If deleting the last item on the last page, go back a page if needed
        const isLastItemOnPage = orders.length === 1 && page > 1;
        if (isLastItemOnPage) {
          setPage(page - 1);
        } else {
          fetchOrders(page);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pesanan</h1>
        <p className="text-gray-600 mt-2">Kelola semua pesanan pelanggan</p>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Produk</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tanggal</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-600">#{order.id}</td>
                  <td className="py-3 px-4 text-gray-900">{order.customer_name}</td>
                  <td className="py-3 px-4 text-gray-600">{order.product_name}</td>
                  <td className="py-3 px-4 text-gray-900 font-semibold">
                    Rp {formatIDR(order.total_price || 0)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-none ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openOrderDetail(order)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-600">
            Menampilkan {orders.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            {` - `}
            {orders.length > 0 ? (pagination.page - 1) * pagination.limit + orders.length : 0}
            {` dari ${pagination.totalItems} pesanan`}
          </div>
          <div className="flex items-center space-x-1">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={!pagination.hasPrevPage}
            >
              «
            </button>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={!pagination.hasPrevPage}
            >
              Sebelumnya
            </button>
            {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-3 py-1 border rounded ${p === page ? 'bg-gray-900 text-white border-gray-900' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={!pagination.hasNextPage}
            >
              Selanjutnya
            </button>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Detail Pesanan #{selectedOrder.id}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Informasi Pelanggan</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Nama:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>No. HP:</strong> {selectedOrder.customer_phone}</p>
                  <p><strong>Alamat:</strong> {selectedOrder.customer_address}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Detail Produk</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Produk:</strong> {selectedOrder.product_name}</p>
                  <p><strong>Warna:</strong> {selectedOrder.product_color}</p>
                  <p><strong>Jumlah:</strong> {selectedOrder.quantity}</p>
                  <p><strong>Harga:</strong> Rp {formatIDR(selectedOrder.total_price || 0)}</p>
                </div>
              </div>
            </div>

            {selectedOrder.payment_proof && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Bukti Transfer</h3>
                <img
                  src={selectedOrder.payment_proof}
                  alt="Bukti Transfer"
                  className="w-full max-w-md rounded-lg"
                />
              </div>
            )}
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutManagement;