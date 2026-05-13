# PassState Utility (`passState.ts`)

The `passState.ts` module provides a utility for easily passing React state down to child components. Instead of passing the state value and its setter function separately as two props, `PassState` bundles them into a single object containing `value` and `update`.

Crucially, the `value` property inside a `PassState` is kept up-to-date by reference. This means that reading `state.value` always returns the latest state, and you can track changes using `useEffect(..., [state.value])`.

## Hooks

### `PassState.use<T>(initval, deps?)`
A React hook to create a `PassState`. It wraps `useState` and `useRef` to maintain a consistent reference while keeping the value current.

**Parameters:**
- `initval`: The initial value or a function that returns the initial value.
- `deps`: Optional dependencies array. When dependencies change, the state is reset to `initval`.

## Utility Functions

### `PassState.unwrap<T>(state: PassState<T> | T): T`
Returns the inner value if the given object is a `PassState`, otherwise returns the object itself.

### `PassState.isPassState(state: any): boolean`
A type guard that checks if the given object is a `PassState`. Useful when a component can accept either a raw value or a `PassState`.

### `PassState.wrap<T>(value: T, setValue: (newValue: T) => void): PassState<T>`
Manually constructs a `PassState` from a raw value and an update function. Useful when you want to create a `PassState` interface for custom logic rather than a direct React state.

## Error Checking Tools

`PassState` includes built-in methods for simple validation, returning an error message if the condition fails, or `null` if it passes. Available methods depend on the value type:

- **All Types:**
  - `falsyError(message: string)`
- **Numbers (`PassStateNumber`):**
  - `minError(expect: number, message: string)`
  - `maxError(expect: number, message: string)`
- **Strings (`PassStateString`):**
  - `regexError(expectRegex: RegExp, message: string)`
  - `minLengthError(expectLength: number, message: string)`
  - `maxLengthError(expectLength: number, message: string)`
  - `emptyError(message: string)`

Because these methods return `null` on success, you can easily chain multiple checks together using the nullish coalescing operator (`??`). The first failing check will return its error message, short-circuiting the rest.

```typescript
const error = 
  state.minLengthError(20, "Message too short") ?? 
  state.maxLengthError(40, "Message too long");
```

## Example Usage

```tsx
import React from 'react';
import { PassState } from './passState';

// A generic text input component that accepts a PassState or a raw string
function TextInput({ textProp }: { textProp: PassState<string> | string }) {
  const value = PassState.unwrap(textProp);
  const isState = PassState.isPassState(textProp);

  const error = isState 
    ? (textProp as PassState<string>).minLengthError(4, "Minimum length is 4")
    : null;

  return (
    <div>
      <input 
        value={value} 
        onChange={(e) => {
          if (isState) {
            (textProp as PassState<string>).update(e.target.value);
          }
        }}
        readOnly={!isState}
      />
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
}

// Parent component managing the state
export function App() {
  const textState = PassState.use("");

  return (
    <div>
      <h3>Editable Input:</h3>
      <TextInput textProp={textState} />
      
      <h3>Read-Only Input:</h3>
      <TextInput textProp="Static Value" />
    </div>
  );
}
```
