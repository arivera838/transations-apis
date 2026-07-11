import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepositoryPort {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
}

export const TRANSACTION_REPOSITORY_PORT = Symbol('TransactionRepositoryPort');
