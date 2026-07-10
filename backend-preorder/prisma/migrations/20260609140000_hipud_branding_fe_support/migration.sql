-- Make PO dates optional so products can be catalog-only menu items.
ALTER TABLE "Product" ALTER COLUMN "poOpenDate" DROP NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "poCloseDate" DROP NOT NULL;

-- Product branding and orderability fields.
ALTER TABLE "Product"
  ADD COLUMN "category" TEXT DEFAULT 'Mochi Daifuku',
  ADD COLUMN "variant" TEXT,
  ADD COLUMN "badge" TEXT,
  ADD COLUMN "isOrderable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Order pickup/danus details.
ALTER TABLE "Order"
  ADD COLUMN "pickupMethod" TEXT DEFAULT 'pickup',
  ADD COLUMN "pickupDate" TIMESTAMP(3),
  ADD COLUMN "pickupTime" TEXT,
  ADD COLUMN "pickupLocation" TEXT,
  ADD COLUMN "faculty" TEXT,
  ADD COLUMN "notes" TEXT;

-- Store item unit price so old/new admin can show subtotal reliably.
ALTER TABLE "OrderItem"
  ADD COLUMN "price" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ALTER COLUMN "subtotal" TYPE DOUBLE PRECISION USING "subtotal"::DOUBLE PRECISION;

-- Reviews can be public/anonymous and product selection is optional.
ALTER TABLE "Review" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "Review" ADD COLUMN "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
