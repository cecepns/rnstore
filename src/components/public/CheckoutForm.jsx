import { useState, useEffect } from 'react';
import api, { formatIDR } from '../../utils/api';

/* eslint-disable react/prop-types */
const CheckoutForm = ({ product, selectedColorName, selectedColorHex, quantity, onOrderSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: ''
  });
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    phone: '+62 812-3456-7890'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.settings.get();
        if (response.data && response.data.phone) {
          setSettings({
            phone: response.data.phone
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for the order
      const formDataToSend = new FormData();
      formDataToSend.append('customer_name', formData.customer_name);
      formDataToSend.append('customer_phone', formData.customer_phone);
      formDataToSend.append('customer_address', formData.customer_address);
      formDataToSend.append('product_id', product.id);
      formDataToSend.append('product_name', product.name);
      formDataToSend.append('product_color', selectedColorName || selectedColorHex);
      formDataToSend.append('quantity', quantity);
      formDataToSend.append('total_price', product.price * quantity);

      const response = await api.orders.create(formDataToSend);
      
      if (response.data) {
        // Call success callback with order data and WhatsApp number
        onOrderSuccess({
          orderId: response.data.id,
          orderData: {
            customer_name: formData.customer_name,
            customer_phone: formData.customer_phone,
            customer_address: formData.customer_address,
            product_id: product.id,
            product_name: product.name,
            product_color: selectedColorName || selectedColorHex,
            quantity: quantity,
            total_price: product.price * quantity
          },
          whatsappNumber: settings.phone
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Formulir Pemesanan</h2>
        
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Ringkasan Pesanan</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Produk:</strong> {product.name}</p>
            <p className="flex items-center gap-2">
              <strong>Warna:</strong>
              <span>{selectedColorName || '-'}</span>
              <span
                className="inline-block w-5 h-5 rounded border border-gray-300"
                style={{ backgroundColor: selectedColorHex }}
                aria-label="Selected color"
              />
            </p>
            <p><strong>Jumlah:</strong> {quantity}</p>
            <p><strong>Total:</strong> Rp {formatIDR(totalPrice)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
              No. HP *
            </label>
            <input
              type="tel"
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label htmlFor="customer_address" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Lengkap *
            </label>
            <textarea
              id="customer_address"
              name="customer_address"
              value={formData.customer_address}
              onChange={handleChange}
              required
              rows={3}
              className="input-field resize-none"
              placeholder="Masukkan alamat lengkap untuk pengiriman"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
