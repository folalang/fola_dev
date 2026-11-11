---
title: 3. A to-do list CLI
description: Build a command-line app with subcommands and options that saves its data as JSON.
order: 3
---

You'll build `todo`, a command-line to-do list with `add`, `list`, `done`
and `clear` commands, a `--file` option, and generated help. It uses
[`Fola::CLI`](/guides/cli/), a Thor-like framework, plus the built-in
`File` and `JSON`.

This program reads and writes files, so run it in your terminal rather than
the playground. [Install Fola](/learn/) first if you haven't already.

## Step 1: a command

Create `todo.fola`. A CLI is a class that inherits from `Fola::CLI::Base`.
Each public method is a command, `desc` describes the next one, and
`start(ARGV)` dispatches to the command named on the command line.

```ruby
require "fola/cli"

class Todo < Fola::CLI::Base
  desc "add TITLE", "Add a task"
  def add(title)
    puts "would add: " + title
  end
end

Todo.start(ARGV)
```

```console
$ fola run todo.fola add "Write the spec"
would add: Write the spec
$ fola run todo.fola help
Commands:
  todo.fola add TITLE       # Add a task
  todo.fola help [COMMAND]  # Describe available commands or one specific command
```

You get `help` for free. The parameter list `def add(title)` means the
command takes exactly one argument. The framework reports a missing or extra
argument for you.

## Step 2: store tasks in a file

Each task is a Hash, and the list is an Array of them, saved as JSON. A small
`Store` class keeps the file handling in one place.

```ruby
class Store
  def initialize(path)
    @path = path
  end

  def load
    return [] unless File.exist?(@path)
    JSON.parse(File.read(@path))
  end

  def save(tasks)
    File.write(@path, JSON.generate(tasks))
  end
end
```

> **Note:** `JSON.parse` gives Hashes with **Symbol** keys by default
> (`task[:title]`). Ruby gives String keys. Pass `symbolize_names: false`
> if you want strings. This tutorial uses symbols throughout.

## Step 3: options

`class_option` adds an option that every command accepts, and `option` adds
one to the next command only. Inside a command, `options` is a Hash of the
parsed values.

```ruby
class_option :file, type: :string, default: "todos.json", desc: "Where tasks are stored"

desc "list", "Show tasks"
option :all, type: :boolean, default: false, aliases: "-a", desc: "Include finished tasks"
def list
  # options[:file] and options[:all] are available here
end
```

Helper methods that shouldn't become commands go in a `no_commands` block.

## The whole program

```ruby
require "fola/cli"

# Stores tasks in a JSON file: [{"title": "...", "done": false}, ...]
class Store
  def initialize(path)
    @path = path
  end

  def load
    return [] unless File.exist?(@path)
    JSON.parse(File.read(@path))
  end

  def save(tasks)
    File.write(@path, JSON.generate(tasks))
  end
end

class Todo < Fola::CLI::Base
  # Exit with status 1 when a command fails, so scripts can tell.
  def self.exit_on_failure?
    true
  end

  class_option :file, type: :string, default: "todos.json", desc: "Where tasks are stored"

  desc "add TITLE", "Add a task"
  def add(title)
    tasks = store.load
    tasks.push({ title: title, done: false })
    store.save(tasks)
    puts "added #" + tasks.length.to_s + ": " + title
  end

  desc "list", "Show tasks"
  option :all, type: :boolean, default: false, aliases: "-a", desc: "Include finished tasks"
  def list
    tasks = store.load
    number = 0
    shown = 0
    tasks.each do |item|
      number += 1
      if options[:all] || !item[:done]
        mark = item[:done] ? "[x]" : "[ ]"
        puts format("%3d", number) + " " + mark + " " + item[:title]
        shown += 1
      end
    end
    puts "nothing to do" if shown == 0
  end

  desc "done NUMBER", "Mark a task as finished"
  def done(number)
    tasks = store.load
    index = number.to_i - 1
    if index < 0 || index >= tasks.length
      raise Fola::CLI::Error, "no task #" + number
    end
    tasks[index][:done] = true
    store.save(tasks)
    puts "finished: " + tasks[index][:title]
  end

  desc "clear", "Remove finished tasks"
  def clear
    tasks = store.load
    left = tasks.reject { |t| t[:done] }
    store.save(left)
    puts "removed " + (tasks.length - left.length).to_s + " finished tasks"
  end

  no_commands do
    def store
      Store.new(options[:file])
    end
  end
end

Todo.start(ARGV)
```

Try it:

```console
$ fola run todo.fola add "Write the spec"
added #1: Write the spec
$ fola run todo.fola add "Launch fola.dev"
added #2: Launch fola.dev
$ fola run todo.fola done 2
finished: Launch fola.dev
$ fola run todo.fola list --all
  1 [ ] Write the spec
  2 [x] Launch fola.dev
$ fola run todo.fola clear
removed 1 finished tasks
$ fola run todo.fola done 9
no task #9
$ echo $?
1
$ fola run todo.fola help list
Usage:
  todo.fola list

Options:
  -a, [--all], [--no-all]  # Include finished tasks
                           # Default: false
  [--file=FILE]            # Where tasks are stored
                           # Default: todos.json

Show tasks
```

Options go after the command name: `fola run todo.fola list --file=work.json`.

## Try next

- Add `program_name "todo"` to the class so help says `todo` rather than
  `todo.fola`.
- Add a `--priority` option to `add` with `enum: %w[low normal high]`, and
  sort `list` by it.
- Write [FolaSpec](/guides/testing/) tests for `Store` using a temporary
  file.
- Compile it to a standalone binary with `folac todo.fola -o todo`.

Next: [4. A web app](/tutorials/web-app/).
