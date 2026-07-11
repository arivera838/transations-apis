import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto';
import { TransactionResponseDto } from '../../application/dtos/transaction-response.dto';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { GetTransactionDto } from 'src/application/dtos/get-transaction.dto';
import { GetTransactionUseCase } from 'src/application/use-cases/get-transaction.use-case';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly findAllTransactionUseCase: GetTransactionUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.createTransactionUseCase.execute(createTransactionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: GetTransactionDto,
  ): Promise<TransactionResponseDto[]> {
    return this.findAllTransactionUseCase.execute(query);
  }
}
