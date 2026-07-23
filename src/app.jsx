/* app.jsx — Cymbiotika Quiz
   Data-driven multi-step quiz built from Figma "Quiz" (node 2614:53897).
   Flow: 10 Basics → 1 conditional deep-dive (branched off the primary
   focus in Q1) → summary → feedback → thanks. Completed quizzes are POSTed to
   the server and appended to responses.csv; feedback goes to feedback.csv. */

const { useState, useMemo, useRef } = React;

/* Standalone/Artifact build sets window.__ARTIFACT__ = true — there is no
   server, so quiz/feedback submissions are skipped (kept fully in-browser). */
const ARTIFACT = typeof window !== "undefined" && !!window.__ARTIFACT__;

/* When hosted statically (e.g. GitHub Pages), submissions are POSTed to a
   Google Apps Script Web App that appends them to the Google Sheet. Set via
   window.__SHEET_ENDPOINT__ in the page. Empty = no sheet (local/artifact). */
const SHEET_ENDPOINT = (typeof window !== "undefined" && window.__SHEET_ENDPOINT__) || "";

/* Fire-and-forget POST to the Apps Script endpoint. Uses no-cors + text/plain
   so the browser sends a "simple" request (no CORS preflight, which Apps Script
   doesn't answer). The response is opaque, so success = the request resolved. */
function sendToSheet(payload) {
  return fetch(SHEET_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

/* ------------------------------- icons ------------------------------- */
const I = {
  chevronLeft: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  chevronDown: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  check: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  search: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  user: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  bag: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  apple: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 12.5c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .6.9 1.4 2 2.4 2s1.3-.6 2.5-.6 1.5.6 2.6.6 1.7-.9 2.3-1.8c.7-1 1-2 1-2.1-.1 0-1.9-.8-1.9-2.8zM15.3 6.3c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.7-.4 2.3-1.1z" />
    </svg>
  ),
  play: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l15 9-15 9V3z" /></svg>
  ),
  facebook: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6v1.8H16l-.4 2.9h-2.1v7A10 10 0 0 0 22 12z" /></svg>
  ),
  instagram: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2 1.6 3.6 3.5 3.9v2.5c-1.3 0-2.5-.4-3.5-1v5.8a5.3 5.3 0 1 1-5.3-5.3c.3 0 .5 0 .8.1v2.6a2.7 2.7 0 1 0 1.9 2.6V3H16z" /></svg>
  ),
  youtube: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3-.4-4.4a2.5 2.5 0 0 0-1.8-1.8C19.3 5.4 12 5.4 12 5.4s-7.3 0-8.8.4A2.5 2.5 0 0 0 1.4 7.6C1 9 1 12 1 12s0 3 .4 4.4a2.5 2.5 0 0 0 1.8 1.8c1.5.4 8.8.4 8.8.4s7.3 0 8.8-.4a2.5 2.5 0 0 0 1.8-1.8C23 15 23 12 23 12zm-13 3.5v-7l6 3.5-6 3.5z" /></svg>
  ),
  star: (s = 32, filled) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 21l1.2-6.5L2.5 9.9l6.6-.9L12 2.5z" />
    </svg>
  ),
  uturn: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-4" />
    </svg>
  ),
  minus: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M5 12h14" /></svg>
  ),
  plus: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
  ),
  hamburger: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
  ),
  close: (s = 24) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
};

/* Money helper */
function money(n) { return "$" + Number(n).toFixed(2); }

