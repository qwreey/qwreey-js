declare global {
  interface Object {
    /**
     * Calls the specified function block with `this` value as its argument and returns its result.
     *
     * @template T The type of the context object.
     * @template R The type of the result returned by the block.
     * @param block A function to be executed with the context object.
     * @returns The result of the block function.
     */
    let<T, R>(this: T, block: (obj: T) => R): R;

    /**
     * Calls the specified function block with `this` value as its argument and returns `this` value.
     *
     * @template T The type of the context object.
     * @param block A function to perform side effects with the context object.
     * @returns The context object itself (`this`).
     */
    also<T>(this: T, block: (obj: T) => void): T;
  }

  interface String {
    /**
     * Calls the specified function block with the string as its argument and returns its result.
     *
     * @template R The type of the result returned by the block.
     * @param block A function to be executed with the string.
     * @returns The result of the block function.
     */
    let<R>(this: string, block: (obj: string) => R): R;

    /**
     * Calls the specified function block with the string as its argument and returns the string itself.
     *
     * @param block A function to perform side effects with the string.
     * @returns The string itself.
     */
    also(this: string, block: (obj: string) => void): string;
  }
}

export {};
