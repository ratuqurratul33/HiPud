import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  CalendarDays,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';

const MENU_CATEGORIES = ['Mochi Ichigo Daifuku', 'Mochi Daifuku', 'Mochi Dubai', 'Mochi Cream', 'Mochi Ubi'];
const CATEGORY_FILTERS = ['Semua', ...MENU_CATEGORIES];

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
  variant?: string | null;
  isActive: boolean;
  isOrderable?: boolean;
  poOpenDate?: string | null;
  poCloseDate?: string | null;
}

interface ProductFormState {
  name: string;
  category: string;
  variant: string;
  description: string;
  price: string;
  imageUrl: string;
  isActive: boolean;
  isOrderable: boolean;
  poOpenDate: string;
  poCloseDate: string;
}

const emptyForm: ProductFormState = {
  name: '',
  category: MENU_CATEGORIES[0],
  variant: '',
  description: '',
  price: '',
  imageUrl: '',
  isActive: true,
  isOrderable: true,
  poOpenDate: '',
  poCloseDate: '',
};

const BACKEND_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const displayImage = (url?: string | null) => {
  if (!url) return '';

  return url.startsWith('http')
    ? url
    : `${BACKEND_URL}${url}`;
};

const dateInputValue = (value?: string | null) => {
  if (!value) return '';
  return value.slice(0, 10);
};

