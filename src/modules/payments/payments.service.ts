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

  // 1. Activa o renueva una suscripción (Usado por el Webhook)
  async activatePremium(
    userId: string,
    amount: number,
    tier: string = 'premium',
  ) {
    let sub = await this.subRepo.findOne({ where: { user_id: userId } });

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // Sumamos 30 días

    if (!sub) {
      // Si no existe, la creamos de cero
      sub = this.subRepo.create({
        user_id: userId,
        tier: tier as UserTier,
        status: SubscriptionStatus.ACTIVE,
        last_amount: amount,
        last_payment_date: new Date(),
        valid_until: expirationDate,
      });
    } else {
      // Si ya existía, actualizamos datos y extendemos fecha
      sub.status = SubscriptionStatus.ACTIVE;
      sub.tier = tier as UserTier;
      sub.last_amount = amount;
      sub.last_payment_date = new Date();
      sub.valid_until = expirationDate;
    }

    return await this.subRepo.save(sub);
  }

  // 2. Obtener el estado actual del usuario (Para el Dashboard)
  async getSubscriptionByUser(userId: string) {
    const sub = await this.subRepo.findOne({ where: { user_id: userId } });
    if (!sub) {
      // Si no tiene nada, devolvemos un objeto "Free" por defecto
      return { tier: UserTier.FREE, status: 'none', valid_until: null };
    }
    return sub;
  }

  // 3. Crear un periodo de prueba (Trial) - Útil para el registro de nuevos usuarios
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

  // 4. Usuario Especial (Acceso total regalado / Familiar)
  async setSpecialUser(userId: string) {
    let sub = await this.subRepo.findOne({ where: { user_id: userId } });

    const data = {
      user_id: userId,
      tier: UserTier.SPECIAL,
      status: SubscriptionStatus.ACTIVE,
      valid_until: new Date('2099-12-31'), // Una fecha muy lejana
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
    accessToken: process.env.MP_ACCESS_TOKEN, // Tu token de Mercado Pago Uruguay
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
        notification_url: 'https://tu-api.com/payments/webhook', // AQUÍ LLEGAN LOS WEBHOOKS
        external_reference: user.id,
      },
    });

    return result.init_point; // El link que le das al usuario en Next.js
  }
}
