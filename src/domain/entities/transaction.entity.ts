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
  readonly items: { productId: string; quantity: number }[];
  readonly paymentId?: string;
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
    items: { productId: string; quantity: number }[];
    paymentId?: string;
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
    this.items = props.items;
    this.paymentId = props.paymentId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    accountId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    items: { productId: string; quantity: number }[];
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
      items: props.items,
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
    items: { productId: string; quantity: number }[];
    paymentId?: string;
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
      items: this.items,
      paymentId: this.paymentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  markAsCompleted(paymentId: string) {
    (this as any).status = TransactionStatus.COMPLETED;
    (this as any).paymentId = paymentId;
    (this as any).updatedAt = new Date().toISOString();
  }

  markAsFailed(paymentId?: string) {
    (this as any).status = TransactionStatus.FAILED;
    if (paymentId) {
      (this as any).paymentId = paymentId;
    }
    (this as any).updatedAt = new Date().toISOString();
  }
}
