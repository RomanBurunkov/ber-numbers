# ber-numbers
Simple Node.js library to help with BER encoding/decoding integers.
Supports BER Short form and Long form from 2 to 5 octets.

### Methods:

- **length** returns supposed total length of BER-encoded number.
- **calcLength** returns recommended length for BER encoding.
- **decode** decodes BER encoded string and returns it's number value.
- **encode** encodes number into Hex BER encoded value.

### Usage example:
```
const ber = require('ber-numbers');

const encodedVal = '83000555';
const decodedVal = ber.decode('83000555');
const viseVersa = ber.encode(decodedVal);
const viseVersa4 = ber.encode(decodedVal, 4);

console.log(`Original hex encoded value: ${encodedVal}`);
console.log(`It's decoded value: ${decodedVal}\n`);
console.log(`Encoded decoded value in hex: ${viseVersa.toString(16)}`);
console.log(`Encoded decoded value in hex with length set to 4: ${viseVersa4.toString(16)}\n`);


const firstByte = '83';

console.log(
  `Get total BER encoded value length by it's first byte value(${firstByte}):`,
  `${ber.length(firstByte)}\n`,

);


const val = 1365;

console.log(
  `Get recommended BER encoded length by the value(${val}):`,
  ber.calcLength(val),
);
```
