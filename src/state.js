import { derived, writable } from "svelte/store";

export const STATE = {
  ERROR: -1,
  IDLE: 0,
  LOADING: 1,
  FOUND: 2,
  NOT_FOUND: 3,
  WITHDRAWING: 4,
  WITHDRAWN: 5,
};

export const state = writable(STATE.IDLE);
export const error = writable(null);
