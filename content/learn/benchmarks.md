---
title: Benchmarks
description: How fast Fola runs today compared with Ruby, measured with the benchmark suite in the Fola repository.
order: 3
---

Fola is young, and so far the work has gone into correctness, not speed.
These numbers show where it stands today against CRuby. They are updated
whenever the runtime changes noticeably.

**In short:** Fola starts about 25× faster than Ruby (4 ms vs. 103 ms), and
its memory use stays flat and small. On long-running compute-heavy code,
Fola's tree-walking interpreter is about 7-10× slower than CRuby's
bytecode VM, and further behind YJIT. For short scripts, where startup
counts, the gap is 1.3-5×.

> **Measured on** 2026-11-12, Fola `main` (`a8bbc7f`) built with
> `zig build -Doptimize=ReleaseFast`, against Ruby 4.0.0 with and without
> `--yjit`, on an Intel Core i5-8365U laptop running Linux x86_64. Each
> time is the best of 5 runs (3 for the larger inputs). Absolute numbers
> depend on the machine; the ratios are what matters.

## Startup

| | Ruby 4.0 | Fola |
|---|--:|--:|
| Empty script | 103 ms | 4 ms |

Fola is one static binary with its standard library built in, so there
are no gems to load and nothing to boot. That matters for CLI tools,
scripts run from cron, and anything started many times.

## The benchmark suite

