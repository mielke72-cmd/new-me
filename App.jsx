import React, { useState, useEffect, useMemo } from "react";

// ----- date helpers -------------------------------------------------
const iso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const START = new Date(2026, 5, 1); // Mon 1 Jun 2026
const END = new Date(2026, 6, 17); // Fri 17 Jul 2026
const COURSE_SATS = new Set(["2026-06-06", "2026-06-20", "2026-07-04"]);

// ----- block definitions --------------------------------------------
const BLOCKS = {
  1: { label: "Block 1 · Groove", note: "Settle into the movements. Leave 2–3 reps in reserve, sit mid rep-range, log your loads." },
  2: { label: "Block 2 · Build reps", note: "Same loads, push to the TOP of each rep range. RIR 2." },
  3: { label: "Block 3 · Add load", note: "Nudge the weight up, reset to the bottom of the range. RIR 1–2." },
  4: { label: "Final week · Consolidate", note: "Back off: lighter loads, 2 sets, RIR 3. Finish fresh, not fried." },
};
const blockOf = (w) => (w <= 2 ? 1 : w <= 4 ? 2 : w <= 6 ? 3 : 4);

// strength sessions
const dayA = {
  type: "STRENGTH", title: "Gym · Day A", subtitle: "Lower + Pull",
  items: [
    "Leg press — 3 × 6–10",
    "Lat pulldown — 3 × 8–10",
    "Seated cable row — 3 × 10–12",
    "Hip thrust — 3 × 8–12",
    "Cable Pallof press — 3 × 10–12 / side",
    "Farmer carry — 3 × 30–40 m",
  ],
};
const dayB = {
  type: "STRENGTH", title: "Home · Day B", subtitle: "Push emphasis",
  items: [
    "DB goblet squat — 3 × 8–12",
    "DB bench press — 3 × 8–12",
    "DB Romanian deadlift — 3 × 10–12",
    "One-arm DB row — 3 × 10–12 / side",
    "Seated DB shoulder press — 3 × 10–12",
    "Side plank — 3 × 20–40 s / side",
    "Dead bug — 3 × 8–10 / side",
  ],
};
const dayC = {
  type: "STRENGTH", title: "Home · Day C", subtitle: "Legs / unilateral",
  items: [
    "Bulgarian split squat — 3 × 8–10 / leg",
    "Single-leg RDL — 3 × 8–10 / leg",
    "Push-ups — 3 × near-max",
    "Band pull-aparts — 3 × 15",
    "Band Pallof press — 3 × 10–12 / side",
    "Suitcase carry — 3 × 30 m / side",
    "Bird dog — 2–3 × 8 / side",
  ],
};
const restDay = {
  type: "REST", title: "Rest + mobility", subtitle: "Active recovery",
  items: ["Hip-flexor / couch stretch — 45 s / side", "Thoracic open books — 8 / side", "Glute bridges + band walks"],
};

const easyRun = (b) => ({
  type: "RUN", title: "Easy run", subtitle: "Zone 2 · conversational",
  items: [`Easy run — ${[null,"30–40","35–45","40–50","25–30"][b]} min`, "Optional: golf range after"],
});
const tempoRun = (b) => ({
  type: "RUN", title: "Tempo run", subtitle: "Comfortably hard",
  items: [
    "Warm-up — 10 min easy",
    `Tempo — ${[null,"2 × 6","2 × 8","3 × 8","2 × 6"][b]} min @ tempo (90s jog between)`,
    "Cool-down — 5 min easy",
  ],
});
const longRun = (b) => ({
  type: "RUN", title: "Long run", subtitle: "Easy pace, build endurance",
  items: [`Long run — ${[null,"45","55","65","—"][b]} min easy`],
});
const courseGolf = {
  type: "GOLF", title: "Full course — 18 holes", subtitle: "Walk if you can",
  items: ["18 holes", "Neutral, stacked finish — no big arched 'reverse-C'", "Putting / short-game focus on tired holes"],
};
const rangeGolf = {
  type: "GOLF", title: "Golf — par 3 / range", subtitle: "Quality over volume",
  items: ["Par-3 round or range", "Short game + putting", "Stop before form gets sloppy"],
};