/* --------------------------- CSV submission -------------------------- */
function postJSON(url, payload) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());
}
function makeId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/* ------------------------------- Header ------------------------------ */
function Header() {
  const links = ["Shop Best Sellers", "Shop by Benefit", "Learn", "Subscribe and Save"];
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header>
      <div className="promo-banner">20% off + Free Shipping with code GIFT</div>
      <div className="hdr">
        <div className="hdr-left">
          <img className="hdr-wordmark" src="assets/wordmark-dark.svg" alt="Cymbiotika" />
          <nav className="hdr-nav">
            {links.map((l) => <button key={l} className="hdr-link">{l}</button>)}
          </nav>
        </div>
        <div className="hdr-actions">
          <div className="hdr-cta">
            <button className="btn btn-primary">Shop All</button>
            <button className="btn btn-outline hdr-cta-quiz">Take the Quiz</button>
          </div>
          <div className="hdr-icons">
            <span className="hdr-icon hdr-flag" title="United States">
              <svg width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="#b22234" /><rect width="24" height="1.85" y="1.85" fill="#fff" /><rect width="24" height="1.85" y="5.5" fill="#fff" /><rect width="24" height="1.85" y="9.2" fill="#fff" /><rect width="10" height="9.2" fill="#3c3b6e" /></svg>
            </span>
            <span className="hdr-icon">{I.search()}</span>
            <span className="hdr-icon hdr-user">{I.user()}</span>
            <span className="hdr-icon">{I.bag()}<span className="hdr-bag-count">1</span></span>
          </div>
          <button
            className={"hdr-burger" + (menuOpen ? " is-open" : "")}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? I.close() : I.hamburger()}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="hdr-menu" onClick={() => setMenuOpen(false)}>
          {links.map((l) => <button key={l} className="hdr-menu-link">{l}</button>)}
          <div className="hdr-menu-cta">
            <button className="btn btn-primary" style={{ width: "100%" }}>Shop All</button>
            <button className="btn btn-outline" style={{ width: "100%" }}>Take the Quiz</button>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ------------------------------- Footer ------------------------------ */
function Footer() {
  const cols = [
    { h: "Shop", items: ["Best Sellers", "Sets", "Merch", "Shop All", "Supplements", "Home Care", "Pets"] },
    { h: "Learn", items: ["Our Story", "Press", "Recipes", "Blog", "Careers", "Knowledge Center", "Supplement Guide"] },
    { h: "Support", items: ["FAQs", "Shipping FAQs", "Arise FAQs", "Returns", "Contact Us", "Gift Card Balance", "Account"] },
    { h: "More", items: ["Store Locator", "Affiliates", "Wholesale"] },
  ];
  // Mobile only: nav sections collapse into accordions (open state ignored on desktop).
  const [open, setOpen] = useState({});
  const toggle = (h) => setOpen((o) => Object.assign({}, o, { [h]: !o[h] }));

  return (
    <footer className="ftr">
      <div className="ftr-col-left">
        <img className="ftr-logo" src="assets/logo-white.svg" alt="Cymbiotika" />
        <div className="ftr-socials">
          <a href="#" aria-label="Facebook">{I.facebook()}</a>
          <a href="#" aria-label="Instagram">{I.instagram()}</a>
          <a href="#" aria-label="TikTok">{I.tiktok()}</a>
          <a href="#" aria-label="YouTube">{I.youtube()}</a>
        </div>
      </div>

      <nav className="ftr-nav">
        {cols.map((c) => (
          <div className={"ftr-nav-col" + (open[c.h] ? " is-open" : "")} key={c.h}>
            <button className="ftr-nav-head" onClick={() => toggle(c.h)} aria-expanded={!!open[c.h]}>
              <h4>{c.h}</h4>
              <span className="ftr-nav-chevron">{I.chevronDown()}</span>
            </button>
            <ul>{c.items.map((it) => <li key={it}><a href="#">{it}</a></li>)}</ul>
          </div>
        ))}
      </nav>

      <div className="ftr-right">
        <div className="ftr-app">
          <span style={{ fontSize: "var(--q-body-1)" }}>Download our app</span>
          <button className="btn btn-outline btn-sm">{I.apple()}&nbsp;On the App Store</button>
          <button className="btn btn-outline btn-sm">{I.play()}&nbsp;On Google Play</button>
        </div>
        <div className="ftr-form">
          <div>
            <h4>Get in early</h4>
            <p className="sub">Get access to sales and exclusive promos by submitting your email!</p>
          </div>
          <input className="ftr-input" placeholder="Email Address" />
          <input className="ftr-input" placeholder="Phone Number" />
          <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>Submit</button>
          <p className="ftr-fineprint">By submitting this form, you consent to receive information and/or marketing texts from Cymbiotika including texts sent by autodialer. Consent is not a condition of purchase. Msg &amp; data rates apply. Msg frequency varies. Unsubscribe at any time by replying STOP. Privacy Policy &amp; Terms</p>
        </div>
        <div className="ftr-disclaimer">*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</div>
        <button className="btn btn-outline btn-sm ftr-accessibility">Accessibility Tool</button>
        <div className="ftr-links">
          <a href="#">Terms of Service</a><a href="#">Privacy Policy</a><a href="#">Disclaimer</a><a href="#">Arise Terms &amp; Conditions</a>
        </div>
        <div className="ftr-copyright">© 2025 Cymbiotika LLC</div>
      </div>
    </footer>
  );
}

