import { v4 as uuidv4 } from 'uuid';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { InvalidTransactionException } from '../exceptions/domain.exception';

export class Transaction {
  readonly id: string;
  readonly accountId: string;
  readonly type: TransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly description: string;
  readonly status: TransactionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: {
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    description: string;
    status: TransactionStatus;
    createdAt: string;
    updatedAt: string;
  }) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.type = props.type;
    this.amount = props.amount;
    this.currency = props.currency;
    this.description = props.description;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    accountId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    description?: string;
  }): Transaction {
    if (props.amount <= 0) {
      throw new InvalidTransactionException('Amount must be greater than zero');
    }

    if (!props.accountId || props.accountId.trim().length === 0) {
      throw new InvalidTransactionException('Account ID is required');
    }

    const now = new Date().toISOString();

    return new Transaction({
      id: uuidv4(),
      accountId: props.accountId,
      type: props.type,
      amount: props.amount,
      currency: props.currency.toUpperCase(),
      description: props.description ?? '',
      status: TransactionStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: {
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    description: string;
    status: TransactionStatus;
    createdAt: string;
    updatedAt: string;
  }): Transaction {
    return new Transaction(props);
  }

  toPrimitives(): Record<string, unknown> {
    return {
      id: this.id,
      accountId: this.accountId,
      type: this.type,
      amount: this.amount,
      currency: this.currency,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
