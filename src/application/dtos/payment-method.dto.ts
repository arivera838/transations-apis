import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
  @ApiProperty({ description: 'Payment method type', example: 'CARD' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ description: 'Token of the payment method', example: 'tok_test_12345' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ description: 'Customer email address', example: 'customer@example.com' })
  @IsEmail()
  @IsNotEmpty()
  customerEmail!: string;

  @ApiProperty({ description: 'Acceptance token for Wompi terms', example: 'acc_test_12345' })
  @IsString()
  @IsNotEmpty()
  acceptanceToken!: string;
}
