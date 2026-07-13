import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
  @ApiProperty({ type: String, description: 'Payment method type', example: 'CARD' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ type: String, description: 'Token of the payment method', example: 'tok_test_12345' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ type: String, description: 'Customer email address', example: 'customer@example.com' })
  @IsEmail()
  @IsNotEmpty()
  customerEmail!: string;

  @ApiProperty({ type: String, description: 'Acceptance token for Wompi terms', example: 'acc_test_12345' })
  @IsString()
  @IsNotEmpty()
  acceptanceToken!: string;
}
