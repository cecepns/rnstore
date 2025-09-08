import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const PublicFooter = () => {
  const [settings, setSettings] = useState({
    phone: '+62 812-3456-7890',
    email: 'info@iphonestore.com',
    address: 'Jakarta, Indonesia'
  });

  // Fetch settings data on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.settings.get();
        if (response.data) {
          setSettings({
            phone: response.data.phone || '+62 812-3456-7890',
            email: response.data.email || 'info@iphonestore.com',
            address: response.data.address || 'Jakarta, Indonesia'
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Keep default values if API fails
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-400">RN STORE</h3>
            <p className="text-gray-300">
              Toko iPhone terpercaya dengan produk original dan garansi resmi.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-primary-400 transition-colors">Home</a></li>
              <li><a href="/products" className="hover:text-primary-400 transition-colors">Products</a></li>
              <li><a href="/about" className="hover:text-primary-400 transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-primary-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📧 {settings.email}</li>
              <li>📱 {settings.phone}</li>
              <li>📍 {settings.address}</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 RN STORE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;