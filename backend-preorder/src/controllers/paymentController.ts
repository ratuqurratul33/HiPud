import { Request, Response } from 'express';
import prisma from '../config/database.js';

// Fitur Mengunggah Bukti Pembayaran
export const createPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const invoiceNumber = req.body.orderId; 
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File bukti pembayaran tidak ditemukan!" });
    }

    const order = await prisma.order.findFirst({
      where: { invoiceNumber: invoiceNumber }
    });

    if (!order) {
      return res.status(404).json({ message: "Pesanan dengan invoice tersebut tidak ditemukan." });
    }

    // PERBAIKAN: Langsung ambil URL lengkap dari Cloudinary
    const imageUrl = file.path; 

    const newPayment = await prisma.payment.create({
      data: {
        orderId: order.id,
        proofImageUrl: imageUrl
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { proofImage: imageUrl }
    });

    res.status(201).json({ success: true, message: "Bukti pembayaran berhasil dikirim!", data: newPayment });
  } catch (error) {
    console.error("Gagal memproses pembayaran:", error);
    res.status(500).json({ message: "Gagal memproses pembayaran", error });
  }
};

// Fitur Menampilkan Semua Bukti Pembayaran (Untuk Admin)
export const getPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: true 
      },
      orderBy: { uploadedAt: 'desc' } 
    });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pembayaran", error });
  }
};

// Fitur Menghapus Bukti Pembayaran (DELETE)
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.payment.delete({
      where: { id: Number(id) }
    });
    res.status(200).json({ message: "Bukti pembayaran berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus pembayaran", error });
  }
};