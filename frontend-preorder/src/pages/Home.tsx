import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Camera,
  ChevronDown,
  Clock,
  HelpCircle,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  X,
} from 'lucide-react';
import Catalog from './Catalog';
import CustomerReviews from '../components/CustomerReviews';
import ReviewForm from '../components/ReviewForm';
import { CartContext } from '../context/CartContext';
import api from '../api/axios';
import hipudLogo from '../assets/hipud-logo-cropped.png';
import stickerImage from '../assets/stikerID.png';
import storyMochiImage from '../assets/cream-no-background.png';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

interface BatchSchedule {
  orderStartDate: string;
  orderEndDate: string;
  readyStartDate: string;
  readyEndDate: string;
  orderDateText: string;
  readyDateText: string;
  status: string;
  note: string;
  products?: Array<{ id: number; name: string }>;
}

const preorderSteps = [
  ['Cek tanggal ketersediaan', 'Pastikan tanggal ready tersedia dan pemesanan dilakukan minimal H-1.'],
  ['Pilih menu', 'Pilih menu mochi yang sedang tersedia untuk batch pemesanan.'],
  ['Isi data', 'Lengkapi nama, nomor WhatsApp, jumlah pesanan, dan catatan tambahan.'],
  ['Pilih pribadi, stand, atau danus', 'Pribadi pickup ke rumah produksi, stand Kencana maksimal jam 8 pagi, atau danus area UNPAD Jatinangor.'],
  ['Bayar DP 50%', 'Pesanan diproses setelah bukti DP berhasil dikirim.'],
  ['Konfirmasi WhatsApp', 'Konfirmasi ke admin agar pesanan segera diverifikasi.'],
];

const navItems = [
  ['Home', 'home'],
  ['Menu', 'menu'],
  ['Pre-Order', 'preorder'],
  ['Jadwal', 'jadwal'],
  ['Review', 'review'],
  ['FAQ', 'faq'],
];

const adminWhatsAppNumber = '6285723891658';
const googleMapsUrl = 'https://www.google.com/maps?cid=14614609035051228550&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=id&source=embed';
const googleMapsEmbedUrl = `${googleMapsUrl}&output=embed`;
const productionPickupLocation = 'Komplek Duta Family C3, Parakanmuncang';

const sectionTitleClass = 'font-display text-xl font-black leading-tight sm:text-2xl md:text-3xl';

