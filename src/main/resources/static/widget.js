(function () {
  if (window.__uzlaunchLoaded) return;
  window.__uzlaunchLoaded = true;

  var DEFAULT_API = "https://api.uzlaunch.uz";
  var apiUrl = (window.__uzlaunchApi || (function () {
    try {
      var scripts = document.querySelectorAll('script[src*="widget.js"]');
      if (scripts.length) return new URL(scripts[scripts.length - 1].src).origin;
    } catch (e) {}
    return DEFAULT_API;
  })()).replace(/\/$/, "");

  var STYLE = [
    '.uzl-form{font-family:Inter,system-ui,sans-serif;max-width:380px;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:16px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}',
    '.uzl-form *{box-sizing:border-box}',
    '.uzl-title{font-size:16px;font-weight:800;margin:0 0 4px 0;color:#0f172a}',
    '.uzl-sub{font-size:13px;color:#64748b;margin:0 0 14px 0;line-height:1.4}',
    '.uzl-input{width:100%;font-size:14px;padding:11px 14px;border:1px solid #e2e8f0;border-radius:10px;outline:none;margin-bottom:8px;background:#f8fafc;color:#0f172a;transition:border-color .15s}',
    '.uzl-input:focus{border-color:var(--uzl-accent,#6366f1);background:#fff}',
    '.uzl-btn{width:100%;border:none;color:#fff;background:var(--uzl-accent,#6366f1);font-weight:700;font-size:14px;padding:12px;border-radius:10px;cursor:pointer;transition:opacity .15s;font-family:inherit}',
    '.uzl-btn:hover{opacity:0.9}',
    '.uzl-btn:disabled{opacity:0.5;cursor:not-allowed}',
    '.uzl-err{font-size:12px;color:#dc2626;margin-top:8px;text-align:center}',
    '.uzl-info{font-size:12px;color:#0369a1;background:#e0f2fe;padding:10px;border-radius:8px;text-align:center;margin-top:4px}',
    '.uzl-ok{text-align:center;padding:8px 0}',
    '.uzl-ok-emoji{font-size:32px;line-height:1}',
    '.uzl-ok-title{font-weight:800;color:#0f172a;font-size:15px;margin-top:8px}',
    '.uzl-ok-msg{color:#64748b;font-size:13px;margin-top:4px;line-height:1.4}',
    '.uzl-foot{text-align:center;margin-top:12px;font-size:11px;color:#94a3b8}',
    '.uzl-foot a{color:#6366f1;text-decoration:none;font-weight:600}',
    '.uzl-backdrop{position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;animation:uzlFade .15s ease-out}',
    '.uzl-modal{position:relative;z-index:99999;animation:uzlPop .2s ease-out}',
    '.uzl-close{position:absolute;top:10px;right:10px;width:28px;height:28px;border:none;background:rgba(0,0,0,0.06);border-radius:50%;cursor:pointer;font-size:16px;line-height:1;color:#64748b;display:flex;align-items:center;justify-content:center;padding:0}',
    '.uzl-close:hover{background:rgba(0,0,0,0.12)}',
    '@keyframes uzlFade{from{opacity:0}to{opacity:1}}',
    '@keyframes uzlPop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}'
  ].join("");

  function injectStyle() {
    if (document.getElementById("uzl-style")) return;
    var s = document.createElement("style");
    s.id = "uzl-style";
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "style") n.setAttribute("style", attrs[k]);
      else if (k === "html") n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }

  function getRef() {
    try { return new URLSearchParams(window.location.search).get("ref") || ""; }
    catch (e) { return ""; }
  }

  function getHost() {
    try { return window.location.hostname || "embed"; }
    catch (e) { return "embed"; }
  }

  function buildForm(slug, opts) {
    var title = opts.title || "Join the waitlist";
    var subtitle = opts.subtitle || "Be the first to know when we launch.";
    var accent = opts.accent;

    var form = el("form", { class: "uzl-form", style: accent ? "--uzl-accent:" + accent : "" });
    var titleEl = el("h3", { class: "uzl-title" }, [title]);
    var subEl = el("p", { class: "uzl-sub" }, [subtitle]);
    var nameInput = el("input", { class: "uzl-input", type: "text", placeholder: "Your name (optional)", autocomplete: "name" });
    var emailInput = el("input", { class: "uzl-input", type: "email", placeholder: "Your email", required: "required", autocomplete: "email" });
    var btn = el("button", { class: "uzl-btn", type: "submit" }, ["Notify me at launch"]);
    var feedback = el("div");
    var foot = el("div", { class: "uzl-foot", html: 'Powered by <a href="https://uzlaunch.uz" target="_blank" rel="noopener noreferrer">UZLaunch</a>' });

    form.appendChild(titleEl);
    form.appendChild(subEl);
    form.appendChild(nameInput);
    form.appendChild(emailInput);
    form.appendChild(btn);
    form.appendChild(feedback);
    form.appendChild(foot);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      feedback.innerHTML = "";
      btn.disabled = true;
      btn.textContent = "Sending…";

      var body = {
        email: emailInput.value.trim(),
        name: nameInput.value.trim() || undefined,
        ref: getRef() || undefined,
        utmSource: "widget",
        utmMedium: "embed",
        utmCampaign: getHost()
      };

      fetch(apiUrl + "/api/public/projects/" + encodeURIComponent(slug) + "/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok) {
            form.innerHTML = "";
            var wrap = el("div", { class: "uzl-ok" });
            wrap.appendChild(el("div", { class: "uzl-ok-emoji" }, ["📬"]));
            wrap.appendChild(el("div", { class: "uzl-ok-title" }, ["Check your email"]));
            wrap.appendChild(el("div", { class: "uzl-ok-msg" }, [res.body.message || "We sent you a confirmation link."]));
            form.appendChild(wrap);
            form.appendChild(foot);
          } else {
            btn.disabled = false;
            btn.textContent = "Notify me at launch";
            var msg = (res.body && res.body.message) || "Something went wrong";
            var isDup = msg.indexOf("Already subscribed") >= 0 || msg.indexOf("Confirmation email") >= 0;
            feedback.innerHTML = "";
            feedback.appendChild(el("div", { class: isDup ? "uzl-info" : "uzl-err" }, [
              isDup ? "You're already on the list! Check your inbox." : msg
            ]));
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = "Notify me at launch";
          feedback.innerHTML = "";
          feedback.appendChild(el("div", { class: "uzl-err" }, ["Network error. Try again."]));
        });
    });

    return form;
  }

  function mountInline(node) {
    var slug = node.getAttribute("data-uzlaunch");
    if (!slug) return;
    if (node.__uzlMounted) return;
    node.__uzlMounted = true;
    node.innerHTML = "";
    node.appendChild(buildForm(slug, {
      title: node.getAttribute("data-uzlaunch-title") || undefined,
      subtitle: node.getAttribute("data-uzlaunch-subtitle") || undefined,
      accent: node.getAttribute("data-uzlaunch-color") || undefined
    }));
  }

  function openModal(slug, opts) {
    var backdrop = el("div", { class: "uzl-backdrop" });
    var modal = el("div", { class: "uzl-modal" });
    var close = el("button", { class: "uzl-close", "aria-label": "Close" }, ["×"]);
    var form = buildForm(slug, opts);
    modal.appendChild(form);
    modal.appendChild(close);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    function dismiss() {
      backdrop.remove();
      document.body.style.overflow = "";
    }
    close.addEventListener("click", dismiss);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) dismiss(); });
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") { dismiss(); document.removeEventListener("keydown", onKey); }
    });
  }

  function bindButton(btn) {
    var slug = btn.getAttribute("data-uzlaunch-btn");
    if (!slug || btn.__uzlBound) return;
    btn.__uzlBound = true;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openModal(slug, {
        title: btn.getAttribute("data-uzlaunch-title") || undefined,
        subtitle: btn.getAttribute("data-uzlaunch-subtitle") || undefined,
        accent: btn.getAttribute("data-uzlaunch-color") || undefined
      });
    });
  }

  function scan() {
    injectStyle();
    document.querySelectorAll("[data-uzlaunch]").forEach(mountInline);
    document.querySelectorAll("[data-uzlaunch-btn]").forEach(bindButton);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }

  window.UZLaunch = { scan: scan, openModal: openModal };
})();
