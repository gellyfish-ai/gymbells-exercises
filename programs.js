// GymBells exercises: the programs page, from programs/index.json, programs/<id>.json, exercises.json and text/en.json
// (built by exercise-art, tools/publish_public.py).
const $ = (id) => document.getElementById(id);
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const LEVELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" };
const UNITS = { seconds: " s", minutes: " min", metres: " m" };
let index = [], exercises = {}, names = {};

const range = (a, b, unit) => (a === b ? `${a}` : `${a}\u2013${b}`) + (unit || "");
const rest = (s) => (s % 60 ? `${s} s` : `${s / 60} min`);
const meta = (p) => [LEVELS[p.level] || p.level, `${p.days} ${p.days === 1 ? "workout" : "workouts"}`, p.weeks ? `${p.weeks} weeks` : ""].filter(Boolean).join(" \u00b7 ");

function filter() {
  const words = norm($("q").value).split(" ").filter(Boolean), lv = $("level").value, days = $("days").value;
  const shown = index.filter((p) => words.every((w) => p.search.includes(w)) && (!lv || p.level === lv) && (!days || String(p.days) === days));
  $("plist").replaceChildren(...shown.map((p) => p.el));
  $("count").textContent = `${shown.length} of ${index.length} programs`;
}

function row(e) {
  const ex = exercises[e.catalogueId], li = el("li", null, "ex");
  const img = el("img");
  img.src = `images/${ex.pose}/end.png`; img.alt = ""; img.loading = "lazy"; img.width = img.height = 512;
  const body = el("div");
  const a = el("a", names[e.catalogueId] || e.name);
  a.href = `index.html#${encodeURIComponent(e.catalogueId)}`;
  const head = el("p", null, "ex-head");
  head.append(a, el("span", `${e.sets} \u00d7 ${range(e.repRangeMin, e.repRangeMax, UNITS[e.measure])}`, "num"));
  body.append(head);
  const notes = [];
  if (e.setPlan) notes.push("Sets: " + e.setPlan.map((s) => range(s.repRangeMin, s.repRangeMax) + (s.weightFactor !== 1 ? ` at ${Math.round(s.weightFactor * 100)}%` : "")).join(", "));
  if (e.defaultWeight) notes.push(`Start around ${e.defaultWeight} kg`);
  if (e.restSeconds) notes.push(`Rest ${rest(e.restSeconds)}`);
  if (e.supersetWithOrder) notes.push(`Superset with exercise ${e.supersetWithOrder}`);
  if (e.isOptional) notes.push("Optional");
  if (e.notes) notes.push(e.notes);
  if (notes.length) body.append(el("p", notes.join(" \u00b7 "), "ex-notes"));
  if (e.swaps && e.swaps.length) {
    const d = el("details"), p = el("p");
    d.append(el("summary", `${e.swaps.length} ${e.swaps.length === 1 ? "swap" : "swaps"}`));
    e.swaps.forEach((id, i) => {
      const s = el("a", names[id] || id);
      s.href = `index.html#${encodeURIComponent(id)}`;
      p.append(i ? ", " : "", s);
    });
    d.append(p);
    body.append(d);
  }
  li.append(img, body);
  return li;
}

async function show() {
  const id = decodeURIComponent(location.hash.slice(1)), p = index.find((x) => x.id === id);
  $("list-view").hidden = !!p;
  $("program").hidden = !p;
  if (!p) { document.title = "GymBells exercises: training programs"; return; }
  const prog = await fetch(`programs/${p.id}.json`).then((r) => r.json());
  document.title = `${prog.name}: GymBells exercises`;
  $("p-name").textContent = prog.name;
  $("p-text").textContent = prog.description;
  $("p-meta").textContent = meta(p);
  $("p-phases").replaceChildren(...prog.phases.map((ph) => {
    const sec = el("section");
    const weeks = ph.weekEnd ? `weeks ${range(ph.weekStart, ph.weekEnd)}` : `from week ${ph.weekStart}`;
    sec.append(el("h2", prog.phases.length > 1 ? `${ph.name}, ${weeks}` : ph.name));
    const about = [ph.description, ph.restBetweenExercises ? `Rest ${rest(ph.restBetweenExercises)} between exercises.` : ""].filter(Boolean).join(". ").replace("..", ".");
    if (about) sec.append(el("p", about));
    const days = el("div", null, "days");
    days.append(...[...ph.workoutDays].sort((a, b) => a.dayNumber - b.dayNumber).map((d) => {
      const box = el("div", null, "day");
      box.append(el("b", d.name));
      const ol = el("ol");
      ol.append(...[...d.exercises].sort((a, b) => a.order - b.order).map(row));
      box.append(ol);
      return box;
    }));
    sec.append(days);
    return sec;
  }));
  window.scrollTo(0, 0);
}

async function main() {
  const [idx, ex, en] = await Promise.all(["programs/index.json", "exercises.json", "text/en.json"].map((u) => fetch(u).then((r) => r.json())));
  exercises = ex.exercises;
  names = Object.fromEntries(Object.entries(en.exercises).map(([id, t]) => [id, t.name]));
  index = idx.programs.map((p) => {
    const a = el("a", null, "prow");
    a.href = `#${p.id}`;
    a.append(el("b", p.name), el("span", p.description, "ptext"), el("span", meta(p), "num"));
    return { ...p, el: a, search: " " + norm(`${p.name} ${p.description}`) + " " };
  });
  for (const k of Object.keys(LEVELS)) if (index.some((p) => p.level === k)) $("level").add(new Option(LEVELS[k], k));
  for (const n of [...new Set(index.map((p) => p.days))].sort((a, b) => a - b)) $("days").add(new Option(`${n} ${n === 1 ? "workout" : "workouts"}`, n));
  for (const id of ["q", "level", "days"]) $(id).addEventListener("input", filter);
  window.addEventListener("hashchange", show);
  filter();
  show();
}

main().catch((e) => { $("count").textContent = `Could not load the programs: ${e.message}`; });
