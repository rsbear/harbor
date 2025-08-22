use tauri::Manager;
use tauri_plugin_fs::FsExt;

mod bundler;
mod kv;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // --- KV Commands ---
            kv::kv_get,
            kv::kv_set,
            kv::kv_list,
            kv::kv_delete,
            kv::kv_search,
            kv::kv_tables,
            // --- Bundler Commands ---
            bundler::build_shipment,
            bundler::install_shipment
        ])
        .setup(move |app| {
            // Set activation poicy to Accessory to prevent the app icon from showing on the dock
            // app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // Initialize KV database
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = kv::initialize_kv_db(&app_handle).await {
                    eprintln!("Failed to initialize KV database: {}", e);
                }
            });

            // Use ~/.harbor as the custom data directory
            let home = dirs::home_dir().expect("No home directory found");
            let harbor_dir = home.join(".harbor");
            std::fs::create_dir_all(&harbor_dir).expect("Failed to create ~/.harbor directory");

            // Allow Tauri FS scope to serve files from ~/.harbor
            app.fs_scope().allow_directory(&harbor_dir, true)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
