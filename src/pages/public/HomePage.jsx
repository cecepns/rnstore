import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { BASE_URL, formatIDR } from "../../utils/api";
import BannerCarousel from "../../components/public/BannerCarousel";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.products.getAll();
        setFeaturedProducts(response.data.slice(0, 3)); // Get first 3 products
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      

      <BannerCarousel />

      {/* Featured Products */}
      <section className="py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Produk Unggulan
            </h2>
            <p className="text-xl text-gray-600">
              iPhone terbaru dengan teknologi terdepan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="card hover:transform hover:scale-105"
                data-aos="fade-up"
                data-aos-delay={index * 200}
              >
                <div className="w-full h-64 mb-5 border-b pb-5">
                  <img
                    src={
                      BASE_URL + product.image ||
                      "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg"
                    }
                    alt={product.name}
                    className="w-full h-full object-contain rounded-lg mb-4"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p dangerouslySetInnerHTML={{__html: product.description}} className="text-gray-600 mb-4 line-clamp-3" />
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">
                    Rp {formatIDR(product.price || 0)}
                  </span>
                  <Link to={`/product/${product.id}`} className="btn-primary">
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center" data-aos="fade-up">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Original</h3>
              <p className="text-gray-600">
                Semua produk dijamin original dengan garansi resmi
              </p>
            </div>

            <div
              className="text-center"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-16 h-16 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">
                Gratis ongkir untuk seluruh Indonesia
              </p>
            </div>

            <div
              className="text-center"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="w-16 h-16 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Customer service siap membantu kapan saja
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
