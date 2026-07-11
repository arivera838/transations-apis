import { IsString, IsOptional } from "class-validator";

export class GetTransactionDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  description?: string;
}