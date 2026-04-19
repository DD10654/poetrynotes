# Migration: Scroll-Container Zoom → Camera Model

A high-level checklist for moving Poetry Notes from the `overflow: auto` +
`transform: scale()` approach to a Canva-style fixed viewport + camera system.

---

## 0. Prerequisites

- [ ] Commit or branch off current work — this touches zoom, pan, drag, and
      arrow-rendering code paths.
- [ ] Confirm existing `Note.position` values in localStorage are treated as
      pre-zoom canvas pixels. (They already are; no data migration needed.)
- [ ] Decide whether the camera state persists across reloads. Recommended:
      persist it on the Project (new field) so users return to their last view.

---

## 1. State changes

- [ ] Replace `ViewState.zoomLevel: number` with:
      ```
      camera: { x: number, y: number, zoom: number }
      ```
      Defaults: `{ x: 0, y: 0, zoom: 1 }`.
- [ ] Add reducer actions: `PAN_CAMERA`, `ZOOM_CAMERA`, `RESET_CAMERA`,
      `ZOOM_TO_FIT`.
- [ ] Remove `containerWidth` state and the ResizeObserver that tracks it.
- [ ] (Optional) Add `Project.camera` to the persisted schema and load it on
      project open.

---

## 2. DOM / CSS restructure

- [ ] Delete `.scroll-container` (the `flex: 1; overflow: auto` wrapper).
- [ ] Delete `zoom-scroll-wrapper` (the `minWidth: Z*100%` intermediate div).
- [ ] Delete the `marginLeft` offset logic on `.editor-container`.
- [ ] Delete the auto-scroll-to-center `useEffect` that runs after zoom changes.
- [ ] New structure under the header:
      ```
      .viewport              (flex: 1, overflow: hidden, position: relative)
        .content-layer       (position: absolute, top/left: 0,
                              transform-origin: 0 0,
                              transform: translate(-cx*Z, -cy*Z) scale(Z))
          .poem-panel        (position: absolute at fixed canvas coords)
          .notes-panel       (position: absolute, no size constraints)
            <svg> arrows
            <div.note> * N
      ```
- [ ] Give the poem explicit canvas coordinates (e.g. `left: 0, top: 0`) instead
      of `margin: auto`. Pick values that place it where users currently see it
      at zoom = 1.

---

## 3. Pan interaction

- [ ] Add `pointerdown` handler on `.viewport`. Start pan only if
      `e.target === viewport` or target has a `canvas-background` class —
      never when the target is a note, the poem editor, or an arrow.
- [ ] On `pointermove` while panning:
      ```
      camera.x -= dx / camera.zoom
      camera.y -= dy / camera.zoom
      ```
- [ ] On `pointerup`, end pan. Use `setPointerCapture` so drags that leave the
      viewport still release cleanly.
- [ ] Add cursor feedback: `grab` on hover over empty canvas, `grabbing` while
      panning.
- [ ] Add trackpad two-finger scroll: `wheel` event *without* `ctrlKey` →
      pan by `deltaX / zoom, deltaY / zoom`. Call `preventDefault()`.

---

## 4. Zoom interaction

- [ ] `wheel` event *with* `ctrlKey` (pinch gesture / ⌘+scroll) → zoom around
      cursor:
      ```
      const rect = viewport.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const worldX = mouseX / camera.zoom + camera.x
      const worldY = mouseY / camera.zoom + camera.y
      const newZoom = clamp(camera.zoom * Math.exp(-e.deltaY * 0.01), 0.1, 4)
      camera.x = worldX - mouseX / newZoom
      camera.y = worldY - mouseY / newZoom
      camera.zoom = newZoom
      ```
- [ ] Keep the header zoom buttons. They should zoom around the viewport
      center, not the cursor — same math with `mouseX = viewport.width/2`.
- [ ] Remove all old zoom logic that manipulated scroll position.

---

## 5. Note drag and resize

- [ ] Drag handler: already divides by zoom — replace `zoomLevel` reference
      with `camera.zoom`. Also add `camera.x` / `camera.y` when converting
      client coords to canvas coords:
      ```
      const canvasX = (e.clientX - rect.left) / camera.zoom + camera.x
      const canvasY = (e.clientY - rect.top)  / camera.zoom + camera.y
      ```
