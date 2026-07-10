import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, MapPin, MessageSquareText, PackageCheck, ShoppingBag, Store, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api/axios';

interface ProductSummary {
  id: number;
  name: string;
  category?: string | null;
  variant?: string | null;
  isActive: boolean;
  isOrderable?: boolean;
}

interface OrderSummary {
  id: number;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  proofImage?: string | null;
  createdAt: string;
}

interface ReviewSummary {
  id: number;
  customerName: string;
  isAnonymous?: boolean;
  rating: number;
  comment: string;
  isPublished: boolean;
  createdAt: string;
}

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  pendingPaymentOrders: number;
  pendingVerificationOrders: number;
  totalCustomers: number;
  totalReviews: number;
  pendingReviews: number;
  totalRevenue: number;
  recentOrders: OrderSummary[];
  activeProducts: ProductSummary[];
  recentPendingReviews: ReviewSummary[];
}

const emptyDashboard: DashboardData = {
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  pendingPaymentOrders: 0,
  pendingVerificationOrders: 0,
  totalCustomers: 0,
  totalReviews: 0,
  pendingReviews: 0,
  totalRevenue: 0,
  recentOrders: [],
  activeProducts: [],
  recentPendingReviews: [],
};

const productionPickupLocation = 'Komplek Duta Family C3, Parakanmuncang';
const openStandLocation = 'Kencana, Jl. Teratai Raya Blok 9, depan Soto Rawon Kencana';

