/**
 * Simple library to help with BER encoding/decoding integers.
 */

'use strict';

/**
 * Index accessors
 */
const Hi = 0;
const Lo = 1;

/**
 * Pad string
 */
const ZEROS32 = '0'.repeat(32);
const ZEROS64 = '0'.repeat(64);

/**
 * Pads 32bit binary number with 0
 */
const pad = bit => (ZEROS32 + (bit.toString(2))).slice(-32);

/**
 * Divides hi and lo
 */
const divide = (bit) => {
  let bitString = (ZEROS64 + (Number(bit).toString(2))).slice(-64);
  return [
    parseInt(bitString.slice(0, 32), 2), // hi
    parseInt(bitString.slice(-32), 2) // lo
  ];
}

const bitWise64 = (a, b) => {
  let _a = divide(a);
  let _b = divide(b);
  return parseInt(pad((_a[Hi] | _b[Hi]) >>> 0) + pad((_a[Lo] | _b[Lo]) >>> 0), 2);
}

/**
 * length - returns probable length of BER-encoded number.
 * 81 - 1 bytes: 00-FF, 0-255
 * 82 - 2 bytes: 0000-FFFF, 0-65535
 * 83 - 3 bytes: 000000-FFFFFF, 0-16777215
 * 84 - 4 bytes: 00000000-FFFFFFFF, 0-4294967295
 * @param {String} ber encoded value to check.
 * @returns {Integer}
 */
const length = ber => {
  ber = ber || '';
  if(!ber.length) return false;
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
  if (val < 128) return 1;
  if (val < 256) return 2;
  if (val < 65536) return 3;
  if (val < 16777216) return 4;
  if (val < 4294967296) return 5;
  return false;
};

/**
 * decode - Decodes BER encoded string and returns it's number value.
 * @param  {string} - Hex BER encoded string i.g. "F0EF"
 * @returns {Integer}
 */
const decode = ber => {
  let base = length(ber);
  if (!base) return false;
  return base === 1 ? parseInt(ber, 16) : parseInt(ber.substr(2), 16);
};

/**
 * encode - Encodes number into Hex BER encoded value.
 * @param {Integer} val  - Number to encode.
 * @param {Integer} base - Total number of bytes for the result, if not set it will be calculated.
 * @returns {Integer} - Encoded HEX value.
 */
const encode = (val, base) => {
  val = val || 0;
  base = base || calcLength(val);
  if(!base) return false;
  if (base < 1 || base > 5) return false;
  switch (base) {
    case 1:
      return val;
    case 2:
      return 0x8100 | val;
    case 3:
      return 0x820000 | val;
    case 4:
      //use custom bitWise since JS doesn't support bitwise for huge numbers.
      return bitWise64(0x83000000, val);
    case 5:
      return bitWise64(0x8400000000, val);
  }
};

module.exports = { length, calcLength, encode, decode };
