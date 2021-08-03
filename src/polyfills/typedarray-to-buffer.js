/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */

var isTypedArray = require('is-typedarray').strict;
var Buffer = require('buffer/').Buffer;

module.exports = function typedarrayToBuffer(arr) {
  if (isTypedArray(arr)) {
    var buf = Buffer.from(arr.buffer);
    if (arr.byteLength !== arr.buffer.byteLength) {
      buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
    }
    return buf;
  } else {
    return Buffer.from(arr);
  }
};
