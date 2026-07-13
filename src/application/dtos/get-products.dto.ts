import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsDto {
  @ApiPropertyOptional({ type: String, description: 'Filter by product name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: String, description: 'Pagination key for next page' })
  @IsOptional()
  @IsString()
  lastEvaluatedKey?: string;

  @ApiPropertyOptional({ type: Number, description: 'Limit number of results', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
