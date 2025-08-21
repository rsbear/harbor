import { Store } from "./store.ts";

export class CommandInput {
  inputValue: Store<string> = new Store<string>("");
  miniName: Store<string> = new Store<string>("");
  query: Store<string> = new Store<string>("");

  constructor() {
    this.inputValue.subscribe((val) => {
      const parts = val.trim().split(" ");
      this.miniName.set(parts[0] || "");
      this.query.set(parts.length > 1 ? parts.slice(1).join(" ") : "");
    });
  }

  setValue(v: string): void {
    this.inputValue.set(v);
  }

  onSubmit(fn: (value: string) => void): void {
    this._submit = fn;
  }

  private _submit?: (value: string) => void;

  submit(): void {
    if (this._submit) this._submit(this.inputValue.get());
  }
}
