# Bloomline — Handoff / Continuity Doc

_Last updated: 2026-07-06. This file exists so the project survives a session freeze — read it first to pick up where the last chat left off._

## What Bloomline is

A mobile-first web app (single file, `bloomline.html`) that shows what plants are **flowering along a driving route** right now and what's **coming up**. You enter a start and destination; it maps the route (Leaflet) and lists plants grouped by growth form, each with a bloom-stage chip and a three-photo strip (flower / leaf / seed).

- **Live at:** bloomline.app (deployed via a connected GitHub repo)
- **Working file:** `bloomline.html` in this Nature folder — started from the **post-EOL build** (`e94a6b2`, 1,348 lines) and now carries the three route/timing fixes below (1,371 lines). Single self-contained HTML/CSS/JS file.
- **Deployed commits:** `b74e512..f0261f5` → `009c197` (organ-category image logic) → `e94a6b2` (Encyclopedia of Life added to the image pool). **The three fixes below live in this local copy only — not yet pushed to bloomline.app.**

## Architecture (current build)

- **Plant dataset:** `DEMO_PLANTS` — hard-coded full-season list for central NJ (skunk cabbage in Feb through fall asters). Each entry: `common`, `sci`, `type` (tree | shrub | ground), `fam`, `status` (native | invasive | naturalized), and `bloom:{s,p,e}` — start/peak/end as `[month,day]` pairs. The 12-point monthly `curve` used by the sparkline is **derived** from that window (`curveFor`/`windowOf`), not stored.
- **Live mode (far routes):** a route update calls `floweringNear(lat,lng,months)` — iNat `species_counts` filtered by phenology annotation `term_id=12&term_value_id=13` (Flowering), research-grade — plus `monthlyCurve(taxonId,bbox)` (iNat histogram) and `classifyType`/`fetchTaxaDetails` for type, native status, and a Wikipedia blurb. Northeast routes use the curated `DEMO_PLANTS` list instead (`inNortheast`).
- **Grouping:** list is grouped by growth form (Trees / Shrubs / Ground & wildflowers). Bloom stage (just opening / at peak / fading) is a chip attribute on each card. Top-level sections are just "In bloom now" and "Coming up."
- **Geocoding:** Open-Meteo (CORS-friendly) resolves the Start/Destination text fields.
- **Map:** Leaflet 1.9.4 (CDN).
- **Photo sources:** iNaturalist (community field photos) + Wikimedia Commons.

## Fixes shipped this session (local `bloomline.html`, not yet pushed)

Three correctness fixes to the live-route path, so the list matches "along **this** route, on **this** date." All in the working copy; re-push to bloomline.app when ready.

1. **Whole-route sampling.** Replaced the fixed 3-point (A / mid / B) sample with `routeSamples(A,B)` — 3–7 evenly spaced points scaled by great-circle distance (`haversine`, ~1 per 60 km, capped at 7) — so the middle of a long drive is actually sampled. `runRoute` now aggregates `floweringNear` across all sample points.
2. **Local bloom timing.** `monthlyCurve(taxonId, bbox)` now constrains the iNat histogram to a padded bounding box around the corridor (`routeBBox`), so a species' peak reflects the route's latitude, not a national average. Falls back to the global histogram when the local box has no data.
3. **Date-synced live query.** `floweringNear` now filters by `month=` derived from the scrubbed date (`monthsAround(selDate)` = month ± 1) instead of a hardcoded last-30-days window. `maybeRefreshLive()` re-runs the live query when the scrubbed month changes (on drag-end / arrow / Today), and `routeCache` is keyed by month. Northeast/`DEMO_PLANTS` routes are date-independent and skip this.

Verified: inline script passes `node --check`; edits are internally consistent (no stale `mid`/`d1`/`d2`). Not yet exercised in a live browser against the iNat API — do a smoke test after pushing.

## The open problem (where the last session got stuck)

**Goal:** each plant's three tiles should reliably read as flower / leaf / seed — the way the PlantNet (Pl@ntNet) Android app never mislabels organs.

**Current pipeline** (`fetchPartPhotos` → `partPhoto` → `wikiCategoryPhoto` → `wikiPhoto` → iNat fallback):
1. Pull iNaturalist photos for the species (always available, fills all three tiles as a baseline).
2. For each organ, try Wikimedia Commons **human-curated organ sub-categories** first — e.g. `Acer rubrum (flowers)`, `(leaves)`, `(fruits)`. This is people filing images by organ, not filename guessing — the best automated signal available.
3. Fall back to Wikimedia **keyword search** with per-organ MUST/AVOID word filters (`FLOWER_MUST`/`FLOWER_AVOID`, `LEAF_*`, `SEED_*`) that reject wrong-part and non-photo files.
4. If no clean part photo exists, use a distinct **iNaturalist + Encyclopedia of Life (EOL)** photo and **honestly relabel the tile "Plant"** (`partOK=false`) rather than masquerade it as the wrong organ.

