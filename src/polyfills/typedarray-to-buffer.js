/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import isTypedArray from 'is-typedarray';
import { Buffer } from 'buffer/';

export default function typedarrayToBuffer(arr) {
  if (isTypedArray.strict(arr)) {
    var buf = Buffer.from(arr.buffer);
    if (arr.byteLength !== arr.buffer.byteLength) {
      buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
    }
    return buf;
  } else {
    return Buffer.from(arr);
  }
}
