// src/modules/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import {
  Subscription,
  SubscriptionStatus,
  UserTier,
} from './entities/subscription.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
  ) {}

  async activatePremium(
    userId: string,
    amount: number,
    tier: string = 'premium',
  ) {
    let sub = await this.subRepo.findOne({ where: { user_id: userId } });

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    if (!sub) {
      sub = this.subRepo.create({
        user_id: userId,
        tier: tier as UserTier,
        status: SubscriptionStatus.ACTIVE,
        last_amount: amount,
        last_payment_date: new Date(),
        valid_until: expirationDate,
      });
    } else {
      sub.status = SubscriptionStatus.ACTIVE;
      sub.tier = tier as UserTier;
      sub.last_amount = amount;
      sub.last_payment_date = new Date();
      sub.valid_until = expirationDate;
    }

    return await this.subRepo.save(sub);
  }

  async getSubscriptionByUser(userId: string) {
    const sub = await this.subRepo.findOne({ where: { user_id: userId } });
    if (!sub) {
      return { tier: UserTier.FREE, status: 'none', valid_until: null };
    }
    return sub;
  }

  async createTrial(userId: string, days: number = 15) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const sub = this.subRepo.create({
      user_id: userId,
      tier: UserTier.PREMIUM,
      status: SubscriptionStatus.TRIAL,
      valid_until: expirationDate,
    });

    return await this.subRepo.save(sub);
  }

  async setSpecialUser(userId: string) {
    let sub = await this.subRepo.findOne({ where: { user_id: userId } });

    const data = {
      user_id: userId,
      tier: UserTier.SPECIAL,
      status: SubscriptionStatus.ACTIVE,
      valid_until: new Date('2099-12-31'),
    };

    if (!sub) {
      sub = this.subRepo.create(data);
    } else {
      Object.assign(sub, data);
    }

    return await this.subRepo.save(sub);
  }

  updateUserSubscription(paymentInfo: void) {
    throw new Error('Method not implemented.');
  }
  getPaymentDetail(paymentId: any) {
    throw new Error('Method not implemented.');
  }
  private client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
  });

  async createSubscriptionLink(user: any) {
    const preference = new Preference(this.client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'sub_premium_mensual',
            title: 'Suscripción  - Asistente Emprendedores',
            quantity: 1,
            unit_price: 500,
            currency_id: 'UYU',
          },
        ],
        back_urls: {
          success: 'https://tu-app.com/dashboard?payment=success',
          failure: 'https://tu-app.com/dashboard?payment=failure',
        },
        notification_url: 'https://tu-api.com/payments/webhook',
        external_reference: user.id,
      },
    });

    return result.init_point;
  }
}
