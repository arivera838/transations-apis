import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProductDynamoDBRepository } from './product.dynamodb.repository';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { DYNAMODB_CLIENT } from './dynamodb.provider';
import { Product } from '../../../domain/entities/product.entity';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

describe('ProductDynamoDBRepository', () => {
  let repository: ProductDynamoDBRepository;
  let configService: ConfigService;
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(async () => {
    ddbMock.reset();

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'aws.dynamodb.productsTable') return 'TestProductsTable';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductDynamoDBRepository,
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: DYNAMODB_CLIENT,
          useValue: DynamoDBDocumentClient.from(new DynamoDBClient({})),
        },
      ],
    }).compile();

    repository = module.get<ProductDynamoDBRepository>(ProductDynamoDBRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should save a product', async () => {
    const product = Product.create({
      name: 'Test Product',
      price: 100,
      stock: 10,
      category: 'Electronics',
    });

    ddbMock.on(PutCommand).resolves({});

    const result = await repository.save(product);
    expect(result).toEqual(product);
    expect(ddbMock.calls().length).toBe(1);
  });

  it('should handle error when saving a product', async () => {
    const product = Product.create({
      name: 'Test Product',
      price: 100,
      stock: 10,
      category: 'Electronics',
    });

    ddbMock.on(PutCommand).rejects(new Error('DynamoDB Error'));

    await expect(repository.save(product)).rejects.toThrow('DynamoDB Error');
  });

  it('should find all products without filters', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [
        {
          id: '1',
          name: 'Test',
          price: 10,
          stock: 5,
          category: 'C',
          image: '',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
      ],
      LastEvaluatedKey: { id: '1' },
    });

    const result = await repository.findAll();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('1');
    expect(result.lastEvaluatedKey).toBe('1');
  });

  it('should find all products with filters', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [],
    });

    const result = await repository.findAll({ name: 'Test' }, 'lastId', 5);
    expect(result.items).toHaveLength(0);
    expect(result.lastEvaluatedKey).toBeUndefined();

    const calls = ddbMock.calls();
    expect(calls[0].args[0].input).toEqual(expect.objectContaining({
      TableName: 'TestProductsTable',
      FilterExpression: 'contains(#name, :name)',
      ExclusiveStartKey: { id: 'lastId' },
      Limit: 5,
    }));
  });
});
