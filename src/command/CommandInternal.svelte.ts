import { getContext, setContext } from "svelte";
import { CommandData } from "./CommandData.svelte";
import z from "zod";
import { okvTable } from "../kv/mod";

const recordsSchema = z.object({
  command: z.string(),
  count: z.number().default(0),
});

const recordsTable = okvTable("CommandRecords", recordsSchema);

class CommandInternal {
  inputValue = $state("");

  miniName = $derived(() => {
    return this.inputValue.split(" ")[0] || "";
  });

  query = $derived(() => {
    const parts = this.inputValue.split(" ");
    return parts.length > 1 ? parts.slice(1).join(" ") : "";
  });

  private _data: CommandData | null = null;

  get data(): CommandData {
    if (!this._data) {
      this._data = new CommandData(() => this.miniName());
    }
    return this._data;
  }

  save = async () => {
    const history = await recordsTable.list();
    if (history._tag === "None") {
      return await recordsTable.set(["0"], {
        command: this.inputValue,
        count: 1,
      });
    }
    if (history._tag === "Ok") {
      const existing = history.result.find(
        (item) => item.value.command === this.inputValue,
      );
      return await recordsTable.set(["0"], {
        command: this.inputValue,
        count: existing ? existing.value.count + 1 : 1,
      });
    }
  };
}

export function newCommandInternal() {
  const c = new CommandInternal();
  setContext("command", c);
}

export function commandInternal() {
  const c = getContext<CommandInternal>("command");
  if (!c) {
    throw new Error("CommandInternal not found in context");
  }
  return c;
}
