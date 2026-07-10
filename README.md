# Hipud Website

Website pre-order Hipud dengan katalog produk, checkout DP, panel admin, dan sistem ulasan.

## Struktur Project

- `frontend-preorder`: aplikasi React untuk customer dan admin.
- `backend-preorder`: API Express, Prisma, dan MySQL.

## Menjalankan Project Lokal

### Backend

```bash
cd backend-preorder
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

Isi `.env` sesuai database lokal atau hosting:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
JWT_SECRET="change_this_secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change_this_password"
```

### Frontend

```bash
cd frontend-preorder
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173` dan backend di `https://hi-pud.vercel.app/`.

## Catatan Git

File rahasia dan file besar tidak ikut repo:

- `.env`
- `node_modules`
- `dist`
- file upload runtime di `backend-preorder/uploads`