/* ------------------------------ Stage shell -------------------------- */
function Stage({ progress, canBack, onBack, children }) {
  return (
    <React.Fragment>
      <div className="q-progress"><div className="q-progress-fill" style={{ width: progress + "%" }} /></div>
      <div className="q-stage">
        {onBack && canBack && (
          <div className="q-back">
            <button onClick={onBack} aria-label="Back">{I.chevronLeft()}</button>
          </div>
        )}
        {children}
      </div>
    </React.Fragment>
  );
}

/* ------------------------------ Email step --------------------------- */
/* Final step — collects the email, then submits the quiz and shows results. */
function EmailCard({ value, onChange, onSubmit, onBack, canBack, progress, submitting }) {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  // Pass the trimmed value up so submission never depends on onChange timing.
  function submit(e) { e.preventDefault(); if (valid && !submitting) onSubmit(value.trim()); }
  return (
    <Stage progress={progress} canBack={canBack} onBack={onBack}>
      <form className="q-card" onSubmit={submit}>
        <div className="q-head">
          <h2 className="q-title">Where should we send your results?</h2>
        </div>
        <div className="q-options">
          <input
            className="q-input"
            type="email"
            placeholder="you@email.com"
            value={value}
            autoFocus
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary q-next" disabled={!valid || submitting}>
          {submitting ? "Building your plan…" : "See my plan"}
        </button>
      </form>
    </Stage>
  );
}

/* --------------------------- Question card --------------------------- */
function QuestionCard({ q, value, onToggle, onNext, onBack, canBack, stepLabel, progress }) {
  const selected = value || [];
  const canNext = selected.length > 0;

  // Single-select: choosing an option auto-advances (brief highlight, then next).
  // Multi-select: toggle freely and confirm with the Next button.
  function pick(opt) {
    onToggle(opt);
    if (!q.multi) setTimeout(onNext, 240);
  }

  return (
    <Stage progress={progress} canBack={canBack} onBack={onBack}>
      <div className="q-card">
        <div className="q-head">
          <h2 className="q-title">{q.title}</h2>
          {q.multi && (
            <p className="q-overline">{q.max ? "Select up to " + q.max : "Select all that apply"}</p>
          )}
        </div>

        <div className="q-options" role={q.multi ? "group" : "radiogroup"}>
          {q.options.map((opt) => {
            const isSel = selected.indexOf(opt) !== -1;
            return (
              <button
                key={opt}
                className={"q-option" + (isSel ? " is-selected" : "")}
                role={q.multi ? "checkbox" : "radio"}
                aria-checked={isSel}
                onClick={() => pick(opt)}
              >
                {opt}              </button>
            );
          })}
        </div>

        {q.multi && (
          <button className="btn btn-primary q-next" disabled={!canNext} onClick={onNext}>Next</button>
        )}
      </div>
    </Stage>
  );
}

/* ----------------------------- Results ------------------------------- */
/* Small circular Cymbiotika avatar used beside product blurbs. */
function BrandAvatar() {
  return (
    <span className="rp-avatar"><img src="assets/brandmark-green.svg" alt="" /></span>
  );
}

function QtyControl({ value, onChange }) {
  return (
    <div className="rp-qty">
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(1, value - 1))}>{I.minus()}</button>
      <span>{value}</span>
      <button type="button" aria-label="Increase" onClick={() => onChange(value + 1)}>{I.plus()}</button>
    </div>
  );
}

function PlanRadios({ product, plan, onPlan }) {
  return (
    <div className="rp-plans">
      <button type="button" className="rp-plan" onClick={() => onPlan("subscribe")}>
        <span className={"rp-radio" + (plan === "subscribe" ? " on" : "")} />
        <span className="rp-plan-label">Subscribe &amp; Save</span>
        <span className="rp-plan-price">
          {money(product.subscribe)} <s>{money(product.oneTime)}</s>
        </span>
      </button>
      <button type="button" className="rp-plan" onClick={() => onPlan("onetime")}>
        <span className={"rp-radio" + (plan === "onetime" ? " on" : "")} />
        <span className="rp-plan-label">One-Time</span>
        <span className="rp-plan-price">{money(product.oneTime)}</span>
      </button>
    </div>
  );
}

