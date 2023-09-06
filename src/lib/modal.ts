import type { ComponentProps, ComponentType, SvelteComponent } from "svelte";

import { derived, get, writable } from "svelte/store";

type HideCallback = () => void;

type FullscreenModal = {
  component: ComponentType;
  props: Record<string, unknown>;
  hideCallback?: HideCallback;
  disableHide?: boolean;
};

const store = writable<FullscreenModal | undefined>(undefined);
export const modalStore = derived(store, s => s);

export function enableHide() {
  store.update(s => {
    if (s) {
      return { ...s, disableHide: false };
    }
  });
}

export function disableHide() {
  store.update(s => {
    if (s) {
      return { ...s, disableHide: true };
    }
  });
}

export function hide(): void {
  const stored = get(modalStore);
  if (!stored || stored.disableHide) {
    return;
  }

  if (stored.hideCallback) {
    stored.hideCallback();
  }
  store.set(undefined);
}

interface ShowArgs<T extends SvelteComponent> {
  component: ComponentType<T>;
  props: ComponentProps<T>;
  hideCallback?: HideCallback;
}

export function show<Component extends SvelteComponent>(
  args: ShowArgs<Component>,
): void {
  // Defocus any active input elements, so that we can always close an open
  // modal via the `esc` hotkey.
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  store.set(args);
}

export function toggle<Component extends SvelteComponent>(
  args: ShowArgs<Component>,
): void {
  const stored = get(modalStore);

  if (stored && stored.component === args.component) {
    hide();
    return;
  }

  show(args);
}
