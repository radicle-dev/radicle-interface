import { writable } from "svelte/store";

export const ERROR = {
  TRANSACTION_FAILED: 1,
};

export const error = writable(null);
