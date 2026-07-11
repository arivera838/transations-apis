import { GetTransactionUseCase } from './get-transaction.use-case';
import { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { GetTransactionDto } from '../dtos/get-transaction.dto';

describe('GetTransactionUseCase', () => {
  let useCase: GetTransactionUseCase;
  let mockRepository: jest.Mocked<TransactionRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new GetTransactionUseCase(mockRepository);
  });

  it('should return transactions correctly', async () => {
    const dummyTransaction = Transaction.fromPersistence({
      id: '1',
      accountId: 'acc_1',
      type: TransactionType.CREDIT,
      amount: 100,
      currency: 'USD',
      description: 'Test',
      status: TransactionStatus.PENDING,
      createdAt: '2021-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z',
      items: [{ productId: 'prod_1', quantity: 2 }]
    });

    mockRepository.findAll.mockResolvedValue([dummyTransaction]);

    const dto: GetTransactionDto = { accountId: 'acc_1' };
    const result = await useCase.execute(dto);

    expect(mockRepository.findAll).toHaveBeenCalledWith(dto);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].accountId).toBe('acc_1');
  });

  it('should call findAll without accountId if not provided', async () => {
    mockRepository.findAll.mockResolvedValue([]);
    const dto: GetTransactionDto = {};
    const result = await useCase.execute(dto);
    expect(mockRepository.findAll).toHaveBeenCalledWith(dto);
    expect(result).toHaveLength(0);
  });
});
