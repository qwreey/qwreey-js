import { mixin } from "../mixin.js";

abstract class Base1 {
  abstract mustImpl(): boolean;
  implByBase1(): boolean {
    console.log("implByBase1");
    return true;
  }
}

abstract class Base2 extends Base1 {
  abstract mustImpl(): boolean;
  implByBase2(): boolean {
    console.log("implByBase2");
    return true;
  }
}

class Impl extends mixin(Base2) {
  mustImpl(): boolean {
    return true;
  }
}

const inst = new Impl();
inst.implByBase1();
inst.implByBase2();
