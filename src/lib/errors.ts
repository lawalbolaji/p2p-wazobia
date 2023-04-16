/**
 * the function recurses through the error object and returns the error as a single string
 * @param stream the default error stream from class-validator
 * @param errors a placeholder for the values for successive recursive calls
 * @returns a string representation of all the concatenated errors
 */
export function extractErrors<T extends { children?: T[]; constraints?: { [type: string]: string } }>(
  stream: T[],
  errors: string
) {
  for (const data of stream) {
    if (!data.children || data.children.length === 0) {
      errors += Object.values(data.constraints || {}).join("; ") + "; ";
    } else {
      errors += extractErrors(data.children, errors);
    }
  }

  return errors;
}