**Shipped since:** EOL images were added to the pool (commit `e94a6b2`) — order is now Wikimedia organ categories → keyword → iNat + EOL combined. More/better photos, especially where iNat is thin.

**Why it still isn't PlantNet-perfect:** PlantNet is accurate because every image in its private database is **organ-labeled by an ML classifier**. No free API exposes "give me the flower photo of species X." PlantNet's own API only does the reverse (you upload a photo, it identifies the species) and needs a key + is rate-limited. Wikimedia organ categories are the ceiling of free automation: excellent for common species, patchy for obscure ones.

**Dead end already checked:** switching to Encyclopedia of Life (EOL) or GBIF does **not** help the organ problem — they aggregate images from the same pool (iNaturalist, Flickr, Smithsonian), untagged by organ. More of the same photos, not organ-labeled ones.

## The scalable fix (supersedes the curated-table idea)

Curation is a non-answer — there are millions of plants; nobody hand-picks flower/leaf/seed for all of them. The real, scalable, **in-browser** fix is iNaturalist's **Plant Phenology annotations**: observations are human-tagged by organ state, filterable via the API and CORS-friendly (works in the static page, no backend).

- Flower tile → observations of the taxon annotated **Flowering** (`term_id=12&term_value_id=13`).
- Seed/fruit tile → annotated **Fruiting** (`term_value_id=14`). (Flower Budding = 15.)
- These are labeled by people per observation, so they scale to **every species iNat has data for** — not a fixed list.

**Honest gap:** phenology only covers flowering/fruiting/budding — there is **no "leaf/vegetative" annotation**. For the leaf tile, use `without_term_value_id=13,14` (observations with no flowering/fruiting = usually foliage) and keep the Wikimedia `(leaves)` category as backup. Leaves stay the weakest tile; flower and seed become reliably organ-correct at scale.

This replaces the earlier "curated table" plan as the primary approach. A curated table, if ever used, is only a last-resort override for a handful of stubborn species — not the mechanism.

## Where each remaining piece can run

