import { useEffect, useState } from "react";
import api, { BASE_URL } from "../../utils/api";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    title: "",
    subtitle: "",
    link_url: "",
    sort_order: 0,
    is_active: true,
    image_desktop: null,
    image_mobile: null,
    preview_desktop: "",
    preview_mobile: "",
  });

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      subtitle: "",
      link_url: "",
      sort_order: 0,
      is_active: true,
      image_desktop: null,
      image_mobile: null,
      preview_desktop: "",
      preview_mobile: "",
    });
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const loadBanners = async () => {
    try {
      const res = await api.banners.getAll();
      setBanners(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFile = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    const previewKey =
      name === "image_desktop" ? "preview_desktop" : "preview_mobile";
    setForm((prev) => ({
      ...prev,
      [name]: file,
      [previewKey]: file ? URL.createObjectURL(file) : "",
    }));
  };

  const handleEdit = (banner) => {
    setForm({
      id: banner.id,
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link_url: banner.link_url || "",
      sort_order: banner.sort_order || 0,
      is_active: !!banner.is_active,
      image_desktop: null,
      image_mobile: null,
      preview_desktop: banner.image_desktop
        ? `${BASE_URL}${banner.image_desktop}`
        : "",
      preview_mobile: banner.image_mobile
        ? `${BASE_URL}${banner.image_mobile}`
        : "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await api.banners.delete(id);
      await loadBanners();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subtitle", form.subtitle);
    fd.append("link_url", form.link_url);
    fd.append("sort_order", form.sort_order);
    fd.append("is_active", form.is_active);
    if (form.image_desktop) fd.append("image_desktop", form.image_desktop);
    if (form.image_mobile) fd.append("image_mobile", form.image_mobile);

    try {
      if (form.id) {
        await api.banners.update(form.id, fd);
      } else {
        await api.banners.create(fd);
      }
      resetForm();
      closeModal();
      await loadBanners();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banner Management</h1>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Daftar Banner</h2>
              <button className="btn-secondary" onClick={openNewModal}>
                Baru
              </button>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        Urutan
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        Judul
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        Aktif
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {banners.map((b) => (
                      <tr key={b.id}>
                        <td className="px-4 py-2">{b.sort_order}</td>
                        <td className="px-4 py-2">{b.title}</td>
                        <td className="px-4 py-2">
                          {b.is_active ? "Ya" : "Tidak"}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            onClick={() => handleEdit(b)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            onClick={() => handleDelete(b.id)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
          ></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b rounded-t-lg bg-white">
              <h2 className="text-xl font-semibold">
                {form.id ? "Edit Banner" : "Banner Baru"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjudul
                </label>
                <textarea
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  className="input-field w-full"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  name="link_url"
                  value={form.link_url}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan
                  </label>
                  <input
                    name="sort_order"
                    type="number"
                    value={form.sort_order}
                    onChange={handleChange}
                    className="input-field w-full"
                  />
                </div>
                <label className="flex items-center space-x-2 mt-6">
                  <input
                    name="is_active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  <span>Aktif</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar Desktop
                </label>
                <input
                  name="image_desktop"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                />
                {form.preview_desktop && (
                  <img
                    src={form.preview_desktop}
                    alt="desktop"
                    className="mt-2 rounded border max-h-64 w-full object-contain"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar Mobile
                </label>
                <input
                  name="image_mobile"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                />
                {form.preview_mobile && (
                  <img
                    src={form.preview_mobile}
                    alt="mobile"
                    className="mt-2 rounded border max-h-64 w-full object-contain"
                  />
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button type="submit" className="btn-primary">
                  {form.id ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
