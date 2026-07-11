import { Module } from '@nestjs/common';
import { TransactionController } from './presentation/controllers/transaction.controller';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { TransactionDynamoDBRepository } from './infrastructure/adapters/dynamodb/transaction.dynamodb.repository';
import { TRANSACTION_REPOSITORY_PORT } from './domain/ports/transaction.repository.port';

@Module({
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    {
      provide: TRANSACTION_REPOSITORY_PORT,
      useClass: TransactionDynamoDBRepository,
    },
  ],
  exports: [CreateTransactionUseCase],
})
export class TransactionModule {}
