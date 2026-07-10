import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle,
  Eye,
  MapPin,
  Package,
  Phone,
  Receipt,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios';

interface OrderItem {
  id: number;
  product: {
    name: string;
    price?: number;
  };
  quantity: number;
  price: number;
  subtotal?: number;
}

interface Order {
  id: number;
  invoiceNumber: string;
  customerName: string;
  whatsappNumber: string;
  address: string;
  pickupMethod?: string | null;
  pickupDate?: string | null;
  pickupTime?: string | null;
  pickupLocation?: string | null;
  faculty?: string | null;
  notes?: string | null;
  totalAmount: number;
  dpAmount?: number;
  status: 'PENDING' | 'DIPROSES' | 'SELESAI' | 'DIBATALKAN';
  proofImage: string | null;
  createdAt: string;
  items: OrderItem[];
}

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'awaiting_payment', label: 'Menunggu Pembayaran' },
  { key: 'awaiting_verification', label: 'Menunggu Verifikasi' },
  { key: 'confirmed', label: 'Diproses' },
  { key: 'done', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

const STATUS_OPTIONS: Array<{ value: Order['status']; label: string }> = [
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'DIPROSES', label: 'Diproses' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DIBATALKAN', label: 'Dibatalkan' },
];

// PERBAIKAN BUG NaN: Dibuat kebal terhadap nilai kosong atau bukan angka
const formatCurrency = (value: any) => {
  const safeNum = Number(value);
  return `Rp ${isNaN(safeNum) ? 0 : safeNum.toLocaleString('id-ID')}`;
};

const BACKEND_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fullImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) return '';

  return imageUrl.startsWith('http')
    ? imageUrl
    : `${BACKEND_URL}${imageUrl}`;
};

const orderPaymentStatus = (order: Order) => {
  if (order.status === 'DIBATALKAN') return 'Dibatalkan';
  if (order.status === 'SELESAI' || order.status === 'DIPROSES') return 'Terverifikasi';
  return order.proofImage ? 'Menunggu Verifikasi' : 'Menunggu Pembayaran';
};

const orderStatusLabel = (status: Order['status']) => {
  const labels = {
    PENDING: 'Menunggu',
    DIPROSES: 'Diproses',
    SELESAI: 'Selesai',
    DIBATALKAN: 'Dibatalkan',
  };
  return labels[status];
};

const pickupMethodLabel = (method?: string | null) => {
  if (method === 'danus') return 'Danus';
  return 'Pribadi';
};

const pillClass = (tone: 'pink' | 'warning' | 'success' | 'danger' | 'blue' | 'muted') => {
  const tones = {
    pink: 'bg-[#f8dce8] text-[#9d4164]',
    warning: 'bg-[#ffe8a3]/80 text-[#8b6816]',
    success: 'bg-[#b9e5c9]/70 text-[#37684a]',
    danger: 'bg-[#f7a8a8]/55 text-[#9c3d45]',
    blue: 'bg-[#ddefff] text-[#4f6c86]',
    muted: 'bg-white/75 text-[#8a7c82] border border-[#f2d6e2]',
  };
  return tones[tone];
};

const statusTone = (status: Order['status']) => {
  if (status === 'PENDING') return 'warning';
  if (status === 'DIPROSES') return 'blue';
  if (status === 'SELESAI') return 'success';
  return 'danger';
};

