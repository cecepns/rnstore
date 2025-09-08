import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api, { BASE_URL, formatIDR } from "../../utils/api";
import CheckoutForm from "../../components/public/CheckoutForm";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [settings, setSettings] = useState({
    phone: '+62 812-3456-7890'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.products.getById(id);
        const productData = response.data;
        setProduct(productData);

        // Set default selected color and image
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0].color);
          setSelectedImage(productData.colors[0].image);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await api.settings.get();
        if (response.data && response.data.phone) {
          setSettings({
            phone: response.data.phone
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchProduct();
    fetchSettings();
  }, [id]);

  const handleColorSelect = (color, image) => {
    setSelectedColor(color);
    setSelectedImage(image);
  };

  const handleBuyNow = () => {
    setShowCheckoutForm(true);
  };

  const handleOrderSuccess = (orderInfo) => {
    setOrderSuccess(orderInfo);
    setShowCheckoutForm(false);
  };

  const handleCancelCheckout = () => {
    setShowCheckoutForm(false);
  };

  const handleWhatsAppRedirect = () => {
    if (!orderSuccess) return;

    const { orderData, whatsappNumber } = orderSuccess;
    
    // Format WhatsApp number (remove spaces and + if present)
    const cleanNumber = whatsappNumber.replace(/[\s+]/g, '');
    
    const message = `Halo, saya ingin konfirmasi pembayaran untuk pesanan:\n\n` +
      `📱 Produk: ${orderData.product_name}\n` +
      `🎨 Warna: ${orderData.product_color}\n` +
      `📦 Jumlah: ${orderData.quantity}\n` +
      `💰 Total: Rp ${formatIDR(orderData.total_price)}\n\n` +
      `Mohon konfirmasi rekening tujuan dan kirim bukti transfer. Terima kasih!`;

    window.open(
      `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleOrderViaWhatsApp = () => {
    const message = `Halo, saya ingin memesan:\n\n${
      product.name
    }\nWarna: ${selectedColor}\nJumlah: ${quantity}\nHarga: Rp ${formatIDR(
      product.price * quantity
    )}\n\nTerima kasih!`;

    // Format WhatsApp number (remove spaces and + if present)
    const cleanNumber = settings.phone.replace(/[\s+]/g, '');

    window.open(
      `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Produk Tidak Ditemukan
          </h2>
          <Link to="/products" className="btn-primary">
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div data-aos="fade-right">
            <img
              src={
                BASE_URL + selectedImage ||
                product.image ||
                "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg"
              }
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />

            {/* Color Options */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Pilih Warna:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((colorOption, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleColorSelect(colorOption.color, colorOption.image)
                      }
                      style={{backgroundColor: colorOption.color}}
                      className={`px-4 w-14 h-14 rounded-full py-2 rounded-lg border-2 transition-all bg-[${colorOption.color}]`}
                    >
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div data-aos="fade-left">
            <nav className="mb-6">
              <Link
                to="/products"
                className="text-primary-600 hover:text-primary-700"
              >
                ← Kembali ke Produk
              </Link>
            </nav>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-primary-600 mb-6">
              Rp {formatIDR(product.price || 0)}
            </div>

            <div className="prose prose-lg mb-8">
              <p
                dangerouslySetInnerHTML={{ __html: product.description }}
                className="text-gray-600"
              />
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Spesifikasi:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-600">
                    {product.specifications}
                  </pre>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah:
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-8">
              <div className="text-xl font-semibold text-gray-900">
                Total: Rp {formatIDR(product.price * quantity)}
              </div>
            </div>

            {/* Order Buttons */}
            <div className="space-y-3">
              {!orderSuccess ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="btn-primary w-full text-lg"
                  >
                    Beli Sekarang
                  </button>
                  <button
                    onClick={handleOrderViaWhatsApp}
                    className="w-full text-lg px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Pesan via WhatsApp
                  </button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <h3 className="font-semibold text-green-800">Pesanan Berhasil Dibuat!</h3>
                    </div>
                    <p className="text-green-700 text-sm">
                      Pesanan Anda telah disimpan dengan ID: #{orderSuccess.orderId}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleWhatsAppRedirect}
                    className="btn-primary w-full text-lg"
                  >
                    Konfirmasi Pembayaran via WhatsApp
                  </button>
                  
                  <button
                    onClick={() => setOrderSuccess(null)}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Buat Pesanan Baru
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <CheckoutForm
          product={product}
          selectedColor={selectedColor}
          quantity={quantity}
          onOrderSuccess={handleOrderSuccess}
          onCancel={handleCancelCheckout}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
