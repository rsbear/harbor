export type Subscriber<T> = (value: T) => void;

export class Store<T> {
  private value: T;
  private subs = new Set<Subscriber<T>>();

  constructor(initial: T) {
    this.value = initial;
  }

  get(): T {
    return this.value;
  }

  set(v: T): void {
    this.value = v;
    this.subs.forEach((fn) => fn(v));
  }

  subscribe(fn: Subscriber<T>): () => void {
    this.subs.add(fn);
    fn(this.value);
    return () => this.subs.delete(fn);
  }
}
