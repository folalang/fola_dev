---
title: 4. A web app
description: Build a small notes service with Fola::Web, covering routes, JSON, HTML templates, tests and a real server.
order: 4
---

`Fola::Web` is a Rack-style web framework that ships with Fola. You'll use
it to build a notes service with a JSON API and an HTML page. Then you'll
serve it over HTTP.

Every app is an object that takes a request and returns
`[status, headers, body]`. That means you can call an app directly, without
a network. Steps 1–3 work that way and run in the playground. Step 4 opens
a real socket, so run it in your terminal.

## Step 1: routes

A `Router` maps HTTP verbs and paths to blocks. `:name` in a path captures
that segment and passes it to the block. `Fola::Web.env_for` builds a fake
request and `Fola::Web.call` runs the app on it.

```fola
require "fola/web"

app = Fola::Web::Router.new do
  get "/" do
    "Welcome to Notes"
  end

  get "/hello/:name" do |name|
    "Hello, " + name + "!"
  end
end

p Fola::Web.call(app, Fola::Web.env_for("/"))
p Fola::Web.call(app, Fola::Web.env_for("/hello/Ada"))
p Fola::Web.call(app, Fola::Web.env_for("/missing"))[0]
```

A block's return value becomes the response body. Paths no route matches
get a `404`.

## Step 2: a JSON API

Route blocks are closures, so they can use the `notes` store defined above
them. Inside a route:

- `params` holds query and form parameters,
- `status`, `headers` and `content_type` set parts of the response,
- `halt` stops the route and responds immediately.

```fola
require "fola/web"

class NoteStore
  def initialize
    @notes = []
  end

  def all
    @notes
  end

  def add(text)
    note = { id: @notes.length + 1, text: text }
    @notes.push(note)
    note
  end

  def find(id)
    @notes.find { |n| n[:id] == id }
  end
end

notes = NoteStore.new
notes.add("Buy milk")

app = Fola::Web::Router.new do
  get "/notes" do
    content_type :json
    JSON.generate(notes.all)
  end

  get "/notes/:id" do |id|
    note = notes.find(id.to_i)
    halt 404, "no such note" if note.nil?
    content_type :json
    JSON.generate(note)
  end

  post "/notes" do
    text = params["text"]
    halt 422, "text is required" if text.nil? || text.strip.empty?
    note = notes.add(text)
    content_type :json
    status 201
    headers "location" => "/notes/" + note[:id].to_s
    JSON.generate(note)
  end
end

def show(response)
  puts response[0].to_s + " " + response[2].join
end

show Fola::Web.call(app, Fola::Web.env_for("/notes", method: "POST", params: { "text" => "Ship the website" }))
show Fola::Web.call(app, Fola::Web.env_for("/notes", method: "POST", params: { "text" => "  " }))
show Fola::Web.call(app, Fola::Web.env_for("/notes"))
show Fola::Web.call(app, Fola::Web.env_for("/notes/2"))
show Fola::Web.call(app, Fola::Web.env_for("/notes/9"))
```

That's also how you test a `Fola::Web` app: call it with `env_for` and
check the triple. No server or HTTP client is needed. Combine it with
[FolaSpec](/guides/testing/) for a real test suite.

## Step 3: HTML with templates

`Fola::Web::Template` compiles ERB-style templates:

- `<%= expr %>` inserts a value and **escapes HTML**,
- `<%== expr %>` inserts it raw,
- `<% code %>` runs code, such as a loop.

A layout calls `yield` where the page content goes.

```fola
require "fola/web"

layout = Fola::Web::Template.new(
  "<!doctype html><title><%= title %></title>" +
  "<h1><%= title %></h1><main><%== yield %></main>"
)

list = Fola::Web::Template.new(
  "<ul><% notes.each do |note| %><li><%= note[:text] %></li><% end %></ul>" +
  "<p><%= notes.length %> notes</p>"
)

notes = [{ id: 1, text: "Buy milk" }, { id: 2, text: "<script>alert(1)</script>" }]

app = Fola::Web::Router.new do
  get "/" do
    layout.render({ title: "Notes" }) { list.render({ notes: notes }) }
  end
end

puts Fola::Web.call(app, Fola::Web.env_for("/"))[2].join
```

The second note is escaped (`&lt;script&gt;`), so user input can't inject
markup.

In a real project, keep templates in files instead. Call `views "views"` in
the router and `render "notes/index", notes: notes` in a route. That renders
`views/notes/index.erb` inside `views/layout.erb`. This website is built with
`Template.load` and three `.erb` files.

## Step 4: serve it

To serve over HTTP, accept TCP connections and hand each one to
`Fola::Web.handle`, which parses requests and writes responses. Save this
as `notes.fola`:

```ruby
require "fola/web"
require "socket"

app = Fola::Web::Router.new do
  get "/" do
    "Hello from Fola::Web"
  end
end

server = TCPServer.new("127.0.0.1", 4567)
puts "listening on http://127.0.0.1:4567"
while true
  client = server.accept
  Fola::Web.handle(app, client)
  client.close
end
```

```console
$ fola run notes.fola
listening on http://127.0.0.1:4567

# in another terminal
$ curl -i http://127.0.0.1:4567/
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
content-length: 20

Hello from Fola::Web
```

Now combine steps 2–4 into one app with a JSON API and an HTML page.

> **Note:** this server handles one connection at a time. A thread per
> connection (`Thread.new(client) { ... }`) is the usual pattern, but it
> doesn't work yet because `accept` holds the interpreter lock while it
> waits. That's fine for development; for production, put a reverse proxy
> in front.

## Try next

- Add `delete "/notes/:id"` that removes a note and returns `204`.
- Add a form to the HTML page that `POST`s to `/notes`, then
  `redirect "/"`.
- Serve a stylesheet with
  `use Fola::Web::Static, root: "public", urls: ["/assets"]`.
- Read the full [Fola::Web reference](/stdlib/web/), including middleware,
  cookies and WebSockets.
