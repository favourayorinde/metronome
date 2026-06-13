# Handoff: Metronome (Dial) — PWA

## Overview
A mobile metronome app with four screens — **Tempo** (a draggable dial), **Rhythm** (beat map / time signature / subdivision), **Sound** (voice picker + volume), and **Train** (count-in, gradual tempo ramp, bar counter). Audio is a real Web Audio lookahead scheduler that synthesizes all click sounds with oscillators (no audio files). Designed phone-first at **320 × 680**.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look and behavior, **not production code to copy directly**. Your task is to **recreate this design in your PWA's existing environment** (React, Vue, Svelte, vanilla, etc.) using its established patterns, then wire up the behavior described below. If the codebase has no UI framework yet, pick the one best suited to a small installable PWA.

One important exception: **`MetronomeEngine.js` is real, framework-agnostic logic you can lift almost verbatim.** It's a plain ES module with no dependencies and no DOM coupling — port it as-is and drive your UI from it. The `.dc.html` files use a custom in-house template runtime (`support.js`); ignore that runtime and read them purely as a spec for markup, styling, and the component logic in the `<script type="text/x-dc">` block at the bottom of `MetronomeDial.dc.html`.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, shadows, and interactions are all specified below and present in the files. Recreate the UI to match, using your codebase's component conventions.

---

## Design Tokens

### Colors (warm paper palette)
| Token | Hex | Use |
|---|---|---|
| `bg` | `#ece5d7` | App background (warm paper) |
| `surface` | `#f7f2e7` | Cards, buttons, raised controls |
| `well` | `#e0d7c2` | Inset/recessed panels (beat map, bar counter) |
| `idle` | `#ddd2bd` | Inactive segments, slider track |
| `text` | `#241d12` | Primary text |
| `muted` | `#8c8270` | Secondary text, labels, ticks |
| `accent` | `#0f9a8a` | Teal — primary/selected state, active beats |
| `accent-shadow` | `#0a5e55` | Drop shadow under selected teal chips |
| `amber` | `#bd8230` | Play button, accent beats |
| `amber-shadow` | `#8a5c1d` | Drop shadow under play button |
| `line` | `rgba(50,38,14,.16)` | Hairline borders |
| `edge` | `rgba(50,38,14,.20)` | 2px bottom "lip" shadow on raised buttons (`0 2px 0 var(--edge)`) |

### Typography
- **UI font:** `Hanken Grotesk` (weights 400/500/600/700/800)
- **Numerals / mono / labels:** `JetBrains Mono` (weights 400/500/600/700) — used for BPM readouts, the status bar, signature pill, and all `letter-spacing` caps labels
- Section labels: 11–12px, weight 700, `letter-spacing: .16em–.24em`, uppercase, color `muted`
- Big BPM readout (dial): 44px JetBrains Mono, weight 600, `font-variant-numeric: tabular-nums`
- Mini-transport BPM: 30px; Train bar counter: 60px

### Spacing / Radii / Shadows
- Screen padding: ~`10px 20px 4px` (Tempo uses 22px sides)
- Card radius: 13–18px; chips 11px; small steppers 10px; pills/toggles 999px
- Raised button shape: `background: surface; border: 1px solid line; box-shadow: 0 2px 0 edge` (a flat "lip", not a blur)
- Selected teal chip: `background: accent; color: #fff; box-shadow: 0 2px 0 #0a5e55`
- Inset well: `box-shadow: inset 0 3px 8px rgba(50,38,14,.16)`
- Play button: `background: amber; box-shadow: 0 3px 0 #8a5c1d, 0 14px 28px rgba(189,130,48,.38)`
- Range slider thumb: 22px circle, `linear-gradient(155deg,#fbf6ea,#e3d9c2)`, 1px border `rgba(50,38,14,.2)`, shadow `0 3px 6px rgba(50,38,14,.28)`

---

## Screens / Views

