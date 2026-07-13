import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ type: String })
  id!: string;
  @ApiProperty({ type: String })
  name!: string;
  @ApiProperty({ type: Number })
  price!: number;
  @ApiProperty({ type: Number })
  stock!: number;
  @ApiProperty({ type: String })
  category!: string;
  @ApiProperty({ type: String })
  image!: string;
  @ApiProperty({ type: String })
  createdAt!: string;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  items!: ProductResponseDto[];
  @ApiProperty({ type: String, required: false })
  lastEvaluatedKey?: string;
}
