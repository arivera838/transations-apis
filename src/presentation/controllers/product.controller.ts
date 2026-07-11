import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { GetProductsDto } from '../../application/dtos/get-products.dto';
import { PaginatedProductsResponseDto } from '../../application/dtos/product-response.dto';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

@Controller('products')
export class ProductController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: GetProductsDto,
  ): Promise<PaginatedProductsResponseDto> {
    return this.getProductsUseCase.execute(query);
  }
}
