---
title: Blocks, scope and exceptions
description: Closures and yield, variable scope, raising and rescuing, and program structure.
order: 4
---

## Blocks

A block is an anonymous function attached to a method call:

```ruby
list.each { |item| puts item }          # braces bind tighter
list.each do |item|                     # do ... end binds to the outermost call
  puts item
end
```

Inside the method, `yield args` calls the block and evaluates to the
block's value. `block_given?` reports whether a block was passed. A block
is a **closure**: it can read and assign the local variables that were in
scope where it was written.

```ruby
total = 0
[1, 2, 3].each { |n| total += n }
total   # => 6
```

Block parameters follow the method parameter rules. One extra rule: when a
block that takes several parameters is yielded a single Array, the array is
spread across the parameters (`pairs.each { |k, v| }`). `&:name` passes a
block that calls `name` on its argument.

`return` inside a block returns from the enclosing method. `next value`
ends the block's current call with `value`. `break value` ends the method
that the block was passed to, which then returns `value`.

> **Implementation status:** blocks, `yield`, closures over locals and
> array spreading (for Hash iteration and nested arrays) are implemented.
> `block_given?`, `next` and `break` in blocks, and lambdas and procs are
> not yet implemented.

## Variable scope

- **Local variables** are visible from their first assignment to the end of
  the enclosing `def`, `class`, `module` or program. A `def` body starts a
  new scope that can't see the outer locals. Blocks extend the
  surrounding scope, and variables first assigned inside a block are local
  to that block.
- **Instance variables** (`@x`) belong to `self`.
- **Global variables** (`$x`) are visible everywhere.
- **Constants** are looked up lexically through the enclosing `class` and
  `module` bodies, then through the ancestors of the innermost class.

## Exceptions

```ruby
begin
  risky
rescue ArgumentError, TypeError => e   # matched with ===, in order
  handle(e)
rescue => e                            # StandardError by default
  retry                                # run the begin body again
else
  runs_if_nothing_was_raised
ensure
  always_runs
end
```

`raise` accepts a message (raising `RuntimeError`), a class and message,
or an exception object. An exception propagates up the call stack until a
`rescue` clause matches it. Uncaught exceptions end the program with a
diagnostic and a non-zero exit status. A method body can use
`rescue`/`else`/`ensure` directly, without `begin`.

Custom exceptions should subclass `StandardError`:

```ruby
class ValidationError < StandardError
end
```

> **Implementation status:** `begin`/`rescue`/`else`/`ensure`, `retry`,
> `raise` and exception classes are implemented. Modifier `rescue` and
> `Exception#cause` are not yet implemented. Errors raised by the
> interpreter itself (an undefined method or variable, a wrong argument
> count, a type mismatch) end the program and can't yet be rescued as
> `NoMethodError`, `NameError`, `ArgumentError` or `TypeError`. Only
> exceptions raised with `raise` can be rescued.

## Program structure

A program is a file. `fola run file.fola a b` evaluates it with
`ARGV == ["a", "b"]`. The program exits with status `0` when evaluation
finishes and `1` on an uncaught exception. `exit(status)` ends it early.

`require "name"` loads a library once. Standard library names (`"json"`,
`"fola/web"`) resolve to built-in libraries. A path starting with `./` or
`/` loads that Fola file, adding `.fola` when the name has no extension.
`load "file.fola"` evaluates the file every time it is called.

> **Implementation status:** `require_relative` is not yet implemented;
> use `require "./path"` relative to the working directory.
