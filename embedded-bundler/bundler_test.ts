/**
 * bundler_test.ts
 *
 * A test runner for the Harbor bundler (bundler.ts).
 * This script executes the bundler against a set of predefined test cases
 * and pipes the raw output directly to the console.
 *
 * To run:
 * deno run -A main_test.ts
 */

interface TestCase {
  name: string;
  url: string;
}

// Test cases to run
const testCases: TestCase[] = [
  {
    name: "React Success Case",
    url: "https://github.com/rsbear/deleteme/tree/main/mini-react-ts",
  },
  {
    name: "Svelte Success Case",
    url: "https://github.com/rsbear/deleteme/tree/main/mini-svelte-ts",
  },
  {
    name: "Failure Case: No harbor.ts(x) entry file",
    url: "https://github.com/rsbear/deleteme/tree/main/mini-no-entry",
  },
  {
    name: "Failure Case: Invalid 'harborMini' export",
    url: "https://github.com/rsbear/deleteme/tree/main/mini-invalid-export",
  },
  {
    name: "Failure Case: Malformed GitHub URL",
    url: "https://github.com/rsbear/deleteme/main",
  },
];

/**
 * Runs a single test case by spawning main.ts as a subprocess
 * and inheriting its stdout and stderr.
 */
async function runTest(tc: TestCase) {
  console.log(`\n// --- Running Test: ${tc.name} ---\n`);

  const command = new Deno.Command("deno", {
    args: [
      "run",
      "-A", // Grant all permissions to the subprocess for simplicity
      "bundler.ts",
      tc.url,
    ],
    // Inherit stdout and stderr to pipe them directly to the parent process
    stdout: "inherit",
    stderr: "inherit",
  });

  // Wait for the command to complete
  await command.output();
}

/**
 * Main execution function.
 */
async function main() {
  for (const tc of testCases) {
    await runTest(tc);
  }
  console.log(`\n// --- All Tests Complete ---`);
}

// Entry point for the script
if (import.meta.main) {
  main();
}
