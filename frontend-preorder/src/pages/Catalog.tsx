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

const BACKEND_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const productImage = (product: Product) => {
  if (product.imageUrl) {
    return product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `${BACKEND_URL}${product.imageUrl}`;
  }

  return null;
};

const ProductCard = ({ product, canOrder, compact = false }: { product: Product; canOrder: boolean; compact?: boolean }) => {
  const { cart, addToCart, updateQuantity } = useContext(CartContext);
  const item = cart.find((cartItem) => cartItem.productId === product.id);
  const imageUrl = productImage(product);
  const closeDate = formatDate(product.poCloseDate);
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
      return <button className="min-h-9 w-full rounded-[12px] bg-white/70 px-2 text-xs font-bold text-[#8a7c82]" disabled>Detail</button>;
    }

    if (item) {
      return (
        <div className="product-qty-wrap-mobile flex min-h-9 w-full items-center gap-1 rounded-[12px] bg-white/72 p-1 shadow-sm">
          <button onClick={() => updateQuantity(product.id, item.quantity - 1)} className="product-qty-btn-mobile pressable grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#f8dce8] text-[#964261]"><Minus size={16} /></button>
          <span className="product-qty-text-mobile min-w-8 flex-1 text-center font-extrabold">{item.quantity}</span>
          <button onClick={() => updateQuantity(product.id, item.quantity + 1)} className="product-qty-btn-mobile pressable grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#f48fb1] text-white"><Plus size={16} /></button>
        </div>
      );
    }

    return (
      <button onClick={addItem} className="product-cart-btn-mobile hipud-btn pressable inline-flex min-h-9 w-full items-center justify-center gap-1.5 px-2 text-xs font-black sm:min-h-10 sm:text-sm">
        <Plus size={14} /> <span className="cart-label-mobile">Keranjang</span>
      </button>
    );
  };

  return (
    <article className="product-card-compact glass-card surface-hover group flex h-full flex-col overflow-hidden rounded-[16px]">
      <div className={`product-media-compact relative ${compact ? 'aspect-square' : 'aspect-[6/5]'} overflow-hidden bg-pink-50`}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[#fff9fb] px-5 text-center text-sm font-black text-[#8a7c82]">
            Foto menyusul
          </div>
        )}
      </div>

      <div className={`product-body-compact flex flex-1 flex-col ${compact ? 'p-2 sm:p-3' : 'p-2.5 sm:p-4'}`}>
        {!compact && (
          <div className="product-meta-mobile flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[#f8dce8]/75 px-2 py-0.5 text-[9px] font-black uppercase tracking-[.08em] text-[#964261] sm:text-[10px]">{product.category || 'Hipud Menu'}</span>
            {product.variant && <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-[#6d5963] sm:text-xs">{product.variant}</span>}
          </div>
        )}

        <h3 className={`product-title-mobile line-clamp-2 font-display font-black leading-tight text-[#3f2e35] ${compact ? 'mt-0 text-center text-[12px] sm:text-sm' : 'mt-2 text-[13px] sm:text-base'}`}>{product.name}</h3>

        {!compact && (
          <>
            <p className="product-desc-mobile mt-1 line-clamp-1 text-[11px] leading-snug text-[#8a7c82] sm:text-sm">{product.description}</p>
            <div className="product-date-mobile mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#50606e] sm:text-xs">
              {closeDate && canOrder ? <span className="rounded-full bg-[#ddefff]/80 px-2 py-0.5">Tutup PO: {closeDate}</span> : null}
              {!canOrder ? <span className="rounded-full bg-white/72 px-2 py-0.5 text-[#8a7c82]">Belum open order</span> : null}
            </div>
          </>
        )}

        <div className={`product-action-mobile mt-auto ${compact ? 'pt-2' : 'pt-2.5'}`}>
          {!compact && <p className="product-price-mobile mb-2 text-sm font-black text-[#f48fb1] sm:text-lg">Rp {Number(product.price).toLocaleString('id-ID')}</p>}
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
  }, [products, activeCategory]);

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
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-pink-100/80 pb-2 md:mb-5 md:gap-3">
        <div className="flex min-w-0 items-center gap-1.5 text-xs leading-tight text-[#8a7c82] sm:gap-2 sm:text-sm sm:leading-relaxed">
          <Sparkles className="shrink-0 text-[#f48fb1]" size={15} />
          <span className="truncate">{mode === 'orderable' ? 'Quick order menu PO.' : 'Menu Hipud.'}</span>
        </div>
        <button onClick={() => navigate('/checkout')} className="pressable relative inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-[12px] bg-white/78 px-3 text-xs font-black text-[#3f2e35] shadow-sm ring-1 ring-white/70 hover:bg-white sm:min-h-11 sm:gap-2 sm:rounded-[18px] sm:px-5 sm:text-sm">
          <ShoppingBag size={15} /> <span className="hidden min-[360px]:inline">Keranjang</span>
          {cartCount > 0 && <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-[#f48fb1] px-1.5 text-xs font-black text-white ring-2 ring-white">{cartCount}</span>}
        </button>
      </div>

      {mode === 'all' && (
        <div className="sticky top-16 z-30 -mx-2 mb-2 bg-[#fff9fb]/86 px-2 py-1.5 backdrop-blur-xl md:top-[4.75rem] lg:static lg:m-0 lg:mb-5 lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
          <div className="hipud-scrollbar flex gap-2 overflow-x-auto pb-1">
            {menuCategories.map((category) => (
              <button key={category} onClick={() => setActiveCategory(category)} className={`pressable min-h-8 whitespace-nowrap rounded-[12px] px-3 text-xs font-bold sm:min-h-10 sm:rounded-[16px] sm:px-4 sm:text-sm ${activeCategory === category ? 'bg-[#f48fb1] text-white shadow-lg shadow-pink-200' : 'glass-card text-[#6d5963] hover:bg-white'}`}>
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-100 border-t-[#f48fb1]" /></div>
      ) : displayProducts.length === 0 ? (
        <div className="rounded-[20px] bg-white/70 p-6 text-center text-sm font-bold text-[#8a7c82] sm:p-8">
          {mode === 'orderable' ? 'Belum ada menu yang sedang open order.' : 'Belum ada menu yang aktif di database.'}
        </div>
      ) : (
        <div className="catalog-grid-compact grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {displayProducts.map((product) => <ProductCard key={product.id} product={product} canOrder={orderable(product)} compact={mode === 'orderable'} />)}
        </div>
      )}

      {mode === 'orderable' && displayProducts.length > 0 && (
        <div className="mt-5 text-center">
          <button onClick={scrollToMenu} className="hipud-outline-btn min-h-11 px-5 text-sm font-black">
            Lihat detail rasa di menu utama
          </button>
        </div>
      )}

      {cartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-[20px] bg-[#3f2e35]/95 px-4 py-3 text-white shadow-2xl backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-sm font-bold">{cartCount} item - Rp {cartTotal.toLocaleString('id-ID')}</span>
            <button onClick={() => navigate('/checkout')} className="min-h-10 rounded-[14px] bg-[#f48fb1] px-4 text-sm font-bold">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
