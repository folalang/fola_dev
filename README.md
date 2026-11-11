# fola.dev

The source of [fola.dev](https://fola.dev), the website for the
[Fola programming language](https://github.com/kamalogudah/fola).

The site generator is written in Fola. `build.fola` renders Markdown,
applies ERB templates with `Fola::Web::Template`, rewrites links, and writes
the search index and sitemap. No Node, Ruby or Jekyll is involved.

## Quick start

You need a built Fola checkout. By default the build looks for one at `../fola`:

```sh
# in ../fola
zig build                         # builds zig-out/bin/fola and fola-web.wasm

# here
../fola/zig-out/bin/fola run build.fola     # writes public/
../fola/zig-out/bin/fola run serve.fola     # http://127.0.0.1:4000
```

Point `FOLA_REPO` somewhere else if your checkout isn't at `../fola`:
`FOLA_REPO=~/src/fola fola run build.fola`.

## Layout

| Path | What it is |
|---|---|
| `build.fola` | Entry point: loads pages, renders them, writes `public/` |
| `serve.fola` | Local preview server built on `Fola::Web` |
| `lib/markdown.fola` | Markdown → HTML (GFM tables, fenced code, nested lists, ...) |
| `lib/site.fola` | Pages, front matter, link rewriting, navigation, search index, sitemap |
| `site.yml` | Site settings, header sections, and the docs imported from the Fola repo |
| `content/` | Pages written for the site (Markdown + YAML front matter) |
| `templates/` | `layout.erb` (shell), `doc.erb` (docs pages), `home.erb` (landing page) |
| `assets/` | `style.css`, `site.js` (search, highlighting, Run buttons), logo |
| `scripts/check-examples.sh` | Runs every runnable code block in `content/` |
| `scripts/check-links.sh` | Fails on broken internal links or anchors in `public/` |
| `.github/workflows/deploy.yml` | CI: build Fola, check, build the site, deploy to GitHub Pages |

## Where content comes from

- **Written here** (`content/`): getting started, the language tour,
  Coming from Ruby, the language specification, and the tutorials.
- **Imported from the Fola repo** (listed under `imports:` in `site.yml`):
  the standard library reference, the guides, the type system and
  translation chapters, and the contributor docs. These are read from
  `$FOLA_REPO/docs` at build time, so the reference stays in sync with the code.
  Edit them in the Fola repo, not here.

The URL of a page in `content/` follows its path:
`content/learn/tour.md` becomes `/learn/tour/`, and `index.md` becomes the
directory URL. Front matter sets `title`, `description`, `order` (its
position in the sidebar), and optionally `section`, `url` and
`layout` (`doc` or `home`).

Relative Markdown links (`string.md#split`, `../README.md`) are rewritten to
site URLs. Links to repo files that aren't published as pages go to GitHub.

### Runnable examples

A fenced block tagged `fola` must be a complete program. The site gives it
a **Run** button that opens it in the playground, and
`scripts/check-examples.sh` runs it in CI. Use `ruby` for fragments and for
programs that need files, sockets or arguments.

## Deploying

`.github/workflows/deploy.yml` builds Fola from `kamalogudah/fola@main`,
checks the examples, builds the site, checks links, and deploys `public/`
to GitHub Pages. It runs on pushes to `main`, nightly, on manual dispatch,
and on a `fola-docs-updated` repository dispatch, which the Fola repo can
send when its docs change.

One-time setup:

1. In the repo settings, under **Pages**, set the source to **GitHub Actions**.
2. Add `fola.dev` as the custom domain (the build writes `public/CNAME`).
3. At the DNS provider, point the apex `fola.dev` to GitHub Pages: `A`
   records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
   `185.199.111.153`, plus `AAAA` records `2606:50c0:8000::153` through
   `2606:50c0:8003::153`. Add `CNAME www` → `kamalogudah.github.io`.
4. Once the certificate is issued, enable **Enforce HTTPS**.

## Interpreter limits the generator works around

The generator only uses what the Fola interpreter supports today, which is
also a good test of it. It avoids `case`, string interpolation,
`next`/`break`, `||=`, constants, `String#index`, lazy regex quantifiers
and keyword arguments. Where a construct is missing, the code uses a
`while` loop, an `if`/`elsif` chain, or a method instead. As the language
grows, these places can be simplified.
