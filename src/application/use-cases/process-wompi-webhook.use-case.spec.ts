import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ProcessWompiWebhookUseCase } from './process-wompi-webhook.use-case';
import { TRANSACTION_REPOSITORY_PORT, TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { PRODUCT_REPOSITORY_PORT, ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

describe('ProcessWompiWebhookUseCase', () => {
  let useCase: ProcessWompiWebhookUseCase;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let configService: jest.Mocked<ConfigService>;

  const mockSecret = 'test_secret_key';

  const generateSignature = (payload: any, properties: string[], secret: string, timestamp: string) => {
    let concatenatedValues = '';
    for (const property of properties) {
      const keys = property.split('.');
      let value: any = payload.data;
      for (const key of keys) {
        if (value === undefined) break;
        value = value[key];
      }
      if (value !== undefined) {
        concatenatedValues += String(value);
      }
    }
    concatenatedValues += timestamp + secret;
    return crypto.createHash('sha256').update(concatenatedValues).digest('hex');
  };

  beforeEach(async () => {
    transactionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByPaymentId: jest.fn(),
      updateStatus: jest.fn(),
    };

    productRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      decrementStock: jest.fn(),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'WOMPI_EVENTS_SECRET') return mockSecret;
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessWompiWebhookUseCase,
        {
          provide: TRANSACTION_REPOSITORY_PORT,
          useValue: transactionRepository,
        },
        {
          provide: PRODUCT_REPOSITORY_PORT,
          useValue: productRepository,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    useCase = module.get<ProcessWompiWebhookUseCase>(ProcessWompiWebhookUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw an error if the signature is missing or invalid', async () => {
    const payload = {
      event: 'transaction.updated',
      data: { transaction: { id: 'wompi-id-123' } },
    };

    await expect(useCase.execute(payload)).rejects.toThrow('Invalid signature');
  });

  it('should ignore events other than transaction.updated', async () => {
    const payload = {
      event: 'some.other.event',
      data: { transaction: { id: 'wompi-id-123' } },
      timestamp: '1620000000',
    };
    const signatureChecksum = generateSignature(payload, ['transaction.id'], mockSecret, payload.timestamp);
    const payloadWithSignature = {
      ...payload,
      signature: {
        properties: ['transaction.id'],
        checksum: signatureChecksum,
      },
    };

    await useCase.execute(payloadWithSignature);
    expect(transactionRepository.findByPaymentId).not.toHaveBeenCalled();
  });

  it('should process APPROVED and update transaction and decrement stock', async () => {
    const payload = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi-id-123',
          status: 'APPROVED',
          amount_in_cents: 10000,
        }
      },
      timestamp: '1620000000',
    };
    const properties = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
    const signatureChecksum = generateSignature(payload, properties, mockSecret, payload.timestamp);
    const payloadWithSignature = {
      ...payload,
      signature: {
        properties,
        checksum: signatureChecksum,
      },
    };

    transactionRepository.findByPaymentId.mockResolvedValue({
      id: 'internal-tx-1',
      status: TransactionStatus.PENDING,
      items: [{ productId: 'prod-1', quantity: 2 }],
    } as any);

    await useCase.execute(payloadWithSignature);

    expect(transactionRepository.findByPaymentId).toHaveBeenCalledWith('wompi-id-123');
    expect(productRepository.decrementStock).toHaveBeenCalledWith('prod-1', 2);
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith('internal-tx-1', TransactionStatus.APPROVED);
  });

  it('should process DECLINED and update transaction without decrementing stock', async () => {
    const payload = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi-id-123',
          status: 'DECLINED',
          amount_in_cents: 10000,
        }
      },
      timestamp: '1620000000',
    };
    const properties = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
    const signatureChecksum = generateSignature(payload, properties, mockSecret, payload.timestamp);
    const payloadWithSignature = {
      ...payload,
      signature: {
        properties,
        checksum: signatureChecksum,
      },
    };

    transactionRepository.findByPaymentId.mockResolvedValue({
      id: 'internal-tx-1',
      status: TransactionStatus.PENDING,
      items: [{ productId: 'prod-1', quantity: 2 }],
    } as any);

    await useCase.execute(payloadWithSignature);

    expect(transactionRepository.findByPaymentId).toHaveBeenCalledWith('wompi-id-123');
    expect(productRepository.decrementStock).not.toHaveBeenCalled();
    expect(transactionRepository.updateStatus).toHaveBeenCalledWith('internal-tx-1', TransactionStatus.FAILED);
  });

  it('should do nothing if internal transaction status is already matching', async () => {
    const payload = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi-id-123',
          status: 'APPROVED',
          amount_in_cents: 10000,
        }
      },
      timestamp: '1620000000',
    };
    const properties = ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'];
    const signatureChecksum = generateSignature(payload, properties, mockSecret, payload.timestamp);
    const payloadWithSignature = {
      ...payload,
      signature: {
        properties,
        checksum: signatureChecksum,
      },
    };

    transactionRepository.findByPaymentId.mockResolvedValue({
      id: 'internal-tx-1',
      status: TransactionStatus.APPROVED, // Already APPROVED
      items: [{ productId: 'prod-1', quantity: 2 }],
    } as any);

    await useCase.execute(payloadWithSignature);

    expect(transactionRepository.findByPaymentId).toHaveBeenCalledWith('wompi-id-123');
    expect(productRepository.decrementStock).not.toHaveBeenCalled();
    expect(transactionRepository.updateStatus).not.toHaveBeenCalled();
  });
});
