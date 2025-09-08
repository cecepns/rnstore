import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [settings, setSettings] = useState({
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    phone: '+62 812-3456-7890',
    email: 'info@iphonestore.com',
    instagram: '@iphonestore_official'
  });
  const [loading, setLoading] = useState(true);

  // Fetch settings data on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.settings.get();
        if (response.data) {
          setSettings({
            address: response.data.address || 'Jl. Sudirman No. 123, Jakarta Pusat',
            phone: response.data.phone || '+62 812-3456-7890',
            email: response.data.email || 'info@iphonestore.com',
            instagram: response.data.instagram || '@iphonestore_official'
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Keep default values if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone = (settings.phone || '').replace(/[\s+]/g, '');
    const message = `Halo, saya ${formData.name} (${formData.email}).%0A%0A${encodeURIComponent(formData.message)}`;
    const waUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(waUrl, '_blank');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600">
            Kami siap membantu Anda dengan segala pertanyaan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div data-aos="fade-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Informasi Kontak
            </h2>
            
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="ml-2 text-gray-600">Memuat informasi kontak...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Alamat</h3>
                      <p className="text-gray-600">{settings.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-secondary-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">📱</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Telepon</h3>
                      <p className="text-gray-600">{settings.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">📧</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">{settings.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-white text-xl">📷</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Instagram</h3>
                      <p className="text-gray-600">{settings.instagram}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div data-aos="fade-left">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Kirim Pesan
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Tulis pesan Anda di sini..."
                  />
                </div>
                
                <button type="submit" className="btn-primary w-full">
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;