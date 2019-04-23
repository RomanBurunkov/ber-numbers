/* eslint-env jest */

const ber = require("./../lib/ber-numbers");

describe("Test length function", () => {
  test("Should return 1 for values less then 128", () => {
    ["1", "10", "40", "100", "127"].forEach(val =>
      expect(ber.length(val)).toBe(1)
    );
  });

  test("Should return 4 for 83XXXXXX values", () => {
    expect(ber.length("83000555")).toBe(4);
  });

  test("Should return false if nothing was passed", () => {
    expect(ber.length()).toBe(false);
  });

  test("Should return false if empty string was passed", () => {
    expect(ber.length("")).toBe(false);
  });

  test("Should return false if not valid value was passed", () => {
    expect(ber.length("86000555")).toBe(false);
  });
});

describe("Test calcLength function", () => {
  [1, 255, 65535, 100000, 16777216].forEach((val, index) => {
    test(`Should return ${index + 1} for ${val}`, () => {
      expect(ber.calcLength(val)).toBe(index + 1);
    });
  });

  test(`Should return false for values greater than 4294967296`, () => {
    expect(ber.calcLength(4294967297)).toBe(false);
  });
});

describe("Test decode function", () => {
  [
    { encoded: "", decoded: false },
    { encoded: "1F", decoded: 31 },
    { encoded: "81FF", decoded: 255 },
    { encoded: "820500", decoded: 1280 },
    { encoded: "83000500", decoded: 1280 }
  ].forEach(testValue => {
    test(`Should return ${testValue.decoded} for ${testValue.encoded}`, () => {
      expect(ber.decode(testValue.encoded)).toBe(testValue.decoded);
    });
  });
});

describe("Test encode function", () => {
  [
    { encoded: 0, decoded: false, base: undefined },
    { encoded: 0, decoded: undefined, base: undefined },
    { encoded: 0, decoded: null, base: undefined },
    { encoded: 0, decoded: "", base: undefined },
    { encoded: 0x1f, decoded: 31, base: undefined },
    { encoded: 0x81fa, decoded: 250, base: undefined },
    { encoded: 0x820500, decoded: 1280, base: undefined },
    { encoded: 0x83000500, decoded: 1280, base: 4 },
    { encoded: 0x83010000, decoded: 65536, base: undefined },
    { encoded: 0x8401000000, decoded: 16777216, base: undefined }
  ].forEach(testValue => {
    test(`Should return ${testValue.encoded} for ${testValue.decoded}, base: ${
      testValue.base
    }`, () => {
      expect(ber.encode(testValue.decoded, testValue.base)).toBe(
        testValue.encoded
      );
    });
  });

  test(`Should return false for base more then 5`, () => {
    expect(ber.encode(250, 6)).toBe(false);
  });

  test(`Should return false for value more then 4294967295`, () => {
    expect(ber.encode(4294967296)).toBe(false);
  });
});
