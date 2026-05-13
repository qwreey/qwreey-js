# Interval Utility (`interval.ts`)

A utility designed to execute functions periodically at specific millisecond intervals. 

It provides two distinct classes depending on the synchronicity of the target function. All time properties and configurations are measured in milliseconds.

## Classes

### `Interval<T>`
Executes a standard, synchronous function repeatedly based on the provided interval.

### `IntervalAsync<T>`
Executes an asynchronous function repeatedly. It transforms the relevant execution operations into `async` methods, allowing you to easily `await` manual executions.

Both classes share the following identical logic and methods.

**Methods & Properties:**

- `run()`: Schedules the function execution using a timeout. Throws an error if the interval is already running.
- `drop()`: Clears the current timeout and stops the interval. If no timeout is active, it does nothing. This ensures the interval safely transitions into a non-running state.
- `execute()` / `executeThenRun()`: 
  - `execute()`: Immediately executes the function. If an interval is currently running, its timeout is reset to prevent overlap.
  - `executeThenRun()`: Immediately executes the function and guarantees that the interval continues running afterward.
  *(Note: In `IntervalAsync`, these methods are `async` and return a Promise that should be awaited.)*
- `get result`: Returns the return value (or Promise in `IntervalAsync`) of the last executed function.

## Example Usage

```typescript
import { Interval, IntervalAsync } from './interval.js';

// Synchronous interval running every 1000ms
const counterInterval = new Interval(() => {
  console.log("Tick!");
  return Date.now();
}, 1000, "counter");

counterInterval.run(); // Starts the loop

// ...later
counterInterval.drop(); // Safely stops the loop


// Asynchronous interval fetching data every 5000ms
const fetchDataInterval = new IntervalAsync(async () => {
  const data = await fetchSomeData();
  return data;
}, 5000, "fetcher");

// Execute immediately and guarantee the interval continues running
await fetchDataInterval.executeThenRun();

// Retrieve the last successful promise/result
console.log(await fetchDataInterval.result);
```
