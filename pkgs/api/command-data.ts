import { Store } from "./store.ts";
import { okvTable, type KvItem } from "jsr:@harbor/kv@^0.1.0";
import { type z } from "npm:zod@^4.0.17";

export type Msg<T> =
  | { _tag: "None"; result: null }
  | { _tag: "Error"; result: string }
  | { _tag: "Loading"; result: true }
  | { _tag: "Some"; result: T[] }
  | { _tag: "Pick"; result: T };

export interface CommandUseResult<T> {
  kv: {
    list(): Promise<any>;
    get(id: string[]): Promise<any>;
    set(id: string[], value: T): Promise<any>;
    delete(id: string[]): Promise<any>;
  };
  msg: Store<Msg<any>>;
}

export class CommandData {
  msg: Store<Msg<any>>;

  constructor(private miniNameGetter: () => string) {
    this.msg = new Store<Msg<any>>({ _tag: "None", result: null });
  }

  use<T extends z.ZodTypeAny>(schema: T): CommandUseResult<z.infer<T>> {
    type Entity = z.infer<T>;
    const repo = okvTable(this.miniNameGetter(), schema);

    const setMsg = (m: Msg<any>) => this.msg.set(m);

    const actions = {
      async list() {
        setMsg({ _tag: "Loading", result: true });
        const res = await repo.list();
        if (res._tag === "Ok") {
          setMsg({ _tag: "Some", result: res.result });
        } else if (res._tag === "Error") {
          setMsg({ _tag: "Error", result: res.result });
        } else {
          setMsg({ _tag: "None", result: null });
        }
        return res;
      },
      async get(id: string[]) {
        setMsg({ _tag: "Loading", result: true });
        const res = await repo.get(id);
        if (res._tag === "Ok") {
          setMsg({ _tag: "Pick", result: res.result });
        } else if (res._tag === "Error") {
          setMsg({ _tag: "Error", result: res.result });
        } else {
          setMsg({ _tag: "None", result: null });
        }
        return res;
      },
      async set(id: string[], value: Entity) {
        return repo.set(id, value);
      },
      async delete(id: string[]) {
        return repo.delete(id);
      },
    };

    return { kv: actions, msg: this.msg };
  }
}
