use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn long_running_function(n: u64) -> u64 {
    let mut result = 0;

    for i in 0..n {
        result += i;
    }

    result
}
