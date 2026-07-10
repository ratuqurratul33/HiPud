import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const parseOptionalBoolean = (value: unknown, defaultValue: boolean) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
};

const JAKARTA_TIME_ZONE = 'Asia/Jakarta';

const hasValidAdminToken = (req: Request) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return false;

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'rahasia_negara_123');
    return true;
  } catch {
    return false;
  }
};

const parseDateOnly = (value: Date | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toDateString = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: JAKARTA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) return '';
  return `${year}-${month}-${day}`;
};

const formatDate = (date: Date) => date.toLocaleDateString('id-ID', {
  timeZone: JAKARTA_TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const getScheduleStatus = (orderStartDate: Date, orderEndDate: Date) => {
  const today = toDateString(new Date());
  const startDate = toDateString(orderStartDate);
  const endDate = toDateString(orderEndDate);

  if (today < startDate) return 'Akan Dibuka';
  if (today > endDate) return 'Ditutup';
  return 'Aktif';
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, target, orderable } = req.query;
    const whereClause: any = {};

    if (target === 'admin' && !hasValidAdminToken(req)) {
      return res.status(401).json({ success: false, message: 'Akses admin produk membutuhkan login.' });
    }

    if (target !== 'admin') {
      whereClause.isActive = true;
    }

    if (orderable === 'true') {
      whereClause.isActive = true;
      whereClause.isOrderable = true;
    }

    if (search) {
      whereClause.name = { contains: String(search) };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }]
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
    res.status(500).json({ message: 'Gagal mengambil data produk', error });
  }
};

export const getActiveBatchSchedule = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isOrderable: true,
        poOpenDate: { not: null },
        poCloseDate: { not: null }
      },
      select: {
        id: true,
        name: true,
        poOpenDate: true,
        poCloseDate: true
      },
      orderBy: [{ poOpenDate: 'asc' }, { poCloseDate: 'asc' }]
    });

    const windows = products
      .map((product) => {
        const orderStartDate = parseDateOnly(product.poOpenDate);
        const orderEndDate = parseDateOnly(product.poCloseDate);
        if (!orderStartDate || !orderEndDate || orderEndDate < orderStartDate) return null;

        return {
          productId: product.id,
          productName: product.name,
          orderStartDate,
          orderEndDate,
          readyStartDate: addDays(orderStartDate, 1),
          readyEndDate: addDays(orderEndDate, 1)
        };
      })
      .filter((window): window is NonNullable<typeof window> => Boolean(window));

    if (windows.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    const orderStartDate = new Date(Math.min(...windows.map((window) => window.orderStartDate.getTime())));
    const orderEndDate = new Date(Math.max(...windows.map((window) => window.orderEndDate.getTime())));
    const readyStartDate = addDays(orderStartDate, 1);
    const readyEndDate = addDays(orderEndDate, 1);

    res.status(200).json({
      success: true,
      data: {
        orderStartDate: toDateString(orderStartDate),
        orderEndDate: toDateString(orderEndDate),
        readyStartDate: toDateString(readyStartDate),
        readyEndDate: toDateString(readyEndDate),
        orderDateText: `${formatDate(orderStartDate)} - ${formatDate(orderEndDate)}`,
        readyDateText: `${formatDate(readyStartDate)} - ${formatDate(readyEndDate)}`,
        status: getScheduleStatus(orderStartDate, orderEndDate),
        note: 'Pemesanan H-24 jam ya, dan jangan lupa konfirmasi ke WhatsApp admin.',
        products: windows.map((window) => ({
          id: window.productId,
          name: window.productName
        }))
      }
    });
  } catch (error) {
    console.error('Gagal mengambil jadwal batch:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil jadwal batch', error });
  }
};

export const uploadProductImage = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'File gambar tidak ditemukan' });
    
    // PERBAIKAN: Langsung ambil URL lengkap dari Cloudinary
    const imageUrl = file.path; 
    
    res.status(201).json({ success: true, imageUrl });
  } catch (error) {
    console.error('Gagal upload gambar produk:', error);
    res.status(500).json({ success: false, message: 'Gagal upload gambar produk', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, poOpenDate, poCloseDate, isActive, isOrderable, category, variant } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl || null,
        poOpenDate: poOpenDate ? new Date(poOpenDate) : null,
        poCloseDate: poCloseDate ? new Date(poCloseDate) : null,
        category: category || 'Mochi Daifuku',
        variant: variant || null,
        isActive: parseOptionalBoolean(isActive, true),
        isOrderable: parseOptionalBoolean(isOrderable, true),
      }
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Gagal menambah produk:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah produk', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, poOpenDate, poCloseDate, isActive, isOrderable, category, variant } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (category !== undefined) updateData.category = category || null;
    if (variant !== undefined) updateData.variant = variant || null;
    if (isActive !== undefined) updateData.isActive = parseOptionalBoolean(isActive, true);
    if (isOrderable !== undefined) updateData.isOrderable = parseOptionalBoolean(isOrderable, true);
    if (poOpenDate !== undefined) updateData.poOpenDate = poOpenDate ? new Date(poOpenDate) : null;
    if (poCloseDate !== undefined) updateData.poCloseDate = poCloseDate ? new Date(poCloseDate) : null;

    const updatedProduct = await prisma.product.update({ where: { id: Number(id) }, data: updateData });
    res.status(200).json({ success: true, message: 'Produk diperbarui!', data: updatedProduct });
  } catch (error) {
    console.error('Gagal memperbarui produk:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui produk', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: Number(id) } });
    res.status(200).json({ success: true, message: 'Produk berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus produk. Pastikan produk ini belum ada di data pesanan.', error });
  }
};
