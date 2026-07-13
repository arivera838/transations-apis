import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WompiPaymentGateway } from './wompi.payment.gateway';
import { PaymentMethodData } from '../../../domain/ports/payment.gateway.port';

describe('WompiPaymentGateway', () => {
  let gateway: WompiPaymentGateway;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiPaymentGateway,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test_key'),
          },
        },
      ],
    }).compile();

    gateway = module.get<WompiPaymentGateway>(WompiPaymentGateway);
    configService = module.get<ConfigService>(ConfigService);
    
    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should process payment successfully and return APPROVED', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'wompi_123',
          status: 'APPROVED',
        },
      }),
    });

    const paymentData: PaymentMethodData = {
      type: 'CARD',
      token: 'tok_test',
      customerEmail: 'test@test.com',
      acceptanceToken: 'acc_test',
    };

    const result = await gateway.processPayment('tx_1', 100, 'COP', paymentData);

    expect(result.success).toBe(true);
    expect(result.gatewayTransactionId).toBe('wompi_123');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should return error when Wompi returns DECLINED', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'wompi_124',
          status: 'DECLINED',
        },
      }),
    });

    const paymentData: PaymentMethodData = {
      type: 'CARD',
      token: 'tok_test',
      customerEmail: 'test@test.com',
      acceptanceToken: 'acc_test',
    };

    const result = await gateway.processPayment('tx_2', 100, 'COP', paymentData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Payment status: DECLINED');
  });

  it('should return error when response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          messages: ['Invalid token'],
        },
      }),
    });

    const paymentData: PaymentMethodData = {
      type: 'CARD',
      token: 'tok_test',
      customerEmail: 'test@test.com',
      acceptanceToken: 'acc_test',
    };

    const result = await gateway.processPayment('tx_3', 100, 'COP', paymentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid token');
  });

  it('should handle fetch exception', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const paymentData: PaymentMethodData = {
      type: 'CARD',
      token: 'tok_test',
      customerEmail: 'test@test.com',
      acceptanceToken: 'acc_test',
    };

    const result = await gateway.processPayment('tx_4', 100, 'COP', paymentData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Internal error communicating with payment gateway');
  });
});
