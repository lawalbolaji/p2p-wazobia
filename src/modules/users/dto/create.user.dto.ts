import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  constructor(params: { email: string; password: string; firstName?: string; lastName?: string; permissionFlags?: number }) {
    this.email = params.email;
    this.password = params.password;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
  }
}
