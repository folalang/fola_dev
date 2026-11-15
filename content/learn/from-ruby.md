---
title: Coming from Ruby
description: What carries over from Ruby, what doesn't yet, and how to work around the gaps.
order: 2
---

Fola parses Ruby syntax with Prism, so most of what you know carries over:
classes, modules and mixins, blocks and `yield`, `begin`/`rescue`/`ensure`
and `retry`, statement modifiers, ranges, symbols, and much of the core
library. Fola is young, though, and the interpreter doesn't run all of
Ruby yet.

This page lists the differences you're most likely to hit in Fola 0.0.2,
each with a workaround. Every item was checked against the 0.0.2
interpreter, and the list shrinks with each release. The
[Kernel reference](/stdlib/kernel/#not-yet-supported) and each standard
library page also note their own gaps.

## Syntax

| Ruby | Status in Fola | Instead |
|---|---|---|
| `expr rescue fallback` | Not yet | A `begin`/`rescue` block |
| `class << self` | Not yet | `def self.name` |
| Reopening a built-in class (`class String; def shout ...`) | Not yet. Reopening your own classes works. | Put helpers for built-ins in a module (`Text.shout(s)`) |
| `extend` | Not yet | `include`, or define `def self.name` methods |
| `private`, `protected` | Not yet | All methods are public; prefix internal ones with `_` by convention |
| `lambda`, `proc`, `->(x) { }` | Not yet. `&block` parameters work. | Pass a block and take it as `&blk`, or pass an object that responds to `call` |
| `defined?(x)`, `__method__` | Not yet | — |
| `not x` | Not yet | `!x` |
| `def +(other)` and other operator methods on your classes | Not yet | Named methods such as `plus(other)` |
| `x&.length` | Not yet | `x.nil? ? nil : x.length` |
| `a !~ b` | Not yet | `!(a =~ b)` |
| `Exception#cause` | Not yet | — |

Supported since 0.0.2: string interpolation (`"Hi #{name}"`, `"a#@x"`),
adjacent string literals, `case`/`when`, `case`/`in` pattern matching,
`break` and `next` (in loops and blocks), `for`, `loop do`,
multiple assignment and destructuring (`a, b = b, a`), `||=` and `&&=`,
constants (`LIMIT = 10`, `Outer::Inner`), class variables (`@@count`),
reopening your own classes, `super`, `*rest`, `**opts`, `&blk` and keyword
parameters, `block_given?`, `at_exit`, `return a, b`, `return` inside a block,
and splats in array literals and calls.

## Semantics

| Behaviour | Ruby | Fola today |
|---|---|---|
| `-7 / 2` | `-4` (floors) | `-3` (truncates toward zero) |
| `puts obj` | calls `obj.to_s` | prints `#<ClassName>`; call `obj.to_s` yourself |
| `p some_class` | `Integer` | `#<Class>`; use `some_class.name` |
| `puts [1, 2]` | one element per line | prints the inspected array |
| `"café".length` | `4` characters | `5` (strings are indexed by byte) |
| `obj.respond_to?(:to_s)` on plain objects | `true` | `false` for methods implemented natively |
| Huge integer *literals* | fine | literals must fit in 64 bits; arithmetic results grow without limit (`2 ** 100` works) |
| Output before an uncaught error | flushed | may be lost; rescue errors you want to report |
| Runtime errors (`1 / 0`, a missing method, a wrong argument count) | rescuable | rescuable too: `ZeroDivisionError`, `NoMethodError`, `ArgumentError`, `TypeError`, `NameError`, `SystemStackError` |

## Core library gaps

The most common missing methods, with replacements:

| Missing | Use instead |
|---|---|
| `String#index`, `#chars`, `#lines`, `#slice`, `#%` | `include?`, `str[i]` in a loop, `split("\n")`, `str[start, len]`, `format` |
| `String#sub` / `#split` with a Regexp | `gsub` (accepts a Regexp) and `match` |
| Changing a String in place (`s << "x"`, `upcase!`, `[]=`) | Strings never change in place: these return a new String and leave the receiver as it was. Reassign: `s += "x"`. See [String](/stdlib/string/) |
| Lazy regex quantifiers (`.*?`) and multiline anchors | negated classes such as `[^*]+`, and splitting into lines first |

Array, Hash and Range now cover nearly all of Enumerable: `each_with_index`,
`each_slice`, `each_cons`, `min`/`max`/`minmax`, `min_by`/`max_by`,
`sort_by`, `partition`, `tally`, `group_by`, `each_with_object`,
`filter_map`, `flat_map`, `take_while` and more. Called without a block they
return an `Enumerator`, so `list.map.with_index { |x, i| ... }` works. Hash
`select`/`reject` return a Hash, and nested arrays destructure into block
parameters (`pairs.map { |a, b| a + b }`). `Kernel#eval` and `binding` are
also available. See [Array](/stdlib/array/), [Hash](/stdlib/hash/) and
[Kernel](/stdlib/kernel/).

If something here blocks you, check the
[issue tracker](https://github.com/kamalogudah/fola/issues). If it isn't
listed there, open an issue. Real programs that hit a gap are the best way to
decide what gets implemented next.
