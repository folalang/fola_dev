---
title: Expressions and statements
description: Operators and precedence, assignment, conditionals, loops and method calls.
order: 2
---

Almost every construct in Fola is an expression with a value. A sequence of
statements evaluates to the value of the last one. An empty sequence
evaluates to `nil`.

## Truthiness

`nil` and `false` are **falsy**. Every other value is **truthy**, including
`0`, `""`, `[]` and `{}`.

## Operator precedence

From highest to lowest. Operators on the same row share a precedence level.

| Operators | Associativity | Meaning |
|---|---|---|
| `!` `~` unary `+` | right | Not, bitwise not, unary plus |
| `**` | right | Exponentiation |
| unary `-` | right | Negation |
| `*` `/` `%` | left | Multiply, divide, modulo |
| `+` `-` | left | Add, subtract |
| `<<` `>>` | left | Shift / append |
| `&` | left | Bitwise and |
| `\|` `^` | left | Bitwise or, xor |
| `>` `>=` `<` `<=` | left | Comparison |
| `<=>` `==` `===` `!=` `=~` `!~` | none | Equality and matching |
| `&&` | left | Logical and |
| `\|\|` | left | Logical or |
| `..` `...` | none | Range construction |
| `? :` | right | Conditional |
| modifier `rescue` | left | |
| `=` `+=` `-=` `*=` ... `\|\|=` `&&=` | right | Assignment |
| `defined?` | none | |
| `not` | right | Low-precedence not |
| `and` `or` | left | Low-precedence logic |
| modifier `if` `unless` `while` `until` | none | Statement modifiers |

Most binary operators are method calls: `a + b` is `a.+(b)`. `&&`, `||`,
`and`, `or`, `not`, `!`, `? :` and assignment are built into the language
and cannot be redefined.

`&&` and `||` short-circuit and return the value of the last operand they
evaluated (`nil || "default"` is `"default"`).

Integer division and modulo **floor** toward negative infinity:
`-7 / 2 == -4` and `-7 % 2 == 1`.

> **Implementation status:** Integer `/` truncates toward zero
> (`-7 / 2 == -3`), but `%` floors. `===` is only defined on Range and
> Regexp, and `!~` is not yet implemented. `not`, `defined?` and modifier
> `rescue` are not yet implemented. User-defined operator methods
> (`def +(other)`) are not yet dispatched.

## Assignment

```ruby
x = 1                  # local variable
@count = 0             # instance variable
$verbose = true        # global variable
obj.name = "Ada"       # calls obj.name=("Ada")
list[0] = :first       # calls list.[]=(0, :first)
x += 1                 # x = x + 1, likewise -=, *=, /=, **= ...
x ||= default          # x = default unless x is truthy
a, b = b, a            # multiple assignment (swap)
first, *rest = list    # splat in multiple assignment
```

An assignment evaluates to the assigned value. A local variable exists from
the point of its first assignment to the end of its scope. Reading it before
then is a call to a method of that name.

> **Implementation status:** `||=`, `&&=`, `op=` on indexes and attributes,
> multiple assignment and destructuring (including nested and splat targets)
> are implemented as of 0.0.2. Constants (`MAX = 10`) and class variables
> (`@@count`) are too.

## Conditionals

```ruby
if cond then ... elsif cond then ... else ... end
unless cond then ... else ... end
expr if cond              # modifier forms
expr unless cond
cond ? a : b
```

An `if` with no matching branch evaluates to `nil`.

```ruby
case value
when 1, 2       then "small"     # matched with ===
when 3..9       then "medium"
when String     then "text"
else                 "other"
end
```

`case` tests each `when` with `pattern === value`, in order, and evaluates
the first matching branch.

> **Implementation status:** `case`/`when` and `case`/`in` pattern matching
> are implemented as of 0.0.2. `when *list` isn't supported on the bytecode
> VM, so a program that uses it runs on the tree walker.

## Loops

```ruby
while cond do ... end
until cond do ... end
expr while cond              # modifier forms
begin ... end while cond     # body runs at least once
for x in collection do ... end
loop do ... end              # Kernel#loop, until break
```

Loops evaluate to `nil` unless `break` gives a value. `break` leaves the
innermost loop or block, `next` skips to its next iteration, and `redo`
restarts the current iteration.

> **Implementation status:** all of these are implemented as of 0.0.2.
> `redo` runs on the tree walker only.

## Method calls

```ruby
puts "hi"                    # receiver is self, parentheses optional
list.push(4)                 # explicit receiver
list.map { |x| x * 2 }       # block argument
File.write(path, data)       # module (singleton) method
greet "Ada", 2               # arguments without parentheses
user&.name                   # safe navigation: nil if user is nil
list.map(&:upcase)           # Symbol#to_proc
```

Arguments are evaluated left to right before the call. Parentheses are
required when a call with arguments is itself an argument, as in
`p(f(1), 2)`.

> **Implementation status:** safe navigation (`&.`) is not yet implemented.
> Splatted arguments and keyword arguments are implemented as of 0.0.2.
