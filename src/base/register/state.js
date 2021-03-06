import { derived, writable } from "svelte/store";

export const STATE = {
  ERROR: -1,
  IDLE: 0,
  CHECKING_AVAILABILITY: 1,
  NAME_UNAVAILABLE: 2,
  NAME_AVAILABLE: 3,
  APPROVING: 4,
  COMMITTING: 5,
  WAITING_TO_REGISTER: 6,
  REGISTERING: 7,
  REGISTERED: 8,
};

export const state = writable(STATE.IDLE);
