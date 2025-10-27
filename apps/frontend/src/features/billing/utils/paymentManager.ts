import { Payment, PaymentStatus } from '@xovira/database/src/generated/prisma';
import { prisma } from '@/lib/prisma';
import { DateTime } from 'luxon';

export class PaymentManager {
  static async getPaymentById(paymentId: string): Promise<Payment | null> {
    return await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            user: true,
            plan: true
          }
        }
      }
    });
  }

  static async getUserPayments(userId: string): Promise<Payment[]> {
    if (!userId) {
      throw new Error('User not found');
    }

    return await prisma.payment.findMany({
      where: {
        subscription: {
          userId: userId
        }
      },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async createPayment({
    userId,
    amount,
    currency,
    billingPeriodStart,
    billingPeriodEnd,
    transactionId
  }: {
    userId: string;
    amount: number;
    currency: string;
    billingPeriodStart: Date;
    billingPeriodEnd: Date;
    transactionId?: string;
  }): Promise<Payment> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          take: 1
        }
      }
    });

    if (!user || user.subscriptions.length === 0) {
      throw new Error('User or active subscription not found');
    }

      return await prisma.payment.create({
      data: {
        subscriptionId: user.subscriptions[0].id,
        amount,
        currency,
          status: PaymentStatus.PENDING,
          billingType: 'SUBSCRIPTION' as any,
          paymentMethod: 'OTHER' as any,
          userId: userId,
        billingPeriodStart,
        billingPeriodEnd
      },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });
  }

  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus
  ): Promise<Payment> {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        processedAt: new Date()
      },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });
  }

  static async processPayment(paymentId: string): Promise<Payment> {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          subscription: true
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      try {
        const success = Math.random() > 0.1;

        const status = success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED;
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status,
          },
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        });

        if (success && payment.billingPeriodEnd && payment.subscriptionId) {
          await tx.subscription.update({
            where: { id: payment.subscriptionId as string },
            data: {
              currentPeriodEnd: payment.billingPeriodEnd
            }
          });
        }

        return updatedPayment;
      } catch (error) {
        return await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.FAILED,
          },
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        });
      }
    });
  }

  static async getPaymentHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    payments: Payment[];
    total: number;
    totalPages: number;
  }> {
    if (!userId) {
      throw new Error('User not found');
    }

    const skip = (page - 1) * pageSize;

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: {
          subscription: {
            userId: userId
          }
        },
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.payment.count({
        where: {
          subscription: {
            userId: userId
          }
        }
      })
    ]);

    return {
      payments,
      total,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  static async refundPayment(
    paymentId: string,
    reason?: string
  ): Promise<Payment> {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          subscription: true
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        throw new Error('Can only refund successful payments');
      }
      const refundedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
        },
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        }
      });

      await tx.payment.create({
        data: {
          subscriptionId: payment.subscriptionId,
          amount: -payment.amount, 
          currency: payment.currency,
          status: PaymentStatus.SUCCEEDED,
          billingPeriodStart: payment.billingPeriodStart,
          billingPeriodEnd: payment.billingPeriodEnd,
          billingType: 'SUBSCRIPTION' as any,
          paymentMethod: 'OTHER' as any,
          userId: payment.userId,
          chargeId: `refund_${payment.chargeId || payment.id}`
        }
      });

      return refundedPayment;
    });
  }

  static async getPaymentStatistics(
    userName: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    refundedPayments: number;
    refundedAmount: number;
    netAmount: number;
  }> {
    const user = await prisma.user.findFirst({ where: { name: userName } });
    if (!user) {
      throw new Error('User not found');
    }
    const payments = await prisma.payment.findMany({
      where: {
        subscription: {
          userId: user.id
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    const successfulPayments = payments.filter(p => p.status === PaymentStatus.SUCCEEDED);
    const refundedPayments = payments.filter(p => p.status === PaymentStatus.REFUNDED);
    const totalAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const refundedAmount = refundedPayments.reduce((sum, p) => sum + p.amount, 0);
    return {
      totalAmount,
      successfulPayments: successfulPayments.length,
      failedPayments: payments.filter(p => p.status === PaymentStatus.FAILED).length,
      refundedPayments: refundedPayments.length,
      refundedAmount,
      netAmount: totalAmount - refundedAmount
    };
  }
}