- **Organ annotations (#3 done right):** in-page, now. Add an iNat annotation query as the first choice for the flower and seed tiles.
- **USDA growth-habit + native status (#2):** the USDA PLANTS API sends no CORS headers and needs an internal symbol lookup, so a static browser app can't call it directly. This is an **offline data-prep step** — bake habit + native fields into `DEMO_PLANTS` once (Path-2 backend task).

## Open items / TODO

- [x] **Fix 1** — whole-route sampling (`routeSamples`/`haversine`). _local only._
- [x] **Fix 2** — local bloom timing via bbox histogram (`monthlyCurve(id,bbox)`/`routeBBox`). _local only._
- [x] **Fix 3** — live query synced to scrubbed month (`monthsAround`/`maybeRefreshLive`). _local only._
- [ ] **Push** the three fixes to the GitHub repo behind bloomline.app, then smoke-test a long cross-latitude route (e.g. Richmond VA → Portland ME) and month-scrub.
- [ ] Remaining polish suggestions (not started): #4 credit line now includes EOL; #5 persist route/date in `localStorage`; #6 keyboard access to the enlarge lightbox; #7 drop `no-cache` meta + add a web-app manifest.
- [ ] Wire iNat phenology-annotation query as first source for flower (13) and seed (14) photo tiles in `fetchPartPhotos` (scope below).
- [ ] Leaf photo tile: use `without_term_value_id=13,14` + Wikimedia `(leaves)` fallback.
- [ ] Path-2 offline step: bake USDA PLANTS growth-habit + native status into `DEMO_PLANTS`.
- [ ] Before further edits, confirm this local `bloomline.html` matches the deployed build (source of truth is the GitHub repo; the deployed file has been changing on disk).

## Scope — phenology-annotation organ photos (next code task)

**Goal:** make the flower and seed tiles organ-correct at scale by pulling from iNaturalist observations tagged by Plant Phenology annotation, with no curation and no backend.

**One new function** (place near `inatPhotos`, ~line 869):

```
inatOrganPhoto(taxonId, valueId, used, withoutIds)
```
- GET `${INAT}/observations?taxon_id={id}&photos=true&quality_grade=research&per_page=12&order_by=votes`
  - flowers: `&term_id=12&term_value_id=13`
  - fruit/seed: `&term_id=12&term_value_id=14`
  - leaf (vegetative proxy): `&term_id=12&without_term_value_id=13,14`
- Parse `results[].photos[]` (or `observation_photos[].photo`); build tile URL by swapping the iNat size token `square`→`medium`, and `large`/`original` for the lightbox.
- Return first photo whose URL isn't in the shared `used` Set → `{url, large, credit: login+" · iNaturalist", partOK:true}`; else `null`.
- Reuse the taxon id already resolved by `inatPhotos` (don't re-lookup); wrap the call in the existing `fetchT` timeout.

**Wire into `fetchPartPhotos`** (post-EOL build, ~L919–937). Today it builds `pool = [...inatPhotos, ...eolPhotos]`, then per tile calls `partPhoto(...)` (Wikimedia category → keyword) and, if that misses, `pick(w)` pulls the next unused `pool` photo via `nextFree()` and labels it "Plant" (`partOK=false`). Insert the annotation lookup as the **first** choice per organ:
- **Flower:** `inatOrganPhoto(id,13)` → `partPhoto([sci+" (flowers)"...])` → `nextFree()` labeled "Plant".
- **Seed:** `inatOrganPhoto(id,14)` → `partPhoto([sci+" (fruits)"...])` → `nextFree()` labeled "Plant".
- **Leaf** (weakest, keep explicit source first): `partPhoto([sci+" (leaves)"...])` → `inatOrganPhoto(id,null,used,[13,14])` → `nextFree()` labeled "Plant".
- Keep the existing `used` Set and `nextFree()`/`pick` so the three tiles never repeat an image; keep the honest `partOK=false` → "Plant" relabel when nothing organ-specific is found.

**Scope of change:** one file (`bloomline.html`), ~30–40 net lines — one new function + edits to the `Promise.all` block. No HTML/CSS changes; lightbox, caching, credits all reuse existing paths.

**Cost/perf:** 3 extra API calls per plant, run in parallel and cached per species in `photoCache`; iNat allows ~60 req/min — fine. Slight added latency covered by the existing shimmer state.

**Honest limits after this:** flower & seed become organ-correct wherever iNat has annotated observations (most common species). Leaf stays a proxy ("no flowering/fruiting" ≈ foliage) — acceptable, and Wikimedia `(leaves)` still takes precedence when it exists. Species with no annotated observations fall back to the current behavior.

**Verify (before re-push):** load app; check Acer rubrum, Cornus florida, common milkweed — flower tile shows flowers, seed tile shows fruit/pods, no repeated images, "Plant" only when annotations are empty; watch console for API errors; test one species iNat is thin on.

**Then:** re-push to the GitHub repo behind bloomline.app. USDA growth-habit/native remains a separate offline Path-2 bake.

## Community layer — added 2026-07-08 (local only, not pushed)

Bloomline is no longer read-only. Added to the working `bloomline.html`, on the Firebase stack (matching Limud Labs / `torah.jsx`):

- **Logins:** Firebase Auth (compat SDK 12.15.0 via gstatic CDN) — Google sign-in with an anonymous fallback; account chip in the header.
- **Location-anchored comments:** a live `notes` collection (Firestore `onSnapshot`). Each plant card has a "Field notes" thread with an optional "pin where I saw it" geolocation toggle (coords rounded to ~3 dp for privacy). Notes with a location also render as flower **pins** on the route-chooser map, corridor-filtered, with popups; a live count sits under the season ribbon.
- **Real "Add a link":** the old fake `submitAdd` (flashed "pending review", discarded input) now writes to a `links` collection.
- **Guarded config:** `firebaseConfig` near the top of the script holds `PASTE_*` placeholders. Until real keys are pasted, `FB_ON=false` and every community feature disables itself — the rest of the app runs exactly as before.

**To go live:** paste the Web-app `firebaseConfig`; enable Google + Anonymous providers; add `bloomline.app` to Authorized domains; create Firestore and paste the security rules — full steps + rules are in **`BLOOMLINE-REVIEW.md`** (this folder). Then smoke-test sign-in, posting a note with/without a pin, and the map pins before re-pushing. Photo uploads on notes (Firebase Storage) are deliberately deferred.

## Notes

- Source-of-truth is the GitHub repo behind bloomline.app; `bloomline.html` here is the working copy to edit, then re-push.
- Honest-labeling principle: never show a wrong-organ photo as if it were the right organ — relabel "Plant" instead.
- `BLOOMLINE-REVIEW.md` (2026-07-08) holds the full review, prioritized recommendations, Firebase setup, and Firestore security rules.
