import { IsEmail, IsOptional, IsString, IsNotEmpty, MinLength, MaxLength, validate, ValidationError } from "class-validator";
import { Response } from "express";
import { Request } from "express-jwt";

export class UserDetailsDto {
  @IsOptional()
  @IsString()
  FirstName?: string;

  @IsOptional()
  @IsString()
  LastName?: string;

  @IsEmail()
  Email: string;

  @MaxLength(50, { message: "password is too long" })
  @MinLength(8, { message: "password is too short" })
  @IsNotEmpty()
  Password: string;

  constructor(params: { Email: string; Password: string; FirstName?: string; LastName?: string }) {
    this.Email = params.Email;
    this.Password = params.Password;
    this.FirstName = params.FirstName;
    this.LastName = params.LastName;
  }
}

export function validateWithPromise<T extends Object>(schema: T) {
  return new Promise((resolve) => {
    validate(schema, { forbidUnknownValues: true }).then((errors) => {
      resolve(errors);
    });
  });
}

export async function validateWrapper<T extends Object>(Schema: T, req: Request, res: Response) {
  const errors = (await validateWithPromise(Schema)) as ValidationError[];
  if (errors.length) {
    res.status(400).json({
      status: 400,
      message: extractErrors<ValidationError>(errors, ""),
    });

    return false;
  }

  return true;
}

function extractErrors<T extends { children?: T[]; constraints?: { [type: string]: string } }>(stream: T[], errors: string) {
  for (const data of stream) {
    if (!data.children || data.children.length === 0) {
      errors += Object.values(data.constraints || {}).join("; ") + "; ";
    } else {
      errors += extractErrors(data.children, errors);
    }
  }

  return errors;
}
