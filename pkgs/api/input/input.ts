import { Store } from "./../store.ts";
import { okvTable } from "@harbor/kv";
import { z } from "zod";
import { CommandData } from "./command-data.ts"; // Import CommandData

const commandHistorySchema = z.object({
  command: z.string(),
  count: z.number().default(0),
});

const kv = okvTable("CommandHistory", commandHistorySchema);

export class CommandInput {
  value: Store<string> = new Store<string>("");
  miniName: Store<string> = new Store<string>("");
  query: Store<string> = new Store<string>("");
  // Add a public property for CommandData
  data: CommandData;

  constructor() {
    // Instantiate CommandData here, passing the miniName getter
    this.data = new CommandData(() => this.miniName.get());

    this.value.subscribe((val) => {
      const parts = val.trim().split(" ");
      this.miniName.set(parts[0] || "");
      this.query.set(parts.length > 1 ? parts.slice(1).join(" ") : "");
    });
  }

  setValue(v: string): void {
    this.value.set(v);
  }

  onSubmit(fn: (value: string) => void): void {
    this._submit = fn;
  }

  private _submit?: (value: string) => void;

  submitUsingValue(): void {
    if (this._submit) this._submit(this.value.get());
  }

  history = async () => {
    return await kv.list();
  };

  save = async (inputValue?: string) => {
    const history = await kv.list();
    const value = inputValue || this.value.get();

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

// Export a singleton instance
export const input = new CommandInput();
