import { Store } from "./../store.ts";

export type CommandModesOpts = "CMD" | "PICK" | "FOCUS";

export class CommandModes {
  #mode: Store<string>;

  constructor() {
    this.#mode = new Store<string>("CMD");
  }

  current(): string {
    return this.#mode.get();
  }

  setMode(mode: CommandModesOpts) {
    this.#mode.set(mode);
  }

  isMode(mode: CommandModesOpts) {
    return mode === this.#mode.get() ? true : false;
  }
}

// Export a singleton instance
export const mode = new CommandModes();
