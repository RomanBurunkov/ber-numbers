/**
 * Simple library to help with BER encoding/decoding integers.
 * Supports BER Short form and Long form from 2 to 5 octets.
 */

"use strict";

/**
 * @typedef {Object} UInt64Parts
 * @property {number} hi - High 32 bits
 * @property {number} lo - Low 32 bits
 */

/** Max possible value to encode */
const MAX_VALUE = 4294967296;
/** Value boundaries array for BER */
const BOUNDARIES = [128, 256, 65536, 16777216, MAX_VALUE];

/** 32bit pad string */
const ZEROS32 = "0".repeat(32);
/** 64bit pad string */
const ZEROS64 = "0".repeat(64);

/**
 * Pads 32bit or 64bit binary number with 0
 * @param {Number} bit
 * @param {32|64} [bitLength] - Total bits to pad to(default 32).
 * @returns {String} Padded binary string.
 */
const pad = (bit, bitLength) => {
  const length = bitLength === 64 ? 64 : 32;
  const zeros = length === 64 ? ZEROS64 : ZEROS32;
  return (zeros + bit.toString(2)).slice(-length);
};

/**
 * Divides 64bit number into hi and lo parts.
 * @param {Number} bit
 * @returns {UInt64Parts} - { hi, lo }
 */
const divide = (bit) => {
  const binString = pad(bit, 64);
  return {
    hi: parseInt(binString.slice(0, 32), 2),
    lo: parseInt(binString.slice(-32), 2),
  };
};

/**
 * Bitwise operations for 64-bit integers: a | b.
 * @param {Number} a
 * @param {Number} b
 * @returns {Number}
 */
const bitWise64 = (a, b) => {
  let _a = divide(a);
  let _b = divide(b);
  return parseInt(pad((_a.hi | _b.hi) >>> 0) + pad((_a.lo | _b.lo) >>> 0), 2);
};

/**
 * Determines the expected total byte length of a BER-encoded integer
 * from its first byte. Accepts either the first byte or the full encoding.
 * 0x81 - 1 value byte (00-FF, 0-255); 2 bytes total including prefix
 * 0x82 - 2 value bytes (0000-FFFF, 0-65535); 3 bytes total including prefix
 * 0x83 - 3 value bytes (000000-FFFFFF, 0-16777215); 4 bytes total including prefix
 * 0x84 - 4 value bytes (00000000-FFFFFFFF, 0-4294967295); 5 bytes total including prefix
 * @param {String} ber - BER encoded value or its first byte.
 * @returns {Number|false} - Expected byte length, or false for missing/unsupported input.
 */
const length = (ber) => {
  if (typeof ber !== "string" || !ber.length) {
    return false;
  }
  const byte = parseInt(ber.length > 2 ? ber[0] + ber[1] : ber, 16);
  if (!Number.isFinite(byte) || byte === 128 || byte > 132) {
    return false;
  }
  // Short encoding used for values 0-127.
  if (byte < 128) {
    return 1;
  }
  // Long-form encoding.
  return byte - 127;
};

/**
 * Returns the minimum total byte length required to encode an integer using BER.
 * @param {Number} val - Non-negative integer less than 2^32.
 * @returns {1|2|3|4|5|false} Encoded byte length, or false if out of range or invalid.
 */
const calcLength = (val) => {
  if (!Number.isFinite(val) || val < 0 || val >= MAX_VALUE) {
    return false;
  }

  return BOUNDARIES.findIndex((x) => val < x) + 1;
};

/**
 * Decodes BER encoded string and returns it's number value.
 * @param {String} ber - Hex BER encoded string i.g. "F0EF"
 * @returns {Number|false}
 */
const decode = (ber) => {
  // Check BER length.
  const len = length(ber);
  if (!len) {
    return false;
  }
  // Parse and return decoded value.
  return parseInt(len === 1 ? ber : ber.slice(2), 16);
};

/**
 * Encodes number into Hex BER encoded value.
 * @param {Number} val  - Number to encode.
 * @param {Number} [len] - Total number of bytes for the result, if not set it will be calculated.
 * @returns {Number|false} - Encoded HEX value or false if invalid.
 */
const encode = (val, len) => {
  const res = val || 0;
  const encodeLen = len || calcLength(res);
  if (!encodeLen || encodeLen < 1 || encodeLen > 5) {
    return false;
  }
  switch (encodeLen) {
    case 1:
      return res;
    case 2:
      return 0x8100 | res;
    case 3:
      return 0x820000 | res;
    // Use custom bitWise64 for cases 4 and 5, since JS doesn't support bitwise for huge numbers.
    case 4:
      return bitWise64(0x83000000, res);
    case 5:
      return bitWise64(0x8400000000, res);
  }
};

module.exports = { length, calcLength, encode, decode };
