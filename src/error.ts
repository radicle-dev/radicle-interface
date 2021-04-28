import { writable } from "svelte/store";

export enum Failure {
  TransactionFailed = 1,
}

export const error = writable(null);
