export class ProductResponseDto {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  createdAt: string;
}

export class PaginatedProductsResponseDto {
  items: ProductResponseDto[];
  lastEvaluatedKey?: string;
}
