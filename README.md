# cypher-nexus-web-tinker

A standalone web tool for building cypher chains and inspecting how the
[cypher_nexus](https://github.com/NahnullScience/cypher_nexus) invoking pipeline
resolves them - the browser-side half of the mod's devtools split described in that
repo. This project never talks to any game state directly; it only ever talks to a
small local HTTP API (`AstExporter` / `DevToolsServer`) that the mod starts on demand
via `/nexus_server start`.

Ships to GitHub Pages as a plain static site. Nothing here is aware of Minecraft,
Kotlin, or the mod's build - the only contract between the two projects is the JSON
shape documented in `src/types/ast.ts`, which mirrors `AstModel.kt` on the mod side by
hand (no shared schema/codegen yet).

## Status

Basic project setup: three-panel layout (cyphers library / wand editor / call tree),
Preact + signals for shared state, a typed API client, and a working (if bare) round
trip from "click a cypher" to "see the compiled JSON". No drag-and-drop, icons, or
category tabs yet - that's the next pass.

## Developing

```sh
pnpm install
pnpm dev
```

By default the app talks to `http://127.0.0.1:25599` (the mod's `DevToolsServer`).
Override with a query param if you're running the mod on a different port, or the dev
server needs to reach an instance elsewhere: `http://localhost:5173/?api=http://127.0.0.1:25600`.

## Deploying

Pushing to `main` builds and deploys automatically via
`.github/workflows/deploy.yml`. One manual step first: in this repo's
**Settings → Pages**, set **Source** to **GitHub Actions** (can't be done from a
committed file).

`vite.config.ts` sets `base: '/cypher-nexus-web-tinker/'` to match this repo's name as
a GitHub Pages project site. Update that if the repo is ever renamed or moved to a
custom domain.
