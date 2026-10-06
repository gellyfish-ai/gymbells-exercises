// GymBells exercises: search and filters over exercises.json and text/en.json (built by exercise-art, tools/publish_public.py).
const $ = (id) => document.getElementById(id);
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
let items = [], labels = {};

const label = (group, key) => (labels[group] && labels[group][key]) || key;
const list = (group, keys) => keys.map((k) => label(group, k)).join(", ");

function option(select, group, keys) {
  for (const k of [...keys].sort((a, b) => label(group, a).localeCompare(label(group, b)))) {
    select.add(new Option(label(group, k), k));
  }
}

function card(it) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "card";
  b.innerHTML = `<img class="start" loading="lazy" alt=""><img class="end" loading="lazy" alt=""><span><b></b><small></small></span>`;
  const [start, end] = b.querySelectorAll("img");
  start.src = `images/${it.pose}/start.png`;
  end.src = `images/${it.pose}/end.png`;
  start.alt = `${it.name}, start`;
  end.alt = `${it.name}, end`;
  b.querySelector("b").textContent = it.name;
  b.querySelector("small").textContent = it.equipment.length ? list("equipment", it.equipment) : "Bodyweight";
  b.onclick = () => { location.hash = it.id; };
  return b;
}

function filter() {
  const words = norm($("q").value).split(" ").filter(Boolean);
  const eq = $("equipment").value, mu = $("muscle").value, lv = $("level").value;
  const shown = items.filter((it) =>
    words.every((w) => it.search.includes(w)) &&
    (!eq || (eq === "-" ? !it.equipment.length : it.equipment.includes(eq))) &&
    (!mu || it.primary_muscles.includes(mu) || it.secondary_muscles.includes(mu)) &&
    (!lv || it.level === lv));
  $("grid").replaceChildren(...shown.map((it) => it.el));
  $("count").textContent = `${shown.length} of ${items.length} exercises`;
}

function show() {
  const it = items.find((x) => x.id === decodeURIComponent(location.hash.slice(1)));
  const d = $("detail");
  if (!it) { if (d.open) d.close(); return; }
  $("d-name").textContent = it.name;
  $("d-aka").textContent = it.other_names.length ? `Also called ${it.other_names.join(", ")}` : "";
  $("d-start").src = `images/${it.pose}/start.png`;
  $("d-start").alt = `${it.name}, start`;
  $("d-end").src = `images/${it.pose}/end.png`;
  $("d-end").alt = `${it.name}, end`;
  const facts = [
    ["Equipment", it.equipment.length ? list("equipment", it.equipment) : "Bodyweight"],
    ["Primary muscles", list("muscle", it.primary_muscles)],
    ["Secondary muscles", list("muscle", it.secondary_muscles)],
    ["Level", label("level", it.level)],
    ["Mechanic", it.mechanic ? label("mechanic", it.mechanic) : ""],
    ["Pattern", it.pattern ? label("pattern", it.pattern) : ""],
    ["Category", label("category", it.category)],
    ["Id", it.id],
  ].filter(([, v]) => v);
  $("d-facts").replaceChildren(...facts.flatMap(([k, v]) => {
    const dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = k; dd.textContent = v;
    return [dt, dd];
  }));
  $("d-steps").replaceChildren(...it.steps.map((s) => { const li = document.createElement("li"); li.textContent = s; return li; }));
  if (!d.open) d.showModal();
}

async function main() {
  const [ex, en] = await Promise.all(["exercises.json", "text/en.json"].map((u) => fetch(u).then((r) => r.json())));
  labels = en.labels;
  items = Object.entries(ex.exercises).map(([id, e]) => {
    const t = en.exercises[id];
    const it = { id, ...e, name: t.name, other_names: t.other_names || [], steps: t.steps };
    it.search = " " + norm([it.name, ...it.other_names].join(" ")) + " ";
    it.el = card(it);
    return it;
  }).sort((a, b) => a.name.localeCompare(b.name));
  const used = (f) => new Set(items.flatMap(f));
  option($("equipment"), "equipment", used((it) => it.equipment));
  if (items.some((it) => !it.equipment.length)) $("equipment").add(new Option("Bodyweight only", "-"), 1);
  option($("muscle"), "muscle", used((it) => [...it.primary_muscles, ...it.secondary_muscles]));
  for (const k of ["beginner", "intermediate", "expert"]) if (items.some((it) => it.level === k)) $("level").add(new Option(label("level", k), k));
  for (const id of ["q", "equipment", "muscle", "level"]) $(id).addEventListener("input", filter);
  $("close").onclick = () => $("detail").close();
  $("detail").addEventListener("close", () => { if (location.hash) history.replaceState(null, "", location.pathname + location.search); });
  $("detail").addEventListener("click", (e) => { if (e.target === $("detail")) $("detail").close(); });
  window.addEventListener("hashchange", show);
  filter();
  show();
}

main().catch((e) => { $("count").textContent = `Could not load the catalogue: ${e.message}`; });
