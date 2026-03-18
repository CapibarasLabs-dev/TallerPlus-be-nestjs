import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook-test')
  async testWebhook(
    @Body() data: { userId: string; amount: number; tier: string },
  ) {
    //simulate an succesfull payment
    return await this.paymentsService.activatePremium(
      data.userId,
      data.amount,
      data.tier,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscription')
  async getStatus(@Request() req: any) {
    return await this.paymentsService.getSubscriptionByUser(req.user.sub);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Query('topic') topic: string) {
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const paymentInfo =
        await this.paymentsService.getPaymentDetail(paymentId);
      await this.paymentsService.updateUserSubscription(paymentInfo);
    }

    return { received: true };
  }
}
