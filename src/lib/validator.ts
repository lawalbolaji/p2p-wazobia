import { ValidationError, validate } from "class-validator";
import express from "express";
import { extractErrors } from "./errors";

/**
 * An async await wrapper around class-validator's .then() promise handler
 * @param schema the schema to validate
 * @returns
 */
export function validateWithPromise<T extends Object>(schema: T) {
  return new Promise((resolve) => {
    validate(schema, { forbidUnknownValues: true }).then((errors) => {
      resolve(errors);
    });
  });
}

export async function validateWrapper<T extends Object>(Schema: T, res: express.Response, next: express.NextFunction) {
  const errors = (await validateWithPromise(Schema)) as ValidationError[];
  if (errors.length) {
    return res.status(400).json({
      status: 400,
      message: extractErrors<ValidationError>(errors, ""),
    });
  }

  return next();
}
