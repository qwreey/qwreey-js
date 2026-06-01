import { TimeId } from "../timeid.js";
export function test() {
  const inputTime = new Date();
  const id = TimeId.create(inputTime);
  const { date: parsedDate } = TimeId.parse(id);
  console.log(
    inputTime.toISOString(),
    parsedDate.toISOString(),
    inputTime.toISOString() == parsedDate.toISOString(),
  );

  if (inputTime.toISOString() != parsedDate.toISOString()) {
    throw Error("Time id input and parsed data is not matched");
  }
}
