# Mixin Utility (`mixin.ts`)

The `mixin.ts` module provides a set of type definitions and runtime functions for creating and applying class mixins in TypeScript. It allows you to compose classes together, copying both instance methods and static properties, while retaining accurate type information for the resulting mixed classes.

## Types

### `AbstractConstructor<T = any>`
Represents a generic constructor function, which is capable of accepting both concrete and abstract classes.

```typescript
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;
```

### `MixinBoth<A, B>`
A utility type that combines two constructor types `A` and `B`. It returns a new constructor type whose instance is the intersection of the instances of `A` and `B`, and also intersects the static properties of `A` and `B`.

### `Mixin<T>`
A recursive utility type that combines an array (or tuple) of constructor types `T` into a single constructor type. The resulting instance type is the intersection of all the instance types provided in the array.

### `MixinApplyList`
A type representing an array of tuples. The first element is a boolean-like condition (`boolean | undefined | null`), and the second is a constructor. It is used as input for conditionally resolving mixin types.

```typescript
export type MixinApplyList = [boolean | undefined | null, AbstractConstructor][];
```

### `MixinInstance<Apply extends MixinApplyList>`
A utility type that computes an intersection of instance types from a `MixinApplyList`. It only includes the instance types where the condition (the first element of the tuple) is exactly `true`.

## Functions

### `applyRuntimeMixins(targetClass: any, baseClassList: any[])`
Copies prototype methods and static properties from a list of base classes directly onto a target class. This function performs the actual runtime work of mixing classes together.

**Parameters:**
- `targetClass`: The class to which the mixins will be applied.
- `baseClassList`: An array of base classes to mix into the `targetClass`.

**Details:**
- **Instance Methods:** Copies all properties and methods from the prototype of each base class to the `targetClass` prototype, ignoring the `"constructor"` property.
- **Static Properties:** Copies all static properties and methods directly from the base classes to the `targetClass`, ignoring special function properties like `"length"`, `"prototype"`, and `"name"`.

### `mixin<T extends AbstractConstructor[]>(...baseClassList: T): Mixin<T>`
Creates an anonymous empty target class, applies the `baseClassList` to it using `applyRuntimeMixins`, and returns the newly constructed mixin class.

**Parameters:**
- `baseClassList`: A rest parameter containing the base classes you want to compose.

**Returns:**
A new class constructor containing all instance and static properties of the given base classes. The returned type correctly reflects the `Mixin<T>` intersection type.

## Example Usage

```typescript
import { mixin } from './mixin.js';

class Jumpable {
  jump() {
    console.log("Jumping!");
  }
}

class Duckable {
  duck() {
    console.log("Ducking!");
  }
}

// Create a mixed class
const CharacterMixin = mixin(Jumpable, Duckable);

class Character extends CharacterMixin {
  walk() {
    console.log("Walking.");
  }
}

const myChar = new Character();
myChar.walk();
myChar.jump(); // Inherited from Jumpable
myChar.duck(); // Inherited from Duckable
```
