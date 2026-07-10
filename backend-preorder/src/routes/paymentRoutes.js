import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { createPayment, getPayments, deletePayment } from '../controllers/paymentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
const router = express.Router();
// 1. Konfigurasi Kunci Cloudinary (Menggunakan 'as string' untuk mengatasi error TypeScript)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// 2. Multer diarahkan untuk menyimpan file ke Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'hipud_payments', // Nama folder di Cloudinary
            format: 'png',
            public_id: Date.now() + '-' + Math.round(Math.random() * 1E9),
        };
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas maksimal 5MB
});
// PINTU TERBUKA (Publik / Pembeli)
router.post('/', upload.single('proofImage'), createPayment);
// PINTU TERGEMBOK (Hanya Admin)
router.get('/', verifyToken, getPayments);
router.delete('/:id', verifyToken, deletePayment);
export default router;
//# sourceMappingURL=paymentRoutes.js.map