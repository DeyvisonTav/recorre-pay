import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs every day at midnight to update overdue payments
   * Changes PENDING payments to OVERDUE when dueDate is past
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateOverduePayments() {
    this.logger.log('Running updateOverduePayments task...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const result = await this.prisma.payment.updateMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: today,
          },
        },
        data: {
          status: 'OVERDUE',
        },
      });

      this.logger.log(`Updated ${result.count} payments to OVERDUE status`);

      // Also update subscription status to PAST_DUE if they have overdue payments
      const overduePayments = await this.prisma.payment.findMany({
        where: {
          status: 'OVERDUE',
        },
        select: {
          subscriptionId: true,
        },
        distinct: ['subscriptionId'],
      });

      if (overduePayments.length > 0) {
        const subscriptionIds = overduePayments.map((p) => p.subscriptionId);

        await this.prisma.subscription.updateMany({
          where: {
            id: { in: subscriptionIds },
            status: 'ACTIVE',
          },
          data: {
            status: 'PAST_DUE',
          },
        });

        this.logger.log(
          `Updated subscriptions with overdue payments to PAST_DUE status`,
        );
      }
    } catch (error) {
      this.logger.error('Error updating overdue payments:', error);
    }
  }

  /**
   * Runs every day at 1 AM to generate next month payments
   * Creates new PENDING payments for active subscriptions
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async generateNextPayments() {
    this.logger.log('Running generateNextPayments task...');

    try {
      // Find active subscriptions that need a new payment generated
      const activeSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          plan: true,
          payments: {
            orderBy: { dueDate: 'desc' },
            take: 1,
          },
        },
      });

      let paymentsCreated = 0;
      const now = new Date();

      for (const subscription of activeSubscriptions) {
        const lastPayment = subscription.payments[0];

        if (!lastPayment) {
          continue;
        }

        // Calculate when the next payment should be generated
        const lastDueDate = new Date(lastPayment.dueDate);
        let nextDueDate: Date;

        switch (subscription.plan.interval) {
          case 'WEEKLY':
            nextDueDate = new Date(lastDueDate);
            nextDueDate.setDate(
              nextDueDate.getDate() + 7 * subscription.plan.intervalCount,
            );
            break;
          case 'YEARLY':
            nextDueDate = new Date(lastDueDate);
            nextDueDate.setFullYear(
              nextDueDate.getFullYear() + subscription.plan.intervalCount,
            );
            break;
          case 'MONTHLY':
          default:
            nextDueDate = new Date(lastDueDate);
            nextDueDate.setMonth(
              nextDueDate.getMonth() + subscription.plan.intervalCount,
            );
            // Handle edge case where day might not exist in the month
            if (nextDueDate.getDate() !== subscription.dueDay) {
              nextDueDate.setDate(0); // Go to last day of previous month
            }
            break;
        }

        // Only generate if next due date is within 7 days
        const daysUntilDue = Math.ceil(
          (nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilDue <= 7 && daysUntilDue > 0) {
          // Check if payment already exists for this due date
          const existingPayment = await this.prisma.payment.findFirst({
            where: {
              subscriptionId: subscription.id,
              dueDate: nextDueDate,
            },
          });

          if (!existingPayment) {
            await this.prisma.payment.create({
              data: {
                subscriptionId: subscription.id,
                customerId: subscription.customerId,
                amount: subscription.plan.price,
                currency: subscription.plan.currency,
                dueDate: nextDueDate,
                status: 'PENDING',
              },
            });
            paymentsCreated++;
          }
        }
      }

      this.logger.log(`Generated ${paymentsCreated} new payments`);
    } catch (error) {
      this.logger.error('Error generating next payments:', error);
    }
  }

  /**
   * Runs every day at 9 AM to send payment reminders
   * Sends reminders for payments due in X days (based on tenant settings)
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPaymentReminders() {
    this.logger.log('Running sendPaymentReminders task...');

    try {
      // Get all tenants with their reminder settings
      const tenants = await this.prisma.tenant.findMany({
        select: {
          id: true,
          reminderDaysBefore: true,
        },
      });

      let remindersCreated = 0;

      for (const tenant of tenants) {
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + tenant.reminderDaysBefore);
        reminderDate.setHours(0, 0, 0, 0);

        const reminderDateEnd = new Date(reminderDate);
        reminderDateEnd.setHours(23, 59, 59, 999);

        // Find pending payments due on the reminder date for this tenant
        const upcomingPayments = await this.prisma.payment.findMany({
          where: {
            status: 'PENDING',
            dueDate: {
              gte: reminderDate,
              lte: reminderDateEnd,
            },
            customer: {
              tenantId: tenant.id,
            },
          },
          include: {
            customer: true,
            subscription: {
              include: { plan: true },
            },
          },
        });

        for (const payment of upcomingPayments) {
          // Check if reminder was already sent
          const existingNotification = await this.prisma.notification.findFirst({
            where: {
              paymentId: payment.id,
              type: 'PAYMENT_REMINDER',
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
              },
            },
          });

          if (!existingNotification) {
            await this.prisma.notification.create({
              data: {
                type: 'PAYMENT_REMINDER',
                channel: 'EMAIL',
                recipient: payment.customer.email,
                subject: 'Lembrete de Pagamento - RecorrePay',
                message: `Olá ${payment.customer.name},\n\nEste é um lembrete de que sua mensalidade de R$ ${payment.amount} referente ao plano "${payment.subscription.plan.name}" vence em ${tenant.reminderDaysBefore} dia(s).\n\nObrigado!`,
                paymentId: payment.id,
                status: 'PENDING',
              },
            });
            remindersCreated++;

            // TODO: Actually send the email/WhatsApp notification
          }
        }
      }

      this.logger.log(`Created ${remindersCreated} payment reminders`);
    } catch (error) {
      this.logger.error('Error sending payment reminders:', error);
    }
  }

  /**
   * Runs every day at 10 AM to send overdue notifications
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendOverdueNotifications() {
    this.logger.log('Running sendOverdueNotifications task...');

    try {
      // Find overdue payments that haven't been notified in the last 3 days
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const overduePayments = await this.prisma.payment.findMany({
        where: {
          status: 'OVERDUE',
        },
        include: {
          customer: true,
          subscription: {
            include: { plan: true },
          },
        },
      });

      let notificationsCreated = 0;

      for (const payment of overduePayments) {
        // Check if overdue notification was already sent recently
        const recentNotification = await this.prisma.notification.findFirst({
          where: {
            paymentId: payment.id,
            type: 'PAYMENT_OVERDUE',
            createdAt: {
              gte: threeDaysAgo,
            },
          },
        });

        if (!recentNotification) {
          const daysOverdue = Math.ceil(
            (Date.now() - new Date(payment.dueDate).getTime()) /
              (1000 * 60 * 60 * 24),
          );

          await this.prisma.notification.create({
            data: {
              type: 'PAYMENT_OVERDUE',
              channel: 'EMAIL',
              recipient: payment.customer.email,
              subject: 'Pagamento em Atraso - RecorrePay',
              message: `Olá ${payment.customer.name},\n\nSua mensalidade de R$ ${payment.amount} referente ao plano "${payment.subscription.plan.name}" está ${daysOverdue} dia(s) em atraso.\n\nPor favor, regularize sua situação o mais breve possível.\n\nObrigado!`,
              paymentId: payment.id,
              status: 'PENDING',
            },
          });
          notificationsCreated++;

          // TODO: Actually send the email/WhatsApp notification
        }
      }

      this.logger.log(`Created ${notificationsCreated} overdue notifications`);
    } catch (error) {
      this.logger.error('Error sending overdue notifications:', error);
    }
  }
}
