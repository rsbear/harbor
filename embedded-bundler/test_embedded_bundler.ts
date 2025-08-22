import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

/**
 * This test suite validates the functionality of the compiled bundler sidecar.
 * It executes the binary as a subprocess and inspects its output to ensure
 * that remote shipments are fetched, built, and bundled correctly.
 */
Deno.test(
  "Embedded bundler should successfully compile a remote React shipment",
  async () => {
    // Define the name of the binary. This should match the output of your
    // `deno compile` command.
    const binaryName = "bundler-aarch64-apple-darwin";
    const binaryPath = join(Deno.cwd(), binaryName);

    // The GitHub URL for the mini-app we want to install.
    const shipmentUrl =
      "https://github.com/rsbear/deleteme/tree/main/mini-react-ts";

    // Check if the binary exists before attempting to run it.
    try {
      await Deno.stat(binaryPath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.error(`
          Error: The bundler binary was not found at the expected path.
          Path: ${binaryPath}
          Please ensure you have compiled the bundler first by running:
          deno task compile
        `);
        // Force test failure if the binary doesn't exist.
        assertEquals(true, false, "Bundler binary not found.");
        return;
      }
      throw error;
    }

    // Set up the command to run the compiled bundler binary.
    // We pass the shipment URL as a command-line argument.
    const command = new Deno.Command(binaryPath, {
      args: [shipmentUrl],
      stdout: "piped", // Capture the standard output (the bundled code).
      stderr: "piped", // Capture the standard error (for logs and errors).
    });

    console.log(`Executing: ${binaryPath} ${shipmentUrl}`);

    // Execute the command and wait for it to complete.
    const { code, stdout, stderr } = await command.output();

    // Decode the output streams from raw bytes into strings.
    const outputString = new TextDecoder().decode(stdout);
    const errorString = new TextDecoder().decode(stderr);

    // For debugging purposes, always log the stderr stream.
    // The bundler script writes progress messages to stderr, so this is expected.
    if (errorString) {
      console.log("--- Bundler Logs (stderr) ---");
      console.log(errorString);
      console.log("----------------------------");
    }

    // --- Assertions ---

    // 1. The process should have exited successfully.
    assertEquals(code, 0, "Bundler process should exit with code 0.");

    // 2. The output bundle should contain the expected exports and code.
    assertStringIncludes(
      outputString,
      "harborMount",
      "The bundled code should include the 'harborMount' export.",
    );
    assertStringIncludes(
      outputString,
      "harborMini",
      "The bundled code should include the 'harborMini' framework identifier.",
    );

    // 3. Since this is a React app, we expect to see React-specific function calls.
    assertStringIncludes(
      outputString,
      "createElement",
      "The bundled React code should contain 'createElement' calls.",
    );

    console.log(
      "Test passed: Bundler successfully compiled the React shipment.",
    );
  },
);

Deno.test(
  "Embedded bundler should successfully compile a remote Svelte shipment",
  async () => {
    // Define the name of the binary. This should match the output of your
    // `deno compile` command.
    const binaryName = "bundler-aarch64-apple-darwin";
    const binaryPath = join(Deno.cwd(), binaryName);

    // The GitHub URL for the Svelte mini-app we want to install.
    const shipmentUrl =
      "https://github.com/rsbear/deleteme/tree/main/mini-svelte-ts";

    // Check if the binary exists before attempting to run it.
    try {
      await Deno.stat(binaryPath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.error(`
          Error: The bundler binary was not found at the expected path.
          Path: ${binaryPath}
          Please ensure you have compiled the bundler first by running:
          deno task compile
        `);
        // Force test failure if the binary doesn't exist.
        assertEquals(true, false, "Bundler binary not found.");
        return;
      }
      throw error;
    }

    // Set up the command to run the compiled bundler binary.
    const command = new Deno.Command(binaryPath, {
      args: [shipmentUrl],
      stdout: "piped", // Capture the standard output (the bundled code).
      stderr: "piped", // Capture the standard error (for logs and errors).
    });

    console.log(`Executing: ${binaryPath} ${shipmentUrl}`);

    // Execute the command and wait for it to complete.
    const { code, stdout, stderr } = await command.output();

    // Decode the output streams from raw bytes into strings.
    const outputString = new TextDecoder().decode(stdout);
    const errorString = new TextDecoder().decode(stderr);

    // For debugging purposes, always log the stderr stream.
    if (errorString) {
      console.log("--- Bundler Logs (stderr) ---");
      console.log(errorString);
      console.log("----------------------------");
    }

    // --- Assertions ---

    // 1. The process should have exited successfully.
    assertEquals(code, 0, "Bundler process should exit with code 0.");

    // 2. The output bundle should contain the expected exports.
    assertStringIncludes(
      outputString,
      "harborMount",
      "The bundled code should include the 'harborMount' export.",
    );
    assertStringIncludes(
      outputString,
      "harborMini",
      "The bundled code should include the 'harborMini' framework identifier.",
    );

    // 3. Check for Svelte-specific output.
    assertStringIncludes(
      outputString,
      "Hello",
      "The bundled Svelte code should contain the 'Hello' string from the App.svelte component.",
    );

    console.log(
      "Test passed: Bundler successfully compiled the Svelte shipment.",
    );
  },
);
