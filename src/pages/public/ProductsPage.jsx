import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { BASE_URL, formatIDR } from "../../utils/api";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.products.getAll(),
          api.categories.getAll(),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category_id == selectedCategory)
    : products;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / limit));
  const currentStartIndex = (page - 1) * limit;
  const displayedProducts = filteredProducts.slice(currentStartIndex, currentStartIndex + limit);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Produk Kami</h1>
          <p className="text-xl text-gray-600">
            Jelajahi koleksi iPhone terlengkap
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-6 py-3 rounded-lg transition-all ${
                selectedCategory === ""
                  ? "bg-primary-500 text-white"
                  : "bg-white text-gray-600 hover:bg-primary-50 border border-gray-300"
              }`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary-500 text-white"
                    : "bg-white text-gray-600 hover:bg-primary-50 border border-gray-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div className="text-sm text-gray-600">
            Menampilkan {filteredProducts.length === 0 ? 0 : currentStartIndex + 1}
            -{Math.min(currentStartIndex + limit, filteredProducts.length)} dari {filteredProducts.length} produk
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Per halaman:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
              className="input-field w-24"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProducts.map((product, index) => (
            <div
              key={product.id}
              className="card hover:transform hover:scale-105"
              data-aos="fade-up"
              data-aos-delay={index * 100}
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
              <p
                dangerouslySetInnerHTML={{ __html: product.description }}
                className="text-gray-600 mb-4 line-clamp-3"
              />
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12" data-aos="fade-up">
            <p className="text-xl text-gray-600">Tidak ada produk ditemukan.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-8">
            <div className="text-sm text-gray-600">Halaman {page} dari {totalPages}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className={`px-3 py-1 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 hover:bg-gray-50 border-gray-300'}`}
              >
                « Pertama
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 hover:bg-gray-50 border-gray-300'}`}
              >
                ‹ Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 hover:bg-gray-50 border-gray-300'}`}
              >
                Berikutnya ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 hover:bg-gray-50 border-gray-300'}`}
              >
                Terakhir »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
