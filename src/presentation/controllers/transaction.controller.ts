import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto';
import { TransactionResponseDto } from '../../application/dtos/transaction-response.dto';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { GetTransactionDto } from '../../application/dtos/get-transaction.dto';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    @Inject(CreateTransactionUseCase) private readonly createTransactionUseCase: CreateTransactionUseCase,
    @Inject(GetTransactionUseCase) private readonly findAllTransactionUseCase: GetTransactionUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new transaction and process Wompi payment' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Transaction successfully created and processed.', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data or insufficient stock' })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.createTransactionUseCase.execute(createTransactionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all transactions with optional filters' })
  @ApiResponse({ status: 200, description: 'List of transactions returned successfully', type: [TransactionResponseDto] })
  async findAll(
    @Query() query: GetTransactionDto,
  ): Promise<TransactionResponseDto[]> {
    return this.findAllTransactionUseCase.execute(query);
  }
}
