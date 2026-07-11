import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { PaginatedProductsResponseDto } from '../../application/dtos/product-response.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let useCase: jest.Mocked<GetProductsUseCase>;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: GetProductsUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    useCase = module.get(GetProductsUseCase);
  });

  it('should return paginated products', async () => {
    const result: PaginatedProductsResponseDto = {
      items: [
        {
          id: '1',
          name: 'P1',
          price: 10,
          stock: 5,
          category: 'C1',
          image: 'img1',
          createdAt: '2021-01-01',
        },
      ],
      lastEvaluatedKey: '1',
    };

    useCase.execute.mockResolvedValue(result);

    const query = { name: 'P1', limit: 5 };
    const response = await controller.findAll(query);

    expect(useCase.execute).toHaveBeenCalledWith(query);
    expect(response).toEqual(result);
  });
});
