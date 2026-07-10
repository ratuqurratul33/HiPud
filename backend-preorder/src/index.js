import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { initCronJobs } from './services/cronService.js';
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
// BUKA PINTU UNTUK FOLDER UPLOADS
// Baris ini membuat file gambar bisa diakses dari URL: http://https://hi-pud.vercel.app/https://hi-pud.vercel.app//uploads/namafile.png
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => {
    res.send('Halo! Server Backend Sistem PO UMKM sudah berhasil berjalan! 🚀');
});
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
initCronJobs();
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
    console.log(`🕒 Mesin Pembersih Otomatis (Cron Job) AKTIF!`);
    console.log(`=========================================`);
});
//# sourceMappingURL=index.js.map