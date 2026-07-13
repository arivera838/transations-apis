import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsArray, IsNumber } from 'class-validator';

export class WompiTransactionDataDto {
  @ApiProperty({ type: String, description: 'The Wompi transaction ID', example: '12345-12345' })
  @IsString()
  id!: string;

  @ApiProperty({ type: String, description: 'The current status of the transaction', example: 'APPROVED' })
  @IsString()
  status!: string;

  @ApiProperty({ type: Number, description: 'The transaction amount in cents', example: 15000000 })
  @IsNumber()
  amount_in_cents!: number;

  @ApiProperty({ type: String, description: 'The reference used for the transaction', example: 'ACC-001_12345' })
  @IsString()
  reference!: string;

  @ApiProperty({ type: String, description: 'The currency of the transaction', example: 'COP' })
  @IsString()
  currency!: string;

  @ApiProperty({ type: String, description: 'The payment method type used', example: 'CARD' })
  @IsString()
  payment_method_type!: string;
}

export class WompiEventDataDto {
  @ApiProperty({ type: () => WompiTransactionDataDto, description: 'Transaction details' })
  @IsObject()
  transaction!: WompiTransactionDataDto;
}

export class WompiSignatureDto {
  @ApiProperty({ type: [String], description: 'List of properties used to calculate the checksum', example: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'] })
  @IsArray()
  properties!: string[];

  @ApiProperty({ type: String, description: 'The SHA256 checksum', example: 'd04b98f48e8f8bcc15c6ae5ac050801cd6dcfd428fb5f9e65c4e16e7807340fa' })
  @IsString()
  checksum!: string;
}

export class WompiWebhookDto {
  @ApiProperty({ type: String, description: 'The event type', example: 'transaction.updated' })
  @IsString()
  event!: string;

  @ApiProperty({ type: () => WompiEventDataDto, description: 'The data associated with the event' })
  @IsObject()
  data!: WompiEventDataDto;

  @ApiProperty({ type: String, description: 'The environment where the event occurred', example: 'test' })
  @IsString()
  environment!: string;

  @ApiProperty({ type: () => WompiSignatureDto, description: 'Signature information to verify authenticity' })
  @IsObject()
  signature!: WompiSignatureDto;

  @ApiProperty({ type: Number, description: 'The timestamp of the event', example: 1689264000000 })
  @IsNumber()
  timestamp!: number;

  @ApiProperty({ type: String, description: 'The date and time the event was sent', example: '2023-07-13T16:00:00.000Z' })
  @IsString()
  sent_at!: string;
}
