use dirs;
use std::fs;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

/// Build a shipment from a local project path (using esbuild).
/// This is more for local dev/testing, not GitHub installs.
#[tauri::command]
pub async fn build_shipment(
    app_handle: AppHandle,
    project_path: String,
    shortcut: String,
) -> Result<String, String> {
    let shell = app_handle.shell();

    // Use ~/.harbor/bundles instead of app_data_dir
    let home = dirs::home_dir().ok_or("No home directory found")?;
    let bundle_dir = home.join(".harbor").join("bundles");
    fs::create_dir_all(&bundle_dir).map_err(|e| e.to_string())?;

    let source_path = format!("{}/mod.tsx", project_path);

    let bundle_name = format!("bundle-{}.js", shortcut);
    let bundle_path = bundle_dir.join(&bundle_name);
    let bundle_path_str = bundle_path.to_str().unwrap().to_string();

    let args = [
        "esbuild",
        &source_path,
        "--bundle",
        &format!("--outfile={}", bundle_path_str),
        "--loader:.tsx=tsx",
        "--jsx=automatic",
        "--platform=browser",
        "--format=esm",
        "--target=es2020",
    ];

    let output = shell
        .command("npx")
        .args(args)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(bundle_path_str)
}

/// Install a shipment from a GitHub URL using the Deno sidecar bundler.
/// Saves the bundle as `bundle-<alias>.js` in the app data dir.
#[tauri::command]
pub async fn install_shipment(
    app_handle: AppHandle,
    github_url: String,
    alias: String,
) -> Result<String, String> {
    let shell = app_handle.shell();

    // 1. Prepare the sidecar command.
    let sidecar_command = shell
        .sidecar("bundler")
        .map_err(|e| format!("Failed to create sidecar command: {}", e))?;

    // 2. Execute the sidecar, passing the GitHub URL as an argument.
    let output = sidecar_command
        .args([github_url.clone()])
        .env("DYLD_FALLBACK_LIBRARY_PATH", "") // macOS fix
        .output()
        .await
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Bundler sidecar failed: {}", stderr));
    }

    // 3. The bundled JavaScript code is in stdout.
    let bundle_content = output.stdout;

    // 4. Save the bundle to ~/.harbor/bundles
    let home = dirs::home_dir().ok_or("No home directory found")?;
    let bundle_dir = home.join(".harbor").join("bundles");
    fs::create_dir_all(&bundle_dir).map_err(|e| e.to_string())?;

    // Use alias for naming convention
    let bundle_name = format!("bundle-{}.js", alias);
    let bundle_path = bundle_dir.join(&bundle_name);

    fs::write(&bundle_path, bundle_content)
        .map_err(|e| format!("Failed to write bundle to file: {}", e))?;

    let bundle_path_str = bundle_path.to_str().unwrap().to_string();

    Ok(bundle_path_str)
}
