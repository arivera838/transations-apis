import { Injectable, Inject } from "@nestjs/common";
import { GetTransactionDto } from "../dtos/get-transaction.dto";
import { TRANSACTION_REPOSITORY_PORT } from '../../domain/ports/transaction.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) { }

  async execute(query: GetTransactionDto): Promise<TransactionResponseDto[]> {
    return this.transactionRepository.findAll(query);
  }
}