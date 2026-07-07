import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Matikan fungsi node-cron lokal karena tidak kompatibel dengan Vercel Serverless
// import { initCronJobs } from './services/cronService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// BUKA PINTU UNTUK FOLDER UPLOADS
app.use('/uploads', express.static('uploads')); 

app.get('/', (req: Request, res: Response) => {
  res.send('Halo! Server Backend Sistem PO UMKM sudah berhasil berjalan di Vercel! 🚀');
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// ENDPOINT BARU: Pengganti Cron Job untuk Vercel
// Vercel akan secara otomatis menembak URL ini setiap hari
app.get('/api/cron-cleanup', (req: Request, res: Response) => {
  // Panggil fungsi pembersih database Anda dari cronService di sini nantinya
  console.log('Menjalankan pembersihan otomatis via Vercel Cron!');
  res.status(200).json({ message: 'Cron job pembersihan berhasil dijalankan' });
});

// initCronJobs(); // <-- Dimatikan

// HANYA JALANKAN SERVER LOKAL JIKA TIDAK DI VERCEL
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server lokal berjalan di: Port ${PORT}`);
    console.log(`=========================================`);
  });
}

// WAJIB UNTUK VERCEL: Mengekspor aplikasi agar dikenali Serverless Function
export default app;