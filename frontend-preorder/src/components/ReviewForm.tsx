import { useEffect, useState } from 'react';
import { Send, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axios';

interface ProductOption {
  id: number;
  name: string;
  category?: string | null;
}

interface ReviewFormProps {
  defaultProductId?: number;
}

interface ReviewFormData {
  invoiceNumber: string;
  customerName: string;
  isAnonymous: boolean;
  productId: string;
  rating: number;
  comment: string;
}

const ReviewForm = ({
  defaultProductId,
}: ReviewFormProps) => {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] =
    useState(false);
  const [loadingSubmit, setLoadingSubmit] =
    useState(false);

  const [formData, setFormData] =
    useState<ReviewFormData>({
      invoiceNumber: '',
      customerName: '',
      isAnonymous: false,
      productId: defaultProductId
        ? String(defaultProductId)
        : '',
      rating: 5,
      comment: '',
    });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        const response = await api.get(
          '/products?target=public'
        );

        const productData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        setProducts(productData);
      } catch (error: any) {
        console.error(
          'Gagal mengambil produk:',
          error.response?.data || error.message
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (defaultProductId) {
      setFormData((previousData) => ({
        ...previousData,
        productId: String(defaultProductId),
      }));
    }
  }, [defaultProductId]);

  const handleInputChange = (
    field: keyof ReviewFormData,
    value: string | boolean | number
  ) => {
    setFormData((previousData) => ({
      ...previousData,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      customerName: '',
      isAnonymous: false,
      productId: defaultProductId
        ? String(defaultProductId)
        : '',
      rating: 5,
      comment: '',
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const invoiceNumber =
      formData.invoiceNumber.trim();
    const customerName =
      formData.customerName.trim();
    const comment = formData.comment.trim();

    if (!invoiceNumber) {
      await Swal.fire({
        icon: 'warning',
        title: 'Nomor invoice belum diisi',
        text: 'Masukkan nomor invoice dari pesanan yang sudah selesai.',
      });

      return;
    }

    if (
      !formData.isAnonymous &&
      !customerName
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'Nama belum diisi',
        text: 'Isi nama atau pilih tampil sebagai anonim.',
      });

      return;
    }

    if (!comment) {
      await Swal.fire({
        icon: 'warning',
        title: 'Review belum diisi',
        text: 'Tuliskan pengalamanmu terlebih dahulu.',
      });

      return;
    }

    try {
      setLoadingSubmit(true);

      const response = await api.post('/reviews', {
        invoiceNumber,
        productId: formData.productId
          ? Number(formData.productId)
          : null,
        customerName: formData.isAnonymous
          ? ''
          : customerName,
        isAnonymous: formData.isAnonymous,
        rating: formData.rating,
        comment,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Terima kasih!',
        text:
          response.data?.message ||
          'Ulasanmu akan ditinjau admin sebelum ditampilkan.',
      });

      resetForm();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Coba lagi beberapa saat lagi.';

      await Swal.fire({
        icon: 'error',
        title: 'Gagal mengirim ulasan',
        text: errorMessage,
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="glass-card mx-auto rounded-[2rem] p-6 text-left md:p-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="invoiceNumber"
            className="hipud-label"
          >
            Nomor Invoice *
          </label>

          <input
            id="invoiceNumber"
            name="invoiceNumber"
            type="text"
            required
            placeholder="Contoh: INV-001"
            className="hipud-input mt-2"
            value={formData.invoiceNumber}
            onChange={(event) =>
              handleInputChange(
                'invoiceNumber',
                event.target.value
              )
            }
          />

          <p className="mt-1 text-xs text-[#8a7c82]">
            Anda hanya bisa mengulas produk yang sudah
            selesai dipesan.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="customerName"
              className="hipud-label"
            >
              Nama
            </label>

            <input
              id="customerName"
              name="customerName"
              type="text"
              disabled={formData.isAnonymous}
              className="hipud-input mt-2 disabled:cursor-not-allowed disabled:bg-white/30"
              placeholder="Nama yang ingin ditampilkan"
              value={formData.customerName}
              onChange={(event) =>
                handleInputChange(
                  'customerName',
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label
              htmlFor="productId"
              className="hipud-label"
            >
              Menu yang direview (opsional)
            </label>

            <select
              id="productId"
              name="productId"
              className="hipud-input mt-2"
              value={formData.productId}
              disabled={
                loadingProducts ||
                Boolean(defaultProductId)
              }
              onChange={(event) =>
                handleInputChange(
                  'productId',
                  event.target.value
                )
              }
            >
              <option value="">
                {loadingProducts
                  ? 'Memuat daftar menu...'
                  : 'Tidak spesifik / umum'}
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-white/65 px-4 py-2 text-sm font-bold text-[#6d5963]">
          <input
            type="checkbox"
            checked={formData.isAnonymous}
            onChange={(event) =>
              handleInputChange(
                'isAnonymous',
                event.target.checked
              )
            }
            className="accent-[#f48fb1]"
          />

          Tampilkan sebagai Anonymous
        </label>

        <div>
          <span className="hipud-label">Rating</span>

          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Beri rating ${star} bintang`}
                onClick={() =>
                  handleInputChange('rating', star)
                }
                className="transition hover:scale-110"
              >
                <Star
                  size={34}
                  className={
                    star <= formData.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-pink-100 text-pink-100'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="hipud-label"
          >
            Review
          </label>

          <textarea
            id="comment"
            name="comment"
            required
            className="hipud-input mt-2 min-h-[130px]"
            placeholder="Ceritakan rasa, packaging, pelayanan, atau pengalaman manismu bersama Hipud."
            value={formData.comment}
            onChange={(event) =>
              handleInputChange(
                'comment',
                event.target.value
              )
            }
          />
        </div>

        <button
          type="submit"
          disabled={loadingSubmit}
          className="hipud-btn inline-flex w-full items-center justify-center gap-2 py-4 font-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />

          {loadingSubmit
            ? 'Mengirim...'
            : 'Kirim Ulasan'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;