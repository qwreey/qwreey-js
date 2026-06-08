export namespace Base64 {
  /**
   * Configuration options for Base64 encoding.
   */
  export interface ToBase64Options {
    /**
     * The alphabet to use for encoding.
     * 'base64' uses the standard Base64 alphabet (RFC 4648).
     * 'base64url' uses the URL-safe Base64 alphabet.
     * @default 'base64'
     */
    alphabet?: "base64" | "base64url";
    /**
     * Whether to omit the padding character ('=') at the end of the output.
     * @default false
     */
    omitPadding?: boolean;
  }

  const Base64Alpabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const Base64AlpabetUrl =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  /**
   * Encodes a Uint8Array into a Base64 or Base64URL string.
   * @param {Uint8Array} uint8Array - The byte array to encode.
   * @param {ToBase64Options} [options] - Optional encoding configuration.
   * @returns {string} The resulting Base64 or Base64URL encoded string.
   */
  export function fromUint8Array(
    uint8Array: Uint8Array,
    options?: ToBase64Options,
  ): string {
    if ((uint8Array as any).toBase64) {
      return (uint8Array as any).toBase64(options);
    }

    const alphabetName = options?.alphabet ?? "base64";
    const omitPadding = options?.omitPadding ?? false;

    const chars =
      alphabetName === "base64url" ? Base64AlpabetUrl : Base64Alpabet;

    let result = "";
    const len = uint8Array.length;

    // 3바이트(24비트)씩 끊어서 4개의 6비트 문자로 변환
    for (let i = 0; i < len; i += 3) {
      const b1 = uint8Array[i]!;
      const b2 = i + 1 < len ? uint8Array[i + 1]! : 0;
      const b3 = i + 2 < len ? uint8Array[i + 2]! : 0;

      const bits = (b1 << 16) | (b2 << 8) | b3;

      result += chars[(bits >> 18) & 63];
      result += chars[(bits >> 12) & 63];

      if (i + 1 < len) {
        result += chars[(bits >> 6) & 63];
      } else if (!omitPadding) {
        result += "=";
      }

      if (i + 2 < len) {
        result += chars[bits & 63];
      } else if (!omitPadding) {
        result += "=";
      }
    }

    return result;
  }

  const Base64Lookup = (() => {
    const arr = new Int8Array(256);
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (let i = 0; i < chars.length; i++) {
      arr[chars.charCodeAt(i)] = i;
    }
    return arr;
  })();

  /**
   * Decodes a Base64 or Base64URL string into a Uint8Array.
   * Automatically handles both standard and URL-safe alphabets and ignores padding characters ('=').
   * @param {string} base64 - The Base64 or Base64URL encoded string to decode.
   * @returns {Uint8Array} The decoded byte array.
   */
  export function toUint8Array(base64: string): Uint8Array {
    // Base64URL의 -, _ 문자를 표준 +, / 로 바꾸고 패딩 제거
    const str = base64.replace(/-/g, "+").replace(/_/g, "/").replace(/=/g, "");
    const outLen = Math.floor((str.length * 3) / 4);
    const result = new Uint8Array(outLen);

    let bits = 0;
    let value = 0;
    let index = 0;

    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      // 6비트씩 가져오기
      value = (value << 6) | Base64Lookup[charCode]!;
      bits += 6;

      // 8비트가 모일 때마다 바이트로 저장
      if (bits >= 8) {
        result[index++] = (value >>> (bits - 8)) & 255;
        bits -= 8;
      }
    }

    return result;
  }

  /**
   * Create random base64 string.
   * @param bytes byte length
   * @returns {string} created random base64
   */
  export function randomBase64(bytes: number = 12): string {
    const randbytes = crypto.getRandomValues(new Uint8Array(bytes));
    return Base64.fromUint8Array(randbytes);
  }
}
