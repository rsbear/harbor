import { CommandInput } from "./input.ts";
import { CommandData, type CommandUseResult } from "./command-data.ts";
import { type z } from "npm:zod@^4.0.17";

export interface HarborAPI {
  input: CommandInput;
  mini: {
    use<T extends z.ZodTypeAny>(schema: T): CommandUseResult<z.infer<T>>;
  };
}

export const harbor: HarborAPI = {
  input: new CommandInput(),
  mini: {
    use: (schema: any) => {
      const data = new CommandData(() => harbor.input.miniName.get());
      return data.use(schema);
    },
  },
};

export * from "./store.ts";
export * from "./command-data.ts";
export * from "./input.ts";
