import { Product } from '../entities/product.entity';

export interface ProductRepositoryPort {
  findAll(filters?: { name?: string }, lastEvaluatedKey?: string, limit?: number): Promise<{
    items: Product[];
    lastEvaluatedKey?: string;
  }>;
  save(product: Product): Promise<Product>;
}

export const PRODUCT_REPOSITORY_PORT = Symbol('ProductRepositoryPort');
