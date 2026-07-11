import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionItemDto {
  @ApiProperty({ description: 'ID of the product', example: 'prod_12345' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'Quantity to purchase', example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
