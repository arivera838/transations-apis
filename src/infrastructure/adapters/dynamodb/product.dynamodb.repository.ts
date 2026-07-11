import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput, PutCommand } from '@aws-sdk/lib-dynamodb';
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
}
