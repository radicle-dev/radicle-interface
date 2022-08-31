import { writable } from "svelte/store";

export interface Err {
  type: Failure;
  txHash?: string;
  message?: string;
}

export enum Failure {
  TransactionFailed = 1,
  NotAuthenticated = 2,
  InsufficientBalance = 3,
}

export const error = writable<Err | null>(null);

export class Unreachable extends Error {
  constructor(value?: never) {
    if (value) {
      super("unreachable value reached: " + value);
    } else {
      super("unreachable code reached");
    }
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    if (message) {
      super(`not found: ${message}`);
    } else {
      super(`not found`);
    }
  }
}

export class MissingReverseRecord extends Error {
  constructor(message?: string) {
    if (message) {
      super(`missing reverse record: ${message}`);
    } else {
      super(`missing reverse record`);
    }
  }
}

class AssertionError extends Error {
  constructor(message?: string) {
    if (message) {
      super(`assertion failed: ${message}`);
    } else {
      super(`assertion failed`);
    }
  }
}

export function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new AssertionError(message);
  }
}

export function assertEq(
  actual: unknown,
  expected: unknown,
  message?: string,
): void {
  if (actual !== expected) {
    throw new AssertionError(
      `assertion failed: expected '${expected}', got '${actual}': ${message}`,
    );
  }
}
