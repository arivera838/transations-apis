import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { TRANSACTION_REPOSITORY_PORT } from '../../domain/ports/transaction.repository.port';
import type { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { PRODUCT_REPOSITORY_PORT } from '../../domain/ports/product.repository.port';
import type { PaymentGatewayPort } from '../../domain/ports/payment.gateway.port';
import { PAYMENT_GATEWAY_PORT } from '../../domain/ports/payment.gateway.port';
import { InvalidTransactionException } from '../../domain/exceptions/domain.exception';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(PAYMENT_GATEWAY_PORT)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    let calculatedAmount = 0;
    
    // Verify products and calculate total amount
    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new InvalidTransactionException(`Product with ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new InvalidTransactionException(`Insufficient stock for product ${product.name}`);
      }
      calculatedAmount += product.price * item.quantity;
    }

    if (Math.abs(calculatedAmount - dto.amount) > 0.01) {
      throw new InvalidTransactionException(`Provided amount (${dto.amount}) does not match the calculated amount (${calculatedAmount}) from items`);
    }

    const transaction = Transaction.create({
      accountId: dto.accountId,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency,
      items: dto.items,
      description: dto.description,
    });

    // Save pending transaction
    const savedTransaction = await this.transactionRepository.save(transaction);

    // Call payment gateway
    const paymentResult = await this.paymentGateway.processPayment(
      savedTransaction.id,
      savedTransaction.amount,
      savedTransaction.currency,
      dto.paymentMethod
    );

    if (paymentResult.success && paymentResult.gatewayTransactionId) {
      savedTransaction.markAsCompleted(paymentResult.gatewayTransactionId);
      
      // Decrement stock
      for (const item of dto.items) {
        await this.productRepository.decrementStock(item.productId, item.quantity);
      }
    } else {
      savedTransaction.markAsFailed(paymentResult.gatewayTransactionId);
    }

    // Update transaction status
    const finalTransaction = await this.transactionRepository.save(savedTransaction);

    return TransactionResponseDto.fromEntity(finalTransaction);
  }
}
