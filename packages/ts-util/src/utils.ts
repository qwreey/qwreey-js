import { logErr } from "./libLog.js";
import { Result } from "./result.js";

/**
 * Converts a union type to an intersection type.
 * @template U The union type to be converted.
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Pads a given number with leading zeros to meet the specified length.
 * @param {number} num The number to be padded.
 * @param {number} [zeroLength=2] The desired total length of the resulting string. Defaults to 2.
 * @returns {string} The padded string representation of the number.
 */
export function zeroPadding(num: number, length: number = 2): string {
  const numStr = Math.abs(num).toString();
  const sign = Math.sign(num);

  let signStr: string;
  if (sign == -1) {
    signStr = "-";
  } else {
    signStr = "";
  }
  const numLength = Math.max(length - signStr.length, 0);

  return signStr + numStr.padStart(numLength, "0");
}

/**
 * Safely parses a JSON string. Returns null if a parsing error occurs.
 * @template T The expected type of the parsed data.
 * @param {string | undefined | null} content The JSON string to parse.
 * @returns {T | null} The parsed object, or null if parsing fails.
 */
export function parseJsonSafe<T = any>(
  content: string | undefined | null,
): T | null {
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Executes a promise and returns a boolean indicating success.
 * Logs an error and returns false if the promise is rejected.
 * @param {Promise<any>} promise The promise to execute.
 * @returns {Promise<boolean>} True if the promise resolves successfully, false otherwise.
 */
export async function AsOk(promise: Promise<any>): Promise<boolean> {
  return await promise
    .then(() => true)
    .catch((i) => {
      logErr("Promise throw(catch in AsOk): " + i);
      return false;
    });
}

/**
 * Executes a promise and returns a wrapped result.
 * @param {Promise<T>} promise The promise to execute.
 * @returns {Promise<Result<T, Error>>} Result.ok(T) if the promise resolves successfully, Result.err(Error) otherwise.
 */
export async function AsResult<T>(
  promise: Promise<T>,
): Promise<Result<T, Error>> {
  return await promise.then(Result.ok).catch(Result.err);
}

/**
 * Executes a promise and returns its result, or null if an error occurs.
 * Logs the error if the promise is rejected.
 * @template T The expected return type of the promise.
 * @param {Promise<T>} promise The promise to execute.
 * @returns {Promise<T | null>} The result of the promise, or null if it fails.
 */
export async function NullCatch<T>(promise: Promise<T>): Promise<T | null> {
  return await promise.catch((i) => {
    logErr("Promise throw(catch in NullCatch): " + i);
    return null;
  });
}

/**
 * Returns an empty promise that resolves to undefined.
 * @returns {Promise<undefined>}
 */
export async function EmptyPromise(): Promise<undefined> {}

/**
 * Returns an promise that resolves to input value.
 * @param {T} input The input value
 * @returns {Promise<T>}
 */
export async function ValuePromise<T>(input: T): Promise<T> {
  return input;
}

/**
 * Returns a promise that immediately rejects with the provided error.
 * @param {Error} err The error to be thrown.
 * @returns {Promise<any>}
 */
export async function ErrorPromise(err: Error): Promise<any> {
  throw err;
}

/**
 * Represents a valid CSS class name or a falsy value to be ignored during the merge process.
 */
export type ClassNameType = string | undefined | false | null;

/**
 * Merges multiple class names and arrays of class names into a single space-separated string.
 * Falsy values such as null, undefined, or false are automatically filtered out.
 * This function handles single-level arrays but does not support deep nesting.
 *
 * @param {...(ClassNameType | ClassNameType[])} classNameList - A list of class names or arrays containing class names.
 * @returns {string} A combined string of valid class names separated by a space.
 */
export function mergeClassName(
  ...classNameList: (ClassNameType | ClassNameType[])[]
): string {
  const buffer = [];
  for (const className of classNameList) {
    if (Array.isArray(className)) {
      for (const item of className) {
        if (item) buffer.push(item);
      }
    } else if (className && className.length) {
      buffer.push(className);
    }
  }
  return buffer.join(" ");
}

export const TIB_UNIT = 1024 ** 4;
export const GIB_UNIT = 1024 ** 3;
export const MIB_UNIT = 1024 ** 2;
export const KIB_UNIT = 1024 ** 1;
/**
 * Formats a file size in bytes into a human-readable string using binary prefixes (IEC standard).
 *
 * @param {number} sizeBytes - The size of the file in bytes.
 * @returns {string} The formatted file size string with its corresponding unit (e.g., "1.5GiB", "500B").
 */
export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes >= TIB_UNIT) {
    return `${(sizeBytes / TIB_UNIT).toFixed(1)}TiB`;
  } else if (sizeBytes >= GIB_UNIT) {
    return `${(sizeBytes / GIB_UNIT).toFixed(1)}GiB`;
  } else if (sizeBytes >= MIB_UNIT) {
    return `${(sizeBytes / MIB_UNIT).toFixed(1)}MiB`;
  } else if (sizeBytes >= KIB_UNIT) {
    return `${(sizeBytes / KIB_UNIT).toFixed(1)}KiB`;
  }
  return `${sizeBytes}B`;
}
