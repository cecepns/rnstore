import { useState, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api, { BASE_URL, formatIDR } from '../../utils/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    specifications: '',
    price: '',
    category_id: '',
    colors: [{ name: '', color: '#000000', image: null }]
  });
  const [showColorPicker, setShowColorPicker] = useState({});

  // Quill configuration for description
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'link'
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.products.getAll();
      setProducts(response.data);
      setPage(1);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.categories.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addColorVariant = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: '', color: '#000000', image: null }]
    }));
  };

  const removeColorVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const updateColorValue = (index, color) => {
    setFormData((prev) => {
      const newColors = [...prev.colors];
      newColors[index] = { ...newColors[index], color };
      return { ...prev, colors: newColors };
    });
  };

  const updateColorName = (index, name) => {
    setFormData((prev) => {
      const newColors = [...prev.colors];
      newColors[index] = { ...newColors[index], name };
      return { ...prev, colors: newColors };
    });
  };

  const updateColorImage = (index, file) => {
    setFormData((prev) => {
      const newColors = [...prev.colors];
      newColors[index] = { ...newColors[index], image: file };
      return { ...prev, colors: newColors };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('specifications', formData.specifications);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category_id', formData.category_id);
    
    // Add color data (include name and hex)
    formDataToSend.append('colors', JSON.stringify(formData.colors.map(c => ({ name: c.name || '', color: c.color }))));
    
    // Add images
    formData.colors.forEach((colorVariant, index) => {
      if (colorVariant.image) {
        formDataToSend.append(`color_image_${index}`, colorVariant.image);
      }
    });

    try {
      if (editingProduct) {
        await api.products.update(editingProduct.id, formDataToSend);
      } else {
        await api.products.create(formDataToSend);
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      specifications: product.specifications || '',
      price: product.price,
      category_id: product.category_id,
      colors: (product.colors || [{ color: '#000000', image: null }]).map((c) => ({
        name: c.name || '',
        color: c.color,
        image: c.image || null
      }))
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await api.products.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      specifications: '',
      price: '',
      category_id: '',
      colors: [{ name: '', color: '#000000', image: null }]
    });
    setEditingProduct(null);
    setShowForm(false);
    setShowColorPicker({});
  };

  const isAnyPickerOpen = Object.values(showColorPicker).some(Boolean);
  const totalPages = Math.max(1, Math.ceil(products.length / limit));
  const currentStartIndex = (page - 1) * limit;
  const displayedProducts = products.slice(currentStartIndex, currentStartIndex + limit);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Produk</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          Tambah Produk
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            {isAnyPickerOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowColorPicker({})}
              />
            )}
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                    required
                    className="input-field"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <div className="rounded-lg">
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spesifikasi
                </label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) => setFormData((prev) => ({ ...prev, specifications: e.target.value }))}
                  placeholder="Masukkan spesifikasi produk (contoh: Layar 6.1 inch, RAM 4GB, Storage 128GB, Kamera 12MP, dll.)"
                  required
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Color Variants */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Varian Warna
                  </label>
                  <button
                    type="button"
                    onClick={addColorVariant}
                    className="btn-secondary text-sm"
                  >
                    Tambah Warna
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.colors.map((colorVariant, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Warna {index + 1}</h4>
                        {formData.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeColorVariant(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Warna
                          </label>
                          <input
                            type="text"
                            value={colorVariant.name}
                            onChange={(e) => updateColorName(index, e.target.value)}
                            placeholder="Misal: Biru, Midnight, Starlight"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Warna
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowColorPicker((prev) => ({
                                ...prev,
                                [index]: !prev[index]
                              }))}
                              className="w-full h-10 rounded border border-gray-300 flex items-center px-3"
                              style={{ backgroundColor: colorVariant.color }}
                            >
                            </button>
                            
                            {showColorPicker[index] && (
                              <div className="absolute z-50 mt-2">
                                <ChromePicker
                                  color={colorVariant.color}
                                  onChange={(color) => updateColorValue(index, color.hex)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gambar Produk
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateColorImage(index, e.target.files[0])}
                            className="input-field"
                          />
                          {/* Image Preview */}
                          {colorVariant.image && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 mb-1">Preview:</p>
                              <img
                                src={typeof colorVariant.image === 'string' 
                                  ? `${BASE_URL}${colorVariant.image}` 
                                  : URL.createObjectURL(colorVariant.image)
                                }
                                alt={`Color ${index + 1} preview`}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <div className="text-sm text-gray-600">
              Menampilkan {products.length === 0 ? 0 : currentStartIndex + 1}
              -{Math.min(currentStartIndex + limit, products.length)} dari {products.length} produk
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per halaman:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
                className="input-field w-24"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Gambar</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Harga</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product, index) => (
                <tr key={product.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-600">#{currentStartIndex + index + 1}</td>
                  <td className="py-3 px-4">
                    <img
                      src={`${BASE_URL}${product.image}` || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-semibold">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600">{product.category_name}</td>
                  <td className="py-3 px-4 text-gray-900 font-semibold">
                    Rp {formatIDR(product.price || 0)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
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
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;