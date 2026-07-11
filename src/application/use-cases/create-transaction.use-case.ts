import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { TRANSACTION_REPOSITORY_PORT } from '../../domain/ports/transaction.repository.port';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const transaction = Transaction.create({
      accountId: dto.accountId,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    return TransactionResponseDto.fromEntity(savedTransaction);
  }
}