A persistent **status bar** (time `9:41` · `METRONOME` · battery glyph) sits at the top of every screen, and a **bottom tab bar** (Tempo · Rhythm · Sound · Train) is always present. On every screen except Tempo, a **mini transport** row appears above the tab bar: play/pause button, the live BPM + tempo term (tap it to jump back to Tempo), and −/+ nudge buttons.

### 1. Tempo (home)
- **Purpose:** Set the tempo and start/stop.
- **Layout:** Centered column. Header row: `TEMPO` label + signature pill (e.g. `4/4`).
- **Components:**
  - **Dial** — 224px circular control. 29 tick marks arc from −135° to +135° (270° sweep); every 4th is a major tick. Ticks below the current angle light up teal. Inner 166px knob has a teal pointer at top and rotates with value. Center shows BPM + `BPM`. **Drag (pointerdown + pointermove) to scrub tempo** — angular delta maps to BPM across the 20–300 range (≈270° ⇒ 280 BPM). `touch-action: none`, `cursor: grab`.
  - Caption: `{tempoTerm} — drag the dial`.
  - **Beat segments** — one pill per beat, reflecting accent/normal/mute; the active beat lifts and glows while playing (amber for accent, teal for normal). Tap cycles the beat state.
  - **Transport** — −  (52px) · play/pause (74px amber) · + (52px).
  - **Presets** — Ballad 72 · Groove 96 · Allegro 132 · Drive 160 (full-width chips).
  - **TAP TEMPO** — full-width button; tap repeatedly to set BPM from inter-tap average (taps older than 2s are dropped; needs ≥2 taps).

### 2. Rhythm
- **Purpose:** Edit the bar's accent pattern, time signature, and subdivision.
- **Components:**
  - **Beat map** (inset well) — one vertical bar per beat; height encodes state (accent 104px / normal 70px / mute 66px dashed outline). Tap a bar to cycle **accent → mute → normal**. Active beat lifts + glows while playing.
  - **Time signature** — 6-chip grid: `4/4, 3/4, 6/8, 5/4, 7/8, 2/4`. Selecting one resizes the beat map.
  - **Subdivision** — 4-chip grid: `Quarter (1), Eighth (2), Triplet (3), 16th (4)` notes-per-beat.

### 3. Sound
- **Purpose:** Pick the click voice and set volume.
- **Components:**
  - **Sound cards** (tap to preview + select): `Click` (pure sine tick), `Woodblock` (warm hollow knock), `Hi-hat` (crisp noise burst), `Rim` (sharp snap), `Cowbell` (bright metallic). Each card has a name, description, and a tiny 5-bar waveform glyph (`wavePatterns` in the source). Selected card goes solid teal.
  - **Volume** (inset well) — range slider 0–100, mono % readout. Maps to engine master gain 0–1.

### 4. Train
- **Purpose:** Practice tools — count-in, gradual tempo ramp, and a session bar counter.
- **Components:**
  - **Count-in** card — stepper, 0–8 bars (label "1 bar" / "N bars"). *(Currently a UI setting; not yet consumed by the engine — see Notes.)*
  - **Gradual tempo** card — a toggle ("Gradual tempo") with subtitle summarizing the plan, e.g. `120 → 160 bpm · +4 every 4 bars`. When **on**, three stepper rows appear:
    - **TARGET BPM** — ramp endpoint, clamped to `[current bpm, 300]`, steps of 4.
    - **RAISE BY** — BPM added at each step, `1–20`, label `+N bpm`.
    - **EVERY** — bars between steps, `1–16`, label `N bar(s)`.
  - **Bars this session** (inset well) — large mono counter (`000`), with a hint line (`press play to begin` / `counting…` / `paused — press play to resume`).

---

## Interactions & Behavior

