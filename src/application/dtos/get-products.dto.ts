import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastEvaluatedKey?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
