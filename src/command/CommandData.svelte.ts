import type { z } from "zod";
import { okvTable, type KvItem } from "../kv/mod";

export type Msg<T> =
  | { _tag: "None"; result: null }
  | { _tag: "Err"; result: string }
  | { _tag: "Loading"; result: true }
  | { _tag: "Some"; result: T[] }
  | { _tag: "Pick"; result: T };

export type ResultFor<Tag extends Msg<any>["_tag"], T> = Extract<
  Msg<T>,
  { _tag: Tag }
>["result"];

export class CommandData {
  private _miniName: () => string;

  constructor(miniNameGetter: () => string) {
    this._miniName = miniNameGetter;
  }

  use<T extends z.ZodTypeAny>(schema: T) {
    type Entity = z.infer<T>;
    type KvEntity = KvItem<Entity>;
    const mini = this._miniName();
    const repo = okvTable(mini, schema);

    const msg = $state<Msg<KvEntity>>({ _tag: "None", result: null });

    const actions = {
      async list() {
        msg._tag = "Loading";
        msg.result = true;
        try {
          const results = await repo.list();
          msg._tag = "Some";
          msg.result = results as any;
          return results;
        } catch (e) {
          msg._tag = "Err";
          msg.result = String(e);
        }
      },
      async get(id: string[]) {
        msg._tag = "Loading";
        msg.result = true;
        const result = await repo.get(id);
        msg._tag = "Pick";
        msg.result = result.result as any;
        return result;
      },
      async update(id: string[], value: Partial<Entity>) {
        await repo.set(id, value);
        return actions.refresh();
      },
      async delete(id: string[]) {
        await repo.delete(id);
        return actions.refresh();
      },
      async refresh() {
        return actions.list();
      },
      async pick(id: string[]) {
        try {
          const result = await repo.get(id);
          msg._tag = "Pick";
          msg.result = result as any;
          return result as Entity;
        } catch (e) {
          msg._tag = "Err";
          msg.result = String(e);
        }
      },
      async setMsgLoading() {
        msg._tag = "Loading";
      },
    };

    return {
      msg,
      actions,
    };
  }
}