// ----- build the weeks ----------------------------------------------
function buildWeeks() {
  const weeks = [];
  for (let w = 0; w < 7; w++) {
    const monday = addDays(START, w * 7);
    const b = blockOf(w + 1);
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(monday, d);
      if (date > END) break;
      const di = iso(date);
      let session;
      if (d === 0) session = dayA;
      else if (d === 1) session = easyRun(b);
      else if (d === 2) session = dayB;
      else if (d === 3) session = tempoRun(b);
      else if (d === 4) session = dayC;
      else if (d === 5) session = COURSE_SATS.has(di) ? courseGolf : rangeGolf;
      else session = b === 4 ? restDay : longRun(b);
      days.push({ date, di, dow: DOW[d], session });
    }
    const first = days[0].date;
    const last = days[days.length - 1].date;
    weeks.push({
      num: w + 1,
      block: b,
      range: `${first.getDate()} ${MON[first.getMonth()]} – ${last.getDate()} ${MON[last.getMonth()]}`,
      days,
    });
  }
  return weeks;
}

const TYPE_STYLE = {
  STRENGTH: { c: "var(--lime)", t: "STRENGTH" },
  RUN: { c: "var(--cyan)", t: "RUN" },
  GOLF: { c: "var(--amber)", t: "GOLF" },
  REST: { c: "var(--muted)", t: "RECOVERY" },
};

const STORAGE_KEY = "blockProgress";

