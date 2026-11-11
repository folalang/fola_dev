---
title: 1. Word frequencies
description: Count the words in a text and print a ranked table, using strings, hashes, blocks and methods.
order: 1
---

In this tutorial you'll write a program that reads a passage of text and
reports its most common words, like this:

```text
the     ██████████ 5
dog     ████ 2
fox     ████ 2
and     ██ 1
brown   ██ 1
```

## Step 1: split text into words

Start with the text in a variable. `split` with no argument splits on
whitespace, and `downcase` makes "The" and "the" the same word.

```fola
text = "The quick brown fox jumps over the lazy dog. The dog sleeps, and the fox runs."

words = text.downcase.split
p words.length
p words.first(5)
```

The output shows a problem: `"dog."` and `"dog"` count as different words.

## Step 2: clean up punctuation

`gsub` replaces every match of a pattern. The regexp `/[^a-z ]/` matches any
character that isn't a lowercase letter or a space, so replacing those with
`""` strips the punctuation.

```fola
text = "The quick brown fox jumps over the lazy dog. The dog sleeps, and the fox runs."

words = text.downcase.gsub(/[^a-z ]/, "").split
p words
```

## Step 3: count with a hash

A Hash maps each word to its count. `fetch(word, 0)` returns `0` the first
time you see a word.

```fola
text = "The quick brown fox jumps over the lazy dog. The dog sleeps, and the fox runs."
words = text.downcase.gsub(/[^a-z ]/, "").split

counts = {}
words.each do |word|
  counts[word] = counts.fetch(word, 0) + 1
end

p counts
```

## Step 4: rank the words

To sort by count, turn the hash into `[word, count]` pairs with `to_a`. Then
sort with a block that compares counts in reverse, breaking ties
alphabetically:

```fola
counts = { "the" => 4, "fox" => 2, "dog" => 2, "quick" => 1, "and" => 1 }

ranked = counts.to_a.sort do |a, b|
  if a[1] == b[1]
    a[0] <=> b[0]
  else
    b[1] <=> a[1]
  end
end

p ranked
```

## Step 5: print a table

`ljust` isn't available yet, so `format("%-8s", word)` pads the word to
8 characters. `"█" * n` draws a bar of length `n`.

```fola
ranked = [["the", 4], ["dog", 2], ["fox", 2], ["and", 1]]

ranked.each do |pair|
  word = pair[0]
  count = pair[1]
  puts format("%-8s", word) + "█" * (count * 2) + " " + count.to_s
end
```

## The whole program

Now wrap each step in a method, so the program reads top to bottom and
each part can be reused:

```fola
def words_in(text)
  text.downcase.gsub(/[^a-z ]/, "").split
end

def count(words)
  counts = {}
  words.each { |w| counts[w] = counts.fetch(w, 0) + 1 }
  counts
end

def rank(counts, limit)
  sorted = counts.to_a.sort do |a, b|
    a[1] == b[1] ? a[0] <=> b[0] : b[1] <=> a[1]
  end
  sorted.first(limit)
end

def report(ranked)
  ranked.each do |pair|
    puts format("%-8s", pair[0]) + "█" * (pair[1] * 2) + " " + pair[1].to_s
  end
end

text = "The quick brown fox jumps over the lazy dog. " +
       "The dog sleeps, and the fox runs. The end."

report(rank(count(words_in(text)), 5))
```

## Try next

- Ignore common words: keep a list such as `%w[the and a of]` and
  `reject` those words.
- Read the text from a file you name on the command line:
  `text = File.read(ARGV[0])`, then run `fola run words.fola essay.txt`.
- Print the percentage of all words next to each count, using `fdiv`.

Next: [2. A bank account](/tutorials/bank-account/).
