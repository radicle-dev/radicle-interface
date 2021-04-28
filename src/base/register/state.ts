import { derived, writable } from "svelte/store";

export enum State {
  Failed = -1,
  Idle,
  Approving,
  Committing,
  WaitingToRegister,
  Registering,
  Registered,
}

export const state = writable(State.Idle);
