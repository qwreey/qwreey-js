import util from "node:util";

export function isGenerator(target: Generator): boolean {
  return (
    target &&
    typeof target.next === "function" &&
    typeof target.throw === "function"
  );
}

export function prettify(value: any, options?: util.InspectOptions): string {
  const typeOf = typeof value;

  if (isGenerator(value)) {
    const generatorOutput = [];
    for (const item of value) {
      generatorOutput.push(prettify(item, options));
    }
    return generatorOutput.join("\n");
  } else if (typeOf === "function") {
    return value.toString();
  } else if (typeOf === "string") {
    return value;
  }
  return util.inspect(value, { depth: 30, maxArrayLength: 200, ...options });
}
