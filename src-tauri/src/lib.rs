mod kv;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // --- KV Commands ---
            kv::kv_get,
            kv::kv_set,
            kv::kv_list,
            kv::kv_delete,
            kv::kv_search,
            kv::kv_tables,
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

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
