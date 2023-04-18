import { IsString, IsDateString } from "class-validator";

export class CreateCardDto {
  @IsString()
  CardholderFirstName: string;

  @IsString()
  CardholderLastName: string;

  @IsString()
  CardNumber: string;

  @IsString()
  Cvv: string;

  @IsString()
  Pin: string;

  @IsDateString()
  ExpirationDate: string;

  constructor(params: {
    CardholderFirstName: string;
    CardholderLastName: string;
    CardNumber: string;
    Cvv: string;
    Pin: string;
    ExpirationDate: string;
  }) {
    this.CardholderFirstName = params.CardholderFirstName;
    this.CardholderLastName = params.CardholderLastName;
    this.CardNumber = params.CardNumber;
    this.Cvv = params.Cvv;
    this.Pin = params.Pin;
    this.ExpirationDate = params.ExpirationDate;
  }
}
