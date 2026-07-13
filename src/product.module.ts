import { Module } from '@nestjs/common';
import { ProductController } from './presentation/controllers/product.controller';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { ProductDynamoDBRepository } from './infrastructure/adapters/dynamodb/product.dynamodb.repository';
import { PRODUCT_REPOSITORY_PORT } from './domain/ports/product.repository.port';

@Module({
  controllers: [ProductController],
  providers: [
    GetProductsUseCase,
    {
      provide: PRODUCT_REPOSITORY_PORT,
      useClass: ProductDynamoDBRepository,
    },
  ],
  exports: [GetProductsUseCase, PRODUCT_REPOSITORY_PORT],
})
export class ProductModule {}
