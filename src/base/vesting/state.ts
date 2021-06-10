import { writable } from "svelte/store";

export enum State {
  Error = -1,
  Idle = 0,
  Loading = 1,
  Found = 2,
  NotFound = 3,
  WithdrawingSign = 4,
  Withdrawing = 5,
  Withdrawn = 6,
}

export const state = writable(State.Idle);

state.subscribe(s => {
  console.log("State", s);
});
