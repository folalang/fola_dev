---
title: Getting started
description: Install Fola, run your first program and find your way around the toolchain.
order: 0
---

Fola is a Ruby-like language with an interpreter written in Zig.
This page takes you from an empty machine to running your own programs. If you
just want to try the language, open the [playground](/play/). It runs the
same interpreter in your browser through WebAssembly.

## Install

Fola is built from source for now. Prebuilt binaries will follow the first
tagged release. You need:

| Tool | Version | Why |
|---|---|---|
| [Zig](https://ziglang.org/download/) | `0.16.0` or later | Compiles Fola and Prism's C sources |
| `git` | any | Cloning the repository and its submodule |
| GNU Readline and libffi | dev packages | Line editing in the REPL; the FFI |
| [Ruby](https://www.ruby-lang.org/) | any recent | Runs **once** to generate Prism's template sources |

On Debian or Ubuntu:

```sh
sudo apt-get install -y libreadline-dev libffi-dev ruby
```

On macOS with Homebrew:

```sh
brew install zig readline libffi ruby
```

Then clone and build:

```sh
git clone --recurse-submodules https://github.com/kamalogudah/fola.git
cd fola
ruby vendor/prism/templates/template.rb   # once per checkout
zig build                                 # builds zig-out/bin/fola
```

Put the binary on your `PATH` so you can run `fola` from anywhere:

```sh
export PATH="$PWD/zig-out/bin:$PATH"
fola --version
```

> Something went wrong? [Building from source](/contribute/building/) has
> platform notes and troubleshooting for every step.

## Hello, world

Create `hello.fola`:

```fola
puts "Hello, world!"
```

and run it:

```sh
fola run hello.fola
```

Every code block on this site with a **Run** button is a complete program.
Click it to open the program in the playground, then change it and run it again.

## A slightly bigger program

```fola
# Count how often each word appears.
text = "the quick brown fox jumps over the lazy dog the end"

counts = {}
text.split.each do |word|
  counts[word] = counts.fetch(word, 0) + 1
end

counts.keys.sort.each do |word|
  puts word + ": " + counts[word].to_s
end
```

If you know Ruby, this reads the way you'd expect. Fola uses Ruby's syntax,
parsed by [Prism](https://github.com/ruby/prism), the Ruby core team's own
parser. Some Ruby features aren't implemented yet. For example, this program
builds strings with `+` because string interpolation (`"#{x}"`) isn't
supported yet. [Coming from Ruby](/learn/from-ruby/) lists every difference.

## The interactive shell

Run `fola` with no arguments to start the REPL:

```console
$ fola
fola> words = %w[zig fola prism]
=> ["zig", "fola", "prism"]
fola> words.map(&:upcase)
=> ["ZIG", "FOLA", "PRISM"]
```

Variables and methods persist for the session. **Tab** completes names and,
after `receiver.`, that receiver's methods. Press **Ctrl-D** on an empty line
to leave.

## The toolchain

The `fola` binary does more than run scripts:

| Command | What it does |
|---|---|
| `fola run file.fola [args]` | Run a program; `ARGV` holds the extra arguments |
| `fola` | Start the REPL |
| `fola spec [paths]` | Run [FolaSpec](/guides/testing/) tests in `spec/**/*_spec.fola` |
| `fola doc -o doc lib/*.fola` | Generate [API documentation](/guides/docs/) from comments |
| `fola build app.fola` | Compile a program to WebAssembly (WASI); `folac app.fola` builds a native binary |
| `fola parse file.fola` | Print the parsed AST, useful for tooling and debugging |
| `folagem` | The [package manager](/guides/packages/) |

## Editor setup

Until there's a dedicated Fola extension, tell your editor to treat `*.fola`
as Ruby. You get highlighting, indentation and bracket matching for free.

For VS Code, add this to `settings.json`:

```json
{ "files.associations": { "*.fola": "ruby" } }
```

## Where next

- [A tour of Fola](/learn/tour/) covers the whole language in one page.
- The [tutorials](/tutorials/) build real programs step by step.
- The [standard library](/stdlib/) documents every built-in class.
- The [language specification](/spec/) gives the precise rules.
