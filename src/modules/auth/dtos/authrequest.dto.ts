import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  constructor(params: {email: string, password: string}) {
    this.email = params.email;
    this.password = params.password;
  }
}
