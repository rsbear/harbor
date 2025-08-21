/**
 * Harbor Command API Type Definitions
 *
 * This file contains type definitions for the Harbor command system
 * that will be published to JSR for mini-app development.
 */

import type { z } from "zod";

// Core message types for data operations
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

// KV Item wrapper type
export interface KvItem<T> {
  key: string[];
  value: T;
  versionstamp: string | null;
}

// Command input interface
export interface CommandInput {
  /** Get the mini-app name (first part of input) */
  miniName(): string;
  /** Get the query string (remaining parts of input) */
  query(): string;
  /** Register or trigger submission handler */
  onSubmit(handler?: (miniName: string, query: string) => void): void;
}

// Data store actions
export interface DataActions<T> {
  /** List all items for the current mini-app */
  list(): Promise<T[] | undefined>;
  /** Get a specific item by ID */
  get(id: string[]): Promise<T | undefined>;
  /** Update an item with partial data */
  update(id: string[], value: Partial<T>): Promise<T[] | undefined>;
  /** Delete an item by ID */
  delete(id: string[]): Promise<T[] | undefined>;
  /** Refresh the current data list */
  refresh(): Promise<T[] | undefined>;
  /** Pick/select a specific item */
  pick(id: string[]): Promise<T | undefined>;
  /** Set the message state to loading */
  setMsgLoading(): Promise<void>;
}

// Data store interface
export interface DataStore<T> {
  /** Current message/state */
  msg: Msg<KvItem<T>>;
  /** Available data actions */
  actions: DataActions<T>;
}

// Command data API
export interface CommandDataAPI {
  /** Create a typed data store using a Zod schema */
  use<T extends z.ZodTypeAny>(schema: T): DataStore<z.infer<T>>;
}

// Main Harbor command interface
export interface HarborCommand {
  /** Input handling and parsing */
  input: CommandInput;
  /** Data store management */
  data: CommandDataAPI;
}

// Mount function type for mini-apps
export type HarborMountFunction = (command: HarborCommand) => void | Promise<void>;

// Mini-app configuration
export interface MiniAppConfig {
  /** Unique identifier for the mini-app */
  name: string;
  /** Display name */
  displayName?: string;
  /** Description */
  description?: string;
  /** Version */
  version?: string;
  /** Mount function */
  mount: HarborMountFunction;
}

// Export the main command interface
declare const command: HarborCommand;
export { command };
