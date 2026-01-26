import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2024-12-18.acacia',
      });
    }
  }

  /**
   * Verify webhook signature and construct event
   */
  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<{ received: boolean }> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);

    // Find payment by Stripe payment intent ID
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
      include: { subscription: true },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
      },
    });

    // Update subscription status if it was PAST_DUE
    if (payment.subscription.status === 'PAST_DUE') {
      // Check if there are other overdue payments
      const overduePayments = await this.prisma.payment.count({
        where: {
          subscriptionId: payment.subscriptionId,
          status: 'OVERDUE',
        },
      });

      if (overduePayments === 0) {
        await this.prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: 'ACTIVE' },
        });
      }
    }

    // Create notification for payment confirmation
    await this.prisma.notification.create({
      data: {
        type: 'PAYMENT_CONFIRMED',
        channel: 'EMAIL',
        recipient: payment.subscription.customerId, // Will need customer email
        subject: 'Pagamento Confirmado - RecorrePay',
        message: `Seu pagamento de R$ ${payment.amount} foi confirmado com sucesso!`,
        paymentId: payment.id,
        status: 'PENDING',
      },
    });

    this.logger.log(`Payment ${payment.id} marked as PAID`);
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    this.logger.log(`Payment intent failed: ${paymentIntent.id}`);

    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Keep payment as PENDING or mark as OVERDUE if past due date
    const now = new Date();
    if (new Date(payment.dueDate) < now) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'OVERDUE' },
      });
    }

    this.logger.log(`Payment ${payment.id} failed`);
  }

  /**
   * Handle paid invoice
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice paid: ${invoice.id}`);

    const payment = await this.prisma.payment.findFirst({
      where: { stripeInvoiceId: invoice.id },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for invoice: ${invoice.id}`);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    this.logger.log(`Payment ${payment.id} marked as PAID via invoice`);
  }

  /**
   * Handle failed invoice payment
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.log(`Invoice payment failed: ${invoice.id}`);

    const payment = await this.prisma.payment.findFirst({
      where: { stripeInvoiceId: invoice.id },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for invoice: ${invoice.id}`);
      return;
    }

    // Mark payment as overdue
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'OVERDUE' },
    });

    // Update subscription to PAST_DUE
    await this.prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: { status: 'PAST_DUE' },
    });

    this.logger.log(`Payment ${payment.id} marked as OVERDUE`);
  }

  /**
   * Handle new subscription created in Stripe
   */
  private async handleSubscriptionCreated(stripeSubscription: Stripe.Subscription) {
    this.logger.log(`Subscription created: ${stripeSubscription.id}`);

    // Find subscription by Stripe subscription ID
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for Stripe subscription: ${stripeSubscription.id}`);
      return;
    }

    // Update subscription status based on Stripe status
    const status = this.mapStripeSubscriptionStatus(stripeSubscription.status);
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status },
    });

    this.logger.log(`Subscription ${subscription.id} synced with Stripe`);
  }

  /**
   * Handle subscription update in Stripe
   */
  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
    this.logger.log(`Subscription updated: ${stripeSubscription.id}`);

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for Stripe subscription: ${stripeSubscription.id}`);
      return;
    }

    const status = this.mapStripeSubscriptionStatus(stripeSubscription.status);
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status },
    });

    this.logger.log(`Subscription ${subscription.id} updated to ${status}`);
  }

  /**
   * Handle subscription deletion in Stripe
   */
  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
    this.logger.log(`Subscription deleted: ${stripeSubscription.id}`);

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for Stripe subscription: ${stripeSubscription.id}`);
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    this.logger.log(`Subscription ${subscription.id} marked as CANCELED`);
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Checkout session completed: ${session.id}`);

    // This could be used for one-time payments or subscription creation via Checkout
    if (session.payment_intent) {
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent.id;

      const payment = await this.prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (payment) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        this.logger.log(`Payment ${payment.id} marked as PAID via checkout`);
      }
    }
  }

  /**
   * Map Stripe subscription status to internal status
   */
  private mapStripeSubscriptionStatus(
    stripeStatus: Stripe.Subscription.Status,
  ): 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'PAST_DUE' {
    switch (stripeStatus) {
      case 'active':
      case 'trialing':
        return 'ACTIVE';
      case 'paused':
        return 'PAUSED';
      case 'canceled':
      case 'unpaid':
      case 'incomplete_expired':
        return 'CANCELED';
      case 'past_due':
      case 'incomplete':
        return 'PAST_DUE';
      default:
        return 'ACTIVE';
    }
  }

  /**
   * Create a payment link for a payment
   */
  async createPaymentLink(paymentId: string): Promise<string> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        customer: true,
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    // Create a Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: payment.currency.toLowerCase(),
            product_data: {
              name: payment.subscription.plan.name,
              description: `Pagamento referente ao plano ${payment.subscription.plan.name}`,
            },
            unit_amount: Math.round(Number(payment.amount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      customer_email: payment.customer.email,
      metadata: {
        paymentId: payment.id,
        customerId: payment.customerId,
        subscriptionId: payment.subscriptionId,
      },
      success_url: `${this.configService.get('FRONTEND_URL')}/payments?success=true`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/payments?canceled=true`,
    });

    // Update payment with Stripe payment intent ID
    if (session.payment_intent) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripePaymentIntentId: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent.id,
          paymentLink: session.url,
        },
      });
    }

    return session.url!;
  }
}
