import prisma from '../config/database.js';
// Pembeli mengirim ulasan baru (SEKARANG WAJIB INVOICE & ANTI-SPAM)
export const createReview = async (req, res) => {
    try {
        const { invoiceNumber, productId, customerName, isAnonymous, rating, comment } = req.body;
        if (!invoiceNumber || !rating || !comment) {
            return res.status(400).json({ success: false, message: 'Nomor Invoice, Rating, dan Review wajib diisi.' });
        }
        // 1. Cek apakah Invoice valid dan berstatus SELESAI
        const order = await prisma.order.findUnique({
            where: { invoiceNumber: String(invoiceNumber) },
            include: { items: true } // Bawa data produk apa saja yang dibeli
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Nomor Invoice tidak ditemukan. Pastikan Anda memasukkan nomor yang benar.' });
        }
        if (order.status !== 'SELESAI') {
            return res.status(400).json({ success: false, message: 'Pesanan Anda belum berstatus SELESAI. Ulasan hanya bisa diberikan setelah pesanan diterima.' });
        }
        // 2. Cek apakah produk yang diulas benar-benar dibeli di Invoice tersebut
        const isProductBought = order.items.some(item => item.productId === Number(productId));
        if (!isProductBought) {
            return res.status(400).json({ success: false, message: 'Anda tidak membeli produk ini pada Nomor Invoice tersebut.' });
        }
        // 3. ANTI-SPAM: Cek apakah pembeli sudah pernah mengulas produk ini pakai Invoice yang sama
        const existingReview = await prisma.review.findFirst({
            where: {
                invoiceNumber: String(invoiceNumber),
                productId: Number(productId)
            }
        });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'Anda sudah memberikan ulasan untuk produk ini menggunakan Invoice tersebut.' });
        }
        // 4. Jika semua aman, simpan ulasan ke database
        const newReview = await prisma.review.create({
            data: {
                invoiceNumber: String(invoiceNumber),
                productId: productId ? Number(productId) : null,
                // Kita bisa ambil otomatis nama pembeli dari order jika isAnonymous false
                customerName: isAnonymous ? 'Anonymous' : (customerName || order.customerName),
                isAnonymous: Boolean(isAnonymous),
                rating: Number(rating),
                comment: String(comment),
            },
            include: { product: true }
        });
        res.status(201).json({ success: true, message: 'Terima kasih! Ulasanmu berhasil dikirim dan akan ditinjau oleh Admin.', data: newReview });
    }
    catch (error) {
        console.error('Gagal mengirim ulasan:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat mengirim ulasan.' });
    }
};
export const getAllReviews = async (_req, res) => {
    try {
        const reviews = await prisma.review.findMany({ include: { product: true }, orderBy: { createdAt: 'desc' } });
        res.status(200).json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data ulasan', error });
    }
};
export const publishReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;
        const updatedReview = await prisma.review.update({ where: { id: Number(id) }, data: { isPublished: Boolean(isPublished) } });
        res.status(200).json({ message: 'Status ulasan berhasil diperbarui!', data: updatedReview });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengubah status ulasan', error });
    }
};
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.review.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: 'Ulasan berhasil dihapus!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal menghapus ulasan', error });
    }
};
export const getPublishedReviews = async (req, res) => {
    try {
        const { productId } = req.query;
        const whereClause = { isPublished: true };
        if (productId)
            whereClause.productId = Number(productId);
        const reviews = await prisma.review.findMany({ where: whereClause, include: { product: true }, orderBy: { createdAt: 'desc' } });
        res.status(200).json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: 'Gagal mengambil ulasan publik', error });
    }
};
//# sourceMappingURL=reviewController.js.map