const formatCurrency = (value: number) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const StatusPill = ({ tone, children }: { tone: 'success' | 'muted' | 'pink' | 'warning'; children: ReactNode }) => {
  const tones = {
    success: 'bg-[#b9e5c9]/70 text-[#37684a]',
    muted: 'bg-white/75 text-[#8a7c82] border border-[#f2d6e2]',
    pink: 'bg-[#f8dce8] text-[#9d4164]',
    warning: 'bg-[#ffe8a3]/80 text-[#8b6816]',
  };

  return <span className={`admin-pill ${tones[tone]}`}>{children}</span>;
};

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProductFormState>(emptyForm);

  const token = localStorage.getItem('adminToken');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?target=admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Gagal mengambil produk:', error);
      Swal.fire({ icon: 'error', title: 'Produk gagal dimuat' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products?target=admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setProducts(response.data);
      } catch (error) {
        console.error('Gagal mengambil produk:', error);
        if (active) Swal.fire({ icon: 'error', title: 'Produk gagal dimuat' });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Semua') return products;
    return products.filter((product) => product.category === activeCategory || product.name.includes(activeCategory));
  }, [activeCategory, products]);

  const groupedCounts = useMemo(
    () =>
      CATEGORY_FILTERS.reduce((acc, category) => {
        acc[category] = category === 'Semua'
          ? products.length
          : products.filter((product) => product.category === category || product.name.includes(category)).length;
        return acc;
      }, {} as Record<string, number>),
    [products]
  );

  const productStats = useMemo(() => {
    const active = products.filter((product) => product.isActive !== false).length;
    const orderable = products.filter((product) => product.isOrderable !== false && product.isActive !== false).length;
    return { total: products.length, active, orderable };
  }, [products]);

  const resetForm = () => {
    setFormData({ ...emptyForm, category: activeCategory === 'Semua' ? MENU_CATEGORIES[0] : activeCategory });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setFormData({ ...emptyForm, category: activeCategory === 'Semua' ? MENU_CATEGORIES[0] : activeCategory });
    setIsEditing(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setFormData({
      name: product.name || '',
      category: product.category || MENU_CATEGORIES[0],
      variant: product.variant || '',
      description: product.description || '',
      price: String(product.price || ''),
      imageUrl: product.imageUrl || '',
      isActive: product.isActive !== false,
      isOrderable: product.isOrderable !== false,
      poOpenDate: dateInputValue(product.poOpenDate),
      poCloseDate: dateInputValue(product.poCloseDate),
    });
    setEditId(product.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const uploadImage = async (file: File) => {
    const body = new FormData();
    body.append('productImage', file);
    setUploading(true);

    try {
      const response = await api.post('/products/upload-image', body, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: response.data.imageUrl }));
    } catch (error) {
      console.error('Upload gambar gagal:', error);
      Swal.fire({ icon: 'error', title: 'Upload gagal', text: 'Gambar produk gagal diupload.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      poOpenDate: formData.poOpenDate || null,
      poCloseDate: formData.poCloseDate || null,
    };

    try {
      if (isEditing && editId) {
        await api.put(`/products/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire({ icon: 'success', title: 'Produk diperbarui', timer: 1300, showConfirmButton: false });
      } else {
        await api.post('/products', payload, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire({ icon: 'success', title: 'Produk ditambahkan', timer: 1300, showConfirmButton: false });
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Gagal menyimpan produk:', error);
      Swal.fire({ icon: 'error', title: 'Gagal menyimpan', text: 'Periksa kembali data produk.' });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Hapus produk?',
      text: `Produk "${name}" akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProducts();
      Swal.fire({ icon: 'success', title: 'Produk terhapus', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal menghapus', text: 'Produk mungkin sudah terhubung dengan pesanan.' });
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-soft-panel reveal-up p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {[
              ['Total produk', productStats.total],
              ['Produk aktif', productStats.active],
              ['Open order', productStats.orderable],
            ].map(([label, value]) => (
              <div key={label} className="admin-stat-chip pressable">
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={openCreate}
            className="btn-admin-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-black sm:w-auto"
          >
            <Plus size={18} />
            Tambah Produk
          </button>
        </div>
      </section>

      <section className="admin-filter-shell reveal-up p-2.5" style={{ animationDelay: '.06s' }}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-black transition active:scale-[0.98] ${
                activeCategory === category
                  ? 'bg-[#f48fb1] text-white shadow-md shadow-pink-200/70'
                  : 'bg-white/66 text-[#6d5963] hover:bg-white'
              }`}
            >
              {category}
              <span className="ml-2 rounded-md bg-white/35 px-2 py-0.5 text-[11px]">{groupedCounts[category] || 0}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="glass-admin-card reveal-up overflow-hidden" style={{ animationDelay: '.12s' }}>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#f2d6e2]/70 bg-white/45 text-[#8a7c82]">
              <tr>
                <th className="px-5 py-4 font-black">Produk</th>
                <th className="px-5 py-4 font-black">Kategori</th>
                <th className="px-5 py-4 font-black">Harga</th>
                <th className="px-5 py-4 font-black">Status</th>
                <th className="px-5 py-4 text-center font-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center font-bold text-[#8a7c82]">Memuat produk...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center font-bold text-[#8a7c82]">Belum ada produk di filter ini.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[#f2d6e2]/55 last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={displayImage(product.imageUrl)} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                        ) : (
                          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f8dce8]/70 text-[#f48fb1]">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-[#3f2e35]">{product.name}</p>
                          <p className="line-clamp-2 max-w-sm text-xs font-medium text-[#8a7c82]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-[#3f2e35]">{product.category || '-'}</p>
                      <p className="text-xs font-bold text-[#8a7c82]">{product.variant || 'Tanpa variant'}</p>
                    </td>
                    <td className="px-5 py-4 font-black text-[#f48fb1]">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {product.isActive ? <StatusPill tone="success">Aktif</StatusPill> : <StatusPill tone="muted">Tidak Aktif</StatusPill>}
                        {product.isOrderable !== false ? <StatusPill tone="pink">Bisa Dipesan</StatusPill> : <StatusPill tone="warning">Belum PO</StatusPill>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(product)} className="admin-icon-button bg-[#fff6df] text-[#9a721c]" aria-label="Edit produk">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="admin-icon-button bg-[#ffe8e8] text-[#b75161]" aria-label="Hapus produk">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 lg:hidden">
          {loading ? (
            <p className="py-10 text-center font-bold text-[#8a7c82]">Memuat produk...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="py-10 text-center font-bold text-[#8a7c82]">Belum ada produk di filter ini.</p>
          ) : (
            filteredProducts.map((product) => (
              <article key={product.id} className="rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                <div className="flex gap-3">
                  {product.imageUrl ? (
                    <img src={displayImage(product.imageUrl)} alt={product.name} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#f8dce8]/70 text-[#f48fb1]">
                      <ImageIcon size={22} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-[#3f2e35]">{product.name}</p>
                    <p className="text-xs font-bold text-[#8a7c82]">{product.category || '-'}{product.variant ? ` - ${product.variant}` : ''}</p>
                    <p className="mt-2 font-black text-[#f48fb1]">{formatCurrency(product.price)}</p>
                  </div>
                </div>
                <p className="line-clamp-2 mt-3 text-sm leading-relaxed text-[#8a7c82]">{product.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.isActive ? <StatusPill tone="success">Aktif</StatusPill> : <StatusPill tone="muted">Tidak Aktif</StatusPill>}
                  {product.isOrderable !== false ? <StatusPill tone="pink">Bisa Dipesan</StatusPill> : <StatusPill tone="warning">Belum PO</StatusPill>}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(product)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#fff6df] px-4 py-2.5 text-sm font-black text-[#9a721c]">
                    <Pencil size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#ffe8e8] px-4 py-2.5 text-sm font-black text-[#b75161]">
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#3f2e35]/28 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="glass-admin-card flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-b-none sm:rounded-[24px]">
            <div className="flex items-start justify-between gap-4 border-b border-[#f2d6e2]/70 px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-black text-[#3f2e35]">{isEditing ? 'Edit Produk' : 'Tambah Produk'}</h3>
                <p className="text-sm font-medium text-[#8a7c82]">Untuk produk open order, isi rentang pemesanan. Tanggal ready otomatis H+1.</p>
              </div>
              <button onClick={resetForm} className="admin-icon-button bg-white/70 text-[#8a7c82]" aria-label="Tutup form">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="admin-label">Nama produk</label>
                  <input className="admin-soft-input mt-2" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Kategori</label>
                  <select className="admin-soft-input mt-2" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    {MENU_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label className="admin-label">Variant</label>
                  <input className="admin-soft-input mt-2" required placeholder="Contoh: Strawberry Fresh" value={formData.variant} onChange={(e) => setFormData({ ...formData, variant: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Harga</label>
                  <input type="number" min="0" className="admin-soft-input mt-2" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Tanggal mulai pemesanan</label>
                  <div className="relative mt-2">
                    <input type="date" className="admin-soft-input pr-11" value={formData.poOpenDate} onChange={(e) => setFormData({ ...formData, poOpenDate: e.target.value })} />
                    <CalendarDays size={18} className="absolute right-4 top-3.5 text-[#8a7c82]" />
                  </div>
                </div>
                <div>
                  <label className="admin-label">Tanggal akhir pemesanan</label>
                  <div className="relative mt-2">
                    <input type="date" className="admin-soft-input pr-11" value={formData.poCloseDate} onChange={(e) => setFormData({ ...formData, poCloseDate: e.target.value })} />
                    <CalendarDays size={18} className="absolute right-4 top-3.5 text-[#8a7c82]" />
                  </div>
                </div>
                <div>
                  <label className="admin-label">Upload gambar produk</label>
                  <label className="mt-2 flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#f2d6e2] bg-white/56 p-4 text-center transition hover:border-[#f48fb1] hover:bg-white/70">
                    {formData.imageUrl ? (
                      <img src={displayImage(formData.imageUrl)} alt="Preview produk" className="h-28 w-28 rounded-2xl object-cover shadow-sm" />
                    ) : (
                      <>
                        <UploadCloud size={28} className="text-[#f48fb1]" />
                        <span className="mt-2 text-sm font-black text-[#3f2e35]">Upload gambar produk</span>
                        <span className="mt-1 text-xs font-bold text-[#8a7c82]">JPG/PNG maksimal 5MB</span>
                      </>
                    )}
                    <input type="file" accept="image/png,image/jpeg,image/jpg" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                  </label>
                  <p className="mt-2 text-xs font-bold text-[#8a7c82]">{uploading ? 'Mengupload gambar...' : formData.imageUrl ? 'Preview gambar siap digunakan.' : 'Gunakan gambar produk asli agar mudah dicek.'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="admin-label">Deskripsi</label>
                  <textarea className="admin-soft-input mt-2 min-h-[110px]" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <label className="flex items-start gap-3 rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="mt-1 accent-[#f48fb1]" />
                  <span>
                    <span className="block font-black text-[#3f2e35]">Status tampil</span>
                    <span className="text-sm font-medium text-[#8a7c82]">Aktifkan agar produk muncul di katalog pembeli.</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                  <input type="checkbox" checked={formData.isOrderable} onChange={(e) => setFormData({ ...formData, isOrderable: e.target.checked })} className="mt-1 accent-[#f48fb1]" />
                  <span>
                    <span className="block font-black text-[#3f2e35]">Status bisa dipesan</span>
                    <span className="text-sm font-medium text-[#8a7c82]">Aktifkan agar produk bisa masuk keranjang PO.</span>
                  </span>
                </label>
              </div>

              <div className="sticky bottom-0 mt-5 flex flex-col-reverse gap-3 border-t border-[#f2d6e2]/70 bg-white/75 px-0 py-4 backdrop-blur sm:flex-row sm:justify-end">
                <button type="button" onClick={resetForm} className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#8a7c82]">
                  Batal
                </button>
                <button className="btn-admin-primary px-5 py-3 text-sm font-black">
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
