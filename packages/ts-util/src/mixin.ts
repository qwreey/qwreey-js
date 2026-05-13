import type { UnionToIntersection } from "./utils.js";

export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;

export type MixinBoth<
  A extends AbstractConstructor<InstanceType<A>>,
  B extends AbstractConstructor<InstanceType<B>>,
> = (A & B) & AbstractConstructor<InstanceType<A> & InstanceType<B>>;

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

export function mixin<T extends AbstractConstructor[]>(
  ...baseClassList: T
): Mixin<T> {
  const targetClass = class {};
  applyRuntimeMixins(targetClass, baseClassList);
  return targetClass as any;
}

export type MixinApplyList = [
  boolean | undefined | null,
  AbstractConstructor,
][];

export type MixinInstance<Apply extends MixinApplyList> = UnionToIntersection<
  {
    [K in keyof Apply]: Apply[K][0] extends true
      ? InstanceType<Apply[K][1]>
      : object;
  }[number]
>;
