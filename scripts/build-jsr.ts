#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Build script for preparing Harbor command types for JSR publishing
 *
 * This script:
 * 1. Validates the TypeScript definitions
 * 2. Copies necessary files to a dist directory
 * 3. Updates version numbers
 * 4. Prepares the package for JSR publishing
 */

import { ensureDir, copy, exists } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

const PROJECT_ROOT = new URL("..", import.meta.url).pathname;
const DIST_DIR = join(PROJECT_ROOT, "dist-jsr");

interface BuildConfig {
  name: string;
  version: string;
  description: string;
  files: Array<{
    src: string;
    dest: string;
    required: boolean;
  }>;
}

const BUILD_CONFIG: BuildConfig = {
  name: "@harbor/command-types",
  version: "0.1.0",
  description: "Type definitions for Harbor command system",
  files: [
    { src: "types/harbor-command.d.ts", dest: "types/harbor-command.d.ts", required: true },
    { src: "jsr.json", dest: "jsr.json", required: true },
    { src: "README-jsr.md", dest: "README.md", required: true },
    { src: "LICENSE", dest: "LICENSE", required: false },
  ]
};

async function validateTypeScript() {
  console.log("🔍 Validating TypeScript definitions...");

  try {
    const cmd = new Deno.Command("deno", {
      args: ["check", join(PROJECT_ROOT, "types/harbor-command.d.ts")],
      stdout: "piped",
      stderr: "piped"
    });

    const { code, stdout, stderr } = await cmd.output();

    if (code !== 0) {
      console.error("❌ TypeScript validation failed:");
      console.error(new TextDecoder().decode(stderr));
      Deno.exit(1);
    }

    console.log("✅ TypeScript definitions are valid");
  } catch (error) {
    console.error("❌ Failed to run TypeScript validation:", error.message);
    Deno.exit(1);
  }
}

async function cleanDistDir() {
  console.log("🧹 Cleaning distribution directory...");

  try {
    await Deno.remove(DIST_DIR, { recursive: true });
  } catch (error) {
    // Directory might not exist, that's okay
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }

  await ensureDir(DIST_DIR);
  console.log("✅ Distribution directory cleaned");
}

async function copyFiles() {
  console.log("📦 Copying files to distribution directory...");

  for (const file of BUILD_CONFIG.files) {
    const srcPath = join(PROJECT_ROOT, file.src);
    const destPath = join(DIST_DIR, file.dest);

    if (!(await exists(srcPath))) {
      if (file.required) {
        console.error(`❌ Required file not found: ${file.src}`);
        Deno.exit(1);
      } else {
        console.warn(`⚠️ Optional file not found: ${file.src}`);
        continue;
      }
    }

    // Ensure destination directory exists
    const destDir = destPath.substring(0, destPath.lastIndexOf("/"));
    if (destDir !== DIST_DIR) {
      await ensureDir(destDir);
    }

    await copy(srcPath, destPath, { overwrite: true });
    console.log(`  ✓ Copied ${file.src} → ${file.dest}`);
  }

  console.log("✅ All files copied successfully");
}

async function updateVersion() {
  console.log("🔢 Updating version information...");

  const jsrConfigPath = join(DIST_DIR, "jsr.json");
  const jsrConfig = JSON.parse(await Deno.readTextFile(jsrConfigPath));

  // You could read version from git tags, package.json, etc.
  // For now, we'll use the version from the build config
  jsrConfig.version = BUILD_CONFIG.version;

  await Deno.writeTextFile(
    jsrConfigPath,
    JSON.stringify(jsrConfig, null, 2) + "\n"
  );

  console.log(`✅ Version updated to ${BUILD_CONFIG.version}`);
}

async function validateJsrConfig() {
  console.log("🔍 Validating JSR configuration...");

  try {
    const cmd = new Deno.Command("deno", {
      args: ["publish", "--dry-run", "--config", join(DIST_DIR, "jsr.json")],
      cwd: DIST_DIR,
      stdout: "piped",
      stderr: "piped"
    });

    const { code, stdout, stderr } = await cmd.output();
    const output = new TextDecoder().decode(stdout);
    const errors = new TextDecoder().decode(stderr);

    if (code !== 0) {
      console.error("❌ JSR validation failed:");
      console.error(errors);
      Deno.exit(1);
    }

    console.log("✅ JSR configuration is valid");
    console.log(output);
  } catch (error) {
    console.error("❌ Failed to run JSR validation:", error.message);
    Deno.exit(1);
  }
}

async function generateSummary() {
  console.log("\n📋 Build Summary");
  console.log("================");
  console.log(`Package: ${BUILD_CONFIG.name}`);
  console.log(`Version: ${BUILD_CONFIG.version}`);
  console.log(`Description: ${BUILD_CONFIG.description}`);
  console.log(`Distribution: ${DIST_DIR}`);
  console.log("\n📁 Files included:");

  for await (const entry of Deno.readDir(DIST_DIR)) {
    if (entry.isFile) {
      const stat = await Deno.stat(join(DIST_DIR, entry.name));
      const sizeKB = Math.round(stat.size / 1024 * 100) / 100;
      console.log(`  • ${entry.name} (${sizeKB} KB)`);
    } else if (entry.isDirectory) {
      console.log(`  📁 ${entry.name}/`);
      for await (const subEntry of Deno.readDir(join(DIST_DIR, entry.name))) {
        if (subEntry.isFile) {
          const stat = await Deno.stat(join(DIST_DIR, entry.name, subEntry.name));
          const sizeKB = Math.round(stat.size / 1024 * 100) / 100;
          console.log(`    • ${subEntry.name} (${sizeKB} KB)`);
        }
      }
    }
  }

  console.log("\n🚀 Ready for publishing!");
  console.log(`\nTo publish to JSR, run:`);
  console.log(`  cd ${DIST_DIR}`);
  console.log(`  deno publish`);
}

async function main() {
  console.log("🚀 Building Harbor Command Types for JSR\n");

  try {
    await validateTypeScript();
    await cleanDistDir();
    await copyFiles();
    await updateVersion();
    await validateJsrConfig();
    await generateSummary();

    console.log("\n✅ Build completed successfully!");
  } catch (error) {
    console.error("\n❌ Build failed:", error.message);
    Deno.exit(1);
  }
}

// Run the build if this script is executed directly
if (import.meta.main) {
  await main();
}