- [ ] Resize handler: same substitution.
- [ ] Verify: note positions can now be negative or arbitrarily large — no
      clamping needed, no bounds checking.

---

## 6. Arrows / connections

- [ ] Remove the `getBoundingClientRect() / zoomLevel` conversion in
      `NoteConnections.tsx` — note positions are already in canvas space, read
      them directly from state.
- [ ] Highlight rects (poem text → note arrows) still need DOM measurement.
      Convert once:
      ```
      const rect = span.getBoundingClientRect()
      const viewportRect = viewport.getBoundingClientRect()
      const canvasX = (rect.left - viewportRect.left) / camera.zoom + camera.x
      const canvasY = (rect.top  - viewportRect.top)  / camera.zoom + camera.y
      ```
- [ ] SVG lives inside `.content-layer`, so it scales automatically. No
      viewBox gymnastics needed.

---

## 7. Poem editor "+ Note" button

- [ ] The selection rect comes from `window.getSelection().getRangeAt(0)
      .getBoundingClientRect()` in screen space. Convert to canvas space
      using the same formula as the highlight rects above before positioning
      the button.

---

## 8. New UI affordances

- [ ] **Zoom indicator** in the header showing `Math.round(camera.zoom * 100)%`.
- [ ] **Reset view** button → `camera = { x: 0, y: 0, zoom: 1 }`.
- [ ] **Zoom to fit** button:
      1. Compute bounds of all notes (`min/max x/y + width/height`) and poem.
      2. Add padding (e.g. 80px on each side).
      3. Set `camera.zoom = min(viewport.w / bounds.w, viewport.h / bounds.h)`
         clamped to [0.1, 1].
      4. Set `camera.x = bounds.minX - padding`,
         `camera.y = bounds.minY - padding`.
- [ ] (Optional) **Minimap** in a corner — a scaled-down SVG of all note
      positions with a rectangle showing the current viewport.

---

## 9. Keyboard shortcuts

- [ ] `⌘/Ctrl + 0` → reset view.
- [ ] `⌘/Ctrl + +` / `⌘/Ctrl + -` → zoom in/out around center.
- [ ] `1` → zoom to fit (optional, matches Figma).
- [ ] Space + drag → pan (optional, matches Figma/Canva muscle memory).

---

## 10. Cleanup

- [ ] Remove `overflow-x`, `overflow-y` declarations from `.main-layout`.
      The outer layout is now `overflow: hidden` on both axes; only the
      viewport clips.
- [ ] Remove the old native scrollbars CSS.
- [ ] Delete dead code: ResizeObserver setup, `leftOffset` calculations,
      `scrollWidth / clientWidth` math, the scroll-container ref.
- [ ] Search the codebase for `zoomLevel` and replace remaining references
      with `camera.zoom`.

---

## 11. Test pass

- [ ] Drag a note to x = -2000. Confirm it stays where dropped and is
      reachable by panning left.
- [ ] Drag a note to x = 5000, y = 5000. Same check.
- [ ] Zoom to 3× at the cursor over a specific note — that note's screen
      position should barely move.
- [ ] Zoom out to 0.2× — poem and all notes visible, no clipping, no
      layout shift.
- [ ] Resize the browser window at zoom = 2×. Content should stay put in
      canvas space; only the visible window changes.
- [ ] Trackpad pinch-zoom and two-finger pan both work.
- [ ] Poem text selection still shows the "+ Note" button in the right spot
      at zoom ≠ 1.
- [ ] Arrows connect notes correctly at zoom = 0.5, 1, 2, 3.
- [ ] Save, reload, confirm notes are in the same canvas positions and
      (if persisted) the camera restores.

---

## 12. Known gotchas

- **Wheel event passive listeners**: React attaches `onWheel` as passive by
  default, so `preventDefault()` is ignored. Attach via
  `viewport.addEventListener('wheel', handler, { passive: false })` in a
  `useEffect`.
- **Text selection vs pan**: ensure pan doesn't start when the user is
  selecting text in the poem. Check `e.target` carefully.
- **Pointer capture on iframes / embedded editors**: TipTap is fine, but
  confirm `pointerup` fires reliably when a drag ends outside the viewport.
- **Transform precision**: at extreme zooms (0.1× or 4×) with large
  canvas coords, sub-pixel rendering can get fuzzy. Round the final
  translate values if notes look blurry.
