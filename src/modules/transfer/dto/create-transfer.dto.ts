import { Type } from "class-transformer";
import { IsOptional, IsPositive, IsString, IsUUID, Min } from "class-validator";

export class CreateTransferDto {
  @IsPositive()
  @Min(100)
  @Type(() => Number)
  amount: number;

  @IsUUID()
  destination: string;

  @IsOptional()
  @IsString()
  description?: string;

  constructor(params: { amount: number; destination: string; description?: string }) {
    this.amount = params.amount;
    this.destination = params.destination;
    this.description = params.description;
  }
}
