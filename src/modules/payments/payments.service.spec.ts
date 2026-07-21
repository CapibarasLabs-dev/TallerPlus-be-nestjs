import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import {
  Subscription,
  SubscriptionStatus,
  UserTier,
} from './entities/subscription.entity';

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
  Preference: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
  })),
}));

describe('PaymentsService', () => {
  let service: PaymentsService;
  const subRepo = {
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => x),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
      ],
    }).compile();
    service = module.get(PaymentsService);
  });

  describe('activatePremium', () => {
    it('creates subscription when missing', async () => {
      subRepo.findOne.mockResolvedValue(null);

      const result = await service.activatePremium('u-1', 500);

      expect(result).toEqual(
        expect.objectContaining({
          user_id: 'u-1',
          tier: UserTier.PREMIUM,
          status: SubscriptionStatus.ACTIVE,
          last_amount: 500,
        }),
      );
      expect(result.valid_until.getTime()).toBeGreaterThan(Date.now());
    });

    it('updates existing subscription', async () => {
      const existing = {
        user_id: 'u-1',
        tier: UserTier.FREE,
        status: SubscriptionStatus.EXPIRED,
      };
      subRepo.findOne.mockResolvedValue(existing);

      const result = await service.activatePremium('u-1', 600, 'premium');
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.last_amount).toBe(600);
    });
  });

  it('getSubscriptionByUser returns FREE default', async () => {
    subRepo.findOne.mockResolvedValue(null);
    await expect(service.getSubscriptionByUser('u-1')).resolves.toEqual({
      tier: UserTier.FREE,
      status: 'none',
      valid_until: null,
    });
  });

  it('createTrial sets PREMIUM/TRIAL', async () => {
    const result = await service.createTrial('u-1', 10);
    expect(result).toEqual(
      expect.objectContaining({
        user_id: 'u-1',
        tier: UserTier.PREMIUM,
        status: SubscriptionStatus.TRIAL,
      }),
    );
  });

  it('setSpecialUser sets far future date', async () => {
    subRepo.findOne.mockResolvedValue(null);
    const result = await service.setSpecialUser('u-1');
    expect(result.tier).toBe(UserTier.SPECIAL);
    expect(result.valid_until).toEqual(new Date('2099-12-31'));
  });

  it('stubs throw Method not implemented', () => {
    expect(() => service.updateUserSubscription(undefined)).toThrow(
      'Method not implemented.',
    );
    expect(() => service.getPaymentDetail('x')).toThrow(
      'Method not implemented.',
    );
  });
});
