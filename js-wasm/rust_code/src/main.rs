use std::time::Instant;

use rust_code::long_running_function;

fn main() {
    let start = Instant::now();
    let result = long_running_function(100_000_000);
    println!("[RUST] Результат: {result}");
    let time = start.elapsed();
    println!("[RUST] Время: {:?}", time);
}
