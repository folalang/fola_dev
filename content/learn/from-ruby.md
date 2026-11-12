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

This page lists the differences you're most likely to hit in Fola 0.0.1,
each with a workaround. Every item was checked against the current
interpreter, and the list shrinks with each release. The
[Kernel reference](/stdlib/kernel/#not-yet-supported) and each standard
library page also note their own gaps.

## Syntax

| Ruby | Status in Fola | Instead |
|---|---|---|
| `"Hi #{name}"` and heredocs (`<<~TEXT`) | Not yet | `"Hi " + name`, `format("Hi %s", name)`, or join an array of lines |
| `"a" "b"` (adjacent literals) | Not yet | `"a" + "b"` |
| `case x when ... end` | Not yet | `if`/`elsif` chains |
| `a, b = 1, 2` and `x, y = pair` | Not yet | Assign each variable on its own line, or index into the array |
| `for x in list` | Not yet | `list.each do \|x\| ... end` |
| `break`, `next` | Not yet | Loop with a flag (`while i < n && !done`) |
| `x \|\|= v`, `x &&= v` | Not yet | `x = v if x.nil?` |
| `expr rescue fallback` | Not yet | A `begin`/`rescue` block |
| `LIMIT = 10` (constant assignment) | Not yet | A method that returns the value (`def self.limit = 10`) |
| `@@class_var` | Not yet | An instance variable on the class, or a module method |
| `class << self` | Not yet | `def self.name` |
| Reopening a class (`class String; def shout ...`) | Not yet; a second `class A` body replaces the first | Keep each class in one body; put helpers for built-ins in a module (`Text.shout(s)`) |
| `Outer::Inner` for your own nested classes, `extend` | Not yet | Define classes and modules at the top level |
| `rescue NoMethodError` / `NameError` / `TypeError` | Not yet; interpreter errors end the program | Check first (`respond_to?`, `nil?`); only `raise`d exceptions can be rescued |
| `private`, `protected` | Not yet | All methods are public; prefix internal ones with `_` by convention |
| `lambda`, `proc`, `->(x) { }`, `&block` params | Not yet | Pass an object that responds to `call`, or use `yield` |
| `f(*args)`, `**opts` | Not yet | Pass an Array or a Hash |
| `def m(a, key: 1)` keyword parameters | Partial | Keyword arguments arrive as one positional Hash; use `opts = {}` and `opts[:key]` |
| `defined?(x)`, `__method__`, `block_given?` | Not yet | — |
| `def +(other)` and other operator methods on your classes | Not yet | Named methods such as `plus(other)` |
| `x&.length` | Not yet | `x.nil? ? nil : x.length` |

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

## Core library gaps

The most common missing methods, with replacements:

| Missing | Use instead |
|---|---|
| `String#index`, `#chars`, `#lines`, `#slice`, `#%` | `include?`, `str[i]` in a loop, `split("\n")`, `str[start, len]`, `format` |
| `String#sub` / `#split` with a Regexp | `gsub` (accepts a Regexp) and `match` |
| `Integer#between?`, `#clamp` | comparisons |
| `===` on Integers and Classes (`Integer === 3`) | `x.is_a?(Integer)` |
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
