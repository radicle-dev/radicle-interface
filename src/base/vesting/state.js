import { derived, writable } from "svelte/store";

export const STATE = {
  ERROR: -1,
  IDLE: 0,
  LOADING: 1,
  FOUND: 2,
  NOT_FOUND: 3,
  WITHDRAWING_SIGN: 4,
  WITHDRAWING: 5,
  WITHDRAWN: 6,
};

export const state = writable(STATE.IDLE);

state.subscribe(s => {
  console.log("State", s);
});
