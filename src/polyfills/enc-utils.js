/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

"use strict";

import { Buffer } from 'buffer/';
import typedarrayToBuffer from 'typedarray-to-buffer';

const ENC_UTF8 = 'utf8';
const ENC_HEX = 'hex';
const STRING_ZERO = '0';

export function bufferToArray(buf) {
  return new Uint8Array(buf);
}

export function bufferToUtf8(buf) {
  return buf.toString(ENC_UTF8);
}

export function bufferToHex(buf, prefixed = false) {
  const hex = buf.toString(ENC_HEX);
  return prefixed ? addHexPrefix(hex) : hex;
}

export function utf8ToBuffer(utf8) {
  return Buffer.from(utf8, ENC_UTF8);
}

export function utf8ToArray(utf8) {
  return bufferToArray(utf8ToBuffer(utf8));
}

export function hexToArray(hex) {
  return bufferToArray(hexToBuffer(hex));
}

export function hexToBuffer(hex) {
  return Buffer.from(removeHexPrefix(hex), ENC_HEX);
}

export function removeHexPrefix(hex) {
  return hex.replace(/^0x/, '');
}

export function addHexPrefix(hex) {
  return hex.startsWith('0x') ? hex : `0x${hex}`;
}

export function arrayToBuffer(arr) {
  return typedarrayToBuffer(arr);
}

export function arrayToHex(arr, prefixed = false) {
  return bufferToHex(arrayToBuffer(arr), prefixed);
}

export function arrayToUtf8(arr) {
  return bufferToUtf8(arrayToBuffer(arr));
}

export function sanitizeHex(hex) {
  hex = removeHexPrefix(hex);
  hex = sanitizeBytes(hex, 2);
  if (hex) {
    hex = addHexPrefix(hex);
  }
  return hex;
}

export function sanitizeBytes(str, byteSize = 8, padding = STRING_ZERO) {
  return padLeft(str, calcByteLength(str.length, byteSize), padding);
}

export function padLeft(str, length, padding = STRING_ZERO) {
  return padString(str, length, true, padding);
}

export function calcByteLength(length, byteSize = 8) {
  const remainder = length % byteSize;
  return remainder
    ? ((length - remainder) / byteSize) * byteSize + byteSize
    : length;
}

export function concatArrays(...args) {
  let result = [];
  args.forEach(arg => (result = result.concat(Array.from(arg))));
  return new Uint8Array([...result]);
}

export function padString(
  str,
  length,
  left,
  padding = STRING_ZERO
) {
  const diff = length - str.length;
  let result = str;
  if (diff > 0) {
    const pad = padding.repeat(diff);
    result = left ? pad + str : str + pad;
  }
  return result;
}
