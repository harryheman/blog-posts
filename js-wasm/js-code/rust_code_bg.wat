(module
  (type (;0;) (func (param i64) (result i64)))
  (func (;0;) (type 0) (param i64) (result i64)
    (local i32 i64 i64 i64 i64 i64 i64)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 1
    global.set 0
    local.get 0
    i64.eqz
    if (result i64)  ;; label = @1
      i64.const 0
    else
      local.get 1
      local.get 0
      i64.const 2
      i64.sub
      local.tee 2
      i64.const 4294967295
      i64.and
      local.tee 3
      local.get 0
      i64.const 1
      i64.sub
      local.tee 5
      local.tee 0
      i64.const 4294967295
      i64.and
      local.tee 4
      i64.mul
      local.tee 6
      local.get 4
      local.get 2
      i64.const 32
      i64.shr_u
      local.tee 2
      i64.mul
      local.tee 4
      local.get 3
      local.get 0
      i64.const 32
      i64.shr_u
      local.tee 7
      i64.mul
      i64.add
      local.tee 0
      i64.const 32
      i64.shl
      i64.add
      local.tee 3
      i64.store
      local.get 1
      local.get 3
      local.get 6
      i64.lt_u
      i64.extend_i32_u
      local.get 2
      local.get 7
      i64.mul
      local.get 0
      local.get 4
      i64.lt_u
      i64.extend_i32_u
      i64.const 32
      i64.shl
      local.get 0
      i64.const 32
      i64.shr_u
      i64.or
      i64.add
      i64.add
      i64.store offset=8
      local.get 5
      local.get 1
      i32.const 8
      i32.add
      i64.load
      i64.const 63
      i64.shl
      local.get 1
      i64.load
      i64.const 1
      i64.shr_u
      i64.or
      i64.add
    end
    local.get 1
    i32.const 16
    i32.add
    global.set 0)
  (memory (;0;) 17)
  (global (;0;) (mut i32) (i32.const 1048576))
  (export "memory" (memory 0))
  (export "long_running_function" (func 0)))
