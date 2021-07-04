/* eslint-disable @typescript-eslint/no-var-requires */
var isTypedArray = require('is-typedarray').strict;
// eslint-disable-next-line @typescript-eslint/naming-convention
var Buf = require('buffer').Buffer;

module.exports = function typedarrayToBuffer(arr) {
  if (isTypedArray(arr)) {
    // To avoid a copy, use the typed array's underlying ArrayBuffer to back new Buffer
    var buf = Buf.from(arr.buffer);
    if (arr.byteLength !== arr.buffer.byteLength) {
      // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
      buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
    }
    return buf;
  } else {
    // Pass through all other types to `Buffer.from`
    return Buf.from(arr);
  }
};
