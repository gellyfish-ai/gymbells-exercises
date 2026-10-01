# Gym Bells exercises

199 gym exercises with illustrations, a start and an end picture each, plus names, other names,
steps, equipment and muscles. They are made for the [Gym Bells](https://gellyfish.dev/gymbells/) app and
shared here for non-commercial use. Release 0.2.0 (2026-10-01).

Browse them on the site, `index.html`. It loads the JSON files, so open it through a web server
(`python3 -m http.server`, then http://localhost:8000), not as a file.

## Files

```
images/<pose>/start.png, end.png   512 px pictures on white; several exercises can share one pose
exercises.json                     per exercise id: pose, equipment, primary and secondary muscles, level, mechanic, category
text/en.json                       per exercise id: name, other names, steps; labels for muscles, equipment, levels
```

Exercise ids never change. An empty equipment list means bodyweight only.

## Licence

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/), see [LICENSE](LICENSE). Credit Gym Bells
and link to it wherever you use the pictures or the text:

> Exercise illustrations by [Gym Bells](https://gellyfish.dev/gymbells/), CC BY-NC 4.0

## Commercial licence

For commercial use, full-size transparent images, translations or your own colours, contact us via
[gellyfish.dev/gymbells](https://gellyfish.dev/gymbells/).