const paymentTone = (status: string) => {
  if (status === 'Menunggu Pembayaran') return 'muted';
  if (status === 'Menunggu Verifikasi') return 'warning';
  if (status === 'Dibatalkan') return 'danger';
  return 'success';
};

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Order['status']>('PENDING');

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await api.get('/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setOrders(response.data);
      } catch (error) {
        console.error('Gagal mengambil data pesanan:', error);
        if (active) Swal.fire({ icon: 'error', title: 'Pesanan gagal dimuat' });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedOrder) setSelectedStatus(selectedOrder.status);
  }, [selectedOrder]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        activeFilter === 'all' ||
        (activeFilter === 'awaiting_payment' && order.status === 'PENDING' && !order.proofImage) ||
        (activeFilter === 'awaiting_verification' && order.status === 'PENDING' && Boolean(order.proofImage)) ||
        (activeFilter === 'confirmed' && order.status === 'DIPROSES') ||
        (activeFilter === 'done' && order.status === 'SELESAI') ||
        (activeFilter === 'cancelled' && order.status === 'DIBATALKAN');

      return matchesStatus;
    });
  }, [orders, activeFilter]);

  const filterCounts = useMemo(
    () =>
      FILTERS.reduce((acc, filter) => {
        acc[filter.key] = filter.key === 'all' ? orders.length : orders.filter((order) => {
          if (filter.key === 'awaiting_payment') return order.status === 'PENDING' && !order.proofImage;
          if (filter.key === 'awaiting_verification') return order.status === 'PENDING' && Boolean(order.proofImage);
          if (filter.key === 'confirmed') return order.status === 'DIPROSES';
          if (filter.key === 'done') return order.status === 'SELESAI';
          if (filter.key === 'cancelled') return order.status === 'DIBATALKAN';
          return false;
        }).length;
        return acc;
      }, {} as Record<string, number>),
    [orders]
  );

  const orderStats = useMemo(() => {
    const revenue = orders
      .filter((order) => order.status !== 'DIBATALKAN')
      .reduce((total, order) => total + Number(order.totalAmount || 0), 0);
    return {
      total: orders.length,
      verification: filterCounts.awaiting_verification || 0,
      processing: filterCounts.confirmed || 0,
      revenue,
    };
  }, [filterCounts, orders]);

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status'], invoice: string) => {
    const token = localStorage.getItem('adminToken');
    const result = await Swal.fire({
      title: 'Ubah status pesanan?',
      text: `Invoice ${invoice} akan menjadi ${orderStatusLabel(newStatus)}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, ubah',
      cancelButtonText: 'Batal',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn-admin-primary px-5 py-2.5 font-black ml-2',
        cancelButton: 'rounded-full bg-white px-5 py-2.5 font-black text-[#8a7c82]',
      },
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedOrder = response.data.data as Order;
      setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
      setSelectedOrder(updatedOrder);
      Swal.fire({ icon: 'success', title: 'Status diperbarui', timer: 1200, showConfirmButton: false });
    } catch (error) {
      console.error('Gagal update status:', error);
      Swal.fire({ icon: 'error', title: 'Gagal memperbarui status' });
    }
  };

  const handleViewProof = (imageUrl: string | null) => {
    if (!imageUrl) {
      Swal.fire({ icon: 'info', title: 'Belum ada bukti', text: 'Pelanggan belum mengunggah bukti pembayaran.' });
      return;
    }

    Swal.fire({
      title: 'Bukti Pembayaran',
      imageUrl: fullImageUrl(imageUrl),
      imageAlt: 'Bukti pembayaran',
      confirmButtonText: 'Tutup',
      buttonsStyling: false,
      customClass: {
        image: 'rounded-xl max-h-[70vh] object-contain shadow-md',
        confirmButton: 'btn-admin-primary px-5 py-2.5 font-black',
      },
    });
  };

  // LOGIKA BARU: Pesan WA Otomatis Sesuai Status Pesanan
  const handleAutoWhatsApp = (order: Order) => {
    const dpVal = Number(order.dpAmount) || Number(order.totalAmount) / 2;
    let message = `Halo Kak ${order.customerName}, ini admin dari *Hi Pud*.\n\nMengenai pesanan dengan Invoice: *${order.invoiceNumber}*\n\n`;

    if (order.status === 'PENDING' && !order.proofImage) {
      message += `Kami melihat kakak belum menyelesaikan pembayaran DP sebesar *${formatCurrency(dpVal)}*. Silakan lakukan pembayaran agar pesanannya bisa segera kami proses ya Kak! Terima kasih. 🙏`;
    } else if (order.status === 'PENDING' && order.proofImage) {
      message += `Terima kasih ya Kak, bukti pembayaran DP-nya sudah kami terima dan sedang diverifikasi. Mohon ditunggu update selanjutnya! 😊`;
    } else if (order.status === 'DIPROSES') {
      message += `Pesanan Kakak sudah kami verifikasi dan saat ini sedang *DIPROSES*. Pesanan akan siap pada tanggal ${order.pickupDate ? new Date(order.pickupDate).toLocaleDateString('id-ID') : 'yang disepakati'}. Kami tunggu kedatangannya ya Kak! 💖`;
    } else if (order.status === 'SELESAI') {
      message += `Terima kasih sudah berbelanja di Hi Pud! Semoga suka dengan mochinya ya Kak. Ditunggu orderan selanjutnya! ✨`;
    } else {
      message += `Ada yang bisa kami bantu terkait pesanan Kakak?`;
    }

    const cleanNumber = order.whatsappNumber.replace(/[^0-9]/g, '');
    const waNumber = cleanNumber.startsWith('0') ? `62${cleanNumber.substring(1)}` : cleanNumber;
    
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <section className="admin-soft-panel reveal-up p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            {[
              ['Total', orderStats.total],
              ['Perlu verifikasi', orderStats.verification],
              ['Diproses', orderStats.processing],
              ['Nilai order', formatCurrency(orderStats.revenue)],
            ].map(([label, value]) => (
              <div key={label} className="admin-stat-chip pressable">
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-filter-shell reveal-up p-2.5" style={{ animationDelay: '.06s' }}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-black transition active:scale-[0.98] ${
                activeFilter === filter.key
                  ? 'bg-[#f48fb1] text-white shadow-md shadow-pink-200/70'
                  : 'bg-white/66 text-[#6d5963] hover:bg-white'
              }`}
            >
              {filter.label}
              <span className="ml-2 rounded-md bg-white/35 px-2 py-0.5 text-[11px]">{filterCounts[filter.key] || 0}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="glass-admin-card reveal-up overflow-hidden" style={{ animationDelay: '.12s' }}>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#f2d6e2]/70 bg-white/45 text-[#8a7c82]">
              <tr>
                <th className="px-5 py-4 font-black">Invoice</th>
                <th className="px-5 py-4 font-black">Pelanggan</th>
                <th className="px-5 py-4 font-black">Total / DP</th>
                <th className="px-5 py-4 font-black">Pengambilan</th>
                <th className="px-5 py-4 font-black">Status</th>
                <th className="px-5 py-4 text-center font-black">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center font-bold text-[#8a7c82]">Memuat pesanan...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center font-bold text-[#8a7c82]">Tidak ada pesanan ditemukan.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#f2d6e2]/55 last:border-b-0">
                    <td className="px-5 py-4">
                      <p className="font-black text-[#3f2e35]">{order.invoiceNumber}</p>
                      <p className="text-xs font-bold text-[#8a7c82]">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-[#3f2e35]">{order.customerName}</p>
                      <p className="text-xs font-bold text-[#8a7c82]">{order.whatsappNumber}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-black text-[#f48fb1]">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs font-bold text-[#8a7c82]">DP {formatCurrency(order.dpAmount || order.totalAmount / 2)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-[#3f2e35]">{pickupMethodLabel(order.pickupMethod)}</p>
                      <p className="max-w-[190px] truncate text-xs font-bold text-[#8a7c82]">{order.pickupDate ? new Date(order.pickupDate).toLocaleDateString('id-ID') : 'Tanggal belum diisi'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`admin-pill ${pillClass(statusTone(order.status))}`}>{orderStatusLabel(order.status)}</span>
                        <span className={`admin-pill ${pillClass(paymentTone(orderPaymentStatus(order)))}`}>{orderPaymentStatus(order)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => setSelectedOrder(order)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3f2e35] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#6d5963]">
                        <Eye size={16} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 lg:hidden">
          {loading ? (
            <p className="py-10 text-center font-bold text-[#8a7c82]">Memuat pesanan...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="py-10 text-center font-bold text-[#8a7c82]">Tidak ada pesanan ditemukan.</p>
          ) : (
            filteredOrders.map((order) => (
              <article key={order.id} className="rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-[#3f2e35]">{order.invoiceNumber}</p>
                    <p className="mt-1 text-sm font-bold text-[#8a7c82]">{order.customerName} - {order.whatsappNumber}</p>
                  </div>
                  <span className={`admin-pill ${pillClass(statusTone(order.status))}`}>{orderStatusLabel(order.status)}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/66 p-3">
                    <p className="text-xs font-black text-[#8a7c82]">Total</p>
                    <p className="font-black text-[#f48fb1]">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/66 p-3">
                    <p className="text-xs font-black text-[#8a7c82]">Pembayaran</p>
                    <p className="font-black text-[#3f2e35]">{orderPaymentStatus(order)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(order)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#3f2e35] px-4 py-2.5 text-sm font-black text-white">
                  <Eye size={16} /> Lihat Detail
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#3f2e35]/30 backdrop-blur-sm">
          <button className="hidden flex-1 lg:block" aria-label="Tutup detail" onClick={() => setSelectedOrder(null)} />
          <aside className="glass-admin-card flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-none lg:rounded-l-[24px]">
            <div className="flex items-start justify-between gap-4 border-b border-[#f2d6e2]/70 px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-black text-[#3f2e35]">Detail Pesanan</h3>
                <p className="text-sm font-bold text-[#8a7c82]">{selectedOrder.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="admin-icon-button bg-white/70 text-[#8a7c82]" aria-label="Tutup detail">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                  <p className="text-xs font-black uppercase text-[#8a7c82]">Pelanggan</p>
                  <p className="mt-2 font-black text-[#3f2e35]">{selectedOrder.customerName}</p>
                  
                  {/* --- TOMBOL WHATSAPP (Sama Persis UI-nya, Tapi Ditambah Otomasi Pesan) --- */}
                  <button
                    onClick={() => handleAutoWhatsApp(selectedOrder)}
                    className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-[#b9e5c9]/70 px-3 py-2 text-xs font-black text-[#37684a] transition hover:bg-[#a6d8ba]"
                  >
                    <Phone size={14} /> {selectedOrder.whatsappNumber}
                  </button>
                  {/* ----------------------------------------------------------------------- */}
                  
                </div>
                <div className="rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                  <p className="text-xs font-black uppercase text-[#8a7c82]">Metode</p>
                  <p className="mt-2 font-black text-[#3f2e35]">{pickupMethodLabel(selectedOrder.pickupMethod)}</p>
                  <p className="mt-2 flex gap-2 text-sm font-medium text-[#8a7c82]">
                    <CalendarDays size={16} className="mt-0.5 shrink-0 text-[#f48fb1]" />
                    {selectedOrder.pickupDate ? new Date(selectedOrder.pickupDate).toLocaleDateString('id-ID') : 'Tanggal belum diisi'}
                    {selectedOrder.pickupTime ? `, ${selectedOrder.pickupTime}` : ''}
                  </p>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                <p className="text-xs font-black uppercase text-[#8a7c82]">Lokasi</p>
                <p className="mt-2 flex gap-2 text-sm font-medium leading-relaxed text-[#3f2e35]">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#f48fb1]" />
                  <span>
                    {selectedOrder.pickupMethod === 'danus' && selectedOrder.faculty ? `${selectedOrder.faculty} - ` : ''}
                    {selectedOrder.pickupLocation || selectedOrder.address}
                  </span>
                </p>
                {selectedOrder.notes && <p className="mt-3 rounded-2xl bg-[#fff9fb] p-3 text-sm font-medium text-[#8a7c82]">{selectedOrder.notes}</p>}
              </div>

              <div className="rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                <h4 className="flex items-center gap-2 font-black text-[#3f2e35]"><Package size={18} className="text-[#f48fb1]" /> Item Pesanan</h4>
                <div className="mt-4 space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl bg-white/66 p-3 text-sm">
                      <div>
                        <p className="font-black text-[#3f2e35]">{item.product?.name || 'Produk Tidak Diketahui'}</p>
                        <p className="text-xs font-bold text-[#8a7c82]">x{item.quantity} @ {formatCurrency(item.price || item.product?.price || 0)}</p>
                      </div>
                      <p className="font-black text-[#f48fb1]">{formatCurrency(item.subtotal || (item.price || item.product?.price || 0) * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-[#f2d6e2]/70 pt-4 text-sm">
                  <div className="flex justify-between gap-4"><span className="font-bold text-[#8a7c82]">Total</span><span className="font-black text-[#3f2e35]">{formatCurrency(selectedOrder.totalAmount)}</span></div>
                  <div className="flex justify-between gap-4"><span className="font-bold text-[#8a7c82]">DP</span><span className="font-black text-[#3f2e35]">{formatCurrency(selectedOrder.dpAmount || selectedOrder.totalAmount / 2)}</span></div>
                  <div className="flex justify-between gap-4"><span className="font-bold text-[#8a7c82]">Sisa pembayaran</span><span className="font-black text-[#f48fb1]">{formatCurrency(selectedOrder.totalAmount - (selectedOrder.dpAmount || selectedOrder.totalAmount / 2))}</span></div>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#f2d6e2]/70 bg-white/58 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-[#3f2e35]">Bukti Pembayaran DP</p>
                    <p className="text-sm font-medium text-[#8a7c82]">{orderPaymentStatus(selectedOrder)}</p>
                  </div>
                  <button
                    onClick={() => handleViewProof(selectedOrder.proofImage)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ddefff] px-4 py-2.5 text-sm font-black text-[#4f6c86]"
                  >
                    <Receipt size={16} /> Lihat Bukti
                  </button>
                </div>
                {selectedOrder.proofImage && (
                  <button onClick={() => handleViewProof(selectedOrder.proofImage)} className="mt-4 block overflow-hidden rounded-[18px] border border-[#f2d6e2]/70">
                    <img src={fullImageUrl(selectedOrder.proofImage)} alt="Bukti pembayaran" className="max-h-56 w-full object-cover" />
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-[#f2d6e2]/70 bg-white/70 px-5 py-4 backdrop-blur sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-[#8a7c82]">Update status pesanan</p>
                  <p className="mt-1 text-sm font-bold text-[#3f2e35]">{selectedOrder.invoiceNumber}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    className="admin-soft-input min-w-[180px] py-3 text-sm font-black"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedStatus, selectedOrder.invoiceNumber)}
                    className="btn-admin-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-black"
                  >
                    <CheckCircle size={17} /> Simpan Status
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
