import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto';
import { TransactionResponseDto } from '../../application/dtos/transaction-response.dto';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.createTransactionUseCase.execute(createTransactionDto);
  }
}
