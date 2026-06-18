import type { UnionToIntersection } from "./utils.js";

/**
 * Represents a generic constructor function, capable of accepting both concrete and abstract classes.
 */
export type AbstractConstructor<T = any> = abstract new (
  ...args: any[]
) => T & { init(...args: any): void };

/**
 * A utility type that combines two constructor types `A` and `B`.
 * Returns a new constructor type intersecting instances and static properties.
 */
export type MixinBoth<
  A extends AbstractConstructor<InstanceType<A>>,
  B extends AbstractConstructor<InstanceType<B>>,
> = (A & B) &
  AbstractConstructor<
    Omit<InstanceType<A>, "init"> & Omit<InstanceType<B>, "init">
  >;

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
    let currentProto = baseClass.prototype;
    while (currentProto && currentProto !== Object.prototype) {
      Object.getOwnPropertyNames(currentProto).forEach((name) => {
        if (name !== "constructor") {
          const descriptor = Object.getOwnPropertyDescriptor(
            currentProto,
            name,
          );
          if (descriptor) {
            Object.defineProperty(targetClass.prototype, name, descriptor);
          }
        }
      });
      currentProto = Object.getPrototypeOf(currentProto);
    }

    let currentClass = baseClass;
    while (
      currentClass &&
      currentClass !== Function.prototype &&
      currentClass !== Object
    ) {
      for (const name of Object.getOwnPropertyNames(currentClass)) {
        if (!["length", "prototype", "name"].includes(name)) {
          const descriptor = Object.getOwnPropertyDescriptor(
            currentClass,
            name,
          );
          if (descriptor) {
            Object.defineProperty(targetClass, name, descriptor);
          }
        }
      }
      currentClass = Object.getPrototypeOf(currentClass);
    }
  }
}

export function isNonNullObject(instance: any): instance is object {
  if (typeof instance !== "object") return false;
  if (instance === null) return false;
  return true;
}

/**
 * Checks whether the given instance incorporates a specific mixin or base class.
 * This utility serves as an alternative to the native `instanceof` operator for custom
 * mixin implementations where the prototype chain does not inherently preserve the relationship.
 *
 * @template T - The constructor type of the target mixin or base class.
 * @param {T} baseClass - The mixin or base class constructor to verify against.
 * @param {*} instance - The object instance to inspect.
 * @returns {instance is T} `true` if the instance incorporates the specified mixin; otherwise, `false`.
 */
export function hasMixin<T extends AbstractConstructor>(
  baseClass: T,
  instance: any,
): instance is T {
  const mixins = getMixins(instance);
  if (!mixins) return false;
  return mixins.includes(baseClass);
}

/**
 * Retrieves the sequence of mixins associated with the specified instance.
 *
 * @param {*} instance - The object instance to inspect.
 * @returns {ReadonlyArray<AbstractConstructor> | undefined} A read-only array of mixin constructors applied to the instance, or `undefined` if no mixins are registered.
 */
export function getMixins(
  instance: any,
): ReadonlyArray<AbstractConstructor> | undefined {
  if (!isNonNullObject(instance)) return;
  if (!("constructor" in instance)) return;

  const instConstructor = instance.constructor;
  if (typeof instConstructor !== "function") return;
  if (!("$baseClassList" in instConstructor)) return;
  const baseClassList = instConstructor["$baseClassList"] as any;
  if (!Array.isArray(baseClassList)) return;

  return baseClassList;
}

/**
 * Creates an anonymous target class, applies the `baseClassList` to it, and returns the constructed mixin class.
 * @param baseClassList A list of base classes you want to compose.
 * @returns A new class constructor containing all instance and static properties of the base classes.
 */
export function mixin<T extends AbstractConstructor[]>(
  ...baseClassList: T
): Mixin<T> {
  const targetClass = class {
    static $baseClassList = baseClassList;
  };
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

export function init<T extends AbstractConstructor>(
  self: InstanceType<T>,
  targetClass: T,
  ...args: Parameters<InstanceType<T>["init"]>
) {
  targetClass.prototype.init.call(self, ...args);
}
