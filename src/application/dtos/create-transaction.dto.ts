import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { TransactionType } from '../../domain/enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsEnum(TransactionType, {
    message: `type must be one of: ${Object.values(TransactionType).join(', ')}`,
  })
  type!: TransactionType;

  @IsNumber()
  @Min(0.01, { message: 'amount must be greater than 0' })
  amount!: number;

  @IsString()
  @Length(3, 3, { message: 'currency must be a 3-letter ISO code (e.g., USD, COP)' })
  currency!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
