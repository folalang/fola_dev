// fola.dev client: theme toggle, mobile menu, code highlighting, copy/run
// buttons, on-page TOC tracking and docs search. No dependencies.
(() => {
  const root = document.documentElement;

  // ------------------------------------------------------------- theme
  const storeTheme = (t) => { try { localStorage.setItem("theme", t); } catch (e) {} };
  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    storeTheme(root.dataset.theme);
  });

  // -------------------------------------------------------------- menu
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  menuBtn?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  // -------------------------------------------------------- highlighting
  const KW = new Set(("alias and begin break case class def defined? do else elsif end ensure false for if in " +
    "module next nil not or redo rescue retry return self super then true undef unless until when while yield " +
    "require require_relative attr_reader attr_writer attr_accessor puts p print raise loop lambda proc new").split(" "));
  const RUBY_RE = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(:[A-Za-z_][\w?!]*|[A-Za-z_]\w*:(?!:))|(@@?[A-Za-z_]\w*|\$[A-Za-z_]\w*)|(\b\d[\d_]*(?:\.\d+)?\b)|(\b[A-Z]\w*)|(\b[a-z_]\w*[?!]?)/g;
  const SH_RE = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'[^'\n]*')|(--?[\w-]+)|(\$\w+)/g;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const span = (cls, s) => '<span class="tok-' + cls + '">' + esc(s) + "</span>";

  function highlightRuby(src) {
    let out = "", last = 0;
    src.replace(RUBY_RE, (m, com, str, sym, ivar, num, konst, word, at) => {
      out += esc(src.slice(last, at));
      last = at + m.length;
      if (com) out += span("com", m);
      else if (str) out += span("str", m);
      else if (sym) out += span("sym", m);
      else if (ivar) out += span("ivar", m);
      else if (num) out += span("num", m);
      else if (konst) out += span("const", m);
      else if (word && KW.has(word)) out += span("kw", m);
      else out += esc(m);
      return m;
    });
    return out + esc(src.slice(last));
  }

  function highlightShell(src) {
    let out = "", last = 0;
    src.replace(SH_RE, (m, com, str, flag, v, at) => {
      out += esc(src.slice(last, at));
      last = at + m.length;
      out += span(com ? "com" : str ? "str" : flag ? "sym" : "ivar", m);
      return m;
    });
    return out + esc(src.slice(last));
  }

  // Base64url, the format the playground's #code= share links use.
  const toBase64Url = (text) => {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  document.querySelectorAll("pre > code").forEach((code) => {
    const pre = code.parentElement;
    const lang = (code.className.match(/language-(\w+)/) || [])[1] || "";
    const text = code.textContent;
    if (/^(ruby|fola|rb)$/.test(lang)) code.innerHTML = highlightRuby(text);
    else if (/^(sh|bash|shell|console)$/.test(lang)) code.innerHTML = highlightShell(text);

    const wrap = document.createElement("div");
    wrap.className = "code-block";
    pre.replaceWith(wrap);
    wrap.appendChild(pre);
    const actions = document.createElement("div");
    actions.className = "code-actions";

    // ```fola blocks are complete programs: offer to run them in the playground.
    if (lang === "fola") {
      wrap.classList.add("runnable");
      const run = document.createElement("a");
      run.className = "run";
      run.href = "/play/#code=" + toBase64Url(text);
      run.target = "_blank";
      run.rel = "noopener";
      run.textContent = "Run ▸";
      run.title = "Open this program in the playground";
      actions.appendChild(run);
    }
    if (navigator.clipboard) {
      const copy = document.createElement("button");
      copy.type = "button";
      copy.textContent = "Copy";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(text);
          copy.textContent = "Copied";
        } catch (e) {
          copy.textContent = "Failed";
        }
        setTimeout(() => { copy.textContent = "Copy"; }, 1400);
      });
      actions.appendChild(copy);
    }
    if (actions.children.length) wrap.appendChild(actions);
  });

  // ------------------------------------------------------ TOC tracking
  const tocLinks = [...document.querySelectorAll(".toc a")];
  if (tocLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(tocLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const heads = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      const first = heads.find((h) => visible.has(h));
      if (first) {
        tocLinks.forEach((a) => a.classList.remove("active"));
        byId.get(first.id)?.classList.add("active");
      }
    }, { rootMargin: "-70px 0px -60% 0px" });
    heads.forEach((h) => io.observe(h));
  }

  // ------------------------------------------------------------ search
  const box = document.querySelector(".search");
  const input = box?.querySelector(".search-input");
  const list = box?.querySelector(".search-results");
  let index = null, results = [], selected = 0, lastFocus = null;

  async function loadIndex() {
    if (index) return index;
    try {
      const res = await fetch("/search.json");
      index = (await res.json()).map((e) => ({ ...e, hay: (e.t + " " + e.h).toLowerCase() }));
    } catch (e) {
      index = [];
    }
    return index;
  }

  function score(entry, terms) {
    let s = 0;
    const title = entry.t.toLowerCase();
    for (const t of terms) {
      if (!entry.hay.includes(t)) return 0;
      if (title === t) s += 100;
      else if (title.startsWith(t)) s += 40;
      else if (title.includes(t)) s += 20;
      else s += 5;
    }
    return s;
  }

  function matchingHeading(entry, terms) {
    return entry.h.split(" · ").find((h) => terms.every((t) => h.toLowerCase().includes(t))) || "";
  }

  function render() {
    list.innerHTML = "";
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    const terms = q.split(/\s+/);
    results = index
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((r) => r.e);
    selected = 0;
    if (!results.length) {
      list.innerHTML = '<li class="search-empty">No results for “' + esc(q) + "”</li>";
      return;
    }
    results.forEach((e, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === 0));
      const head = matchingHeading(e, terms);
      const anchor = head ? "#" + head.toLowerCase().replace(/[^a-z0-9 _-]/g, "").trim().replace(/ /g, "-") : "";
      li.innerHTML = '<a href="' + e.u + anchor + '"><b>' + esc(e.s) + "</b>" + esc(e.t) +
        "<small>" + esc(head || e.h) + "</small></a>";
      list.appendChild(li);
    });
  }

  function move(delta) {
    const items = list.querySelectorAll('[role="option"]');
    if (!items.length) return;
    items[selected].setAttribute("aria-selected", "false");
    selected = (selected + delta + items.length) % items.length;
    items[selected].setAttribute("aria-selected", "true");
    items[selected].scrollIntoView({ block: "nearest" });
  }

  async function openSearch() {
    lastFocus = document.activeElement;
    box.hidden = false;
    input.focus();
    input.select();
    await loadIndex();
    render();
  }
  function closeSearch() {
    box.hidden = true;
    lastFocus?.focus?.();
  }

  document.querySelector(".search-open")?.addEventListener("click", openSearch);
  box?.querySelector("[data-close]")?.addEventListener("click", closeSearch);
  input?.addEventListener("input", () => { if (index) render(); });
  input?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") {
      const a = list.querySelectorAll('[role="option"] a')[selected];
      if (a) location.href = a.href;
    }
  });
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) ||
      document.activeElement?.isContentEditable;
    if (e.key === "Escape" && !box.hidden) closeSearch();
    else if (!typing && (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k"))) {
      e.preventDefault();
      openSearch();
    }
  });
})();
