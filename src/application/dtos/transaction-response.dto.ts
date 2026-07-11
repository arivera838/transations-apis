import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { Transaction } from '../../domain/entities/transaction.entity';

export class TransactionResponseDto {
  id!: string;
  accountId!: string;
  type!: TransactionType;
  amount!: number;
  currency!: string;
  description!: string;
  status!: TransactionStatus;
  createdAt!: string;
  updatedAt!: string;

  static fromEntity(transaction: Transaction): TransactionResponseDto {
    const dto = new TransactionResponseDto();
    dto.id = transaction.id;
    dto.accountId = transaction.accountId;
    dto.type = transaction.type;
    dto.amount = transaction.amount;
    dto.currency = transaction.currency;
    dto.description = transaction.description;
    dto.status = transaction.status;
    dto.createdAt = transaction.createdAt;
    dto.updatedAt = transaction.updatedAt;
    return dto;
  }
}
