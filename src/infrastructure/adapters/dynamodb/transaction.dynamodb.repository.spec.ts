import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TransactionDynamoDBRepository } from './transaction.dynamodb.repository';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { DYNAMODB_CLIENT } from './dynamodb.provider';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionType } from '../../../domain/enums/transaction-type.enum';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

describe('TransactionDynamoDBRepository', () => {
  let repository: TransactionDynamoDBRepository;
  let configService: ConfigService;
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(async () => {
    ddbMock.reset();

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'aws.dynamodb.transactionsTable') return 'TestTransactionsTable';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionDynamoDBRepository,
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: DYNAMODB_CLIENT,
          useValue: DynamoDBDocumentClient.from(new DynamoDBClient({})),
        },
      ],
    }).compile();

    repository = module.get<TransactionDynamoDBRepository>(TransactionDynamoDBRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should save a transaction', async () => {
    const transaction = Transaction.create({
      accountId: 'acc_1',
      type: TransactionType.CREDIT,
      amount: 100,
      currency: 'USD',
      items: [{ productId: 'prod_1', quantity: 2 }],
    });

    ddbMock.on(PutCommand).resolves({});

    const result = await repository.save(transaction);
    expect(result).toEqual(transaction);
    expect(ddbMock.calls().length).toBe(1);
  });

  it('should handle error when saving a transaction', async () => {
    const transaction = Transaction.create({
      accountId: 'acc_1',
      type: TransactionType.CREDIT,
      amount: 100,
      currency: 'USD',
      items: [{ productId: 'prod_1', quantity: 2 }],
    });

    ddbMock.on(PutCommand).rejects(new Error('DynamoDB Error'));
    await expect(repository.save(transaction)).rejects.toThrow('DynamoDB Error');
  });

  it('should find all transactions for an account using QueryCommand', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          id: '1',
          accountId: 'acc_1',
          type: 'DEPOSIT',
          amount: 100,
          currency: 'USD',
          description: '',
          status: 'PENDING',
          createdAt: '2021-01-01T00:00:00.000Z',
          updatedAt: '2021-01-01T00:00:00.000Z',
        },
      ],
    });

    const result = await repository.findAll({ accountId: 'acc_1' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');

    const calls = ddbMock.calls();
    expect(calls[0].args[0].input).toEqual(expect.objectContaining({
      TableName: 'TestTransactionsTable',
      IndexName: 'accountId-createdAt-index',
    }));
  });

  it('should find all transactions globally using ScanCommand if accountId is missing', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [],
    });

    const result = await repository.findAll({});
    expect(result).toHaveLength(0);

    const calls = ddbMock.calls();
    expect(calls[0].args[0].input).toEqual(expect.objectContaining({
      TableName: 'TestTransactionsTable',
    }));
  });
});
