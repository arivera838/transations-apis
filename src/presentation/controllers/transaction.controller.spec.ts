import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

describe('TransactionController', () => {
  let controller: TransactionController;
  let createUseCase: jest.Mocked<CreateTransactionUseCase>;
  let getUseCase: jest.Mocked<GetTransactionUseCase>;

  beforeEach(async () => {
    const mockCreateUseCase = {
      execute: jest.fn(),
    };
    const mockGetUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: CreateTransactionUseCase, useValue: mockCreateUseCase },
        { provide: GetTransactionUseCase, useValue: mockGetUseCase },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    createUseCase = module.get(CreateTransactionUseCase);
    getUseCase = module.get(GetTransactionUseCase);
  });

  it('should call createUseCase and return response', async () => {
    const dto: CreateTransactionDto = {
      accountId: 'acc_1',
      amount: 100,
      currency: 'usd',
      type: TransactionType.CREDIT,
      description: 'Test',
      items: [{ productId: 'prod_1', quantity: 2 }],
      paymentMethod: { type: 'C', token: 'T', customerEmail: 'a@a.com', acceptanceToken: 'a' },
    };

    const response = { id: 'tx_1', ...dto, status: 'PENDING', createdAt: '2021-01-01' } as any;
    createUseCase.execute.mockResolvedValue(response);

    const result = await controller.create(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  it('should call getUseCase and return response', async () => {
    const response = [{ id: 'tx_1', amount: 100 }] as any;
    getUseCase.execute.mockResolvedValue(response);

    const result = await controller.findAll({ accountId: 'acc_1' });
    expect(getUseCase.execute).toHaveBeenCalledWith({ accountId: 'acc_1' });
    expect(result).toEqual(response);
  });
});
