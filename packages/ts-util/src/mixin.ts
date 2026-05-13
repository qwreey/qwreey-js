import type { UnionToIntersection } from "./utils.js";

/**
 * Represents a generic constructor function, capable of accepting both concrete and abstract classes.
 */
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;

/**
 * A utility type that combines two constructor types `A` and `B`.
 * Returns a new constructor type intersecting instances and static properties.
 */
export type MixinBoth<
  A extends AbstractConstructor<InstanceType<A>>,
  B extends AbstractConstructor<InstanceType<B>>,
> = (A & B) & AbstractConstructor<InstanceType<A> & InstanceType<B>>;

/**
 * A recursive utility type that combines an array of constructor types `T` into a single constructor type.
 */
export type Mixin<T extends AbstractConstructor[]> = T extends [
  infer First extends AbstractConstructor,
]
  ? First
  : T extends [
        ...infer Others extends AbstractConstructor[],
        infer Last extends AbstractConstructor,
      ]
    ? MixinBoth<Mixin<Others>, Last>
    : never;

/**
 * Copies prototype methods and static properties from a list of base classes directly onto a target class.
 * @param targetClass The class to which the mixins will be applied.
 * @param baseClassList An array of base classes to mix into the `targetClass`.
 */
export function applyRuntimeMixins(targetClass: any, baseClassList: any[]) {
  for (const baseClass of baseClassList) {
    Object.getOwnPropertyNames(baseClass.prototype).forEach((name) => {
      if (name !== "constructor") {
        const descriptor = Object.getOwnPropertyDescriptor(
          baseClass.prototype,
          name,
        );
        if (descriptor) {
          Object.defineProperty(targetClass.prototype, name, descriptor);
        }
      }
    });

    for (const name of Object.getOwnPropertyNames(baseClass)) {
      if (!["length", "prototype", "name"].includes(name)) {
        const descriptor = Object.getOwnPropertyDescriptor(baseClass, name);

        if (descriptor) {
          Object.defineProperty(targetClass, name, descriptor);
        }
      }
    }
  }
}

/**
 * Creates an anonymous target class, applies the `baseClassList` to it, and returns the constructed mixin class.
 * @param baseClassList A list of base classes you want to compose.
 * @returns A new class constructor containing all instance and static properties of the base classes.
 */
export function mixin<T extends AbstractConstructor[]>(
  ...baseClassList: T
): Mixin<T> {
  const targetClass = class {};
  applyRuntimeMixins(targetClass, baseClassList);
  return targetClass as any;
}

/**
 * Represents an array of tuples where the first element is a condition and the second is a constructor.
 */
export type MixinApplyList = [
  boolean | undefined | null,
  AbstractConstructor,
][];

/**
 * Computes an intersection of instance types from a `MixinApplyList` where the condition is strictly true.
 */
export type MixinInstance<Apply extends MixinApplyList> = UnionToIntersection<
  {
    [K in keyof Apply]: Apply[K][0] extends true
      ? InstanceType<Apply[K][1]>
      : object;
  }[number]
>;
