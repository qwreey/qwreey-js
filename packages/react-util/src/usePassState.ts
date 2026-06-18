"use client";

import React from "react";

/**
 * A state utility that bundles a React state value and its setter into a single object.
 * This allows passing a single prop to child components instead of two separate props.
 *
 * Note: `value` is kept up-to-date by reference, meaning it always reflects the latest state.
 */
export namespace PassState {
  export type UpdateActionFunc<T> = (before: T) => T;
  export type UpdateAction<T> = T | UpdateActionFunc<T>;
  function evalUpdateAction<T>(action: UpdateAction<T>, current: T): T {
    if (typeof action === "function") {
      return (action as UpdateActionFunc<T>)(current);
    }
    return action;
  }

  export type InitActionFunc<T> = () => T;
  export type InitAction<T> = T | InitActionFunc<T>;
  function evalInitAction<T>(action: InitAction<T>): T {
    if (typeof action === "function") {
      return (action as InitActionFunc<T>)();
    }
    return action;
  }

  /**
   * Internal implementation of PassState.
   */
  export class PassStateImpl<T> {
    update: React.Dispatch<React.SetStateAction<T>>;
    value: T;

    constructor(value: T, update: React.Dispatch<React.SetStateAction<T>>) {
      this.value = value;
      this.update = update;
    }

    /** Returns the message if the value is falsy, otherwise null. */
    falsyError(message: string): string | null {
      return this.value ? null : message;
    }
    /** Returns the message if the string value does not match the regex, otherwise null. */
    regexError(
      this: PassState<string>,
      expectRegex: RegExp,
      message: string,
    ): string | null {
      if (!this.value) return message;
      if (this.value.match(expectRegex)) return null;
      return message;
    }
    /** Returns the message if the string length is less than the expected length, otherwise null. */
    minLengthError(
      this: PassState<string>,
      expectLength: number,
      message: string,
    ): string | null {
      if (!this.value) return message;
      if (this.value.length < expectLength) return message;
      return null;
    }
    /** Returns the message if the string length exceeds the expected length, otherwise null. */
    maxLengthError(
      this: PassState<string>,
      expectLength: number,
      message: string,
    ): string | null {
      if (!this.value) return message;
      if (this.value.length > expectLength) return message;
      return null;
    }
    /** Returns the message if the string is empty, otherwise null. */
    emptyError(this: PassState<string>, message: string): string | null {
      if (this.value == "") return message;
      if (!this.value) return message;
      return null;
    }

    /** Returns the message if the value is less than the expected minimum, otherwise null. */
    minError(
      this: PassState<number>,
      expect: number,
      message: string,
    ): string | null {
      if (this.value < expect) return message;
      return null;
    }

    /** Returns the message if the value is greater than the expected maximum, otherwise null. */
    maxError(
      this: PassState<number>,
      expect: number,
      message: string,
    ): string | null {
      if (this.value > expect) return message;
      return null;
    }
  }

  /**
   * A React hook that creates a PassState, wrapping `useState` and maintaining an up-to-date reference.
   * @param initval Initial value or a function returning it.
   * @param deps Optional dependencies array to reset the state when changed.
   * @returns A PassState instance.
   */
  function usePassState<T>(initval: InitAction<T>, deps?: any[]): PassState<T> {
    const [value, setValue] = React.useState<T>(() => evalInitAction(initval));
    const refed = React.useRef<PassState<T> | null>(null);

    const wrappedSetter = (action: UpdateAction<T>) => {
      const newValue = evalUpdateAction(action, refed.current!.value);
      refed.current!.value = newValue;
      setValue(() => newValue);
    };

    refed.current ??= new PassStateImpl<T>(
      value,
      wrappedSetter,
    ) as unknown as PassState<T>;

    const inited = React.useRef<boolean>(false);
    React.useEffect(() => {
      if (inited.current) return;
      inited.current = true;
      const newValue = evalInitAction(initval);
      refed.current!.value = newValue;
      setValue(() => newValue);
    }, deps ?? []);

    return refed.current;
  }
  export const use = usePassState;

  /**
   * Type guard to check if an object is a PassState instance.
   */
  export function isPassState<T>(
    obj: T,
  ): T extends PassState<any> ? true : false {
    if (typeof obj !== "object") return false as any;
    return (obj instanceof PassStateImpl) as any;
  }

  /**
   * Returns the inner value if it's a PassState, otherwise returns the object itself.
   */
  export function unwrap<T>(obj: PassState<T> | T): T {
    if (isPassState(obj)) return (obj as PassState<T>).value;
    return obj as T;
  }

  /**
   * Manually constructs a PassState from a raw value and an update function.
   * This can be used to hook into state updates and store the processed values.
   */
  export function wrap<T>(
    value: T,
    setValue: (newValue: T) => void,
  ): PassState<T> {
    const wrapped = new PassStateImpl(value, (i: T | ((input: T) => T)) => {
      if (typeof i === "function") {
        setValue((i as any)(value) as any);
      } else {
        setValue(i);
      }
    });
    return wrapped as unknown as PassState<T>;
  }

  /** Specific error checking methods for numeric PassState. */
  export type PassStateNumber<T extends number> = {
    /** Returns the message if the value is less than the expected minimum, otherwise null. */
    minError(
      this: PassState<T>,
      expect: number,
      message: string,
    ): string | null;
    /** Returns the message if the value is greater than the expected maximum, otherwise null. */
    maxError(
      this: PassState<T>,
      expect: number,
      message: string,
    ): string | null;
  };

  /** Specific error checking methods for string PassState. */
  export type PassStateString<T extends string | null> = {
    /** Returns the message if the string does not match the regex, otherwise null. */
    regexError(
      this: PassState<T>,
      expectRegex: RegExp,
      message: string,
    ): string | null;
    /** Returns the message if the string length is less than expected, otherwise null. */
    minLengthError(
      this: PassState<T>,
      expectLength: number,
      message: string,
    ): string | null;
    /** Returns the message if the string length exceeds expected, otherwise null. */
    maxLengthError(
      this: PassState<T>,
      expectLength: number,
      message: string,
    ): string | null;
    /** Returns the message if the string is empty, otherwise null. */
    emptyError(this: PassState<T>, message: string): string | null;
  };

  /** Base structure for all PassState types. */
  export type PassStateAny<T> = {
    /** Updates the state, triggering a re-render in the originating context. */
    update: React.Dispatch<React.SetStateAction<T>>;
    /** The current value of the state. Always up-to-date by reference. */
    value: T;
    /** Returns the message if the value is falsy, otherwise null. */
    falsyError(this: PassState<T>, message: string): string | null;
  };
}

/**
 * A combined type representing a PassState, which includes `value`, `update`,
 * and specific error checking methods based on the inner type `T`.
 */
export type PassState<T> = (T extends number
  ? PassState.PassStateNumber<T>
  : object) &
  (T extends string | null
    ? T extends null
      ? object
      : PassState.PassStateString<T>
    : object) &
  PassState.PassStateAny<T>;

export const usePassState = PassState.use;