export default function App() {
  const weeks = useMemo(buildWeeks, []);
  const todayIso = iso(new Date());

  const startWeek = useMemo(() => {
    const idx = weeks.findIndex((wk) => wk.days.some((d) => d.di === todayIso));
    return idx >= 0 ? idx : 0;
  }, [weeks, todayIso]);

  const [activeWeek, setActiveWeek] = useState(startWeek);
  const [done, setDone] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(new Set([todayIso]));
  const [showNotes, setShowNotes] = useState(false);

  // load persisted progress from the browser
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch (e) { /* fall back to in-memory */ }
    setLoaded(true);
  }, []);

  // save progress to the browser
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(done)); } catch (e) {}
  }, [done, loaded]);

  const toggle = (key) =>
    setDone((p) => { const n = { ...p }; n[key] ? delete n[key] : (n[key] = true); return n; });

  const toggleExpand = (di) =>
    setExpanded((p) => { const n = new Set(p); n.has(di) ? n.delete(di) : n.add(di); return n; });

  const stats = useMemo(() => {
    let total = 0, complete = 0;
    weeks.forEach((wk) => wk.days.forEach((d) => {
      total++;
      const all = d.session.items.every((_, i) => done[`${d.di}-${i}`]);
      if (all) complete++;
    }));
    return { total, complete, pct: Math.round((complete / total) * 100) };
  }, [weeks, done]);

  const wk = weeks[activeWeek];

  return (
    <div className="app">
      <style>{CSS}</style>

      <header className="hd">
        <div className="hd-top">
          <div>
            <div className="kicker">Training plan · 1 Jun – 17 Jul</div>
            <h1>THE BLOCK</h1>
          </div>
          <button className="notes-btn" onClick={() => setShowNotes((s) => !s)}>
            {showNotes ? "✕" : "i"}
          </button>
        </div>

        <div className="prog">
          <div className="prog-bar"><span style={{ width: `${stats.pct}%` }} /></div>
          <div className="prog-meta">
            <span className="prog-num">{stats.complete}<span className="slash">/{stats.total}</span></span>
            <span className="prog-lbl">sessions done · {stats.pct}%</span>
          </div>
        </div>

        {showNotes && (
          <div className="coach">
            <p className="coach-h">Spine rules (grade 2 · L5-S1)</p>
            <ul>
              <li>Neutral spine every rep. No loaded extension or rotation.</li>
              <li>Avoid: heavy back squats, standing OHP, conventional deadlifts, back-extension bench, weighted twists/sit-ups.</li>
              <li>Lift <b>after</b> golf, never before. Pull lower-body volume first if your back talks back.</li>
              <li>Progress reps before load. Stop 1–2 reps shy of failure.</li>
              <li>Tired? Swap the long run for full rest any week — recovery is where it lands.</li>
            </ul>
          </div>
        )}
      </header>

      <nav className="weeks">
        {weeks.map((w, i) => (
          <button
            key={w.num}
            className={`wtab ${i === activeWeek ? "on" : ""}`}
            onClick={() => setActiveWeek(i)}
          >
            <span className="wtab-n">W{w.num}</span>
            <span className="wtab-r">{w.range.split(" – ")[0]}</span>
          </button>
        ))}
      </nav>

      <div className="block-banner">
        <span className="bb-tag">{BLOCKS[wk.block].label}</span>
        <span className="bb-note">{BLOCKS[wk.block].note}</span>
      </div>

      <main>
        {wk.days.map((d) => {
          const ts = TYPE_STYLE[d.session.type];
          const isToday = d.di === todayIso;
          const isOpen = expanded.has(d.di);
          const doneCount = d.session.items.filter((_, i) => done[`${d.di}-${i}`]).length;
          const allDone = doneCount === d.session.items.length;
          return (
            <div key={d.di} className={`card ${isToday ? "today" : ""} ${allDone ? "complete" : ""}`}>
              <button className="card-head" onClick={() => toggleExpand(d.di)}>
                <div className="ch-left">
                  <div className="date">
                    <span className="dow">{d.dow}</span>
                    <span className="dnum">{d.date.getDate()}</span>
                  </div>
                  <div className="ch-titles">
                    <span className="tag" style={{ color: ts.c, borderColor: ts.c }}>{ts.t}</span>
                    <span className="ttl">{d.session.title}</span>
                    <span className="sub">{d.session.subtitle}</span>
                  </div>
                </div>
                <div className="ch-right">
                  {isToday && <span className="today-dot">TODAY</span>}
                  <span className="count">{doneCount}/{d.session.items.length}</span>
                  <span className={`chev ${isOpen ? "open" : ""}`}>›</span>
                </div>
              </button>

              {isOpen && (
                <ul className="items">
                  {d.session.items.map((it, i) => {
                    const key = `${d.di}-${i}`;
                    const checked = !!done[key];
                    return (
                      <li key={key} className={checked ? "checked" : ""} onClick={() => toggle(key)}>
                        <span className="box" style={{ borderColor: ts.c, background: checked ? ts.c : "transparent" }} />
                        <span className="it-txt">{it}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </main>

      <footer className="ft">
        3 runs · 3 lifts · golf weekly · full course every 2nd Saturday
        <br />Progress saves on this device. Built around your spine, not your age.
      </footer>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
:root {
  --bg: #0c0d0a; --surf: #15170f; --surf2: #1b1d14; --line: #2a2d20;
  --ink: #e9eadf; --muted: #8a8e7a;
  --lime: #c8f24e; --cyan: #6ad6e8; --amber: #f2b54e;
}
.app {
  font-family: 'IBM Plex Mono', monospace; background: var(--bg); color: var(--ink);
  min-height: 100vh; max-width: 540px; margin: 0 auto; padding: 0 16px 48px;
  background-image: radial-gradient(circle at 80% -10%, rgba(200,242,78,0.08), transparent 45%);
}
.hd { padding: 26px 0 14px; position: sticky; top: 0; background: linear-gradient(var(--bg) 78%, transparent); z-index: 20; }
.hd-top { display: flex; justify-content: space-between; align-items: flex-start; }
.kicker { font-size: 11px; letter-spacing: 0.18em; color: var(--muted); text-transform: uppercase; }
h1 { font-family: 'Anton', sans-serif; font-size: 46px; line-height: 0.9; letter-spacing: 0.02em; margin-top: 4px;
  background: linear-gradient(100deg, var(--ink), var(--lime)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.notes-btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line); background: var(--surf);
  color: var(--lime); font-family: 'Anton', sans-serif; font-size: 16px; cursor: pointer; flex: none; }
.prog { margin-top: 16px; }
.prog-bar { height: 6px; background: var(--surf2); border-radius: 99px; overflow: hidden; }
.prog-bar span { display: block; height: 100%; background: var(--lime); border-radius: 99px; transition: width .4s ease; }
.prog-meta { display: flex; align-items: baseline; gap: 8px; margin-top: 7px; }
.prog-num { font-family: 'Anton', sans-serif; font-size: 20px; color: var(--lime); }
.slash { color: var(--muted); font-size: 14px; }
.prog-lbl { font-size: 11px; color: var(--muted); letter-spacing: 0.04em; }
.coach { margin-top: 14px; background: var(--surf); border: 1px solid var(--line); border-radius: 12px; padding: 14px; }
.coach-h { font-family: 'Anton', sans-serif; letter-spacing: 0.03em; color: var(--lime); font-size: 14px; margin-bottom: 8px; }
.coach ul { list-style: none; display: flex; flex-direction: column; gap: 7px; }
.coach li { font-size: 12.5px; line-height: 1.45; color: var(--ink); padding-left: 14px; position: relative; }
.coach li::before { content: '—'; position: absolute; left: 0; color: var(--lime); }
.weeks { display: flex; gap: 7px; overflow-x: auto; padding: 4px 0 12px; scrollbar-width: none; }
.weeks::-webkit-scrollbar { display: none; }
.wtab { flex: none; background: var(--surf); border: 1px solid var(--line); border-radius: 10px; padding: 8px 12px;
  display: flex; flex-direction: column; gap: 2px; cursor: pointer; color: var(--muted); min-width: 62px; }
.wtab-n { font-family: 'Anton', sans-serif; font-size: 16px; }
.wtab-r { font-size: 10px; }
.wtab.on { background: var(--lime); border-color: var(--lime); color: #11140a; }
.block-banner { background: var(--surf); border-left: 3px solid var(--lime); border-radius: 0 10px 10px 0; padding: 11px 14px; margin-bottom: 16px; }
.bb-tag { font-family: 'Anton', sans-serif; font-size: 14px; letter-spacing: 0.04em; color: var(--lime); display: block; }
.bb-note { font-size: 11.5px; color: var(--muted); line-height: 1.45; display: block; margin-top: 3px; }
main { display: flex; flex-direction: column; gap: 9px; }
.card { background: var(--surf); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; transition: border-color .2s; }
.card.today { border-color: var(--lime); box-shadow: 0 0 0 1px var(--lime), 0 8px 30px -12px rgba(200,242,78,0.4); }
.card.complete { opacity: 0.62; }
.card-head { width: 100%; background: none; border: none; cursor: pointer; color: inherit; font-family: inherit;
  display: flex; justify-content: space-between; align-items: center; padding: 13px 14px; text-align: left; }
.ch-left { display: flex; gap: 13px; align-items: center; }
.date { display: flex; flex-direction: column; align-items: center; min-width: 30px; }
.dow { font-size: 10px; color: var(--muted); letter-spacing: 0.08em; }
.dnum { font-family: 'Anton', sans-serif; font-size: 24px; line-height: 1; }
.ch-titles { display: flex; flex-direction: column; gap: 3px; }
.tag { font-size: 9.5px; letter-spacing: 0.12em; border: 1px solid; border-radius: 5px; padding: 1px 6px; width: fit-content; }
.ttl { font-size: 14px; font-weight: 600; }
.sub { font-size: 11px; color: var(--muted); }
.ch-right { display: flex; align-items: center; gap: 9px; }
.today-dot { font-size: 9px; letter-spacing: 0.1em; color: #11140a; background: var(--lime); padding: 2px 6px; border-radius: 5px; }
.count { font-size: 11px; color: var(--muted); }
.chev { font-size: 22px; color: var(--muted); transition: transform .2s; line-height: 1; }
.chev.open { transform: rotate(90deg); color: var(--lime); }
.items { list-style: none; padding: 2px 14px 14px; display: flex; flex-direction: column; gap: 2px; }
.items li { display: flex; gap: 11px; align-items: flex-start; padding: 9px 4px; cursor: pointer; border-top: 1px solid var(--line); }
.box { width: 18px; height: 18px; border: 1.5px solid; border-radius: 5px; flex: none; margin-top: 1px; transition: background .15s; }
.it-txt { font-size: 13px; line-height: 1.4; }
.checked .it-txt { color: var(--muted); text-decoration: line-through; }
.ft { text-align: center; font-size: 11px; color: var(--muted); line-height: 1.7; margin-top: 26px; }
`;