Each program in [`bench/`](https://github.com/kamalogudah/fola/tree/main/bench) runs unchanged under both
`fola run` and `ruby`. Before timing, the runner checks that both print
the same result. These times include startup, so Ruby pays its ~100 ms on
every run.

<div class="bench-legend"><span><i style="background:var(--fg-faint)"></i>Ruby 4.0</span><span><i style="background:var(--tok-sym)"></i>Ruby 4.0 + YJIT</span><span><i style="background:var(--accent)"></i>Fola</span></div>
<div class="bench">
<div class="bench-group"><div class="bench-name">blocks<span>map / select / reduce over 200k elements</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:77.5%"></div></div><b>165 ms</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:67.6%"></div></div><b>144 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>213 ms</b></div>
</div>
<div class="bench-group"><div class="bench-name">fib<span>recursive calls, fib(27)</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:43.2%"></div></div><b>134 ms</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:34.5%"></div></div><b>107 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>310 ms</b></div>
</div>
<div class="bench-group"><div class="bench-name">hash<span>200k Hash inserts and lookups</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:51.0%"></div></div><b>158 ms</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:51.3%"></div></div><b>159 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>310 ms</b></div>
</div>
<div class="bench-group"><div class="bench-name">loop<span>tight while loop, 3M iterations</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:21.4%"></div></div><b>220 ms</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:21.9%"></div></div><b>225 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>1.03 s</b></div>
</div>
<div class="bench-group"><div class="bench-name">objects<span>300k Point.new and method calls</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:32.1%"></div></div><b>209 ms</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:24.6%"></div></div><b>160 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>651 ms</b></div>
</div>
<div class="bench-group"><div class="bench-name">sieve<span>primes up to 300k, array indexing</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:33.2%"></div></div><b>190 ms</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:30.0%"></div></div><b>172 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>573 ms</b></div>
</div>
<div class="bench-group"><div class="bench-name">strcat<span>20k string appends</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:78.9%"></div></div><b>265 ms</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:72.9%"></div></div><b>245 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>336 ms</b></div>
</div>
</div>

| Benchmark | Ruby | Ruby + YJIT | Fola | Fola ÷ Ruby | Fola peak memory | Ruby peak memory |
|---|--:|--:|--:|--:|--:|--:|
| `blocks` | 165 ms | 144 ms | 213 ms | 1.3× | 19 MB | 18 MB |
| `fib` | 134 ms | 107 ms | 310 ms | 2.3× | 5 MB | 14 MB |
| `hash` | 158 ms | 159 ms | 310 ms | 2.0× | 25 MB | 24 MB |
| `loop` | 220 ms | 225 ms | 1.03 s | 4.7× | 4 MB | 14 MB |
| `objects` | 209 ms | 160 ms | 651 ms | 3.1× | 14 MB | 14 MB |
| `sieve` | 190 ms | 172 ms | 573 ms | 3.0× | 16 MB | 17 MB |
| `strcat` | 265 ms | 245 ms | 336 ms | 1.3× | 21 MB | 80 MB |

Code built from blocks and collection methods (`blocks`) and code that
mostly calls into native methods (`strcat`, `hash`) is closest to Ruby,
because the work runs in Zig. Tight loops of arithmetic and local variable
access (`loop`) are slowest, because every AST node the tree walker
visits costs a few nanoseconds that a bytecode VM doesn't pay.

## Larger inputs

With bigger inputs, startup stops mattering and the gap in raw interpreter
speed shows:

<div class="bench-legend"><span><i style="background:var(--fg-faint)"></i>Ruby 4.0</span><span><i style="background:var(--tok-sym)"></i>Ruby 4.0 + YJIT</span><span><i style="background:var(--accent)"></i>Fola</span></div>
<div class="bench">
<div class="bench-group"><div class="bench-name">fib(32)<span>~7M recursive calls</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:13.6%"></div></div><b>517 ms</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:4.2%"></div></div><b>160 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>3.81 s</b></div>
</div>
<div class="bench-group"><div class="bench-name">loop, 30M<span>30M while-loop iterations</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:10.6%"></div></div><b>1.40 s</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:11.1%"></div></div><b>1.47 s</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>13.24 s</b></div>
</div>
<div class="bench-group"><div class="bench-name">objects, 3M<span>3M allocations and dispatches</span></div>
<div class="bench-row"><em>Ruby</em><div class="bench-track"><div class="bench-bar" style="width:14.1%"></div></div><b>1.21 s</b></div>
<div class="bench-row"><em>YJIT</em><div class="bench-track"><div class="bench-bar yjit" style="width:9.2%"></div></div><b>788 ms</b></div>
<div class="bench-row"><em>Fola</em><div class="bench-track"><div class="bench-bar fola" style="width:100.0%"></div></div><b>8.57 s</b></div>
</div>
</div>

| Input | Ruby | Ruby + YJIT | Fola | Fola ÷ Ruby | Fola peak memory | Ruby peak memory |
|---|--:|--:|--:|--:|--:|--:|
| fib(32) | 517 ms | 160 ms | 3.81 s | 7.4× | 6 MB | 14 MB |
| loop, 30M | 1.40 s | 1.47 s | 13.24 s | 9.5× | 5 MB | 14 MB |
| objects, 3M | 1.21 s | 788 ms | 8.57 s | 7.1× | 15 MB | 14 MB |

Peak memory stays flat as the work grows. Three million `Point` objects
peak at 15 MB, because `fola run` frees unreachable values with a
mark-and-sweep collector (see the [memory strategy](/contribute/memory/)).
Before the collector existed, the same run peaked at 9 GB.

## Where it's heading

`fola run` executes programs on a tree-walking interpreter. A bytecode
compiler and VM are being built alongside it. It already runs recursion
and arithmetic about 45-50× faster than the tree walker (see
[VM vs. tree-walker benchmarks](/contribute/benchmarks/)). It doesn't yet
compile classes, blocks or instance variables, so programs don't run on
it yet. As more of the language moves onto the VM, the numbers on this
page should improve.

## Run them yourself

You need a Fola checkout and Ruby on your `PATH`:

```sh
zig build -Doptimize=ReleaseFast   # Debug builds are roughly 10x slower
bench/run.sh -y -m                 # all benchmarks, with YJIT and peak memory
bench/run.sh -n 5 fib loop         # selected benchmarks, best of 5
bench/stdlib.sh                    # ns per call for each stdlib method
bench/stdlib.sh -l                 # check each stdlib method for leaks
```

`bench/stdlib.sh` times more than 100 standard library methods one by one
against Ruby, and marks the ones that are unusually slow.
