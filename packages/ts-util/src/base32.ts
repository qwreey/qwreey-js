export namespace Base32 {
  const Base32Alpabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  /**
   * Encodes a Uint8Array into a Base32 string according to RFC 4648.
   * * @param {Uint8Array} uint8Array - The byte array to encode.
   * @returns {string} The resulting Base32 encoded string.
   */
  export function fromUint8Array(uint8Array: Uint8Array): string {
    let bits = 0;
    let value = 0;
    const output = [];

    for (const byte of uint8Array) {
      value = (value << 8) | byte;
      bits += 8;

      while (bits >= 5) {
        output.push(Base32Alpabet[(value >>> (bits - 5)) & 31]);
        bits -= 5;
      }
    }

    if (bits > 0) {
      output.push(Base32Alpabet[(value << (5 - bits)) & 31]);
    }

    while (output.length % 8 !== 0) {
      output.push("=");
    }

    return output.join("");
  }

  const Base32Lookup = (() => {
    const arr = new Int8Array(256);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    for (let i = 0; i < chars.length; i++) {
      arr[chars.charCodeAt(i)] = i;
    }
    return arr;
  })();

  /**
   * Decodes a Base32 string into a Uint8Array.
   * Ignores padding characters ('=') and is case-insensitive.
   * @param {string} base32 - The Base32 encoded string to decode.
   * @returns {Uint8Array} The decoded byte array.
   */
  export function toUint8Array(base32: string): Uint8Array {
    // 소문자가 들어와도 대문자로 처리. 패딩(=) 제거
    const str = base32.toUpperCase().replace(/=/g, "");
    const outLen = Math.floor((str.length * 5) / 8);
    const result = new Uint8Array(outLen);

    let bits = 0;
    let value = 0;
    let index = 0;

    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      // 5비트씩 가져오기
      value = (value << 5) | Base32Lookup[charCode]!;
      bits += 5;

      // 8비트가 모이면 하나의 바이트로 결과 배열에 넣기
      if (bits >= 8) {
        result[index++] = (value >>> (bits - 8)) & 255;
        bits -= 8;
      }
    }

    return result;
  }
}