const Home = () => {
  const navigate = useNavigate();
  const { cartCount } = useContext(CartContext);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [batchSchedule, setBatchSchedule] = useState<BatchSchedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setScheduleLoading(true);
        const response = await api.get('/products/schedule/active');
        setBatchSchedule(response.data.data);
      } catch (error) {
        console.error('Gagal mengambil jadwal batch:', error);
        setBatchSchedule(null);
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const faqs = [
    ['Apa itu sistem pre-order Hipud?', 'Pre-order berarti produk dibuat sesuai batch agar produksi lebih rapi dan mochi tetap fresh.'],
    ['Kenapa harus bayar DP 50%?', 'DP membantu mengamankan slot produksi. Sisa pembayaran dilakukan saat pesanan diambil atau diantar.'],
    ['Apa bedanya Pribadi dan Danus?', 'Pribadi hanya pickup ke rumah produksi. Danus bisa diantar khusus area UNPAD Jatinangor.'],
    ['Kapan bisa memilih tanggal pengambilan?', 'Tanggal pengambilan mengikuti jadwal ready batch dan pemesanan wajib minimal H-24 jam.'],
    ['Apakah bisa pesan lebih dari satu menu?', 'Bisa. Keranjang mendukung beberapa menu dan jumlah masing-masing produk bisa diubah.'],
  ];

  const goStandSchedule = () => {
    setTimeout(() => scrollTo('jadwal'), 0);
  };

  const goSection = (id: string) => {
    setMobileNavOpen(false);
    scrollTo(id);
  };

  return (
    <main className="min-h-screen overflow-x-hidden text-[#3f2e35]">
      <nav className="sticky inset-x-0 top-0 z-50 border-b border-white/60 bg-white/82 backdrop-blur-2xl">
        <div className="hipud-container flex h-16 items-center justify-between px-4 sm:px-6 md:h-[4.75rem] md:px-10">
          <button onClick={() => goSection('home')} className="pressable flex min-h-11 items-center gap-2 text-left md:gap-3">
            <img src={hipudLogo} alt="Hipud Sweet and Fresh" className="h-10 w-auto object-contain md:h-12" />
            <span className="hidden text-xs font-bold uppercase tracking-[.18em] text-[#8a7c82] sm:inline">Homemade Mochi</span>
          </button>
          <div className="hidden items-center gap-5 text-sm font-bold text-[#6d5963] lg:flex">
            {navItems.map(([label, target]) => (
              <button key={target} onClick={() => goSection(target)} className="min-h-11 transition hover:text-[#f48fb1]">
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => navigate('/checkout')} aria-label="Buka keranjang" className="pressable relative grid h-11 w-11 place-items-center rounded-[16px] bg-white/86 shadow-sm transition hover:bg-white">
              <ShoppingBag size={20} className="text-[#964261]" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f48fb1] px-1 text-[10px] font-black text-white">{cartCount}</span>}
            </button>
            <button onClick={() => goSection('preorder')} className="hipud-btn pressable hidden min-h-11 items-center px-5 text-sm font-black md:inline-flex">Pesan Sekarang</button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileNavOpen}
              className="pressable grid h-11 w-11 place-items-center rounded-[16px] bg-white/86 shadow-sm transition hover:bg-white lg:hidden"
            >
              {mobileNavOpen ? <X size={21} className="text-[#964261]" /> : <Menu size={21} className="text-[#964261]" />}
            </button>
          </div>
        </div>
        <div className={`lg:hidden ${mobileNavOpen ? 'block' : 'hidden'}`}>
          <button
            type="button"
            aria-label="Tutup menu"
            className="fixed inset-0 top-16 z-40 bg-[#3f2e35]/18"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute right-3 top-[4.35rem] z-50 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.1rem] border border-white/70 bg-white/96 p-2 shadow-[0_18px_50px_rgba(63,46,53,0.16)] backdrop-blur-xl">
            <div className="grid gap-1 text-sm font-black text-[#6d5963]">
              {navItems.map(([label, target]) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => goSection(target)}
                  className="flex min-h-11 items-center rounded-[14px] px-3 text-left transition hover:bg-[#fff1f6] hover:text-[#964261]"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate('/checkout');
                }}
                className="hipud-btn pressable mt-1 flex min-h-11 items-center justify-center px-4 text-sm font-black"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="relative overflow-hidden px-4 pb-10 pt-7 sm:px-6 md:px-10 md:pb-14 md:pt-10 xl:px-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fff9fb] via-[#fff9fb]/92 to-[#f8dce8]/72" />
        <div className="hero-copy-row relative z-10 mx-auto grid max-w-7xl items-center gap-6 lg:min-h-[calc(86vh-4.75rem)] lg:grid-cols-[.88fr_1fr] lg:gap-10">
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <div className="hero-sticker-stage">
              <div className="hero-sticker-glass" />
              <img src={stickerImage} alt="Varian mochi Hipud" className="hero-sticker-float relative z-10 w-full max-w-[260px] object-contain drop-shadow-[0_22px_34px_rgba(150,66,97,0.22)] sm:max-w-[340px] lg:max-w-[430px]" />
            </div>
          </div>

          <div className="order-1 max-w-2xl reveal-up lg:order-2">
            <h1 className="font-display text-[clamp(2.25rem,11vw,4.25rem)] font-black leading-[1.05] text-[#3f2e35]">
              Welcome to Hipud
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-[#6d5963] md:text-lg md:leading-8">
              Spesialis aneka mochi tersedia online, Stand Kencana, dan danus.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 md:max-w-xl">
              <button onClick={() => scrollTo('steps')} className="hipud-btn pressable inline-flex min-h-12 items-center justify-center gap-2 px-5 font-black"><ShoppingBag size={19} /> Cara Memesan</button>
              <button onClick={() => scrollTo('menu')} className="hipud-outline-btn pressable inline-flex min-h-12 items-center justify-center px-5 font-black">Lihat Menu</button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 pb-3 sm:px-6 md:px-10 xl:px-20">
        <div className="glass-card mx-auto grid max-w-3xl grid-cols-3 gap-1.5 rounded-[1rem] px-2.5 py-2 text-center text-[10px] font-black leading-tight text-[#6d5963] sm:gap-2 sm:px-4 sm:text-xs">
          <span className="inline-flex min-w-0 items-center justify-center gap-1"><Sparkles size={13} className="shrink-0 text-[#f48fb1]" /> <span className="min-w-0">Fresh daily</span></span>
          <span className="inline-flex min-w-0 items-center justify-center gap-1"><Truck size={13} className="shrink-0 text-[#f48fb1]" /> <span className="min-w-0">Pribadi/stand/danus</span></span>
          <span className="inline-flex min-w-0 items-center justify-center gap-1"><MessageCircle size={13} className="shrink-0 text-[#f48fb1]" /> <span className="min-w-0">Trusted</span></span>
        </div>
      </section>

      <section id="about" className="px-3 py-6 sm:px-4 md:px-10 md:py-10 xl:px-20">
        <div className="brand-story-grid mx-auto grid max-w-[1500px] items-center gap-4 lg:grid-cols-[.9fr_1.1fr] lg:gap-10">
          <div className="brand-story-media relative flex max-h-[220px] items-center justify-center overflow-hidden lg:max-h-[440px]">
            <img
              src={storyMochiImage}
              alt="Box mochi Hipud tanpa latar belakang"
              className="story-product-float mx-auto w-full max-w-[430px] object-contain drop-shadow-[0_24px_36px_rgba(150,66,97,0.2)] lg:max-w-[540px]"
            />
          </div>
          <div className="max-w-2xl">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[.18em] text-[#f48fb1] sm:text-xs">Brand Story</p>
            <h2 className={sectionTitleClass}>Kenalan dengan Hipud</h2>
            <p className="mt-2 text-sm leading-6 text-[#8a7c82] md:text-base md:leading-7">
              Hipud adalah brand dessert mochi homemade sejak Maret 2023 untuk area Kabupaten Bandung dan Jatinangor. Sistem pre-order membantu produksi lebih rapi dan mochi tetap fresh.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#8a7c82] md:text-base md:leading-7">
              Kamu bisa pesan online, ambil di Stand Kencana, atau danus sesuai jadwal batch yang tersedia.
            </p>
            <div className="mt-3 grid gap-2 text-[13px] font-bold leading-snug text-[#6d5963] sm:text-sm">
              {[
                'Mochi homemade dengan tekstur lembut dan rasa fresh.',
                'Bisa pilih online, stand Kencana, atau danus area Jatinangor.',
                'Jadwal PO jelas agar slot produksi lebih tertata.',
              ].map((item) => (
                <span key={item} className="inline-flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f48fb1]" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
              <button onClick={goStandSchedule} className="hipud-outline-btn pressable inline-flex min-h-10 items-center justify-center px-4 text-xs font-black sm:min-h-11 sm:text-sm">Jadwal Offline</button>
              <button onClick={() => scrollTo('steps')} className="hipud-btn pressable inline-flex min-h-10 items-center justify-center px-4 text-xs font-black sm:min-h-11 sm:text-sm">Cara Pre-Order</button>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="bg-white/35 px-2 py-5 sm:px-4 md:px-10 md:py-10 xl:px-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-3 flex items-end justify-between gap-3 text-left md:mb-5">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[.18em] text-[#f48fb1] sm:text-xs">Katalog Brand</p>
              <h2 className="font-display text-xl font-black leading-tight sm:text-2xl md:text-3xl">Daftar Menu Hipud</h2>
            </div>
            <p className="hidden max-w-md text-right text-sm leading-6 text-[#8a7c82] md:block">Menu lengkap, detail rasa, dan pilihan mochi Hipud.</p>
          </div>
          <Catalog mode="all" />
        </div>
      </section>

      <section id="steps" className="bg-white/40 px-2 py-4 sm:px-4 md:px-10 md:py-10 xl:px-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-3 text-center md:mb-6">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[.18em] text-[#f48fb1] sm:text-xs">Order Flow</p>
            <h2 className="font-display text-xl font-black leading-tight sm:text-2xl md:text-3xl">Cara Pre-Order</h2>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {preorderSteps.map(([title, text], index) => (
              <button
                key={title}
                type="button"
                onClick={index === 0 ? () => scrollTo('jadwal') : undefined}
                className={`glass-card rounded-[10px] p-2 text-left sm:rounded-[1.2rem] sm:p-4 ${index === 0 ? 'pressable transition hover:-translate-y-0.5 hover:bg-white/82' : 'cursor-default'}`}
              >
                <div className="mb-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#f48fb1] text-[10px] font-black text-white sm:mb-3 sm:h-8 sm:w-8 sm:text-sm">{index + 1}</div>
                <h3 className="font-display text-[10px] font-black leading-tight sm:text-sm md:text-base">{title}</h3>
                <p className="mt-1 line-clamp-2 text-[9px] leading-tight text-[#8a7c82] sm:text-xs md:text-sm md:leading-relaxed">{text}</p>
              </button>
            ))}
          </div>
          <p className="mt-2 rounded-[10px] bg-white/65 px-2 py-2 text-center text-[10px] font-bold text-[#8a7c82] sm:mt-4 sm:rounded-[1.25rem] sm:px-4 sm:py-3 sm:text-sm">
            Catatan: Pemesanan minimal H-24 jam sebelum tanggal pengambilan.
          </p>
        </div>
      </section>

      <section id="preorder" className="px-2 py-5 sm:px-4 md:px-10 md:py-10 xl:px-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-3 flex items-end justify-between gap-3 md:mb-5">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[.18em] text-[#f48fb1] sm:text-xs">Open Order</p>
              <h2 className="font-display text-xl font-black leading-tight sm:text-2xl md:text-3xl">Quick Pre-Order</h2>
              <p className="hidden mt-2 max-w-2xl text-sm leading-6 text-[#8a7c82] md:block">Pilih cepat dari menu yang sedang open order.</p>
            </div>
            <button onClick={() => navigate('/checkout')} className="hipud-btn pressable inline-flex min-h-9 shrink-0 items-center justify-center px-3 text-xs font-black sm:min-h-11 sm:px-5 sm:text-sm">Checkout</button>
          </div>
          <Catalog mode="orderable" />
        </div>
      </section>

      <section id="jadwal" className="px-3 py-6 sm:px-4 md:px-10 md:py-10 xl:px-20">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-3 text-center md:mb-5">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[.18em] text-[#f48fb1] sm:text-xs">Schedule</p>
            <h2 className={sectionTitleClass}>Jadwal & Lokasi</h2>
          </div>
          <div className="glass-card overflow-hidden rounded-[1.6rem] p-3 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[.86fr_1.14fr]">
              <div className="grid gap-3">
                <article className="rounded-[1rem] bg-white/62 p-3 sm:rounded-[1.3rem] sm:p-5">
                  <div className="mb-3 flex items-start gap-2.5 sm:gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#f8dce8] text-[#964261] sm:h-10 sm:w-10 sm:rounded-[14px]"><CalendarDays size={18} /></span>
                    <div>
                      <h3 className="font-display text-base font-black leading-tight sm:text-lg">Jadwal PO & Danus</h3>
                      <p className="text-xs font-bold text-[#8a7c82] sm:text-sm">Online order mengikuti batch aktif</p>
                    </div>
                  </div>
                  {scheduleLoading ? (
                    <p className="text-sm font-bold text-[#8a7c82]">Memuat jadwal batch...</p>
                  ) : batchSchedule ? (
                    <div className="grid gap-2 text-xs leading-relaxed text-[#8a7c82] min-[380px]:grid-cols-[6rem_1fr] sm:grid-cols-[7rem_1fr] sm:text-sm">
                      <span className="font-black text-[#3f2e35]">Order</span><span>{batchSchedule.orderDateText}</span>
                      <span className="font-black text-[#3f2e35]">Ready</span><span>{batchSchedule.readyDateText}</span>
                      <span className="font-black text-[#3f2e35]">Pickup</span><span>{productionPickupLocation}</span>
                      <span className="font-black text-[#3f2e35]">Status</span><span className="w-fit rounded-full bg-[#b9e5c9]/70 px-3 py-1 font-black text-[#37684a]">{batchSchedule.status}</span>
                    </div>
                  ) : (
                    <div className="grid gap-2 text-sm leading-relaxed text-[#8a7c82]">
                      <p className="font-black text-[#3f2e35]">Belum ada jadwal PO, Stand Kencana, dan danus yang aktif.</p>
                      <p>Cek Instagram Hipud untuk update batch terbaru.</p>
                      <p><span className="font-black text-[#3f2e35]">Pickup:</span> {productionPickupLocation}</p>
                    </div>
                  )}
                  <button onClick={() => scrollTo('preorder')} className="hipud-btn pressable mt-3 inline-flex min-h-10 items-center justify-center px-4 text-xs font-black sm:min-h-11 sm:px-5 sm:text-sm">Quick Pre-Order</button>
                </article>

                <article className="rounded-[1rem] bg-white/62 p-3 sm:rounded-[1.3rem] sm:p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#ddefff]/80 text-[#4f6c86] sm:h-10 sm:w-10 sm:rounded-[14px]"><Store size={18} /></span>
                    <div>
                      <h3 className="font-display text-base font-black leading-tight sm:text-lg">Open Stand</h3>
                      <p className="text-xs font-bold text-[#8a7c82] sm:text-sm">Setiap Minggu pagi</p>
                    </div>
                  </div>
                  <div className="grid gap-1.5 text-xs font-bold text-[#6d5963] sm:gap-2 sm:text-sm">
                    <span className="inline-flex items-center gap-2"><Clock size={17} className="shrink-0 text-[#f48fb1]" /> 06.30-08.30 WIB</span>
                    <span className="inline-flex items-start gap-2"><MapPin size={17} className="mt-0.5 shrink-0 text-[#f48fb1]" /> Jl. Teratai Raya Blok 9, depan Soto Rawon Kencana, Kabupaten Bandung, Rancaekek.</span>
                  </div>
                </article>
              </div>

              <div className="rounded-[1rem] bg-[#fff9fb]/80 p-3 sm:rounded-[1.3rem] sm:p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-base font-black text-[#3f2e35] sm:text-lg">Lokasi Hipud</p>
                    <p className="text-xs font-bold text-[#8a7c82] sm:text-sm">Stand Kencana dan area layanan Jatinangor</p>
                  </div>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hipud-outline-btn pressable inline-flex min-h-10 items-center justify-center gap-2 px-3 text-xs font-black sm:min-h-11 sm:px-4 sm:text-sm"
                  >
                    <Navigation size={16} /> Info Lokasi
                  </a>
                </div>
                {showLocationMap ? (
                  <iframe
                    title="Peta lokasi Hipud"
                    className="aspect-[4/3] max-h-[240px] w-full rounded-[1rem] border-0 md:aspect-[16/10] lg:max-h-[360px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={googleMapsEmbedUrl}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLocationMap(true)}
                    className="grid aspect-[4/3] max-h-[240px] w-full place-items-center rounded-[1rem] border border-dashed border-[#f8dce8] bg-white/70 px-4 text-center text-sm font-black text-[#6d5963] transition hover:bg-white md:aspect-[16/10] lg:max-h-[360px]"
                  >
                    Tampilkan peta lokasi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="review" className="bg-white/35 px-3 py-6 sm:px-4 md:px-10 md:py-10 xl:px-20">
        <div className="mx-auto max-w-[1500px]"><CustomerReviews /></div>
      </section>
      <section className="px-3 py-6 sm:px-4 md:px-10 md:py-10 xl:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={sectionTitleClass}>Gimana pengalaman manismu bersama Hipud?</h2>
          <p className="mt-2 text-sm leading-6 text-[#8a7c82] md:text-[15px] md:leading-7">Ulasan bisa dikirim tanpa invoice dan akan dimoderasi admin sebelum tampil.</p>
          <div className="mt-3 md:mt-5"><ReviewForm /></div>
        </div>
      </section>

      <section id="faq" className="bg-white/35 px-3 py-6 sm:px-4 md:px-10 md:py-10 xl:px-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 text-center md:mb-5">
            <HelpCircle className="mx-auto mb-1 text-[#f48fb1]" size={28} />
            <h2 className={sectionTitleClass}>FAQ</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            {faqs.map(([q, a], i) => (
              <div key={q} className="glass-card overflow-hidden rounded-[1rem] md:rounded-[1.2rem]">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex min-h-11 w-full items-center justify-between gap-3 p-3 text-left text-sm font-black sm:min-h-12 sm:p-4 sm:text-base">
                  <span>{q}</span>
                  <ChevronDown className={`shrink-0 transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`grid transition-all duration-200 ease-out ${openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <p className="min-h-0 overflow-hidden px-3 pb-3 text-sm leading-relaxed text-[#8a7c82] sm:px-4 sm:pb-4">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="kontak" className="bg-[#3f2e35] px-3 py-6 text-white sm:px-5 md:px-8 xl:px-20">
        <div className="mx-auto grid max-w-[1500px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><p className="font-display text-xl font-black text-[#f8dce8]">Hipud</p><p className="mt-1 text-xs leading-snug text-white/70">Spesialis aneka mochi online, offline, dan danus.</p></div>
          <div><p className="text-sm font-black">Navigasi</p><div className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-white/70 sm:grid-cols-1">{navItems.map(([label, target]) => <button key={target} onClick={() => scrollTo(target)} className="w-fit min-h-7 text-left hover:text-white">{label}</button>)}</div></div>
          <div>
            <p className="text-sm font-black">Kontak</p>
            <div className="mt-2 flex gap-2">
              <a href="https://www.instagram.com/hi.pud" target="_blank" rel="noopener noreferrer" aria-label="Instagram Hipud" className="footer-social-button">
                <Camera size={16} />
              </a>
              <a href={`https://wa.me/${adminWhatsAppNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Hipud" className="footer-social-button">
                <MessageCircle size={16} />
              </a>
              <button onClick={goStandSchedule} aria-label="Jadwal open stand" className="footer-social-button">
                <MapPin size={16} />
              </button>
            </div>
          </div>
          <div><p className="text-sm font-black">Info</p><div className="mt-2 space-y-1 text-xs leading-snug text-white/70"><p>Kabupaten Bandung & Jatinangor</p><p>Open Stand: Minggu pagi 06.30-08.30</p><p>PO, Stand & Danus: mengikuti jadwal batch</p></div></div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
