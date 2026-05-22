if (!Object.prototype.also) {
  Object.defineProperty(Object.prototype, "also", {
    value: function (block) {
      "use strict";
      block(this);
      return this;
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

if (!Object.prototype.let) {
  Object.defineProperty(Object.prototype, "let", {
    value: function (block) {
      "use strict";
      return block(this);
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });
}
