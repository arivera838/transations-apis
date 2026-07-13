import { Transaction } from './transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { InvalidTransactionException } from '../../domain/exceptions/domain.exception';

describe('Transaction Entity', () => {
  it('should create a valid transaction', () => {
    const props = {
      accountId: 'acc_123',
      type: TransactionType.CREDIT,
      amount: 100,
      currency: 'usd',
      description: 'Test deposit',
      items: [{ productId: 'prod_1', quantity: 2 }]
    };

    const transaction = Transaction.create(props);

    expect(transaction).toBeDefined();
    expect(transaction.id).toBeDefined();
    expect(transaction.accountId).toBe('acc_123');
    expect(transaction.type).toBe(TransactionType.CREDIT);
    expect(transaction.amount).toBe(100);
    expect(transaction.currency).toBe('USD');
    expect(transaction.description).toBe('Test deposit');
    expect(transaction.status).toBe(TransactionStatus.PENDING);
    expect(transaction.createdAt).toBeDefined();
    expect(transaction.updatedAt).toBeDefined();
  });

  it('should throw exception if amount is less than or equal to 0', () => {
    expect(() => {
      Transaction.create({
        accountId: 'acc_123',
        type: TransactionType.CREDIT,
        amount: 0,
        currency: 'usd',
        items: [{ productId: 'prod_1', quantity: 2 }]
      });
    }).toThrow(InvalidTransactionException);

    expect(() => {
      Transaction.create({
        accountId: 'acc_123',
        type: TransactionType.CREDIT,
        amount: -50,
        currency: 'usd',
        items: [{ productId: 'prod_1', quantity: 2 }]
      });
    }).toThrow(InvalidTransactionException);
  });

  it('should throw exception if accountId is empty', () => {
    expect(() => {
      Transaction.create({
        accountId: '',
        type: TransactionType.DEBIT,
        amount: 100,
        currency: 'usd',
        items: [{ productId: 'prod_1', quantity: 2 }]
      });
    }).toThrow(InvalidTransactionException);
  });

  it('should create from persistence and export to primitives', () => {
    const data = {
      id: 'tx_1',
      accountId: 'acc_1',
      type: TransactionType.DEBIT,
      amount: 200,
      currency: 'EUR',
      description: 'Test',
      status: TransactionStatus.APPROVED,
      createdAt: '2021-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z',
      items: [{ productId: 'prod_1', quantity: 2 }]
    };

    const transaction = Transaction.fromPersistence(data);
    expect(transaction.toPrimitives()).toEqual(data);
  });
});