function ProductCard({ product, badge, badgeKind, variant, plan, qty, onPlan, onQty, inRoutine, onAction }) {
  return (
    <div className={"rp-card rp-card--" + variant}>
      <div className="rp-card-media">
        <img src={product.img} alt={product.name} />
      </div>
      <div className="rp-card-body">
        <div className="rp-card-head">
          <span className={"rp-badge rp-badge--" + badgeKind}>{badge}</span>
          <h3 className="rp-name">{product.name}</h3>
          <div className="rp-price">
            <span className="rp-price-now">{money(product.subscribe)}</span>
            <s className="rp-price-was">{money(product.oneTime)}</s>
          </div>
        </div>
        <div className="rp-blurb"><BrandAvatar /><p>{product.blurb}</p></div>
        <PlanRadios product={product} plan={plan} onPlan={onPlan} />
        <div className="rp-card-actions">
          <QtyControl value={qty} onChange={onQty} />
          <button
            className={"btn " + (inRoutine ? "btn-outline" : "btn-primary")}
            style={{ flex: 1 }}
            onClick={onAction}
          >
            {variant === "hero" ? (inRoutine ? "Remove" : "Add to routine") : (inRoutine ? "Added ✓" : "Select")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsPage({ answers, onStartOver, onFeedback, saveState }) {
  // Derive goals + recommendations from the user's real answers.
  const picks = [];
  (answers.focus || []).concat(answers.wishlist || []).forEach((a) => {
    if (picks.indexOf(a) === -1) picks.push(a);
  });
  const focus = (answers.focus && answers.focus[0]) || "Overall wellness + immunity";
  const chips = picks.map((a) => GOAL_CHIP[a] || a);

  // Top Match is chosen by the primary focus; the other two products enhance.
  const topId = FOCUS_TO_PRODUCT[focus] || "glutathione";
  const topMatch = PRODUCTS[topId];
  const enhance = Object.keys(PRODUCTS).filter((k) => k !== topId).map((k) => PRODUCTS[k]);

  // All products shown (unique ids) → routine lookup.
  const shown = [topMatch].concat(enhance);
  const byId = {};
  shown.forEach((p) => { byId[p.id] = p; });

  const [routine, setRoutine] = useState([topMatch.id]);
  const [plans, setPlans] = useState(() => {
    const m = {}; shown.forEach((p) => { m[p.id] = "subscribe"; }); return m;
  });
  const [qtys, setQtys] = useState(() => {
    const m = {}; shown.forEach((p) => { m[p.id] = 1; }); return m;
  });
  const [added, setAdded] = useState(false);

  const setPlan = (id, v) => setPlans((m) => Object.assign({}, m, { [id]: v }));
  const setQty = (id, v) => setQtys((m) => Object.assign({}, m, { [id]: v }));
  const toggle = (id) => setRoutine((r) => r.indexOf(id) === -1 ? r.concat(id) : r.filter((x) => x !== id));

  const priceOf = (id) => (plans[id] === "onetime" ? byId[id].oneTime : byId[id].subscribe) * qtys[id];
  const compareOf = (id) => byId[id].oneTime * qtys[id];
  const total = routine.reduce((s, id) => s + priceOf(id), 0);
  const compareTotal = routine.reduce((s, id) => s + compareOf(id), 0);
  const savingPct = compareTotal > 0 ? Math.round((1 - total / compareTotal) * 100) : 0;

  const bundle = shown; // the 3 renders on the right

  return (
    <div className="rp">
      <button className="rp-startover" onClick={onStartOver}>{I.uturn()} Start Over</button>

      <div className="rp-hero">
        <h1 className="rp-title">Here’s your personalized supplement plan</h1>
        <p className="rp-sub">We’ve created this custom bundle based on your goals, lifestyle, and dietary habits.
          We’re here to support you on your journey to reach optimal health.</p>
      </div>
      <div className="rp-divider" />

      <div className="rp-goals">
        <span className="rp-goals-label">Your goals:</span>
        <div className="rp-chips">
          {chips.map((c) => <span className="rp-chip" key={c}>{c}</span>)}
        </div>
      </div>

      <div className="rp-cols">
        {/* LEFT */}
        <div className="rp-left">
          <ProductCard
            product={topMatch} badge="Top Match" badgeKind="primary" variant="hero"
            plan={plans[topMatch.id]} qty={qtys[topMatch.id]}
            onPlan={(v) => setPlan(topMatch.id, v)} onQty={(v) => setQty(topMatch.id, v)}
            inRoutine={routine.indexOf(topMatch.id) !== -1} onAction={() => toggle(topMatch.id)}
          />

          <h2 className="rp-section-title">Enhance your routine</h2>
          <div className="rp-enhance">
            {enhance.map((p) => (
              <ProductCard
                key={p.id} product={p} badge="Support" badgeKind="accent" variant="grid"
                plan={plans[p.id]} qty={qtys[p.id]}
                onPlan={(v) => setPlan(p.id, v)} onQty={(v) => setQty(p.id, v)}
                inRoutine={routine.indexOf(p.id) !== -1} onAction={() => toggle(p.id)}
              />
            ))}
          </div>

          <p className="rp-disclaimer">Disclaimer: These recommendations are for general wellness support and are
            not medical advice. If you have a medical condition or health concerns, consult your healthcare
            provider before starting new supplements.</p>
        </div>

        {/* RIGHT */}
        <div className="rp-right">
          <div className="rp-routine">
            <div className="rp-routine-head">
              <h3>Build Your Routine</h3>
              <p>{savingPct > 0 ? "You’re saving " + savingPct + "% on your routine" : "Your selected routine"}</p>
            </div>
            {routine.length === 0 && <p className="rp-empty">Your routine is empty — add a product to get started.</p>}
            {routine.map((id) => (
              <div className="rp-line" key={id}>
                <div className="rp-line-left">
                  <span className="rp-line-name">{byId[id].name}</span>
                  <button className="rp-remove" onClick={() => toggle(id)}>Remove</button>
                </div>
                <div className="rp-line-price">
                  <s>{money(compareOf(id))}</s><span>{money(priceOf(id))}</span>
                </div>
              </div>
            ))}
            <div className="rp-total">
              <span>Total:</span>
              <div className="rp-line-price">
                <s>{money(compareTotal)}</s><span>{money(total)}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }}
              disabled={routine.length === 0} onClick={() => setAdded(true)}>
              {added ? "✓ Added to cart" : "Add to Cart"}
            </button>
          </div>

          <div className="rp-bundle">
            <div className="rp-bundle-items">
              {bundle.map((p, i) => (
                <React.Fragment key={p.id}>
                  {i > 0 && <span className="rp-bundle-plus">{I.plus(16)}</span>}
                  <div className="rp-bundle-item">
                    <span className={"rp-badge rp-badge--" + (i === 0 ? "primary" : "accent")}>{i === 0 ? "Primary" : "Support"}</span>
                    <div className="rp-bundle-media"><img src={p.img} alt={p.name} /></div>
                    <span className="rp-bundle-name">{p.name}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <button className="btn btn-outline" style={{ width: "100%" }}
              onClick={() => setRoutine(shown.map((p) => p.id))}>
              Add All {bundle.length} to Cart · {money(bundle.reduce((s, p) => s + p.subscribe, 0))}
            </button>
          </div>

          <div className="rp-feedback-cta">
            <span className={"q-save q-save--" + saveState}>
              {saveState === "saving" && "Saving your responses…"}
              {saveState === "saved" && "✓ Your answers were saved"}
              {saveState === "error" && "Couldn’t save your answers (is the server running?)"}
            </span>
            <button className="rp-feedback-link" onClick={onFeedback}>Share quiz feedback</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Feedback ------------------------------ */
function FeedbackCard({ onSubmit, submitting }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [ease, setEase] = useState("");
  const [comment, setComment] = useState("");
  const easeOpts = ["Very easy", "Somewhat easy", "Neutral", "A bit confusing", "Difficult"];
  const canSubmit = rating > 0 && !submitting;

  return (
    <Stage progress={100}>
      <div className="q-card">
        <div className="q-head">
          <h2 className="q-title">How was your quiz experience?</h2>
          <p className="q-step">Your feedback helps us improve.</p>
        </div>

        <div className="q-fb-block">
          <span className="q-fb-label">Rate your experience</span>
          <div className="q-stars" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={"q-star" + ((hover || rating) >= n ? " is-on" : "")}
                aria-label={n + " star"}
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
              >
                {I.star(34, (hover || rating) >= n)}
              </button>
            ))}
          </div>
        </div>

        <div className="q-fb-block">
          <span className="q-fb-label">How easy was it to complete?</span>
          <div className="q-options">
            {easeOpts.map((opt) => (
              <button
                key={opt}
                type="button"
                className={"q-option" + (ease === opt ? " is-selected" : "")}
                onClick={() => setEase(opt)}
              >
                {opt}              </button>
            ))}
          </div>
        </div>

        <div className="q-fb-block">
          <span className="q-fb-label">Anything else you’d like to share?</span>
          <textarea
            className="q-textarea"
            rows="4"
            placeholder="Tell us what worked or what we could do better…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary q-next"
          disabled={!canSubmit}
          onClick={() => onSubmit({ rating, ease, comment })}
        >
          {submitting ? "Submitting…" : "Submit feedback"}
        </button>
      </div>
    </Stage>
  );
}

/* ------------------------------ Thanks ------------------------------- */
function Thanks({ saveState, onRestart }) {
  return (
    <Stage progress={100}>
      <div className="q-done">
        <img className="q-brandmark" src="assets/brandmark-green.svg" alt="" style={{ width: 40, height: 40 }} />
        <h2 className="q-title">Thank you!</h2>
        <p className="q-step">
          {saveState === "saved" ? "Your feedback was saved to feedback.csv." : "We appreciate you taking the time."}
        </p>
        <button className="btn btn-outline q-next" onClick={onRestart}>Start over</button>
      </div>
    </Stage>
  );
}

/* ------------------------------- App --------------------------------- */
function App() {
  const [stage, setStage] = useState("quiz"); // quiz | email | complete | feedback | thanks
  const [email, setEmail] = useState("");
  const emailRef = useRef("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [id]: [labels] }
  const [respSave, setRespSave] = useState("idle");
  const [fbSave, setFbSave] = useState("idle");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const idRef = useRef(makeId());
  // Mirror of `answers` that is always current — auto-advance submits from a
  // setTimeout whose closure would otherwise miss the just-clicked final answer.
  const answersRef = useRef({});

  // Active question list. The two "support" questions branch inline: right
  // after Q1 (focus) and Q2 (wishlist) we insert the matching deep-dive
  // question(s), then the flow returns to the next basics question.
  // Deep-dives are de-duplicated so a topic picked in both Q1 and Q2 only
  // appears once.
  const questions = useMemo(() => {
    const seq = [];
    const used = {};
    const addCond = (label) => {
      const cid = FOCUS_TO_CONDITIONAL[label];
      if (cid && CONDITIONALS[cid] && !used[cid]) {
        seq.push(CONDITIONALS[cid]);
        used[cid] = true;
      }
    };
    BASICS.forEach((qq) => {
      seq.push(qq);
      if (qq.id === "focus" && answers.focus && answers.focus[0]) {
        addCond(answers.focus[0]);
      }
      if (qq.id === "wishlist") {
        (answers.wishlist || []).forEach(addCond);
      }
    });
    return seq;
  }, [answers]);

  const q = questions[idx];
  const total = questions.length;
  // Progress across: questions (total) + email (1). Complete/feedback/thanks = 100.
  const steps = total + 1;
  let progress = 100;
  if (stage === "quiz") progress = Math.round(((idx + 1) / steps) * 100);
  else if (stage === "email") progress = Math.round((total / steps) * 100);

  function toggle(opt) {
    setAnswers((prev) => {
      const cur = prev[q.id] ? prev[q.id].slice() : [];
      let next;
      if (q.multi) {
        const i = cur.indexOf(opt);
        if (i === -1) {
          if (q.max && cur.length >= q.max) return prev; // cap reached — ignore
          cur.push(opt);
        } else {
          cur.splice(i, 1);
        }
        next = cur;
      } else {
        next = [opt];
      }
      const updated = Object.assign({}, prev, { [q.id]: next });
      answersRef.current = updated; // keep the ref in lockstep with state
      return updated;
    });
  }

  function buildResponseRow() {
    const a = answersRef.current; // latest answers (incl. the final auto-advance)
    return {
      submission_id: idRef.current,
      timestamp: new Date().toISOString(),
      email: emailRef.current,
      focus: a.focus || [],
      wishlist: a.wishlist || [],
      feeling: a.feeling || [],
      barriers: a.barriers || [],
      experience: a.experience || [],
      routine_now: a["routine-now"] || [],
      flags: a.flags || [],
      commitment: a.commitment || [],
      begin: a.begin || [],
      mindset: a.mindset || [],
      // One column per deep-dive topic; filled only if that branch was shown.
      dd_energy: a["cond-energy"] || [],
      dd_gut: a["cond-gut"] || [],
      dd_stress: a["cond-stress"] || [],
      dd_beauty: a["cond-beauty"] || [],
      dd_other: a["cond-other"] || [],
    };
  }

  function finishQuiz() {
    setStage("complete");
    const row = buildResponseRow();
    if (SHEET_ENDPOINT) { // hosted: append to the Google Sheet
      setRespSave("saving");
      sendToSheet(Object.assign({ type: "response" }, row))
        .then(() => setRespSave("saved"))
        .catch(() => setRespSave("error"));
      return;
    }
    if (ARTIFACT) return; // no server and no sheet — skip
    setRespSave("saving");
    postJSON("/api/submit", row)
      .then((r) => setRespSave(r && r.ok ? "saved" : "error"))
      .catch(() => setRespSave("error"));
  }

  function goNext() {
    if (idx + 1 >= questions.length) setStage("email"); // email is the final step
    else setIdx(idx + 1);
  }
  function goBack() { if (idx > 0) setIdx(idx - 1); }

  function submitFeedback(fb) {
    const payload = {
      submission_id: idRef.current,
      timestamp: new Date().toISOString(),
      email: emailRef.current,
      rating: fb.rating,
      ease: fb.ease,
      comment: fb.comment,
    };
    if (SHEET_ENDPOINT) { // hosted: append feedback to the Google Sheet
      setFbSubmitting(true); setFbSave("saving");
      sendToSheet(Object.assign({ type: "feedback" }, payload))
        .then(() => setFbSave("saved"))
        .catch(() => setFbSave("error"))
        .then(() => { setFbSubmitting(false); setStage("thanks"); });
      return;
    }
    if (ARTIFACT) { setFbSave("saved"); setStage("thanks"); return; }
    setFbSubmitting(true);
    setFbSave("saving");
    postJSON("/api/feedback", payload)
      .then((r) => setFbSave(r && r.ok ? "saved" : "error"))
      .catch(() => setFbSave("error"))
      .then(() => { setFbSubmitting(false); setStage("thanks"); });
  }

  function restart() {
    setStage("quiz"); setEmail(""); emailRef.current = ""; setIdx(0); setAnswers({}); answersRef.current = {};
    setRespSave("idle"); setFbSave("idle"); setFbSubmitting(false);
    idRef.current = makeId();
  }

  return (
    <div className="quiz-app">
      <Header />

      {stage === "quiz" && (
        <QuestionCard
          q={q}
          value={answers[q.id]}
          onToggle={toggle}
          onNext={goNext}
          onBack={goBack}
          canBack={idx > 0}
          stepLabel={"Question " + (idx + 1) + " of " + total}
          progress={progress}
        />
      )}

      {stage === "email" && (
        <EmailCard
          value={email}
          onChange={(v) => { setEmail(v); emailRef.current = v; }}
          onSubmit={(em) => { setEmail(em); emailRef.current = em; finishQuiz(); }}
          onBack={() => setStage("quiz")}
          canBack={true}
          submitting={respSave === "saving"}
          progress={progress}
        />
      )}

      {stage === "complete" && (
        <ResultsPage
          answers={answers}
          onStartOver={restart}
          onFeedback={() => setStage("feedback")}
          saveState={respSave}
        />
      )}

      {stage === "feedback" && (
        <FeedbackCard onSubmit={submitFeedback} submitting={fbSubmitting} />
      )}

      {stage === "thanks" && (
        <Thanks saveState={fbSave} onRestart={restart} />
      )}

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
