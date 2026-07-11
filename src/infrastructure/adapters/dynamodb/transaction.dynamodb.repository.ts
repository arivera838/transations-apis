import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../../domain/ports/transaction.repository.port';
import { TransactionType } from '../../../domain/enums/transaction-type.enum';
import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';
import { DYNAMODB_CLIENT } from './dynamodb.provider';

@Injectable()
export class TransactionDynamoDBRepository implements TransactionRepositoryPort {
  private readonly logger = new Logger(TransactionDynamoDBRepository.name);
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly dynamoDBClient: DynamoDBDocumentClient,
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
      });
    } catch (error) {
      this.logger.error(
        `Failed to find transaction: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
