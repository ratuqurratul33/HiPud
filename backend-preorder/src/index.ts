import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

import { initCronJobs } from './services/cronService.js';

const app = express();
// WAJIB UNTUK RENDER: Menggunakan PORT dinamis dari environment
const PORT = process.env.PORT || 5000;

// PENGATURAN CORS: Mengizinkan Vercel untuk mengakses API ini
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// BUKA PINTU UNTUK FOLDER UPLOADS (Sementara tetap ada sebelum Cloudinary aktif)
app.use('/uploads', express.static('uploads')); 

app.get('/', (req: Request, res: Response) => {
  res.send('Halo! Server Backend Sistem PO UMKM sudah berhasil berjalan di Cloud! 🚀');
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

initCronJobs();

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server berjalan di: Port ${PORT}`);
  console.log(`🕒 Mesin Pembersih Otomatis (Cron Job) AKTIF!`);
  console.log(`=========================================`);
});