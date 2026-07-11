import { GetTransactionDto } from 'src/application/dtos/get-transaction.dto';
import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepositoryPort {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findAll(query: GetTransactionDto): Promise<Transaction[]>;
}

export const TRANSACTION_REPOSITORY_PORT = Symbol('TransactionRepositoryPort');
