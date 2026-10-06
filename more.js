// GymBells exercises: the samples page, from samples/samples.json (built by exercise-art, tools/publish_public.py).
const $ = (id) => document.getElementById(id);
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };

function tabs(box, entries, pick) {
  const buttons = entries.map(([text, value], i) => {
    const b = el("button", text);
    b.type = "button";
    b.setAttribute("role", "tab");
    b.onclick = () => { buttons.forEach((o) => o.setAttribute("aria-selected", o === b)); pick(value); };
    b.setAttribute("aria-selected", i === 0);
    return b;
  });
  box.replaceChildren(...buttons);
  pick(entries[0][1]);
}

async function main() {
  const s = await fetch("samples/samples.json").then((r) => r.json());

  tabs($("looks"), s.looks.map((l) => [l.label, l]), (look) => {
    $("look-text").textContent = look.text;
    $("look-grid").replaceChildren(...s.poses.map((p) => {
      const b = el("button", null, "sample");
      b.type = "button";
      const src = (phase) => `samples/looks/${look.id}/${p.pose}-${phase}.png`;
      for (const phase of ["start", "end"]) {
        const img = el("img");
        img.src = src(phase);
        img.alt = `${p.name}, ${phase}, ${look.label}`;
        img.loading = "lazy";
        img.width = img.height = 512;
        b.append(img);
      }
      b.append(el("span", p.name));
      b.onclick = () => {
        $("z-name").textContent = p.name;
        $("d-aka").textContent = `${look.label}. ${look.text}`;
        for (const phase of ["start", "end"]) { $(`z-${phase}`).src = src(phase); $(`z-${phase}`).alt = `${p.name}, ${phase}`; }
        $("zoom").showModal();
      };
      return b;
    }));
  });
  $("close").onclick = () => $("zoom").close();
  $("zoom").addEventListener("click", (e) => { if (e.target === $("zoom")) $("zoom").close(); });

  $("full").src = $("full-link").href = `samples/full/${s.full.pose}.png`;
  $("full").alt = `${s.full.name}, end, 1024 px on a transparent background`;

  tabs($("languages"), s.languages.map((l) => [l.language, l]), (lang) => {
    $("lang-name").textContent = lang.name;
    $("lang-name").lang = $("lang-steps").lang = lang.code;
    $("lang-steps").replaceChildren(...lang.steps.map((t) => el("li", t)));
  });
}

main().catch((e) => { $("look-text").textContent = `Could not load the samples: ${e.message}`; });
