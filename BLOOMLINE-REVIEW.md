# Bloomline — Review & Recommendations

_2026-07-08 · reviewing `bloomline.html` (1,371 lines, the local working copy with the three unpushed route/timing fixes). Companion to `BLOOMLINE-HANDOFF.md`._

## Verdict in one paragraph

Bloomline is a genuinely lovely read-only field guide. The mobile UI is polished, the season scrubber is a great idea executed well, the whole-route sampling and honest photo labeling show real care, and the live iNaturalist path makes it work anywhere. Its single biggest limitation is exactly the thing you flagged: **it only talks, it never listens.** There are no accounts, nothing persists between visits, and every control that looks like it accepts user input is a stub — the "+ Add a link" button (`submitAdd`, line 869) just flashes "✓ Submitted · pending review" and throws the text away. Turning Bloomline from a broadcast into a place people contribute to and come back to is the highest-leverage change available, and logins + location-anchored comments are the right first move.

## What's already strong (don't touch)

The season ribbon with a draggable "now" marker is the standout interaction — keep it central. The growth-form grouping (Trees / Shrubs / Ground & wildflowers) with a bloom-stage chip per card reads cleanly. The photo pipeline's honesty principle — relabel a tile "Plant" rather than show a wrong-organ image — is the right call and rare. The live path (iNat `species_counts` filtered by Flowering phenology, per-corridor histograms, whole-route sampling) is solid engineering. None of the recommendations below disturb any of this; the community layer is additive.

## The core gap: Bloomline is read-only

Three symptoms of one problem:

1. **No identity.** Nobody can be recognized across sessions, so nothing a person does can stick to them.
2. **No persistence.** Route and date reset every visit; `localStorage` is unused (it's TODO #5 in the handoff).
3. **Fake participation.** The "Add a link" affordance is a placeholder. Shipping a control that pretends to accept input and silently discards it is the one thing in the app that violates its own honesty principle.

Fixing this is what "make it more useful" means in practice: give people a reason to sign in, contribute, and return.

## Recommendation 1 — Accounts (Firebase Auth)

Reuse the Limud Labs Firebase project rather than introducing a second vendor: one login system across both apps, config and rules you already understand. Offer **Google sign-in** (one tap, no password) plus **anonymous auth** so a first-time visitor can read and even jot a note before committing to an account, then upgrade later. Because Bloomline is a single static file, use the **compat** build of the Firebase JS SDK (v12.15.0) loaded from the gstatic CDN — it exposes a global `firebase` object and needs no module refactor of the existing classic `<script>`. Accounts unlock everything downstream: attribution on notes, "my sightings," rate-limiting, and moderation.

## Recommendation 2 — Location-anchored field notes (your "comments" + "pins")

This is the heart of the request, and one data model serves both surfaces. A **field note** is `{ plant, text, location?, author, timestamp }`. Store all notes in one Firestore collection. A note with no location is a **comment** on that plant; a note with a location is a **pin**. Same object, two views:

- **Comment thread per plant.** In each expanded card, a live "Field notes" list (Firestore `onSnapshot`, so new notes appear without refresh) plus a compose box: a text field and a "📍 pin where I saw it" toggle that grabs the phone's GPS. This literally is "comments to anchor people's locations."
- **Pins on the map.** The app's only map today lives in the route-chooser modal. Render located notes there as flower pins, filtered to the current route corridor's bounding box, each with a popup (plant · note · author · date). A small live count on the main screen ("🌸 N field notes along your route") advertises that the map has something to show.

Geo is the one thing Firestore doesn't do natively, but a route corridor only needs a bounding-box filter — load recent located notes and keep those inside `routeBBox` (a function the app already has). If volume ever grows past a few thousand, add a geohash field and range-query on it; not needed at launch.

## Recommendation 3 — Persistence and reasons to return

With accounts in place, persist the obvious things: last route and scrubbed date in `localStorage` (handoff TODO #5) so the app reopens where you left it, and a "my field notes" view tied to the account. Pair this with the web-app manifest already scoped as TODO #7 so Bloomline is installable to the home screen — a returning-user feature that costs a few lines.

## Recommendation 4 — Trust and safety (the moment you accept user input)

User-generated content changes the threat model, so bake in the basics now rather than retrofitting: writes require auth and are validated by Firestore **security rules** (a starter set is in the setup section below — anyone reads, only signed-in users write, a note is stamped with the author's uid and can only be edited or deleted by that author). Store a display name but never precise home location or other PII. Add a lightweight **report/flag** action per note and a `flagged` field a future moderation pass can filter on. Keep GPS coarse (a couple of decimal places ≈ neighborhood, not doorstep) to protect contributors and rare-plant locations — down-rounding coordinates is also good conservation practice for sensitive species.

## Recommendation 5 — Smaller high-value polish (mostly already on your list)

Make the existing "Add a link" control real by writing to Firestore (folded into this build). Ship the outstanding handoff items: lightbox keyboard access (TODO #6), the EOL credit line (#4), and the iNat **phenology-annotation organ photos** already scoped at the end of the handoff — that's the scalable fix for flower/seed tiles and is independent of the community layer. Finally, push the three local route/timing fixes to bloomline.app so the deployed build matches this working copy before layering new features on top.

## What I'm building this session

Per "doc, then build," I'm implementing, directly in `bloomline.html`:

- Firebase compat SDK + a **guarded** `firebaseConfig` block — until you paste real keys, the community features disable themselves and the rest of the app runs exactly as before.
- **Auth:** Google + anonymous, with a header account chip (sign in → avatar/name → sign out).
- **Field notes:** live per-plant comment thread with an optional "pin my spot" geolocation toggle; the old fake submit is replaced with real Firestore writes.
- **Pins:** located notes drawn on the route-chooser map, corridor-filtered, with popups, and a live count on the main screen.
- The existing "Add a link" is wired to Firestore too, so no control lies about accepting input anymore.

## Firebase setup (your side — ~10 minutes)

1. In the Firebase console, open your Limud Labs project (or a new one) → **Add app → Web**, and copy the `firebaseConfig` object.
2. Paste it into the clearly marked `firebaseConfig` block near the top of the script in `bloomline.html`.
3. **Authentication → Sign-in method:** enable **Google** and **Anonymous**.
4. **Authentication → Settings → Authorized domains:** add `bloomline.app` (and `localhost` for testing).
5. **Firestore Database → Create database** (production mode), then paste these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{id} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid
                    && request.resource.data.text is string
                    && request.resource.data.text.size() <= 500;
      allow update, delete: if request.auth != null
                    && resource.data.uid == request.auth.uid;
    }
    match /links/{id} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.uid == request.auth.uid;
      allow update, delete: if request.auth != null
                    && resource.data.uid == request.auth.uid;
    }
  }
}
```

Until step 2 is done, the app shows a quiet "Connect Firebase to enable accounts & field notes" state and works exactly as it does today.

## Open questions / next increments

Photo uploads on notes (Firebase Storage — deferred to keep this build tight and the app functional without Storage configured); a `geohash` field if note volume grows; a simple moderation view over `flagged` notes; and a "my sightings" account page. None block launch.
