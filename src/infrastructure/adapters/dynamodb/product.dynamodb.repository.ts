import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Product } from '../../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../../domain/ports/product.repository.port';
import { DYNAMODB_CLIENT } from './dynamodb.provider';

@Injectable()
export class ProductDynamoDBRepository implements ProductRepositoryPort {
  private readonly logger = new Logger(ProductDynamoDBRepository.name);
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly dynamoDBClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('aws.dynamodb.productsTable') ??
      'Products';
  }

  async save(product: Product): Promise<Product> {
    const item = product.toPrimitives();

    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: item,
      });
      await this.dynamoDBClient.send(command);
      return product;
    } catch (error) {
      this.logger.error(`Failed to save product: ${product.id}`, error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  async findAll(
    filters?: { name?: string },
    lastEvaluatedKey?: string,
    limit?: number,
  ): Promise<{ items: Product[]; lastEvaluatedKey?: string }> {
    const params: ScanCommandInput = {
      TableName: this.tableName,
      Limit: limit || 10,
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = { id: lastEvaluatedKey };
    }

    if (filters?.name) {
      params.FilterExpression = 'contains(#name, :name)';
      params.ExpressionAttributeNames = {
        '#name': 'name',
      };
      params.ExpressionAttributeValues = {
        ':name': filters.name,
      };
    }

    try {
      const command = new ScanCommand(params);
      const result = await this.dynamoDBClient.send(command);

      const items = result.Items?.map((item) =>
        Product.fromPersistence({
          id: item['id'] as string,
          name: item['name'] as string,
          price: item['price'] as number,
          stock: item['stock'] as number,
          category: item['category'] as string,
          image: item['image'] as string,
          createdAt: item['createdAt'] as string,
        }),
      ) ?? [];

      let nextKey: string | undefined = undefined;
      if (result.LastEvaluatedKey && result.LastEvaluatedKey['id']) {
        nextKey = result.LastEvaluatedKey['id'] as string;
      }

      return {
        items,
        lastEvaluatedKey: nextKey,
      };
    } catch (error) {
      this.logger.error(
        'Failed to find all products',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findById(id: string): Promise<Product | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    try {
      const result = await this.dynamoDBClient.send(command);
      if (!result.Item) return null;

      return Product.fromPersistence({
        id: result.Item['id'] as string,
        name: result.Item['name'] as string,
        price: result.Item['price'] as number,
        stock: result.Item['stock'] as number,
        category: result.Item['category'] as string,
        image: result.Item['image'] as string,
        createdAt: result.Item['createdAt'] as string,
      });
    } catch (error) {
      this.logger.error(`Failed to find product: ${id}`, error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id: productId },
      UpdateExpression: 'SET stock = stock - :quantity',
      ConditionExpression: 'stock >= :quantity',
      ExpressionAttributeValues: {
        ':quantity': quantity,
      },
    });

    try {
      await this.dynamoDBClient.send(command);
      this.logger.log(`Stock decremented for product: ${productId} by ${quantity}`);
    } catch (error: any) {
      this.logger.error(`Failed to decrement stock for product: ${productId}`, error instanceof Error ? error.stack : String(error));
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error(`Insufficient stock for product ${productId}`);
      }
      throw error;
    }
  }
}
