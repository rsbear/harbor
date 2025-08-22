// bundler.ts (Corrected version)
import { build, InlineConfig } from "npm:vite";
import { compile } from "npm:svelte/compiler";
// Note: Vite plugins are no longer imported at the top level.
import { dirname, join, toFileUrl } from "jsr:@std/path";

type Framework = "react" | "svelte" | "gleam";

/**
 * Parses a GitHub URL to extract the user, repo, branch, and sub-path.
 */
export function parseGitHubUrl(urlString: string) {
  const url = new URL(urlString);
  if (url.hostname !== "github.com") {
    throw new Error("URL must be a valid github.com link.");
  }
  const pathParts = url.pathname.split("/").filter(Boolean);
  if (pathParts.length < 5 || pathParts[2] !== "tree") {
    throw new Error(
      "Invalid GitHub URL format. Expected github.com/<user>/<repo>/tree/<branch>/<path>",
    );
  }
  const [user, repo, , branch, ...subPath] = pathParts;
  return {
    user,
    repo,
    branch,
    path: subPath.join("/"),
  };
}

/**
 * Recursively fetches the contents of a directory from a GitHub repository
 * and writes the files to a local base path.
 */
async function fetchAndWriteRepoDir(
  user: string,
  repo: string,
  branch: string,
  dirPath: string,
  localBasePath: string,
) {
  const apiUrl = `https://api.github.com/repos/${user}/${repo}/contents/${dirPath}?ref=${branch}`;
  const response = await fetch(apiUrl, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch '${dirPath}' from GitHub: ${response.statusText}`,
    );
  }
  const contents: Array<{
    type: "dir" | "file";
    path: string;
    download_url: string | null;
  }> = await response.json();

  for (const item of contents) {
    // Determine the path relative to the directory we're fetching.
    const relativePath = item.path.substring(dirPath.length).replace(/^\//, "");
    const localItemPath = join(localBasePath, relativePath);

    if (item.type === "dir") {
      await Deno.mkdir(localItemPath, { recursive: true });
      await fetchAndWriteRepoDir(user, repo, branch, item.path, localBasePath);
    } else if (item.type === "file" && item.download_url) {
      await Deno.mkdir(dirname(localItemPath), { recursive: true });
      const fileResponse = await fetch(item.download_url);
      if (fileResponse.ok) {
        const fileData = await fileResponse.arrayBuffer();
        await Deno.writeFile(localItemPath, new Uint8Array(fileData));
      }
    }
  }
}

/**
 * Compiles a Svelte file to a JavaScript file.
 */
async function compileSvelteToJs(svelteFilePath: string): Promise<string> {
  console.error(`Compiling Svelte component at: ${svelteFilePath}`);
  const svelteCode = await Deno.readTextFile(svelteFilePath);
  const { js } = compile(svelteCode, {
    generate: "client",
    // format: "esm",
  });

  const jsFilePath = svelteFilePath.replace(/\.svelte$/, ".js");
  await Deno.writeTextFile(jsFilePath, js.code);
  console.error(`Svelte component compiled to: ${jsFilePath}`);
  return jsFilePath;
}

/**
 * Scans the local path for a harbor entry point file (harbor.tsx or harbor.ts)
 * and determines the framework from its contents.
 */
async function findEntryPointAndFramework(
  localPath: string,
): Promise<{ entryPointPath: string; framework: Framework }> {
  for (const entry of ["harbor.tsx", "harbor.ts"]) {
    const entryPointPath = join(localPath, entry);
    try {
      const content = await Deno.readTextFile(entryPointPath);
      const match = content.match(
        /export\s+const\s+harborMini\s*=\s*['"](react|svelte|gleam)['"]/,
      );
      if (match && match[1]) {
        return {
          entryPointPath,
          framework: match[1] as Framework,
        };
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) throw e;
    }
  }
  throw new Error("Could not find a valid harbor entry point file.");
}

async function main(ghUrl?: string) {
  let tempDir: string | undefined;
  try {
    const githubUrl = ghUrl || Deno.args[0];
    if (!githubUrl) throw new Error("No GitHub URL provided.");

    const { user, repo, branch, path: repoPath } = parseGitHubUrl(githubUrl);

    tempDir = await Deno.makeTempDir();
    console.error(`Fetching remote app into temporary directory: ${tempDir}`);

    // Fetch only the specific subdirectory for the mini-app.
    await fetchAndWriteRepoDir(user, repo, branch, repoPath, tempDir);

    const localAppPath = tempDir; // The temp directory is now the app's root.
    let { entryPointPath, framework } =
      await findEntryPointAndFramework(localAppPath);

    if (framework === "svelte") {
      // Compile the main Svelte component to JavaScript
      const appSveltePath = join(localAppPath, "App.svelte");
      await compileSvelteToJs(appSveltePath);

      // Modify the harbor.ts entry point to import the compiled .js file
      let harborTsContent = await Deno.readTextFile(entryPointPath);
      harborTsContent = harborTsContent.replace(
        /from\s+['"](.+)\.svelte['"]/g,
        'from "$1.js"',
      );
      // Overwrite the original entry point with the modified content
      await Deno.writeTextFile(entryPointPath, harborTsContent);
    }

    console.error(`Using entry point: ${entryPointPath}`);
    console.error("Bundling with 'deno bundle'...");

    const bundleCommand = new Deno.Command("deno", {
      args: ["bundle", "--platform=browser", "--no-check", entryPointPath],
      cwd: localAppPath,
      stdout: "piped",
      stderr: "piped",
    });

    const { success, stdout, stderr } = await bundleCommand.output();
    const errorString = new TextDecoder().decode(stderr);

    if (errorString) {
      console.error("--- Deno Bundle Logs (stderr) ---");
      console.error(errorString);
      console.error("---------------------------------");
    }

    if (!success) {
      throw new Error(`'deno bundle' failed: ${errorString}`);
    }

    const outputString = new TextDecoder().decode(stdout);
    console.log(outputString);
  } catch (error) {
    console.error(error instanceof Error ? error.stack : String(error));
    Deno.exit(1);
  } finally {
    if (tempDir) {
      await Deno.remove(tempDir, { recursive: true });
      console.error(`Cleaned up temporary directory: ${tempDir}`);
    }
  }
}

if (import.meta.main) {
  main();
}