const formatCurrency = (value: number) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const statusLabel = (status: string, proofImage?: string | null) => {
  if (status === 'PENDING') return proofImage ? 'Menunggu Verifikasi' : 'Menunggu Pembayaran';
  const labels: Record<string, string> = {
    DIPROSES: 'Diproses',
    SELESAI: 'Selesai',
    DIBATALKAN: 'Dibatalkan',
  };
  return labels[status] || status;
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);

  useEffect(() => {
    let active = true;

    const fetchDashboard = async () => {
      const token = localStorage.getItem('adminToken');

      try {
        setLoading(true);
        const response = await api.get('/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setDashboard({ ...emptyDashboard, ...response.data.data });
      } catch (error: unknown) {
        const status = typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

        if (status === 401) {
          localStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminSessionUnlocked');
          Swal.fire({
            icon: 'error',
            title: 'Sesi Berakhir',
            text: 'Silakan login kembali.',
            buttonsStyling: false,
            customClass: { confirmButton: 'btn-admin-primary px-5 py-2.5 font-black' },
          });
          navigate('/admin/login');
          return;
        }

        Swal.fire({
          icon: 'error',
          title: 'Dashboard gagal dimuat',
          text: 'Periksa koneksi backend lalu coba lagi.',
          buttonsStyling: false,
          customClass: { confirmButton: 'btn-admin-primary px-5 py-2.5 font-black' },
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      active = false;
    };
  }, [navigate]);

  const stats = useMemo(
    () => [
      {
        title: 'Total Produk',
        value: dashboard.totalProducts,
        note: `${dashboard.activeProducts.length} aktif PO ditampilkan`,
        icon: PackageCheck,
        color: 'bg-[#ddefff] text-[#4f6c86]',
      },
      {
        title: 'Pesanan Masuk',
        value: dashboard.totalOrders,
        note: `${formatCurrency(dashboard.totalRevenue)} omzet terkonfirmasi`,
        icon: ShoppingBag,
        color: 'bg-[#f8dce8] text-[#b94c75]',
      },
      {
        title: 'Menunggu Verifikasi',
        value: dashboard.pendingVerificationOrders,
        note: `${dashboard.pendingPaymentOrders} belum upload bukti`,
        icon: WalletCards,
        color: 'bg-[#ffe8a3] text-[#8b6816]',
      },
      {
        title: 'Total Review',
        value: dashboard.totalReviews,
        note: `${dashboard.pendingReviews} perlu moderasi`,
        icon: MessageSquareText,
        color: 'bg-[#b9e5c9] text-[#37684a]',
      },
    ],
    [dashboard]
  );

  if (loading) {
    return (
      <div className="glass-admin-card grid min-h-[360px] place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#f8dce8] border-t-[#f48fb1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.title} className="glass-admin-card surface-hover p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-[#8a7c82]">{stat.title}</p>
                  <p className="mt-3 text-2xl font-black text-[#3f2e35]">{stat.value}</p>
                </div>
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>
              <p className="mt-3 text-xs font-bold text-[#8a7c82]">{stat.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="glass-admin-card surface-hover p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#f8dce8] text-[#b94c75]">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-base font-black text-[#3f2e35]">Jadwal PO & Danus</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-[#8a7c82]">
                Online order mengikuti batch produk yang aktif di Kelola Produk. Untuk pickup pribadi arahkan pelanggan ke rumah produksi, atau Stand Kencana maksimal jam 8 pagi.
              </p>
              <p className="mt-4 inline-flex items-start gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm font-black text-[#6d5963]">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[#f48fb1]" />
                {productionPickupLocation}
              </p>
            </div>
          </div>
        </article>

        <article className="glass-admin-card surface-hover p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[#ddefff] text-[#4f6c86]">
              <Store size={22} />
            </div>
            <div>
              <p className="text-base font-black text-[#3f2e35]">Jadwal Open Stand</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-[#8a7c82]">
                Setiap Minggu pagi pukul 06.30-08.30 WIB.
              </p>
              <p className="mt-4 inline-flex items-start gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm font-black text-[#6d5963]">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[#f48fb1]" />
                {openStandLocation}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="glass-admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-black text-[#3f2e35]">Pesanan Terbaru</h2>
            <Clock3 size={18} className="text-[#f48fb1]" />
          </div>
          <div className="space-y-3">
            {dashboard.recentOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-[#f2d6e2]/70 bg-white/58 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#3f2e35]">{order.invoiceNumber}</p>
                    <p className="truncate text-xs font-bold text-[#8a7c82]">{order.customerName}</p>
                  </div>
                  <span className="admin-pill bg-[#fff3c5] text-[#8b6816]">{statusLabel(order.status, order.proofImage)}</span>
                </div>
                <p className="mt-2 text-sm font-black text-[#f48fb1]">{formatCurrency(order.totalAmount)}</p>
              </div>
            ))}
            {dashboard.recentOrders.length === 0 && <p className="py-8 text-center text-sm font-bold text-[#8a7c82]">Belum ada pesanan.</p>}
          </div>
        </div>

        <div className="glass-admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-black text-[#3f2e35]">Produk Aktif PO</h2>
            <PackageCheck size={18} className="text-[#f48fb1]" />
          </div>
          <div className="space-y-3">
            {dashboard.activeProducts.map((product) => (
              <div key={product.id} className="rounded-2xl border border-[#f2d6e2]/70 bg-white/58 p-3">
                <p className="text-sm font-black text-[#3f2e35]">{product.name}</p>
                <p className="mt-1 text-xs font-bold text-[#8a7c82]">{product.category || 'Menu Hi Pud'}{product.variant ? ` - ${product.variant}` : ''}</p>
              </div>
            ))}
            {dashboard.activeProducts.length === 0 && (
              <p className="py-8 text-center text-sm font-bold text-[#8a7c82]">Belum ada produk aktif PO.</p>
            )}
          </div>
        </div>

        <div className="glass-admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-black text-[#3f2e35]">Review Pending</h2>
            <MessageSquareText size={18} className="text-[#f48fb1]" />
          </div>
          <div className="space-y-3">
            {dashboard.recentPendingReviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-[#f2d6e2]/70 bg-white/58 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-[#3f2e35]">{review.isAnonymous ? 'Anonymous' : review.customerName}</p>
                  <span className="text-xs font-black text-[#f48fb1]">{review.rating}/5</span>
                </div>
                <p className="line-clamp-2 mt-2 text-xs font-medium leading-relaxed text-[#8a7c82]">{review.comment}</p>
              </div>
            ))}
            {dashboard.recentPendingReviews.length === 0 && (
              <p className="py-8 text-center text-sm font-bold text-[#8a7c82]">Tidak ada review pending.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;
