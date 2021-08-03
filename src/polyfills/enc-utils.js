/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */

"use strict";

var Buffer = require("buffer/").Buffer;
var typedarrayToBuffer = require("typedarray-to-buffer");

const ENC_UTF8 = 'utf8';
const ENC_HEX = 'hex';

function bufferToArray(buf) {
  return new Uint8Array(buf);
}
exports.bufferToArray = bufferToArray;

function bufferToUtf8(buf) {
  return buf.toString(ENC_UTF8);
}
exports.bufferToUtf8 = bufferToUtf8;

function bufferToHex(buf, prefixed = false) {
  const hex = buf.toString(ENC_HEX);
  return prefixed ? addHexPrefix(hex) : hex;
}
exports.bufferToHex = bufferToHex;

function utf8ToBuffer(utf8) {
  return Buffer.from(utf8, ENC_UTF8);
}
exports.utf8ToBuffer = utf8ToBuffer;

function utf8ToArray(utf8) {
  return bufferToArray(utf8ToBuffer(utf8));
}
exports.utf8ToArray = utf8ToArray;

function hexToArray(hex) {
  return bufferToArray(hexToBuffer(hex));
}
exports.hexToArray = hexToArray;

function hexToBuffer(hex) {
  return Buffer.from(removeHexPrefix(hex), ENC_HEX);
}
exports.hexToBuffer = hexToBuffer;

function removeHexPrefix(hex) {
  return hex.replace(/^0x/, '');
}
exports.removeHexPrefix = removeHexPrefix;

function addHexPrefix(hex) {
  return hex.startsWith('0x') ? hex : `0x${hex}`;
}
exports.addHexPrefix = addHexPrefix;

function arrayToBuffer(arr) {
  return typedarrayToBuffer(arr);
}
exports.arrayToBuffer = arrayToBuffer;

function arrayToHex(arr, prefixed = false) {
  return bufferToHex(arrayToBuffer(arr), prefixed);
}
exports.arrayToHex = arrayToHex;

function concatArrays(...args) {
  let result = [];
  args.forEach(arg => (result = result.concat(Array.from(arg))));
  return new Uint8Array([...result]);
}
exports.concatArrays = concatArrays;
