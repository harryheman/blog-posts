(module
  (func (export "long_running_function") (param $n i64) (result i64)
    (local $i i64)
    (local $result i64)

    (local.set $i (i64.const 0))
    (local.set $result (i64.const 0))

    (block $my_block
      (loop $my_loop
        (i64.ge_u (local.get $i) (local.get $n))
        (br_if $my_block)

        (local.set $result (i64.add (local.get $result) (local.get $i)))
        (local.set $i (i64.add (local.get $i) (i64.const 1)))

        (br $my_loop)
      )
    )

    (local.get $result)
  )
)
