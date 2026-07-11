import { GetProductsUseCase } from './get-products.use-case';
import { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';
import { GetProductsDto } from '../dtos/get-products.dto';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let mockRepository: jest.Mocked<ProductRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      decrementStock: jest.fn(),
    };
    useCase = new GetProductsUseCase(mockRepository);
  });

  it('should return paginated products and map response correctly', async () => {
    const dummyProduct = Product.fromPersistence({
      id: 'prod_1',
      name: 'Test Product',
      price: 15,
      stock: 50,
      category: 'Home',
      image: 'img.png',
      createdAt: '2021-01-01T00:00:00.000Z',
    });

    mockRepository.findAll.mockResolvedValue({
      items: [dummyProduct],
      lastEvaluatedKey: 'prod_1',
    });

    const dto: GetProductsDto = { name: 'Test', limit: 5, lastEvaluatedKey: 'prod_0' };
    const result = await useCase.execute(dto);

    expect(mockRepository.findAll).toHaveBeenCalledWith(
      { name: 'Test' },
      'prod_0',
      5
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('prod_1');
    expect(result.items[0].image).toBe('img.png');
    expect(result.lastEvaluatedKey).toBe('prod_1');
  });

  it('should apply default limit if not provided', async () => {
    mockRepository.findAll.mockResolvedValue({ items: [] });
    await useCase.execute({});
    expect(mockRepository.findAll).toHaveBeenCalledWith({}, undefined, 10);
  });
});
