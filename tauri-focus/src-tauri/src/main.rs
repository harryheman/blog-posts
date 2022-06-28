#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs::OpenOptions;
use std::io::Write;
use home::home_dir;

#[tauri::command]
fn add_task(text: String) {
  let mut path = home_dir()
    .expect("Ошибка доступа к домашней директории");
  path.push("tasks.txt");

  let mut file = OpenOptions::new()
    .create(true)
    .append(true)
    .open(path)
    .expect("Ошибка при открытии файла");

  writeln!(file, "{text}").expect("Ошибка при записи файла");
}

fn main() {
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![add_task])
    .menu(tauri::Menu::os_default(&context.package_info().name))
    .run(context)
    .expect("Ошибка при запуске приложения");
}
