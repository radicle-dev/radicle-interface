import { derived, writable } from "svelte/store";

export enum State {
  Error = -1,
  Idle,
  CheckingAvailability,
  NameUnavailable,
  NameAvailable,
  Approving,
  Committing,
  WaitingToRegister,
  Registering,
  Registered,
}

export const state = writable(State.Idle);
