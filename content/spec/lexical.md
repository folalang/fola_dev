---
title: Lexical structure
description: Source text, comments, identifiers, keywords and literal syntax.
order: 1
---

## Source text

A Fola source file is a sequence of Unicode characters encoded in UTF-8.
The conventional extension is `.fola`. Lines end with LF or CRLF. A line
that starts with `#!` on the first line of a file is ignored, so scripts can
be executable.

Newlines are significant: they end a statement unless the line is clearly
incomplete. A line is incomplete when it ends with a binary operator, a
comma, an opening bracket, or a `\`, or when the next line starts with
`.` or `&.` (a leading method call). `;` also ends a statement.

## Comments

```ruby
# A line comment runs to the end of the line.

=begin
A block comment starts with =begin and ends with =end,
each at the very beginning of a line.
=end
```

Contiguous `#` lines directly before a definition are its **documentation
comment**. `fola doc` extracts them and understands YARD tags (`@param`,
`@return`, ...). See [Documentation](/guides/docs/).

## Identifiers

| Form | Example | Meaning |
|---|---|---|
| `[a-z_][A-Za-z0-9_]*` | `count`, `_tmp` | Local variable or method name |
| `[A-Z][A-Za-z0-9_]*` | `String`, `MAX` | Constant (classes and modules are constants) |
| `@` identifier | `@name` | Instance variable |
| `@@` identifier | `@@count` | Class variable |
| `$` identifier | `$stdout`, `$debug` | Global variable |

A method name may end in `?`, `!` or `=` (`empty?`, `sort!`, `name=`).
Identifiers are case-sensitive and may contain non-ASCII letters.

> **Implementation status:** class variables and constant assignment
> (`MAX = 3`) are not yet implemented. Built-in constants such as
> `Float::INFINITY` can be read.

## Keywords

These words are reserved and cannot be used as local variable names:

```text
__ENCODING__ __LINE__ __FILE__ BEGIN END alias and begin break case class
def defined? do else elsif end ensure false for if in module next nil not
or redo rescue retry return self super then true undef unless until when
while yield
```

## Literals

### Integers

```ruby
42        -17       1_000_000      # decimal, _ separates digits
0x1F      0b1010    0o17   017     # hex, binary, octal
```

Integers have arbitrary precision. Arithmetic never overflows; it moves to a
big-integer representation when needed.

> **Implementation status:** an integer *literal* must fit in a signed
> 64-bit integer. Computed values are unbounded (`2 ** 100` works).

### Floats

```ruby
3.14   -0.5   1.5e3   2E-4
```

Floats are IEEE 754 double precision. A float literal needs digits on both
sides of the decimal point (`1.0`, not `1.`).

### Strings

```ruby
'single: no escapes except \\ and \''
"double: escapes such as \n \t \\ \" \e é"
%q(like single quotes)    %Q(like double quotes)
```

Adjacent string literals are concatenated. Strings are mutable byte
sequences; string literals are frozen.

Double-quoted strings may contain **interpolation**: `"total: #{n + 1}"`
evaluates the expression, calls `to_s` on the result and inserts it.
Heredocs (`<<~TEXT ... TEXT`) start a multi-line string on the next line;
`<<~` strips the common leading indentation.

> **Implementation status:** interpolation, heredocs and adjacent-literal
> concatenation are not yet implemented. `String#length` and indexing count
> bytes, not characters. Strings are immutable: mutating methods such as
> `<<` return a new String and leave the receiver unchanged.

### Symbols

```ruby
:name   :"with spaces"   :empty?   :+
```

A symbol is an immutable, interned name. Two symbols with the same name are
the same object.

### Arrays and hashes

```ruby
[1, "two", :three]
%w[ruby zig fola]          # => ["ruby", "zig", "fola"]
%i[get post]               # => [:get, :post]

{ "key" => "value", 1 => :one }
{ name: "Ada", age: 36 }   # shorthand for { :name => "Ada", :age => 36 }
```

Hashes keep keys in insertion order.

### Ranges

```ruby
1..10     # inclusive of 10
1...10    # exclusive of 10
```

> **Implementation status:** beginless and endless ranges (`..5`, `1..`)
> are not yet implemented.

### Regular expressions

```ruby
/fo+la/    /^\d{3}-\d{4}$/    %r{a/b}
```

Regexps support character classes, groups, alternation, anchors and
greedy quantifiers.

> **Implementation status:** flags (`/x/i`), lazy quantifiers (`*?`),
> interpolation inside regexps, and the `$~`/`$1` match globals are not yet
> implemented. Use `str.match(re)[1]` for captures.
