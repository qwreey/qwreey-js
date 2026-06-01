import { Base32 } from "./base32.js";

export namespace TimeId {
  /**
   * Generates a unique, time-sortable identifier string.
   *
   * The identifier is composed of four hyphen-separated segments:
   * - The first two segments encode the current millisecond timestamp.
   * - The last two segments (16 characters) contain random entropy.
   *
   * @returns {string} A unique ID string (e.g., "XXXX-XXXX-YYYY-YYYY").
   */
  export function create(timebase: Date | null = null): string {
    // Create random values
    const randbytes = crypto.getRandomValues(new Uint8Array(8));
    const k32 = Base32.fromUint8Array(randbytes);
    const lower = k32.substring(0, 8);
    const upper = k32.substring(8, 16);
    const timepad = k32.substring(16, 19);

    // Construct time Uint8Array
    timebase ??= new Date();
    const timestamp = BigInt(timebase.getTime());
    const timebuffer = new ArrayBuffer(8);
    const timeview = new DataView(timebuffer);
    timeview.setBigUint64(0, timestamp, false);
    const timearr = new Uint8Array(timebuffer);

    // Assemble id
    const timestr = Base32.fromUint8Array(timearr).substring(0, 13) + timepad;
    const timelower = timestr.substring(0, 8);
    const timeupper = timestr.substring(8, 16);
    const generated = `${timelower}-${timeupper}-${lower}-${upper}`;
    return generated;
  }

  /**
   * Parses a timeId string and returns the original Date and random bytes.
   *
   * @param id The timeId string to parse.
   * @returns An object containing the decoded `date` and `randbytes`.
   * @throws If the timeId format or payload is invalid.
   */
  export function parse(id: string): { date: Date; randbytes: Uint8Array } {
    const parts = id.split("-");
    if (parts.length !== 4) {
      throw new Error("Invalid timeId format");
    }
    const [timeLower, timeUpper, randLower, randUpper] = parts as [
      string,
      string,
      string,
      string,
    ];

    const randStr = randLower + randUpper;
    const randbytes = Base32.toUint8Array(randStr);

    const timeStr = timeLower + timeUpper;
    const timearr = Base32.toUint8Array(timeStr);

    if (randbytes.length !== 8 || timearr.length !== 8) {
      throw new Error("Invalid timeId payload");
    }

    const timeview = new DataView(
      timearr.buffer,
      timearr.byteOffset,
      timearr.byteLength,
    );
    const timestamp = timeview.getBigUint64(0, false);
    const date = new Date(Number(timestamp));

    return { date, randbytes };
  }
}
