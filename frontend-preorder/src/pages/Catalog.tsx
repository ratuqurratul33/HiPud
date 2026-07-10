import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import api from '../api/axios';
import { CartContext } from '../context/CartContext';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
  variant?: string | null;
  isActive?: boolean;
  isOrderable?: boolean;
  poOpenDate?: string | null;
  poCloseDate?: string | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const productImage = (product: Product) => {
  if (product.imageUrl) return product.imageUrl.startsWith('http') ? product.imageUrl : `https://hi-pud.vercel.app/${product.imageUrl}`;
  return null;
};

const ProductCard = ({ product, canOrder, compact = false }: { product: Product; canOrder: boolean; compact?: boolean }) => {
  const { cart, addToCart, updateQuantity } = useContext(CartContext);
  const item = cart.find((cartItem) => cartItem.productId === product.id);
  const imageUrl = productImage(product);
  const addItem = () => addToCart({
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    quantity: 1,
    imageUrl: product.imageUrl,
    category: product.category,
    variant: product.variant,
  });

  const CartControl = () => {
    if (!canOrder || product.id <= 0) {
      return <button className="rounded-[22px] bg-white/70 px-4 py-2 text-sm font-bold text-[#8a7c82]" disabled>Detail di menu</button>;
    }

    if (item) {
      return (
        <div className="flex items-center gap-2 rounded-[22px] bg-white/70 p-1 shadow-sm">
          <button onClick={() => updateQuantity(product.id, item.quantity - 1)} className="pressable grid h-9 w-9 place-items-center rounded-[18px] bg-[#f8dce8] text-[#964261]"><Minus size={16} /></button>
          <span className="min-w-8 text-center font-extrabold">{item.quantity}</span>
          <button onClick={() => updateQuantity(product.id, item.quantity + 1)} className="pressable grid h-9 w-9 place-items-center rounded-[18px] bg-[#f48fb1] text-white"><Plus size={16} /></button>
        </div>
      );
    }

    return (
      <button onClick={addItem} className="hipud-btn pressable inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold">
        <Plus size={16} /> Keranjang
      </button>
    );
  };

  if (compact) {
    return (
      <article className="glass-card surface-hover group overflow-hidden rounded-[26px]">
        <div className="relative aspect-square overflow-hidden bg-pink-50">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[#fff9fb] px-5 text-center text-sm font-black text-[#8a7c82]">
              Foto menyusul
            </div>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <h3 className="line-clamp-2 min-h-[44px] font-display text-base font-black leading-snug text-[#3f2e35]">{product.name}</h3>
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-base font-black text-[#f48fb1]">Rp {Number(product.price).toLocaleString('id-ID')}</p>
            <CartControl />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="glass-card menu-card-wide surface-hover group overflow-hidden rounded-[28px]">
      <div className="relative min-h-[230px] overflow-hidden bg-pink-50 lg:min-h-full">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[#fff9fb] px-6 text-center text-sm font-black text-[#8a7c82]">
            Gambar produk belum tersedia
          </div>
        )}
      </div>
      <div className="flex min-h-[230px] flex-col justify-between p-6 sm:p-7">
        <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-[#8a7c82]">{product.category || 'Hipud Menu'}</p>
        <h3 className="font-display text-lg font-extrabold text-[#3f2e35]">{product.name}</h3>
        {product.variant && <p className="mt-1 text-sm font-semibold text-[#964261]">{product.variant}</p>}
        <p className="mt-3 text-sm leading-relaxed text-[#8a7c82] line-clamp-2">{product.description}</p>
        {formatDate(product.poCloseDate) && canOrder && (
          <p className="mt-3 rounded-2xl bg-[#ddefff]/80 px-3 py-1 text-xs font-bold text-[#50606e]">Tutup PO: {formatDate(product.poCloseDate)}</p>
        )}
        </div>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-black text-[#f48fb1]">Rp {Number(product.price).toLocaleString('id-ID')}</p>
          <CartControl />
        </div>
      </div>
    </article>
  );
};

const Catalog = ({ mode = 'all' }: { mode?: 'all' | 'orderable' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const navigate = useNavigate();
  const { cartCount, cartTotal } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = mode === 'orderable' ? '/products?orderable=true' : '/products?target=public';
        const response = await api.get(query);
        setProducts(response.data);
      } catch (error) {
        console.error('Gagal mengambil data produk:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [mode]);

  const displayProducts = useMemo(() => {
    return products.filter((product) => activeCategory === 'Semua' || product.category === activeCategory || product.name.includes(activeCategory));
  }, [products, activeCategory, mode]);

  const menuCategories = useMemo(() => {
    const categories = products
      .map((product) => product.category || product.name)
      .filter((category): category is string => Boolean(category));
    return ['Semua', ...Array.from(new Set(categories))];
  }, [products]);

  const orderable = (product: Product) => product.isOrderable !== false && product.isActive !== false && product.id > 0;
  const scrollToMenu = () => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-pink-100/80 pb-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3 text-[#8a7c82]"><Sparkles className="shrink-0 text-[#f48fb1]" size={20} /> <span>{mode === 'orderable' ? 'Quick order: pilih dari foto dan nama, detail lengkap ada di menu utama.' : 'Pilih menu Hipud favoritmu dan cek detail rasanya.'}</span></div>
        <button onClick={() => navigate('/checkout')} className="pressable relative inline-flex items-center justify-center gap-3 rounded-[22px] bg-[#3f2e35] px-6 py-3 font-bold text-white shadow-lg hover:bg-[#55414b]">
          <ShoppingBag size={19} /> Lihat Keranjang
          {cartCount > 0 && <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-2xl bg-[#f48fb1] text-xs font-black text-white ring-2 ring-white">{cartCount}</span>}
        </button>
      </div>

      {mode === 'all' && (
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {menuCategories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className={`pressable whitespace-nowrap rounded-[18px] px-5 py-2.5 text-sm font-bold ${activeCategory === category ? 'bg-[#f48fb1] text-white shadow-lg shadow-pink-200' : 'glass-card text-[#6d5963] hover:bg-white'}`}>
              {category}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-16"><div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-100 border-t-[#f48fb1]" /></div>
      ) : displayProducts.length === 0 ? (
        <div className="rounded-[26px] bg-white/70 p-10 text-center text-[#8a7c82]">
          {mode === 'orderable' ? 'Belum ada menu yang sedang open order.' : 'Belum ada menu yang aktif di database.'}
        </div>
      ) : (
        <div className={mode === 'orderable' ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid grid-cols-1 gap-7 lg:grid-cols-2'}>
          {displayProducts.map((product) => <ProductCard key={product.id} product={product} canOrder={orderable(product)} compact={mode === 'orderable'} />)}
        </div>
      )}

      {mode === 'orderable' && displayProducts.length > 0 && (
        <div className="mt-7 text-center">
          <button onClick={scrollToMenu} className="hipud-outline-btn px-5 py-3 text-sm font-black">
            Lihat detail rasa di menu utama
          </button>
        </div>
      )}

      {cartCount > 0 && (
        <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[26px] bg-[#3f2e35]/95 px-5 py-3 text-white shadow-2xl backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold">{cartCount} item - Rp {cartTotal.toLocaleString('id-ID')}</span>
            <button onClick={() => navigate('/checkout')} className="rounded-2xl bg-[#f48fb1] px-4 py-2 text-sm font-bold">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
