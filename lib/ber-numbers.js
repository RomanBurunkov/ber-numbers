/**
 * Simple library to help with BER encoding/decoding integers.
 * Supports BER Short form and Long form from 2 to 5 octets.
 */

"use strict";

/**
 * Value boundaries array for BER.
 */
const BOUNDARIES = [128, 256, 65536, 16777216, 4294967296];

/**
 * Pad strings
 */
const ZEROS32 = "0".repeat(32);
const ZEROS64 = "0".repeat(64);

/**
 * Pads 32bit binary number with 0
 */
const pad = bit => (ZEROS32 + bit.toString(2)).slice(-32);

/**
 * Divides hi and lo
 */
const divide = bit => {
  let bitString = (ZEROS64 + Number(bit).toString(2)).slice(-64);
  return {
    hi: parseInt(bitString.slice(0, 32), 2),
    lo: parseInt(bitString.slice(-32), 2)
  };
};

/**
 * Bitwise operations for 64-bit integers
 * @param {Integer} a
 * @param {Integer} b
 * @returns {Integer}
 */
const bitWise64 = (a, b) => {
  let _a = divide(a);
  let _b = divide(b);
  return parseInt(pad((_a.hi | _b.hi) >>> 0) + pad((_a.lo | _b.lo) >>> 0), 2);
};

/**
 * length - returns supposed total length of BER-encoded number.
 * 0x81 - 1 bytes: 00-FF, 0-255
 * 0x82 - 2 bytes: 0000-FFFF, 0-65535
 * 0x83 - 3 bytes: 000000-FFFFFF, 0-16777215
 * 0x84 - 4 bytes: 00000000-FFFFFFFF, 0-4294967295
 * @param {String} val - BER encoded value or it's first byte.
 * @returns {Integer} - Supposed length of the encoded integer.
 */
const length = val => {
  const ber = val || "";
  if (!ber.length) return false;
  let byte = parseInt(ber.length > 2 ? ber.substr(0, 2) : ber, 16);
  if (byte < 128) return 1; // Short encoding used for values 0-127.
  let check = byte - 127;
  return check > 1 && check < 6 ? check : false;
};

/**
 * calcLength - returns recommended length for BER encoding.
 * @param {Integer} val - Number for encoding.
 * @returns {Integer}
 */
const calcLength = val => {
  return val >= BOUNDARIES[BOUNDARIES.length - 1]
    ? false
    : BOUNDARIES.findIndex(x => val < x) + 1;
};

/**
 * decode - Decodes BER encoded string and returns it's number value.
 * @param  {string} - Hex BER encoded string i.g. "F0EF"
 * @returns {Integer}
 */
const decode = ber => {
  // Check BER length.
  let len = length(ber);
  if (!len) return false;
  // Parse and return decoded value.
  return len === 1 ? parseInt(ber, 16) : parseInt(ber.substr(2), 16);
};

/**
 * encode - Encodes number into Hex BER encoded value.
 * @param {Integer} val  - Number to encode.
 * @param {Integer} len - Total number of bytes for the result, if not set it will be calculated.
 * @returns {Integer} - Encoded HEX value.
 */
const encode = (val, len) => {
  const res = val || 0;
  const encodeLen = len || calcLength(res);
  if (!encodeLen) return false;
  if (encodeLen < 1 || encodeLen > 5) return false;
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
