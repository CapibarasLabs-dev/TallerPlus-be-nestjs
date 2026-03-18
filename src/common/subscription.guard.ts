import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
  UserTier,
} from '../modules/payments/entities/subscription.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectRepository(Subscription)
    private subRepo: Repository<Subscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub; // Viene del JwtAuthGuard

    const sub = await this.subRepo.findOne({ where: { user_id: userId } });

    if (!sub) throw new ForbiddenException('No posees una suscripción activa.');

    // 1. Si es un usuario especial (familia/amigos), pasa siempre
    if (sub.tier === UserTier.SPECIAL) return true;

    // 2. Si es Premium o Trial, verificamos la fecha de vencimiento
    const isAccessStatus = [
      SubscriptionStatus.ACTIVE,
      SubscriptionStatus.TRIAL,
    ].includes(sub.status);
    const isNotExpired = sub.valid_until && new Date() < sub.valid_until;

    if (isAccessStatus && isNotExpired) {
      return true;
    }

    throw new ForbiddenException(
      'Tu suscripción ha expirado o no tienes acceso Premium.',
    );
  }
}
