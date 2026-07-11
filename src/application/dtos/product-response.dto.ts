import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  price!: number;
  @ApiProperty()
  stock!: number;
  @ApiProperty()
  category!: string;
  @ApiProperty()
  image!: string;
  @ApiProperty()
  createdAt!: string;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  items!: ProductResponseDto[];
  @ApiProperty({ required: false })
  lastEvaluatedKey?: string;
}
