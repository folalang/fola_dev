---
title: Language specification
description: The definition of Fola, covering its syntax, semantics and type system.
order: 0
---

This specification defines the Fola programming language: which programs
are well formed and what they mean. It is written for implementers, tool
authors and anyone who needs the precise rules. If you want to learn the
language, start with [A tour of Fola](/learn/tour/).

## Status

This is a **working draft** that tracks Fola 0.0.1. Fola adopts Ruby's
surface syntax and much of its object model, so this document only spells
out a rule in full where Fola defines it differently or more precisely.
Elsewhere it refers to Ruby 3.3 behaviour.

The reference implementation doesn't cover the whole language yet. Notes
like this one mark where it falls short:

> **Implementation status:** what the `fola` interpreter accepts today, if
> it differs from the rule above.

A program that uses a construct marked as not yet implemented is still a
valid Fola program. The reference implementation rejects it with an
"unsupported syntax" diagnostic and doesn't run it.

## How a program runs

A Fola program goes through these stages:

1. **Parsing.** The source text (UTF-8) is parsed by
   [Prism](https://github.com/ruby/prism) into a Prism syntax tree. Any
   syntax error stops the program before it runs.
2. **Translation.** The Prism tree becomes the Fola AST: a smaller, typed
   tree. Prism nodes with no Fola translation produce an "unsupported
   syntax" diagnostic. See [Translation](/spec/translation/).
3. **Type checking.** Optional type annotations are checked. Unannotated
   code is dynamically typed, and checking never rejects it. See
   [Type system](/spec/types/).
4. **Evaluation.** The program's top-level statements run in order in the
   context of the main object.

## Notation

Grammar fragments use a light EBNF. `x?` means optional, `x*` means zero or
more, `x+` means one or more, `|` separates alternatives, and literal tokens
are written in `code`. Examples use fenced code blocks. `# =>` shows the
value an expression evaluates to.

## Contents

| Chapter | Covers |
|---|---|
| [Lexical structure](/spec/lexical/) | Source encoding, comments, identifiers, keywords and literals |
| [Expressions and statements](/spec/expressions/) | Operators, precedence, assignment, conditionals, loops and calls |
| [Objects and methods](/spec/objects/) | Classes, modules, method definition, lookup and visibility |
| [Blocks, scope and exceptions](/spec/evaluation/) | Closures, variable scope, `yield`, `raise`/`rescue` and program structure |
| [Type system](/spec/types/) | Optional type annotations and their static rules |
| [Translation](/spec/translation/) | How Prism trees become the Fola AST |

The [standard library reference](/stdlib/) is normative for built-in
classes and modules.
