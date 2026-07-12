import { IsString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetTransactionDto {
  @ApiPropertyOptional({ type: String, description: 'Filter by account ID' })
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by transaction type' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by currency' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by description substring' })
  @IsString()
  @IsOptional()
  description?: string;
}