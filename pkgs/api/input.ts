import { Store } from "./store.ts";
import { okvTable, type KvItem } from "@harbor/kv";
import { z } from "zod";

const commandHistorySchema = z.object({
  command: z.string(),
  count: z.number().default(0),
});

const kv = okvTable("CommandHistory", commandHistorySchema);

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

  history = async () => {
    return await kv.list();
  };

  save = async (inputValue?: string) => {
    const history = await kv.list();
    const value = inputValue || this.inputValue.get();

    if (history._tag === "None") {
      return await kv.set([value], {
        command: value,
        count: 1,
      });
    }
    if (history._tag === "Ok") {
      const existing = history.result.find((x) => x.value.command === value);
      return await kv.set([value], {
        command: value,
        count: existing ? existing.value.count + 1 : 1,
      });
    }
  };
}
