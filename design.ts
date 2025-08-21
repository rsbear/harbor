// @ts-nocheck

// harbor core API, depends on @harbor/kv
import { harbor } from "@harbor/api";
harbor.input.query();
harbor.input.miniName();
harbor.input.onSubmit(async () => {});
harbor.input.save();

// mini app data
const mini = harbor.mini.use(someZodSchema); // defines the schema for this mini apps table
await mini.kv.list();
await mini.kv.get([id]);
await mini.kv.set([id]);

// data state
type Msg<T> =
  | { _tag: "None"; result: null }
  | { _tag: "Err"; result: string }
  | { _tag: "Loading"; result: boolean }
  | { _tag: "Some"; result: T[] }
  | { _tag: "Pick"; result: T };

// mini.msg is a reactive state based on harbor.input
// essentially the goal of it is to abstract away the need to result data to state
const msg: Msg = mini.msg;

// really this is intended as an escape hatch
import { harbor } from "@harbor/kv";
const table = okvTable("TableName", someZodSchema);
table.list();
table.get(["key"]);
table.set(["key"], value);
