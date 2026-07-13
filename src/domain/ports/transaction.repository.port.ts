import { GetTransactionDto } from 'src/application/dtos/get-transaction.dto';
import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';

export interface TransactionRepositoryPort {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findAll(query: GetTransactionDto): Promise<Transaction[]>;
  findByPaymentId(paymentId: string): Promise<Transaction | null>;
  updateStatus(id: string, status: TransactionStatus): Promise<void>;
}

export const TRANSACTION_REPOSITORY_PORT = Symbol('TransactionRepositoryPort');
