---
title: Objects and methods
description: Classes, modules, method definition, lookup, self and visibility.
order: 3
---

## Everything is an object

Every value is an object, including integers, `nil`, `true`, classes and
modules. Every object has a class (`obj.class`), and every class is itself an
object of class `Class`. Objects are compared for identity with `equal?` and
for value with `==`.

The built-in class hierarchy:

```text
BasicObject
└── Object
    ├── Module ── Class
    ├── NilClass, TrueClass, FalseClass
    ├── Numeric ── Integer, Float, Rational, Complex
    ├── String, Symbol, Array, Hash, Range, Regexp, MatchData
    ├── Exception ── StandardError ── ArgumentError, TypeError, ...
    └── ...standard library classes
```

## Classes

```ruby
class Point < Base          # superclass is optional (default Object)
  attr_reader :x, :y        # defines x and y readers

  def initialize(x, y)      # called by Point.new(x, y)
    @x = x
    @y = y
  end

  def self.origin           # class (singleton) method
    new(0, 0)
  end

  def to_s
    "(" + x.to_s + ", " + y.to_s + ")"
  end
end
```

`class Name ... end` creates the class, or **reopens** it if it already
exists, so methods can be added to any class later. `Name.new(args)`
allocates an instance and calls its `initialize` with `args`.

Instance variables belong to the object, not the class. They don't need to
be declared. Reading one that was never assigned gives `nil`.

`attr_reader`, `attr_writer` and `attr_accessor` define reader methods,
writer methods (`name=`), or both.

> **Implementation status:** reopening a user-defined class replaces its
> earlier methods instead of adding to them, so keep each class in one
> `class` body. Built-in classes (`String`, `Integer`, ...) can't be
> reopened yet.

## Modules

```ruby
module Greeting
  def greet = "Hello from " + name     # instance method, for mixing in

  def self.version = "1.0"             # module function
end

class User
  include Greeting
  attr_reader :name
end
```

A module is a namespace and a bundle of methods. It cannot be instantiated.
`include M` inserts `M` into a class's ancestor chain, directly above the
class. `extend M` adds `M`'s methods to a single object. Classes and modules
nest. Write `Outer::Inner` to refer to a nested one.

> **Implementation status:** `include` and module functions are
> implemented. `extend` and `Outer::Inner` lookups of user-defined nested
> classes and modules are not yet implemented. Define them at the top level.

## Method lookup

A call `recv.m(args)` finds `m` by searching:

1. the singleton class of `recv`, if it has one,
2. `recv`'s class,
3. the modules included in that class, last included first,
4. the superclass, and its included modules, repeating up to
   `BasicObject`.

If nothing is found, `method_missing` is called. Its default implementation
raises `NoMethodError`. Within a method, `super` calls the next method of
the same name further along the chain. Bare `super` passes the current
method's arguments, and `super(a, b)` passes the ones given.

## self

`self` is the current object: the receiver inside an instance method, the
class inside a class body or class method, and the **main object** at the
top level. A call with no receiver (`helper(1)`) is sent to `self`.
Top-level `def` defines a private method on `Object`.

## Method definitions

```ruby
def name(required, optional = default, *rest, key:, opt_key: 1, **opts, &block)
  body
end

def area = width * height        # endless method
```

A method returns the value of its last expression, or the value given to
`return`. Default values are evaluated at call time, left to right, and can
refer to earlier parameters.

> **Implementation status:** required, optional and block-free parameters
> and endless methods are implemented. Rest (`*rest`, `**opts`) and
> explicit block (`&block`) parameters are not yet. Keyword arguments
> arrive as one Hash in the next positional parameter.

## Visibility

Methods are **public** by default. `private` makes the methods defined after
it in the class body callable only without an explicit receiver.
`protected` methods can be called by other instances of the same class.

> **Implementation status:** `private` and `protected` are not yet
> implemented. Every method is public.

## Equality and hashing

| Method | Default | Purpose |
|---|---|---|
| `equal?(o)` | identity | Same object |
| `==(o)` | identity | Value equality; classes override it |
| `eql?(o)` and `hash` | identity | Hash key equality; must agree with each other |
| `===(o)` | `==` | Case equality, used by `case`/`when` |
| `<=>(o)` | `0` if `==`, else `nil` | Ordering, used by `sort` |
