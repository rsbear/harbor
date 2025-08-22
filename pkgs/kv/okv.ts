import { invoke } from "@tauri-apps/api/core";
import { type ZodSchema } from "zod";

export interface KvItem<T> {
  value: T;
  metadata: {
    key: string[];
    created_at: number;
    updated_at: number;
  };
}

export type KvMsg<T> =
  | { _tag: "Ok"; result: T }
  | { _tag: "None"; result: null }
  | { _tag: "Error"; result: string };

export interface KvTable<T> {
  get(key: string[]): Promise<KvMsg<KvItem<T>>>;
  set(key: string[], value: T): Promise<KvMsg<void>>;
  list(): Promise<KvMsg<Array<KvItem<T>>>>;
  delete(key: string[]): Promise<KvMsg<void>>;
}

export function okvTable<T>(baseKey: string, schema: ZodSchema<T>): KvTable<T> {
  return {
    /**
     * Get a single item by key
     */
    async get(key: string[]): Promise<KvMsg<KvItem<T>>> {
      try {
        const fullKey = [baseKey, ...key];
        const result = await invoke<KvItem<any> | null>("kv_get", {
          key: fullKey,
        });

        if (result === null) {
          return { _tag: "None", result: null };
        }

        return {
          _tag: "Ok",
          result: {
            ...result,
            value: schema.parse(result.value),
          },
        };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error getting value";
        return { _tag: "Error", result: errorMsg };
      }
    },

    /**
     * Set a value by key
     */
    async set(key: string[], value: T): Promise<KvMsg<void>> {
      const validated = schema.safeParse(value);
      if (validated.error) {
        console.error("Validation error:", validated.error);
        return { _tag: "Error", result: validated.error.message };
      }
      try {
        const fullKey = [baseKey, ...key];
        await invoke<void>("kv_set", { key: fullKey, value: validated.data });
        return { _tag: "Ok", result: undefined };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error setting value";
        return { _tag: "Error", result: errorMsg };
      }
    },

    /**
     * List all items under this table
     */
    async list(): Promise<KvMsg<Array<KvItem<T>>>> {
      try {
        const items = await invoke<KvItem<T>[]>("kv_list", {
          prefix: [baseKey],
        });

        const validatedItems = items.map((item) => ({
          ...item,
          value: schema.parse(item.value),
        }));

        return { _tag: "Ok", result: validatedItems };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error listing values";
        return { _tag: "Error", result: errorMsg };
      }
    },

    /**
     * Delete a value by key
     */
    async delete(key: string[]): Promise<KvMsg<void>> {
      try {
        const fullKey = [baseKey, ...key];
        await invoke<void>("kv_delete", { key: fullKey });
        return { _tag: "Ok", result: undefined };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Error deleting value";
        return { _tag: "Error", result: errorMsg };
      }
    },
  };
}
