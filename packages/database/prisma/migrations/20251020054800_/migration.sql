-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentGateway" ADD VALUE 'BRAINTREE';
ALTER TYPE "PaymentGateway" ADD VALUE 'ADYEN';
ALTER TYPE "PaymentGateway" ADD VALUE 'RAZORPAY';
ALTER TYPE "PaymentGateway" ADD VALUE 'SQUARE';
ALTER TYPE "PaymentGateway" ADD VALUE 'AUTHORIZE_NET';
ALTER TYPE "PaymentGateway" ADD VALUE 'OTHER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'E_WALLET';
ALTER TYPE "PaymentMethod" ADD VALUE 'CASH';
