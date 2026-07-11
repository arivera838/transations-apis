import { Module } from '@nestjs/common';
import { TransactionController } from './presentation/controllers/transaction.controller';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { TransactionDynamoDBRepository } from './infrastructure/adapters/dynamodb/transaction.dynamodb.repository';
import { TRANSACTION_REPOSITORY_PORT } from './domain/ports/transaction.repository.port';
import { PAYMENT_GATEWAY_PORT } from './domain/ports/payment.gateway.port';
import { WompiPaymentGateway } from './infrastructure/adapters/payment/wompi.payment.gateway';
import { ProductModule } from './product.module';

@Module({
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionUseCase,
    {
      provide: TRANSACTION_REPOSITORY_PORT,
      useClass: TransactionDynamoDBRepository,
    },
    {
      provide: PAYMENT_GATEWAY_PORT,
      useClass: WompiPaymentGateway,
    },
  ],
  imports: [ProductModule],
  exports: [CreateTransactionUseCase, GetTransactionUseCase],
})
export class TransactionModule { }
