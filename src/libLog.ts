export type LogErr = (msg: string) => any;

let logErrInner: LogErr = console.log.bind(console);
export const logErr: LogErr = (msg: string) => {
  logErr(msg);
};
export function setLogErr(newLogger: LogErr) {
  logErrInner = newLogger;
}
