import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { createProduct, deleteProduct, getActiveBatchSchedule, getProducts, updateProduct, uploadProductImage } from '../controllers/productController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
const router = express.Router();
// 1. Konfigurasi Kunci Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// 2. Penyimpanan Foto Produk ke Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'hipud_products', // Folder khusus produk
            format: 'png',
            public_id: `productImage-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
        };
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});
router.get('/', getProducts);
router.get('/schedule/active', getActiveBatchSchedule);
router.post('/upload-image', verifyToken, upload.single('productImage'), uploadProductImage);
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);
export default router;
//# sourceMappingURL=productRoutes.js.map