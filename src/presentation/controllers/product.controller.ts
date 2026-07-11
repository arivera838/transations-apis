import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetProductsDto } from '../../application/dtos/get-products.dto';
import { PaginatedProductsResponseDto } from '../../application/dtos/product-response.dto';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all paginated products' })
  @ApiResponse({ status: 200, description: 'Paginated list of products', type: PaginatedProductsResponseDto })
  async findAll(
    @Query() query: GetProductsDto,
  ): Promise<PaginatedProductsResponseDto> {
    return this.getProductsUseCase.execute(query);
  }
}
