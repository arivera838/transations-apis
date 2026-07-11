import { Injectable, Inject } from '@nestjs/common';
import { GetProductsDto } from '../dtos/get-products.dto';
import { PaginatedProductsResponseDto } from '../dtos/product-response.dto';
import { PRODUCT_REPOSITORY_PORT } from '../../domain/ports/product.repository.port';
import type { ProductRepositoryPort } from '../../domain/ports/product.repository.port';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(query: GetProductsDto): Promise<PaginatedProductsResponseDto> {
    const filters = { name: query.name };
    const limit = query.limit || 10;
    
    const result = await this.productRepository.findAll(
      filters,
      query.lastEvaluatedKey,
      limit
    );

    return {
      items: result.items.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: product.image,
        createdAt: product.createdAt,
      })),
      lastEvaluatedKey: result.lastEvaluatedKey,
    };
  }
}
