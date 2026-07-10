import { useEffect, useMemo, useState } from 'react';
import { Quote, Star, UserCircle } from 'lucide-react';
import api from '../api/axios';

interface Review {
  id: number;
  customerName: string;
  isAnonymous?: boolean;
  rating: number;
  comment: string;
  createdAt: string;
  product?: { name: string } | null;
}

const CustomerReviews = ({ productId }: { productId?: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicReviews = async () => {
      try {
        setLoading(true);
        const url = productId ? `/reviews/public?productId=${productId}` : '/reviews/public';
        const response = await api.get(url);
        setReviews(response.data);
      } catch (error) {
        console.error('Gagal mengambil ulasan:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicReviews();
  }, [productId]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={15} className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-pink-100 text-pink-100'} />
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex flex-col justify-between gap-3 md:mb-5 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-[.18em] text-[#f48fb1] sm:text-xs">Social Proof</p>
          <h2 className="font-display text-xl font-black leading-tight sm:text-2xl md:text-3xl">Apa Kata Mereka Tentang Hipud?</h2>
          <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-[#8a7c82] md:block">Cerita manis dari pelanggan yang sudah mencoba menu Hipud.</p>
        </div>
        {!loading && reviews.length > 0 && (
          <div className="glass-card w-fit rounded-[1rem] px-4 py-2 md:rounded-[1.2rem] md:px-5 md:py-3">
            <p className="font-display text-xl font-black text-[#f48fb1] md:text-2xl">{avgRating.toFixed(1)}/5</p>
            <p className="text-sm font-bold text-[#8a7c82]">{reviews.length} ulasan</p>
          </div>
        )}
      </div>

      {loading ? <div className="py-5 text-center text-sm font-bold text-[#8a7c82]">Memuat ulasan...</div> : null}

      {!loading && reviews.length === 0 ? (
        <div className="rounded-[1rem] bg-white/70 px-4 py-4 text-center text-sm font-bold text-[#8a7c82]">Belum ada ulasan yang dipublikasikan.</div>
      ) : null}

      {!loading && reviews.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="glass-card relative overflow-hidden rounded-[1rem] p-3 sm:rounded-[1.35rem] sm:p-5">
              <Quote className="absolute -right-2 -top-2 text-[#f8dce8]" size={46} />
              {renderStars(review.rating)}
              <p className="mt-3 text-sm italic leading-relaxed text-[#6d5963]">"{review.comment}"</p>
              {review.product && <span className="mt-4 inline-block rounded-full bg-[#ddefff] px-3 py-1 text-xs font-black text-[#50606e]">Review: {review.product.name}</span>}
              <div className="mt-3 flex items-center gap-3 border-t border-pink-100 pt-3">
                <UserCircle className="shrink-0 text-[#f48fb1]" size={34} />
                <div className="min-w-0">
                  <p className="truncate font-black text-[#3f2e35]">{review.isAnonymous ? 'Anonymous' : review.customerName}</p>
                  <p className="text-xs text-[#8a7c82]">{new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CustomerReviews;
