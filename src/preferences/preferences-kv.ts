import { z } from "zod";
import { okvTable } from "@harbor/kv";

const prefsSchema = z.object({
  harbor: z.object({
    harbor_theme: z.string(),
    monaco_theme: z.string().optional(),
    markdown_theme: z.string().optional(),
  }),
  apps: z.array(z.object({ alias: z.string(), github_url: z.url() })),
});

export const prefsKv = okvTable("Preferences", prefsSchema);
export type PrefsKvSchema = z.infer<typeof prefsSchema>;
