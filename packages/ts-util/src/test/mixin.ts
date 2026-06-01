import { mixin, hasMixin } from "../mixin.js";
export function test() {
  class A {}
  class B {}
  class C extends mixin(A, B) {}

  const instC = new C();

  console.log(hasMixin(A, instC));
}
