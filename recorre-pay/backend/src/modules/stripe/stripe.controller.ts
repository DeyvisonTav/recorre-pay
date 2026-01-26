import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  /**
   * Stripe webhook endpoint
   * Must be public (no auth) and receive raw body for signature verification
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new Error('Raw body not available');
    }

    const event = this.stripeService.constructEvent(rawBody, signature);
    return this.stripeService.handleWebhookEvent(event);
  }
}
