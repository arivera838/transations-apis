import { CreateTransactionUseCase } from './create-transaction.use-case';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { PaymentGatewayPort } from '../../domain/ports/payment.gateway.port';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { InvalidTransactionException } from '../../domain/exceptions/domain.exception';
import { Product } from '../../domain/entities/product.entity';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockTransactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let mockProductRepository: jest.Mocked<ProductRepositoryPort>;
  let mockPaymentGateway: jest.Mocked<PaymentGatewayPort>;

  beforeEach(() => {
    mockTransactionRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPaymentId: jest.fn(),
      updateStatus: jest.fn(),
    };
    mockProductRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };
    mockPaymentGateway = {
      processPayment: jest.fn(),
    };
    useCase = new CreateTransactionUseCase(
      mockTransactionRepository,
      mockProductRepository,
      mockPaymentGateway,
    );
  });

  it('should create and save a valid transaction', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc_123',
      type: TransactionType.CREDIT,
      amount: 150,
      currency: 'USD',
      description: 'Test',
      items: [{ productId: 'prod_1', quantity: 2 }],
      paymentMethod: {
        type: 'CARD',
        token: 'tok_1',
        customerEmail: 'a@a.com',
        acceptanceToken: 'acc_1',
      }
    };

    const mockProduct = Product.fromPersistence({
      id: 'prod_1',
      name: 'Product 1',
      price: 75,
      stock: 10,
      category: 'Cat',
      image: 'img.jpg',
      createdAt: new Date().toISOString(),
    });

    mockProductRepository.findById.mockResolvedValue(mockProduct);
    mockTransactionRepository.save.mockImplementation(async (tx) => tx);
    mockPaymentGateway.processPayment.mockResolvedValue({ success: true, status: TransactionStatus.APPROVED, gatewayTransactionId: 'gw_123' });

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.accountId).toBe('acc_123');
    expect(result.status).toBe(TransactionStatus.APPROVED);
    expect(result.paymentId).toBe('gw_123');

    // First save for PENDING, second save for COMPLETED
    expect(mockTransactionRepository.save).toHaveBeenCalledTimes(2);
    expect(mockPaymentGateway.processPayment).toHaveBeenCalled();
    expect(mockProductRepository.decrementStock).toHaveBeenCalledWith('prod_1', 2);
  });

  it('should fail if product not found', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc_123',
      type: TransactionType.CREDIT,
      amount: 150,
      currency: 'USD',
      items: [{ productId: 'prod_1', quantity: 2 }],
      paymentMethod: { type: 'C', token: 'T', customerEmail: 'a@a.com', acceptanceToken: 'a' }
    };
    mockProductRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(dto)).rejects.toThrow(InvalidTransactionException);
  });

  it('should fail if insufficient stock', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc_123',
      type: TransactionType.CREDIT,
      amount: 150,
      currency: 'USD',
      items: [{ productId: 'prod_1', quantity: 20 }],
      paymentMethod: { type: 'C', token: 'T', customerEmail: 'a@a.com', acceptanceToken: 'a' }
    };
    const mockProduct = Product.create({ name: 'A', price: 7.5, stock: 10, category: 'C', image: 'I' });
    mockProductRepository.findById.mockResolvedValue(mockProduct);

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidTransactionException);
  });

  it('should fail if amounts mismatch', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc_123',
      type: TransactionType.CREDIT,
      amount: 200, // Mismath! 2 * 75 = 150
      currency: 'USD',
      items: [{ productId: 'prod_1', quantity: 2 }],
      paymentMethod: { type: 'C', token: 'T', customerEmail: 'a@a.com', acceptanceToken: 'a' }
    };
    const mockProduct = Product.fromPersistence({ id: 'prod_1', name: 'A', price: 75, stock: 10, category: 'C', image: 'I', createdAt: '' });
    mockProductRepository.findById.mockResolvedValue(mockProduct);

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidTransactionException);
  });

  it('should mark as failed if payment gateway fails', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc_123',
      type: TransactionType.CREDIT,
      amount: 150,
      currency: 'USD',
      items: [{ productId: 'prod_1', quantity: 2 }],
      paymentMethod: { type: 'C', token: 'T', customerEmail: 'a@a.com', acceptanceToken: 'a' }
    };
    const mockProduct = Product.fromPersistence({ id: 'prod_1', name: 'A', price: 75, stock: 10, category: 'C', image: 'I', createdAt: '' });
    mockProductRepository.findById.mockResolvedValue(mockProduct);
    mockTransactionRepository.save.mockImplementation(async (tx) => tx);
    mockPaymentGateway.processPayment.mockResolvedValue({ success: false, status: TransactionStatus.FAILED, gatewayTransactionId: 'gw_error' });

    const result = await useCase.execute(dto);
    expect(result.status).toBe(TransactionStatus.FAILED);
    expect(result.paymentId).toBe('gw_error');
    expect(mockProductRepository.decrementStock).not.toHaveBeenCalled();
  });
});
