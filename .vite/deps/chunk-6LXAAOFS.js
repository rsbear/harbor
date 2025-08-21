import {
  createSubscriber
} from "./chunk-J4EISQ4T.js";

// node_modules/.deno/svelte@5.38.2/node_modules/svelte/src/reactivity/reactive-value.js
var ReactiveValue = class {
  #fn;
  #subscribe;
  /**
   *
   * @param {() => T} fn
   * @param {(update: () => void) => void} onsubscribe
   */
  constructor(fn, onsubscribe) {
    this.#fn = fn;
    this.#subscribe = createSubscriber(onsubscribe);
  }
  get current() {
    this.#subscribe();
    return this.#fn();
  }
};

export {
  ReactiveValue
};
//# sourceMappingURL=chunk-6LXAAOFS.js.map