- **Play/pause** drives `MetronomeEngine`. Starting resets `barCount` to 0 and the ramp tracker. Stopping clears the visual beat and freezes the session bar count.
- **Beat-synced visuals:** the engine fires an `onBeat(beat, sub, isDownbeat, type)` callback scheduled at the exact audio time; the UI uses it to highlight the active beat/segment.
- **Bar polling:** a 200ms interval reads `engine.barCount` to update the session counter and to apply the tempo ramp.
- **Gradual tempo ramp (Train):** while playing with the ramp on, every `rampBars` bars the BPM increases by `rampStep`, clamped to `rampEnd`. Implementation guards against double-applying on the same bar (`_rampedAt`) and stops once the target is reached. Each step also updates `engine.bpm`, so the dial and readouts move in lockstep.
- **Tap tempo:** averages intervals between taps within a 2s window.
- **Dial drag:** pointer-based angular tracking on `window` (pointermove/pointerup), clamped 20–300 BPM.
- **Sound preview:** selecting a sound plays one tick immediately (`engine.preview()`).
- Transitions are short (`.09–.15s ease`) on segment/chip/toggle state changes.

## State Management
Single component state (see the logic class at the bottom of `MetronomeDial.dc.html`):
```
bpm (20–300)            playing (bool)         screen ('tempo'|'rhythm'|'sound'|'train')
beatsPerBar, noteValue  subdiv (1–4)           sound ('click'|'woodblock'|'hihat'|'rim'|'cowbell')
beatStates[] ('accent'|'normal'|'mute')        currentBeat (-1 when idle)
volume (0–1)            accentFirst (bool)     taps[]
countIn (0–8)           barsPlayed
ramp (bool)  rampEnd (≤300)  rampStep (1–20)  rampBars (1–16)
```
The engine holds its own copy of `bpm / beatsPerBar / subdiv / sound / beatStates / volume`; keep them in sync on every change (the prototype sets `engine.<field>` inside each setter). For a PWA, persist user settings (bpm, signature, sound, volume, ramp config) to `localStorage` and restore on load.

## Audio Engine (`MetronomeEngine.js`) — port this as-is
- Web Audio **lookahead scheduler**: a `setTimeout` loop (`lookahead = 25ms`) schedules notes `scheduleAhead = 0.12s` in advance for rock-solid timing independent of the JS event loop.
- All voices are synthesized from oscillators + filtered white noise (`_tone` / `_noise` / `_voice`) — no sample assets.
- Per-beat `accent / normal / mute` + per-beat subdivisions; `accentFirst` auto-accents beat 0.
- Key API: `bpm`, `beatsPerBar`, `subdiv`, `sound`, `volume`, `beatStates[]`; methods `start() / stop() / toggle() / preview() / setVolume(v) / setBeatsPerBar(n)`; fields `playing`, `barCount`; callback `onBeat`.
- **PWA note:** browsers require a user gesture to start audio. The engine calls `ctx.resume()` on start/preview; make sure the first play is triggered by a tap. Also consider a Wake Lock so the screen doesn't sleep mid-practice.

## Assets
None — no images or icon files. Fonts are Google Fonts (`Hanken Grotesk`, `JetBrains Mono`); self-host them for offline PWA use. All sounds are synthesized at runtime. The "waveform" glyphs and battery icon are pure CSS/divs.

## Files
- `MetronomeDial.dc.html` — the full app: markup + inline styles for all four screens, plus the component logic class (state, handlers, `renderVals()` deriving every styled element). **Primary spec.**
- `MetronomeEngine.js` — the audio scheduler. **Reuse directly.**
- `Dial App.dc.html` — a gallery wrapper that frames all four screens side by side (numbered `01–04`) for review; not part of the shippable app.
- `support.js` — the in-house template runtime that renders the `.dc.html` files locally. **Not needed in your PWA** — included only so the prototypes open in a browser.

## Notes / Open items
- **Count-in** is wired as a setting but not yet consumed by the engine. To implement: on start, play `countIn` empty (or rim-click) bars before un-muting the pattern, and don't increment the session counter during count-in.
- The prototype keeps everything in one component; for a real app, splitting the engine wrapper (a hook/store) from the four screen views is recommended.
