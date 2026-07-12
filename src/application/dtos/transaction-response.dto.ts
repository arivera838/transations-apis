import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionItemDto } from './transaction-item.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ type: String, description: 'The unique transaction ID' })
  id!: string;
  @ApiProperty({ type: String, description: 'The ID of the account' })
  accountId!: string;
  @ApiProperty({ enum: TransactionType })
  type!: TransactionType;
  @ApiProperty({ type: Number, description: 'Amount of the transaction' })
  amount!: number;
  @ApiProperty({ type: String, description: 'Currency code' })
  currency!: string;
  @ApiProperty({ type: String, description: 'Description of the transaction' })
  description!: string;
  @ApiProperty({ enum: TransactionStatus })
  status!: TransactionStatus;
  @ApiProperty({ type: () => [TransactionItemDto] })
  items!: TransactionItemDto[];
  @ApiPropertyOptional({ type: String, description: 'Gateway transaction ID if processed' })
  paymentId?: string;
  @ApiProperty({ type: String })
  createdAt!: string;
  @ApiProperty({ type: String })
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
    dto.items = transaction.items;
    dto.paymentId = transaction.paymentId;
    dto.createdAt = transaction.createdAt;
    dto.updatedAt = transaction.updatedAt;
    return dto;
  }
}
