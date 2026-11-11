---
title: A tour of Fola
description: The whole language on one page, from values to classes, blocks and exceptions.
order: 1
---

This tour walks through the language in roughly the order you'll need it.
Every example is a complete program: press **Run** to try it in the
playground. If you already know Ruby, skim the headings and read
[Coming from Ruby](/learn/from-ruby/) instead.

## Values and variables

Everything in Fola is an object. Local variables need no declaration and
start with a lowercase letter or underscore.

```fola
name = "Ada"           # String
year = 1815            # Integer (arbitrary precision)
pi = 3.14159           # Float
ready = true           # true / false
nothing = nil          # the absence of a value
lang = :fola           # Symbol: an interned name

p name, year, pi, ready, nothing, lang
p 2 ** 100             # Integers never overflow
```

`p` prints a value's inspected form; `puts` prints strings as they are.
Only `nil` and `false` are falsy. `0`, `""` and `[]` all count as true.

## Strings

```fola
greeting = "Hello"
who = "Fola"

puts greeting + ", " + who + "!"     # concatenation
puts "ha" * 3                         # repetition
puts format("%s is %d years old", "Fola", 1)
puts "a-b-c".split("-").join(" + ")
puts "  padded  ".strip.upcase
p "fola".start_with?("fo"), "fola".include?("ol")
p "hello world".gsub("o", "0")
p "hello"[0], "hello"[1, 3]
```

Double-quoted strings process escapes such as `\n` and `\t`; single-quoted
strings are taken literally. String interpolation (`"#{x}"`) isn't
supported yet. Use `+` with `to_s`, or `format`.

## Numbers

```fola
p 7 / 2, 7 % 3, 7.0 / 2     # Integer / Integer is an Integer
p 10.fdiv(4), 3.7.floor, 3.2.ceil, 3.5.round
p 0x1F, 0b101, 0o17, 1_000_000
p "42".to_i + 1, "2.5".to_f * 2
```

## Arrays

```fola
langs = ["ruby", "zig", "fola"]
langs.push("c")

p langs.length, langs.first, langs.last
p langs.map { |l| l.upcase }
p langs.select { |l| l.length > 3 }
p langs.sort, langs.reverse
p [3, 1, 2].sum, [1, [2, [3]]].flatten, [1, nil, 2].compact
p %w[a b c].zip([1, 2, 3])
p (1..10).select(&:even?)
```

## Hashes

```fola
ages = { "ada" => 36, "grace" => 85 }
ages["linus"] = 54

p ages["ada"], ages.fetch("nobody", 0)
p ages.key?("grace"), ages.length

ages.each do |name, age|
  puts name + " is " + age.to_s
end

point = { x: 1, y: 2 }     # Symbol keys
p point[:x] + point[:y]
```

## Ranges

```fola
p (1..5).to_a       # inclusive
p (1...5).to_a      # exclusive
p (1..3).map { |i| i * i }
p (1..10).include?(7)
```

## Control flow

```fola
temperature = 22

if temperature > 30
  puts "hot"
elsif temperature > 15
  puts "pleasant"
else
  puts "cold"
end

puts "no coat needed" unless temperature < 10
label = temperature.even? ? "even" : "odd"
puts label

# `if` is an expression
kind = if temperature > 0 then "above zero" else "freezing" end
puts kind

count = 0
while count < 3
  count += 1
end
until count == 0
  count -= 1
end
p count
```

`case`/`when` isn't supported yet; chain `if`/`elsif` instead.

## Methods

```fola
def greet(name = "world")
  "Hello, " + name + "!"     # the last expression is the return value
end

def classify(n)
  return "negative" if n < 0
  n.zero? ? "zero" : "positive"
end

puts greet
puts greet("Fola")
p classify(-3), classify(0), classify(8)
```

Method names may end in `?` (predicates) or `!` (methods that modify the receiver or raise an error).

## Blocks

A block is code passed to a method, written with `{ }` on one line or
`do ... end` across several. The method runs it with `yield`.

```fola
def twice
  yield 1
  yield 2
end

twice { |n| puts "called with " + n.to_s }

squares = [1, 2, 3].map do |n|
  n * n
end
p squares

total = [1, 2, 3, 4].inject(0) { |sum, n| sum + n }
p total

3.times { |i| print i, " " }
puts
```

## Classes

```fola
class Animal
  attr_reader :name

  def initialize(name)
    @name = name            # instance variables start with @
  end

  def speak
    name + " makes a sound"
  end
end

class Dog < Animal
  def speak
    super + " (woof)"
  end
end

rex = Dog.new("Rex")
puts rex.speak
p rex.is_a?(Animal)
p rex.class.name
```

`attr_reader`, `attr_writer` and `attr_accessor` generate accessor methods.
Define class methods with `def self.name`.

## Modules

Modules group methods. They can be mixed into classes with `include`, or
called directly when you define them with `def self.`.

```fola
module Loud
  def shout
    speak.upcase + "!"
  end
end

class Cat
  include Loud

  def speak
    "meow"
  end
end

module Geometry
  def self.area(w, h)
    w * h
  end
end

puts Cat.new.shout
p Geometry.area(3, 4)
```

## Exceptions

```fola
class ConfigError < StandardError
end

def load_config(path)
  raise ConfigError, "missing " + path if path.empty?
  "loaded " + path
end

begin
  puts load_config("app.yml")
  puts load_config("")
rescue ConfigError => e
  puts "config problem: " + e.message
ensure
  puts "done"
end

attempts = 0
begin
  attempts += 1
  raise "flaky" if attempts < 3
  puts "succeeded after " + attempts.to_s + " attempts"
rescue
  retry
end
```

## Files and the standard library

The standard library is built in. `require` of a library name is accepted
but rarely needed. `require "./lib/thing"` loads another Fola file.

```ruby
data = JSON.parse(File.read("config.json"))
File.write("out.txt", "hello\n")
Dir.glob("src/**/*.fola").each { |f| puts f }
```

Read the [standard library reference](/stdlib/) for the full list, from
`JSON` and `YAML` through `Net::HTTP`, `SQLite` and the `Fola::Web`
framework.
