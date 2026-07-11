import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../domain/enums/transaction-type.enum';
import { TransactionItemDto } from './transaction-item.dto';
import { PaymentMethodDto } from './payment-method.dto';

export class CreateTransactionDto {
  @ApiProperty({ description: 'The ID of the account initiating the transaction', example: 'acc_12345' })
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @ApiProperty({ enum: TransactionType, description: 'Type of transaction (CREDIT/DEBIT)' })
  @IsEnum(TransactionType, {
    message: `type must be one of: ${Object.values(TransactionType).join(', ')}`,
  })
  type!: TransactionType;

  @ApiProperty({ description: 'Amount of the transaction in the specified currency', example: 150000 })
  @IsNumber()
  @Min(0.01, { message: 'amount must be greater than 0' })
  amount!: number;

  @ApiProperty({ description: '3-letter ISO currency code', example: 'COP' })
  @IsString()
  @Length(3, 3, { message: 'currency must be a 3-letter ISO code (e.g., USD, COP)' })
  currency!: string;

  @ApiPropertyOptional({ description: 'Optional description of the transaction' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: () => [TransactionItemDto], description: 'List of products to purchase' })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TransactionItemDto)
  items!: TransactionItemDto[];

  @ApiProperty({ type: () => PaymentMethodDto, description: 'Payment method information for Wompi gateway' })
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  @IsNotEmpty()
  paymentMethod!: PaymentMethodDto;
}
