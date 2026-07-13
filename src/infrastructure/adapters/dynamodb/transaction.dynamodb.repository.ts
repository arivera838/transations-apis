import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../../domain/ports/transaction.repository.port';
import { TransactionType } from '../../../domain/enums/transaction-type.enum';
import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';
import { DYNAMODB_CLIENT } from './dynamodb.provider';
import { GetTransactionDto } from 'src/application/dtos/get-transaction.dto';

@Injectable()
export class TransactionDynamoDBRepository implements TransactionRepositoryPort {
  private readonly logger = new Logger(TransactionDynamoDBRepository.name);
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly dynamoDBClient: DynamoDBDocumentClient,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.tableName =
      this.configService.get<string>('aws.dynamodb.transactionsTable') ??
      'Transactions';
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const item = transaction.toPrimitives();

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });

    try {
      await this.dynamoDBClient.send(command);
      this.logger.log(`Transaction saved successfully: ${transaction.id}`);
      return transaction;
    } catch (error) {
      this.logger.error(
        `Failed to save transaction: ${transaction.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    try {
      const result = await this.dynamoDBClient.send(command);

      if (!result.Item) {
        return null;
      }

      return Transaction.fromPersistence({
        id: result.Item['id'] as string,
        accountId: result.Item['accountId'] as string,
        type: result.Item['type'] as TransactionType,
        amount: result.Item['amount'] as number,
        currency: result.Item['currency'] as string,
        description: result.Item['description'] as string,
        status: result.Item['status'] as TransactionStatus,
        createdAt: result.Item['createdAt'] as string,
        updatedAt: result.Item['updatedAt'] as string,
        items: result.Item['items'] as { productId: string, quantity: number }[],
      });
    } catch (error) {
      this.logger.error(
        `Failed to find transaction: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findAll(query: GetTransactionDto): Promise<Transaction[]> {
    let command;

    if (query.accountId) {
      command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'accountId-createdAt-index',
        KeyConditionExpression: 'accountId = :accountId',
        ExpressionAttributeValues: {
          ':accountId': query.accountId,
        },
      });
    } else {
      command = new ScanCommand({
        TableName: this.tableName,
      });
    }

    try {
      const result = await this.dynamoDBClient.send(command);

      return result.Items?.map((item) =>
        Transaction.fromPersistence({
          id: item['id'] as string,
          accountId: item['accountId'] as string,
          type: item['type'] as TransactionType,
          amount: item['amount'] as number,
          currency: item['currency'] as string,
          description: item['description'] as string,
          status: item['status'] as TransactionStatus,
          createdAt: item['createdAt'] as string,
          updatedAt: item['updatedAt'] as string,
          items: item['items'] as { productId: string, quantity: number }[],
        }),
      ) ?? [];
    } catch (error) {
      this.logger.error(
        'Failed to find all transactions',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async findByPaymentId(paymentId: string): Promise<Transaction | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'paymentId-index',
      KeyConditionExpression: 'paymentId = :paymentId',
      ExpressionAttributeValues: {
        ':paymentId': paymentId,
      },
    });

    try {
      const result = await this.dynamoDBClient.send(command);
      
      if (!result.Items || result.Items.length === 0) {
        return null;
      }

      const item = result.Items[0];
      return Transaction.fromPersistence({
        id: item['id'] as string,
        accountId: item['accountId'] as string,
        type: item['type'] as TransactionType,
        amount: item['amount'] as number,
        currency: item['currency'] as string,
        description: item['description'] as string,
        status: item['status'] as TransactionStatus,
        createdAt: item['createdAt'] as string,
        updatedAt: item['updatedAt'] as string,
        paymentId: item['paymentId'] as string,
        items: item['items'] as { productId: string, quantity: number }[],
      });
    } catch (error) {
      this.logger.error(
        `Failed to find transaction by paymentId: ${paymentId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...(await this.findById(id))?.toPrimitives(),
        status,
        updatedAt: new Date().toISOString(),
      },
    });

    try {
      await this.dynamoDBClient.send(command);
      this.logger.log(`Transaction ${id} status updated to ${status}`);
    } catch (error) {
      this.logger.error(
        `Failed to update status for transaction ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
