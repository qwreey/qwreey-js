# Result Utility (`result.ts`)

The `result.ts` module provides a Rust-inspired `Result` type for predictable and type-safe error handling in TypeScript. Instead of throwing exceptions, operations can return a `Result` object representing either a success or a failure. 

It uses a discriminated union approach. Because one of the values (`result` or `error`) is guaranteed to be `undefined` when the other is populated, TypeScript's control flow analysis can perfectly narrow the types based on a simple truthiness check.

## Types

### `Result<T, U>`
A discriminated union type that can represent either a successful value of type `T` or an error of type `U`. 

```typescript
export type Result<T, U> =
  | {
      result: undefined;
      error: U;
    }
  | {
      result: T;
      error: undefined;
    };
```

## Functions

The `Result` namespace provides factory functions to easily construct `Result` objects.

### `Result.ok<T>(result: T)`
Creates a successful result object containing the provided `result` value and setting `error` to `undefined`.

**Parameters:**
- `result`: The successful value to wrap.

### `Result.err<U>(error: U)`
Creates an error result object containing the provided `error` value and setting `result` to `undefined`.

**Parameters:**
- `error`: The error value or object to wrap.

## Example Usage

The main benefit of this implementation is that it enables safe, seamless type narrowing. Checking for the presence of the error automatically proves to TypeScript that the success value is defined.

```typescript
import { Result } from './result.js';

// An example function that might fail
function parseInteger(input: string): Result<number, string> {
  const parsed = parseInt(input, 10);
  
  if (isNaN(parsed)) {
    return Result.err(`"${input}" is not a valid number.`);
  }
  
  return Result.ok(parsed);
}

function processData(input: string) {
  const parseResult = parseInteger(input);

  // Type narrowing check
  if (parseResult.error) {
    // Inside this block, TypeScript knows `parseResult.error` is a string
    console.error("Failed to parse:", parseResult.error);
    return;
  }

  // If we reach here, TypeScript knows `parseResult.error` is undefined
  // and `parseResult.result` is definitely a number (type `T`).
  console.log("Parsed successfully. The number is:", parseResult.result * 2);
}

processData("123");   // Output: Parsed successfully. The number is: 246
processData("hello"); // Output: Failed to parse: "hello" is not a valid number.
```