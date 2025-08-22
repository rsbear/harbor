import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [sveltekit(), tailwindcss(), svelteTesting()],
  test: {
    // If you are testing components client-side, you need to setup a DOM environment.
    // If not all your files should have this environment, you can use a
    // `// @vitest-environment jsdom` comment at the top of the test files instead.
    environment: "jsdom",
    globals: true,
    setupFiles: "./test-setup.ts",

    include: [
      // "**/*.{test,spec}.{js,ts}", // matches src/foo/test/*.test.ts
      "**/*.test.{js,ts}",
      "**/*.test.svelte.{js,ts}",
      "**/*.spec.{js,ts}",
      "**/*.spec.svelte.{js,ts}",
      // "**/test/**/*.{test,spec}.{js,ts}", // matches src/foo/test/*.test.ts
      // "**/tests/**/*.{test,spec}.{js,ts}", // matches src/foo/tests/*.spec.ts
    ],
  },
  // @ts-expect-error process is a nodejs global
  resolve: process.env.VITEST
    ? {
        conditions: ["browser"],
      }
    : undefined,
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    fs: {
      allow: ["./pkgs"], // allow serving pkgs/ folder
    },
  },
}));
