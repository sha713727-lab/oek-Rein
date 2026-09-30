# Oak & Rein — hero wordmark motion

**Cursor implementation brief · audited 30 September 2026**

**Target:** https://oakrein.com/  
**Motion reference:** https://www.voldogfood.com/  
**Brand text:** `OAK & REIN`

This document covers the first-load wordmark sequence, the large hero wordmark’s scroll behavior, and its relationship to the compact header brand. It is a scoped addition to the repository’s existing design rules. Do not replace the project’s entire `DESIGN.md` with this file without retaining its unrelated rules.

The audit used the current public HTML, JavaScript and CSS of both sites, plus live desktop DOM/style inspection and screenshots at a 1363 × 936 CSS-pixel viewport. The local Oak & Rein repository was not supplied. Production bundle findings below are verified against the deployed site; Cursor must locate their current source equivalents before editing.

## 1. The correction that matters

**The centre-out wipe currently on Oak & Rein’s large H1 is the wrong reference effect for VOLDOG’s first-load wordmark.**

VOLDOG has three separate brand elements with different jobs:

| Element | Reference selector | Actual behavior |
| --- | --- | --- |
| Temporary intro wordmark | `.loader-logo-wrapper` and its image | A smaller, centred wordmark rises through a mask with a 15° vertical skew, settles, then fades and contracts while the backdrop expands. |
| Large wordmark behind the animal | `.header-logo` | A separate large asset. It appears during the handoff, then translates downward, shrinks and fades according to scroll progress. |
| Brand inside the navigation | `#voldog-icon` and `#voldog-text` | The icon closes horizontally and the small wordmark opens from the centre after a scroll threshold. |

Implement these as separate layers for Oak & Rein. The temporary intro is an `aria-hidden` duplicate. The large title is the real H1. The compact header brand stays inside the existing home link.

This is whole-wordmark motion. The inspected implementation does not split the hero logo into animated letters. Do not substitute a letter stagger, typewriter, bouncing ampersand, liquid distortion, marquee, or mouse-velocity effect.

## 2. Evidence and limits

Labels used throughout:

- **SOURCE:** read directly from current public production code.
- **OBSERVED:** confirmed in the live desktop page.
- **ADAPTATION:** a deliberate Oak & Rein implementation requirement, not a claim about VOLDOG.
- **UNVERIFIED:** requires implementation or device testing.

### 2.1 Current source references

| ID | Public source | Relevant evidence |
| --- | --- | --- |
| V1 | [VOLDOG homepage](https://www.voldogfood.com/) | Separate intro, hero-image wordmark and header SVG groups. |
| V2 | [page-transition.js](https://www.voldogfood.com/wp-content/themes/Divi-Child-Theme/js/page-transition.js?ver=1774963255) | `playHomeIntro`, readiness, repeat-navigation behavior. |
| V3 | [logo-scroll-reveal.js](https://www.voldogfood.com/wp-content/themes/Divi-Child-Theme/js/logo-scroll-reveal.js?ver=1774963244) | Hero progress, pin, compact brand and mobile branches. |
| V4 | [Child-theme CSS](https://www.voldogfood.com/wp-content/themes/Divi-Child-Theme/style.min.css?ver=1781454137) | Intro mask, wordmark sizing and CSS transitions. |
| V5 | [smooth-scroll.js](https://www.voldogfood.com/wp-content/themes/Divi-Child-Theme/js/smooth-scroll.js?ver=1774963320) | Lenis configuration and scroll update bridge. |
| O1 | [Oak & Rein homepage](https://oakrein.com/) | Existing H1, horse, CTA and motion wrappers. |
| O2 | [Oak & Rein motion bundle](https://oakrein.com/_next/static/chunks/3i_pgxfpwza13.js) | Current `HomeMotion` and wordmark reveal configuration. |
| O3 | [Oak & Rein design CSS](https://oakrein.com/_next/static/chunks/34ypqj5k9ecv3.css) | Fraunces wordmark, broad span selectors, sizing and masks. |
| O4 | [Oak & Rein header bundle](https://oakrein.com/_next/static/chunks/2lyv-x3qkyo1f.js) | Current homepage compact-header threshold. |

These are audit references, not dependencies to import or hotlink. Production chunk names can change after deployment.

### 2.2 VOLDOG first-load sequence — SOURCE

The following positions are derived from the overlapping GSAP timeline in V2. Time zero means **the timeline starts**, not navigation start; asset/font readiness adds a variable delay.

| Timeline time | Target | From → to | Duration / ease |
| --- | --- | --- | --- |
| 0.00–1.20s | Backdrop | Desktop scale `0.2 → 0.3`; opacity `0 → 1` | `1.2s`, `power1.inOut` |
| 0.40–1.20s | Intro wrapper | `y:50 → 0`, scale `0.9 → 1`, opacity `0 → 1` | `0.8s`, `power2.out` |
| 0.60–1.40s | Intro wordmark image | Desktop `y:200 → 0`, `skewY:15 → 0`, opacity `0 → 1` | `0.8s`, `power2.out` |
| 1.40–2.10s | Intro wordmark image | Opacity `1 → 0`, scale `1 → 0.85` | `0.7s`, `power4.out` |
| 1.90–3.10s | Backdrop | Scale `0.3 → 1` | `1.2s`, `power4.out` |
| 2.00–2.60s | Intro wrapper | Opacity `1 → 0`, scale `1 → 0.9` | `0.6s`, `power1.inOut` |
| At 2.40s | Large hero wordmark container | JS sets opacity `1`, `y:0`; CSS had opacity `0`, `translateY(-30px)` | JS duration `0`; CSS transition `0.6s ease` |
| At 2.40s | Other hero/header elements | `is-loaded` class added | Their own CSS reveals begin |
| At 3.10s | Completion | Intro completes | Session flag set; scroll systems resume |

The skewed entrance belongs to the temporary logo image. The large final wordmark does **not** receive that same skew tween in the reference.

V2 uses a 100px intro-image offset at widths up to 980px. Its backdrop scales are `0.3 → 0.6 → 1` for 479–980px and `0.5 → 0.7 → 1` below 479px. These are source findings; the simpler Oak & Rein mobile policy in §7 intentionally differs.

The reference skips the large intro on later non-reload navigation when its session flag exists, but a reload can replay it. Its temporary mask is a fixed, centred, overflow-hidden container. The intro wordmark and final wordmark reuse the same SVG artwork in separate DOM elements; this is not a geometric morph between positions.

### 2.3 VOLDOG desktop scroll — SOURCE + OBSERVED

Let `s` be scroll travel in CSS pixels from the hero’s `top top` trigger, and:

```ts
const p = Math.min(1, Math.max(0, s / 700));
const q = Math.max(0, p - 0.5);

const wordmarkY = 50 * p;
const wordmarkScale = 1 - 0.5 * p;
const wordmarkOpacity = Math.max(0, 1 - 2 * p);

const heroScale = 1 - 0.5 * q;
const heroOpacity = 1 - 0.2 * q;
```

The large logo tween uses `ease: "none"`, `scrub: true`, and a top-centre transform origin. The reference writes `1 - 2*p` for opacity; clamp it explicitly in the new implementation. The whole hero stays unchanged until `p = 0.5`; it finishes at **scale 0.75**, not 0.8.

| Travel `s` | `p` | Wordmark local scale | Wordmark local Y | Wordmark opacity | Hero scene scale | Hero scene opacity |
| --- | --- | --- | --- | --- | --- | --- |
| 0px | 0 | 1 | 0px | 1 | 1 | 1 |
| 175px | 0.25 | 0.875 | +12.5px | 0.5 | 1 | 1 |
| 350px | 0.50 | 0.75 | +25px | 0 | 1 | 1 |
| 525px | 0.75 | 0.625 | +37.5px | 0 | 0.875 | 0.95 |
| 700px | 1 | 0.5 | +50px | 0 | 0.75 | 0.9 |

“Local” means before the ancestor scene transform. Do not multiply the ancestor scale into the child a second time.

The separate reference pin lasts **400px**, while the wordmark progress lasts **700px**. The source pin has `pinSpacing:false`; its following section has compensating layout/animation code. Copying only that pin setting into Oak & Rein would risk overlapping the next section.

Live desktop checkpoints after scroll settled:

- At `scrollY = 288`: large logo scale approximately `0.7943`, Y `+20.5714px`, opacity `0.177143`; hero scale remained `1`.
- At `scrollY = 535`: large logo opacity `0`, hero scale approximately `0.8679`, hero opacity `0.9471`; the compact navigation wordmark was visible.
- Returning to the top restored the large logo to scale `1`, Y `0` and opacity `1`.

V4 also puts a `0.3s` CSS transition on the large logo’s transform and opacity. This is an additional smoothing layer over the scroll updates. **Do not reproduce two competing owners on the same property.** Use the progress contract above with direct GSAP updates; the remaining scroll smoothing comes from the existing Lenis instance. This is an explicit cleanup adaptation.

### 2.4 Compact header brand — SOURCE

At the desktop halfway threshold, V3 starts a separate timed transition:

| Target | Motion | Timing |
| --- | --- | --- |
| Small header icon | Full clip → horizontally closed clip; opacity `1 → 0` | `0.7s`, `power2.inOut` |
| Small header wordmark | `inset(0 50% 0 50%) → inset(0)`; opacity `0 → 1` | Starts `0.4s` after icon starts; `0.7s`, `power2.out` |

The reference’s small SVG wordmark stays at `scale:2` throughout its opening tween. That is an asset-sizing choice, not a `1 → 2` zoom effect to copy onto the H1.

The mobile reference switches the header at `scrollTop > 20`, restores it at `<= 10`, and scales the hero towards `0.9` across 250px without the desktop pin. This was inspected in code, not on a physical mobile device.

### 2.5 What is not the wordmark effect

No hero-wordmark-specific hover animation was found in the inspected motion files and relevant CSS. The large text is not a navigation control. Keep it noninteractive.

The wavy text ribbon, curved section boundaries, dog/cat switch, custom cursor and route-cover wipe are separate systems. Leave them outside this task. In particular, a scroll-velocity bend hook does not implement the wordmark’s progress mapping.

## 3. Oak & Rein: current gaps

The deployed hero currently has `.home-hero-layout`, `.home-hero-scroll`, `.home-hero-panel`, `.home-hero-entrance`, `.home-hero-wordmark-mask`, `.home-hero-wordmark-line` and `.home-hero-subject-motion`.

| Current deployed behavior | Why it differs | Required change |
| --- | --- | --- |
| H1 line starts with a centre-closed clip and opacity 0; opens over `0.7s power2.out` | Uses the compact-header reveal on the large hero title | Remove this H1 wipe and implement separate intro and final-title layers. |
| H1 scrolls upward `-40px`, with `scrub:0.55` | Reference large title moves downward and also shrinks/fades | Use the progress values in §2.3 on a dedicated child wrapper. |
| Panel immediately scales `1 → 0.8`, opacity `1 → 0.9` across 700px | Reference panel retreat begins halfway through | Use the piecewise scene mapping. |
| Hero explicitly uses `pin:false` | Loses the held composition during the wordmark exit | Add the scoped desktop pin described in §8. |
| Existing subject motion has its own `y:+48` scroll tween | Changes the animal-to-wordmark relationship | Remove that extra hero-only scroll offset in this reference-matching scene; retain the media playback implementation. |
| Header threshold is `max(160, 0.55 * panelHeight)` on the homepage | Header change is independent of wordmark exit | On eligible desktop homepages, derive compact state from the same hero progress. |
| Current reveal spans have generic `.home-hero-wordmark span` styling | New structural spans would inherit font/layout declarations | Replace that broad rule with explicit typography and motion-wrapper selectors. |

**OBSERVED typography:** the visible title line uses Fraunces, weight 600, 140px at the audited desktop viewport, uppercase, `letter-spacing:-0.035em`, white. Preserve Fraunces and Oak & Rein’s identity. VOLDOG’s large mark is an SVG asset, so matching a supposed VOLDOG font is not the implementation task.

The current public JavaScript also contains the old session key `saddlera-hero-seen`. Use a new, scoped Oak & Rein key for this new sequence; do not clear unrelated session storage.

## 4. Scope and brand rules

Implement the wordmark system and only the supporting hero/header-brand changes needed for it.

- Render `OAK & REIN`, with spaces around the ampersand, as one visual line. Do not animate the ampersand independently.
- Keep Fraunces for the wordmark and the existing Manrope interface font.
- Reuse current theme and CMS values. The audited hero currently resolves `--hero-stage` to `#859361`; do not hard-code a new brand palette or recolour the entire site to match VOLDOG.
- Preserve the horse media, alpha-processing canvas/video, posters, their responsive containment, and the existing CTA destination. Do not regenerate or replace the horse.
- Preserve CMS data, section order, routes, navigation disclosures, search, account, wishlist, bag and checkout behavior.
- Do not restyle `.shop-range-card*`, `.best-sellers-card*`, `.product-card*`, `.ribbon-marquee*` or `.ribbon-curve*` internals. Keep the existing ribbon outside the new pin transform where practical, preserving its order and appearance.
- Preserve unrelated dirty worktree changes, backend files and environment files.
- Do not import Divi CSS, VOLDOG logo paths, pet imagery, remote animation scripts or VOLDOG media.
- Do not install Framer Motion or another animation engine for this feature. Use the existing GSAP installation; inspect dependencies before adding anything.
- Do not add a site-wide loader, route interception or page-cover transition.

## 5. Composition requirements — ADAPTATION

### Settled hero

Keep the rounded panel and current gutters. The wordmark is a large, crisp, horizontal layer behind the horse. The horse can overlap the centre of the type, but the brand must remain recognisable: never hide both words behind the animal, clip the `O` or `N`, or lose the ampersand completely.

Use the existing header height to place the title with a clear gap beneath navigation. Do not position it by guessing a fixed desktop screenshot coordinate.

Target the visible wordmark at roughly **78–84% of the panel width** on desktop. This is an Oak & Rein composition target, not a measured font specification from VOLDOG. The current 140px cap makes it substantially narrower than the reference at the audited viewport.

A starting point for the actual type span is `font-size:clamp(32px, 13vw, 248px)`, weight 600 and tracking `-0.035em`. Adjust against the actual Fraunces font and the existing panel’s width, not a substitute system font. At exceptionally wide panels, use the project’s existing content-width policy and measure again. Do not use `scaleX()` to force the text to fit.

At 320, 375, 390, 768, 1024, 1366, 1440 and 1920px widths, the complete phrase must fit on one line without horizontal page overflow. Use local responsive font-size/gutters if needed. Do not shrink the whole hero to solve text overflow.

### Masks and layering

The temporary intro wordmark has a deliberate reveal mask. Its settled text must have enough top/bottom padding for Fraunces serifs; start with `0.12em` each and inspect actual glyphs. Clipping during the entrance is intentional. Clipping in the settled frame is a failure.

The large final title does not need the existing centre-out `clip-path`. Remove that effect entirely. A structural wrapper must not accidentally inherit the reveal mask or font-size rule intended for the text itself.

Use a local stacking context with `isolation:isolate` and small, explicit z-index values:

| Layer | Relative order | Behavior |
| --- | --- | --- |
| Decorative backdrop | 0 | Intro scale animation; never contains controls |
| Settled H1 | 10 | Behind horse, noninteractive |
| Horse media | 20 | Existing cutout and video/canvas |
| Temporary intro wordmark | 30 | Only during intro; `aria-hidden`, `pointer-events:none` |
| CTA and header controls | Above decorative layers | Remain usable and legible |

Do not copy the reference’s extreme z-index values or create a page-wide fixed overlay. The intro must be contained in the hero.

## 6. DOM and animation ownership

Adapt current components instead of creating a second hero. The following is a structural guide, not a replacement for existing CMS/media components:

```tsx
<section className="home-hero" ref={heroRef}>
  <div className="home-hero-layout">
    <div className="home-hero-pin">
      <div className="home-hero-panel">
        <div className="home-hero-backdrop-intro" aria-hidden="true" />

        <div className="home-hero-intro-anchor" aria-hidden="true">
          <div className="home-hero-intro-motion">
            <div className="home-hero-intro-mask">
              <span className="home-hero-intro-type">OAK &amp; REIN</span>
            </div>
          </div>
        </div>

        <h1 className="home-hero-wordmark">
          <span className="home-hero-wordmark-scroll">
            <span className="home-hero-wordmark-reveal">
              <span className="home-hero-wordmark-line">OAK &amp; REIN</span>
            </span>
          </span>
        </h1>

        <div className="home-hero-subject">
          <div className="home-hero-subject-reveal">
            {/* Existing media component, preserved */}
          </div>
        </div>
        {/* Existing CTA component, preserved */}
      </div>
    </div>
    {/* Existing ribbon, preserved outside the pin if layout permits */}
  </div>
</section>
```

The actual existing `.home-hero-scroll` can serve as the pin shell if it is stable, contains only the intended panel and has no competing transform owner. Rename or reuse deliberately; do not nest redundant pin shells.

| Element | Owner | Owned properties |
| --- | --- | --- |
| Stable layout / H1 position / intro anchor | Scoped CSS | Dimensions, position, alignment, gutters |
| Pin shell | ScrollTrigger pin | Pin positioning only |
| Panel inside pin shell | Hero progress controller | Scene scale and opacity |
| Decorative backdrop | Intro timeline | Intro scale and opacity |
| Intro outer motion wrapper | Intro timeline | Wrapper Y, scale and opacity |
| Intro type | Intro timeline | Type Y, skewY, scale and opacity |
| Final wordmark reveal wrapper | Intro timeline | Entrance Y and opacity |
| Final wordmark scroll wrapper | Hero progress controller | Scroll Y, scale and opacity |
| Type span | Scoped CSS | Font, tracking, case, line-height, colour |
| Subject reveal wrapper | Intro timeline | Entrance opacity only |
| Media video/canvas internals | Existing media component | Playback and alpha rendering |
| Header brand layers | Header brand timeline | Clip and opacity |

Avoid putting `translateX(-50%)` layout centring and GSAP motion on the same element. Centre with the outer grid/flex/position wrapper and animate its child. Use `transition:none` on GSAP-owned properties in these scoped wrappers. Do not globally disable transitions on the rest of the homepage.

## 7. Intro implementation contract — ADAPTATION

### Desktop first visit

Eligibility: homepage, viewport at least 1024px wide and 600px high, fine pointer, and no reduced-motion preference. The 1024px threshold deliberately aligns with Oak & Rein’s existing desktop header rather than importing VOLDOG’s 981px breakpoint.

Use the times from §2.2 as **explicit absolute positions in one GSAP timeline**, with these Oak & Rein mappings:

- Backdrop → `.home-hero-backdrop-intro`.
- Intro wrapper → `.home-hero-intro-motion`.
- Intro image → `.home-hero-intro-type`, rendered in Fraunces.
- Large hero title container → `.home-hero-wordmark-reveal`.

Centre the intro anchor within the hero. Give the temporary type a container up to approximately 450px wide, constrained by panel gutters, and fit the complete phrase naturally. The backdrop takes the same current hero background treatment and rounded shape. Move the panel’s visual background into that decorative child if needed so its scale is genuinely visible; do not add an indistinguishable scaled copy over an already opaque identical background.

The rest of the page and header must remain available during the decorative sequence. Keep the CTA visible and usable from the start. Use the existing dark/forest header colour treatment while a small backdrop exposes a light page surface, then the existing overlay treatment once the full backdrop is present. This is a scoped contrast accommodation, not a header redesign.

At `2.40s`, reveal the final H1 from `y:-30, opacity:0` to `y:0, opacity:1` over `0.6s`. Match the reference CSS `ease` with GSAP CustomEase using `0.25,0.1,0.25,1`; register that named ease once in the existing motion config. The GSAP tween replaces the reference’s mixed CSS/JS ownership.

Reveal the existing horse media via its outer opacity wrapper at `2.40s` over `0.65s power2.out`. This media timing is an adaptation. Do not animate its width, aspect ratio or alpha-rendering canvas dimensions.

At completion, remove the temporary intro from rendering, clear temporary `will-change`, and leave the H1/media at their settled states. Retain only the transforms needed by active scroll motion.

### Readiness, interruption and repeat visits

1. Server-render the real H1 and usable CTA in the settled state. Decorative intro content is hidden by default. JavaScript failure must never leave a blank hero.
2. Initialise a scoped client controller after the nodes and the real font are ready. Do not wait for video playback to start.
3. Only hide the settled title to arm the full intro if setup can occur promptly before a visible settled composition is replaced. If font readiness/setup is late, keep the settled hero and skip the intro. Use a bounded readiness deadline of at most 800ms; do not flash readable text away after that deadline.
4. Add any animation-ready class only after setup succeeds. Catch failure, kill this feature’s animations, and restore settled styles.
5. Use `oakrein:hero-wordmark:v1:seen` in guarded `sessionStorage` access. Mark complete or intentionally skipped. Play the large sequence once per tab session, including across reloads. This repeat policy intentionally differs from VOLDOG’s reload behavior.
6. On later visits, render the settled hero directly. Do not replay the temporary logo or perform another clip wipe.
7. A wheel gesture, touch scroll, scroll-navigation key, actual scroll beyond 8px, or interaction with a hero/header control must settle the intro immediately. Preserve that interaction’s normal browser behavior. Do not `preventDefault()` wheel/touch or steal focus.
8. Settling is idempotent: kill/pause the intro, set all entrance-only elements to their final states, hide the duplicate, then apply the current scroll progress. It must not reset a scrolled wordmark to its top-of-page state.
9. Back/forward restoration must preserve browser scroll position. Skip the intro when arriving at a nonzero restored position. Do not set `history.scrollRestoration = "manual"` globally.
10. Do not globally stop Lenis or call global `ScrollTrigger.disable()`. Other sections and menus must keep working.

### Tablet, touch and short desktop viewports

Below the desktop eligibility threshold, skip the temporary-logo/backdrop spectacle and desktop pin. On a fresh eligible non-reduced visit, allow one direct, restrained H1 block entrance: `y:24 → 0`, `skewY:4 → 0`, opacity `0 → 1`, `0.6s power2.out`. Put it on the reveal wrapper, not the scroll wrapper. This is an intentionally simpler adaptation; do not label it an exact reference mobile reproduction.

Keep the title at scale 1 after entrance and let it leave through normal document scrolling. Preserve native touch scrolling. Avoid full-viewport bounce caused by dynamic mobile browser chrome.

### Reduced motion, including live changes

Render the final H1 immediately. Disable this feature’s pin, intro, skew, transform scrub and fading wordmark exit. Let the hero scroll normally, keep the title readable, and switch the header brand instantly if its existing layout requires a compact state.

Use a media-query-aware lifecycle, so changing the preference while the page is open reverts this feature’s active animations and leaves visible, usable content. A listener that merely adds `is-hero-ready` while old ScrollTriggers continue running is insufficient.

## 8. Scroll and header implementation contract

### One source of progress

Use a stable, untransformed layout wrapper as the trigger. Read `self.progress` across `start:"top top"` and `end:"+=700"`. Apply the equations in §2.3 to the dedicated wordmark-scroll wrapper and panel.

Use GSAP setters or a linear GSAP timeline. The following is implementation guidance; integrate it with the repository’s lifecycle and refs:

```ts
function applyHeroProgress(rawProgress: number) {
  const p = Math.max(0, Math.min(1, rawProgress));
  const q = Math.max(0, p - 0.5);

  gsap.set(wordmarkScroll, {
    y: 50 * p,
    scale: 1 - 0.5 * p,
    opacity: Math.max(0, 1 - 2 * p),
    transformOrigin: "50% 0%",
  });

  gsap.set(panel, {
    scale: 1 - 0.5 * q,
    opacity: 1 - 0.2 * q,
    transformOrigin: "50% 50%",
  });

  // Notify the header only when the boolean target changes.
  setCompactTargetIfChanged(p >= 0.5);
}
```

This function is based on position, not velocity. Slow and fast scrolling to the same location must converge to the same values. Scrolling backwards reverses the values immediately. A new 700ms tween on every scroll event would be incorrect: **700 is a distance in pixels.**

Do not retain the old H1 `y:-40` tween, centre-out clip tween, immediate panel `scale:0.8` tween or extra subject `y:48` tween alongside this controller. Replace their ownership for this hero; preserve other `HomeMotion` sections.

### Pin and layout

For eligible desktop only, pin the stable shell for `+=400`, starting at the same `top top` point. Animate the child panel, never the pinned element’s scale. Leave header positioning outside transformed hero ancestors.

Default to **`pinSpacing:true`** for Oak & Rein, so the following content keeps a safe normal-flow position. This is a deliberate layout adaptation from the reference. Do not add another manual 400px spacer if ScrollTrigger already creates one.

If the existing layout has a documented equivalent spacing strategy, use that instead and explain it in the implementation report. Never silently set `pin:false` to finish the task. A concrete pin conflict must be fixed in the scoped wrappers or reported with evidence.

Create the pin before dependent scroll measurements, refresh after final font/layout readiness, and verify the next section at pin entry and release. Do not copy the reference’s unrelated next-section scale/padding animation.

### Header brand handoff

At desktop `p >= 0.5`, transition the current horse/crest mark to a compact `OAK & REIN` wordmark inside the existing home link. Keep a stable header brand slot so nav items never shift. Use the existing asset as the crest; do not invent a new icon.

Use the clip/opacity timing in §2.4, but size Oak & Rein’s compact type directly to its slot. Do not apply the source’s constant SVG `scale:2` to text.

Build one paused, reversible header-brand timeline. Play it when the target becomes compact and reverse from its current time when the target becomes expanded. Do not restart an already running transition on every scroll tick. Reversing the same timeline is an adaptation that prevents the source’s separately scheduled reset tweens from fighting on rapid threshold crossings.

Synchronise the homepage’s existing frost/theme/compact boolean with this same progress threshold. Preserve the current independent interior-route header behavior. On small/touch layouts, preserve the existing compact-header policy without importing the reference’s tiny 20px threshold automatically.

Keep the existing home link’s accessible name. Its duplicate visual crest/wordmark layers should not produce two screen-reader names or extra Tab stops. Preserve search, menu, cart and dropdown state handling.

## 9. Timing and velocity curves

Use named GSAP eases exactly where listed. Do not substitute the project’s generic sweep token, spring presets or approximate four-number curves and then call them source matches.

| Use | Required curve | Interpretation |
| --- | --- | --- |
| Intro wrapper/type rise | `power2.out` | Strong initial motion, smooth deceleration |
| Intro logo contraction/fade, backdrop expansion | `power4.out` | Faster early travel, longer gentle finish |
| First backdrop growth and outer intro fade | `power1.inOut` | Symmetric acceleration/deceleration |
| Final hero-title entrance | CSS `ease` equivalent via CustomEase: `0.25,0.1,0.25,1` | Matches the reference container’s CSS timing function |
| Compact crest closing | `power2.inOut` | Symmetric closing motion |
| Compact text opening | `power2.out` | Fast opening with a soft finish |
| Hero scroll mapping | Linear position mapping / `none` | No time-based ease or spring |

For normalized time `t` in `[0,1]`, GSAP `power2.out` follows `1 - (1-t)^3`; `power4.out` follows `1 - (1-t)^5`. “Power2” is not a quadratic-out curve. Their normalized velocities are respectively `3(1-t)^2` and `5(1-t)^4`; divide by duration and multiply by travel distance to obtain physical units per second.

| Normalized time | `power2.out` travel | `power4.out` travel |
| --- | --- | --- |
| 0.25 | 57.8125% | 76.2695% |
| 0.50 | 87.5% | 96.875% |
| 0.75 | 98.4375% | 99.9023% |
| 1.00 | 100% | 100% |

Scroll speed affects how quickly `p` changes in real time, not the final scale at a given position. Lenis smoothing, CSS transition easing, timeline easing and numeric ScrollTrigger scrub lag are different mechanisms. Do not stack them indiscriminately.

V5 uses Lenis `lerp:0.06` and `wheelMultiplier:1.1`. Audit the existing Oak & Rein singleton before making changes. This wordmark task does not justify creating a second Lenis instance, adding another RAF loop, replacing current working scroll locks, or copying the reference’s older Lenis API options.

Keep the existing supported Lenis/ScrollTrigger bridge. If it is driven by GSAP’s ticker, pass milliseconds to `lenis.raf`, retain only one RAF owner, and remove callbacks on teardown. Changing global smooth-scroll tuning requires evidence of a mismatch, not guesswork.

## 10. React, Next.js and CSS implementation rules

- Read actual package versions and local design rules first. Use the existing GSAP registration/config module if one exists.
- Prefer a focused client controller such as `HeroWordmarkMotion`; keep CMS fetching and semantic hero content in the current component boundaries.
- Use refs and scoped selectors. Do not let `.header-logo`, `h1` or `.home-hero-wordmark span` global selectors touch unrelated content.
- Use `gsap.context` and media-query-aware cleanup. Match-media branches must revert their own pin, inline styles and listeners before another branch mounts.
- Ensure React development Strict Mode does not leave duplicate pins, duplicate intro DOM, multiple scroll listeners or multiple session writes.
- Remove only this feature’s animations on teardown. Do not use `ScrollTrigger.killAll()`.
- Do not read `window`, storage or viewport size during server rendering. Keep initial server/client markup consistent.
- Responsive changes and late font metrics must refresh measurements without replaying the first-visit intro. Avoid triggering continuous refresh from an observer watching a node whose size the pin itself changes.
- Remove the current hero-specific clip wipe and its temporary styles. Avoid fixing CSS conflicts with repeated appended overrides or broad `!important` rules.
- Reserve layout dimensions from the first paint. Changing opacity/transform should not cause layout shifts.
- Keep the one real H1 accessible throughout. Decorative duplicates are `aria-hidden`, unfocusable and noninteractive. Do not announce an ornamental loading sequence.
- Keep the original media fallback operational if video decoding, autoplay or canvas processing fails.
- Remove temporary compositor hints after the intro; do not permanently promote every hero descendant.

Reference API documentation: [GSAP easing](https://gsap.com/docs/v3/Eases/), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [gsap.context](https://gsap.com/docs/v3/GSAP/gsap.context()/), [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/). Follow the installed package’s supported APIs.

## 11. Cursor execution order

### A. Inspect before modifying

Run `git status --short`, read the repository’s `AGENTS.md`, current `DESIGN.md`, brand constants and frontend package scripts. Identify existing hero/header timelines and every selector that changes their transform, opacity or clip-path.

Likely files from the project’s previously supplied structure are listed below. They are search candidates, not confirmed current local paths:

```text
Frontend/src/features/catalog/hero-home.tsx
Frontend/src/features/motion/home-motion.tsx
Frontend/src/features/motion/motion-config.ts
Frontend/src/features/motion/smooth-scroll.tsx
Frontend/src/features/navigation/site-header.tsx
Frontend/src/app/home-design.css
Frontend/src/app/home.css
Frontend/src/constants/brand.ts
Frontend/src/app/[locale]/(public)/page.tsx
```

Use `rg` to find `home-hero-wordmark`, `home-hero-panel`, `saddlera-hero-seen`, `clipPath`, and `ScrollTrigger`. Inspect relevant diffs before editing. Do not assume the deployment bundle maps one-to-one to an unchanged repository file.

### B. Correct static composition

Add/reuse stable wrappers, final H1 and hidden decorative intro. Verify the settled brand width, font, ampersand and horse overlap before enabling motion. Confirm the header home link and hero CTA still work.

### C. Replace the hero motion owners

Implement one intro sequence, one progress controller, one desktop pin and one reversible header-brand transition. Remove superseded hero tweens. Keep the rest of `HomeMotion` intact. Apply repeat, interruption and reduced-motion rules.

### D. Validate and correct

Run the available frontend lint, typecheck and build scripts; use their actual package-script names. Report missing scripts instead of claiming they ran. Then perform the visual/interaction checks below. Compilation alone is not visual verification.

## 12. Acceptance matrix

| ID | Check | Pass condition |
| --- | --- | --- |
| W01 | Static settled desktop | One readable `OAK & REIN` H1; Fraunces retained; full phrase fits; horse and CTA preserved. |
| W02 | Fresh desktop intro | Separate centred logo rises with positive Y offset and 15° skew, settles, contracts/fades; backdrop expands; final title appears at the defined handoff. |
| W03 | Timed checkpoints | At timeline 0.6, 1.4, 2.1, 2.4 and 3.1s, states agree with §2.2/§7. No unplanned centre-out H1 wipe. |
| W04 | Scroll position | At relative 0, 175, 350, 525 and 700px, local computed transforms/opacity match §2.3 within rounding tolerance after input settles. |
| W05 | Reverse scroll | Return to top restores the large H1 and crest cleanly. Rapid reversal creates no stuck opacity, ghost logo or restarting tween loop. |
| W06 | Pin boundary | Hold lasts 400px on eligible desktop; following section does not overlap unexpectedly; no duplicate spacer or layout jump at release. |
| W07 | Header handoff | Compact brand transition follows the shared halfway threshold, fits its slot, reverses continuously, and does not shift menu items. |
| W08 | Early interaction | Wheel, keyboard scrolling, Tab/focus and clicks can interrupt the intro; CTA/menu/cart remain operable without an invisible overlay. |
| W09 | Repeat / history | Full intro plays once per session; reload/route return do not repeat it; back/forward preserves restored scroll. |
| W10 | Responsive | Test widths 320, 375, 390, 768, 1024, 1366, 1440 and 1920px, plus a short laptop viewport. No clipped letters or horizontal page overflow. |
| W11 | Live resize | Cross desktop/mobile and height thresholds during/after intro. No stale pin or fresh intro replay. |
| W12 | Reduced motion | Preference set before load and toggled while open: no intro, transform scrub or pin; text stays visible. |
| W13 | Failure handling | Slow/failed font, absent GSAP setup, blocked autoplay and failed media decode leave readable brand and functional navigation. |
| W14 | Lifecycle | Strict Mode, unmount/remount and route changes create no duplicated animation owners, event listeners or temporary DOM. |
| W15 | Browser coverage | Desktop Chromium plus Safari/iOS checks for clipping, pinning, fonts and the existing transparent media. Record anything not tested. |
| W16 | Scope | CMS, commerce interactions, section order, locked cards/ribbon and unrelated worktree edits remain intact. |

For timing checks, use a development-only way to pause/seek the local timeline or record it; remove debug controls from production. Compare **local transform values**, not only a screenshot of a parent-scaled child. Capture both sites at the same viewport and distinguish relative trigger travel from absolute page `scrollY`.

### Evidence status of this audit

| Area | Audit status |
| --- | --- |
| VOLDOG desktop scroll and header handoff | Source verified and visually observed at settled checkpoints. |
| VOLDOG first-load timeline | Exact configuration and overlap positions source verified; not frame-by-frame recorded. |
| VOLDOG mobile branch | Source verified; mobile visual motion unverified. |
| Current Oak & Rein structure, font, wipe and scroll configuration | Production source verified; desktop DOM/computed-style observations collected. |
| Current local repository implementation | Unverified; repository not provided for this audit. |
| New Oak & Rein implementation | Specification only; Cursor must implement and validate. |
| Safari, physical touch devices and live reduced-motion behavior | Not tested in this audit. |

## 13. Required completion report from Cursor

Return a short summary of what changed, the files touched, commands actually run, screenshots/recordings or computed-style evidence for W01–W07, and a Verified / Unverified table for the remaining acceptance checks. State any deliberate deviation from the contract and why it was necessary.

Do not claim a reference match merely because a heading animates or a build passes. If browser capture is unavailable, say visual motion remains unverified and provide exact manual verification steps.

## 14. Paste this into Cursor with this file attached

```text
Implement the attached Oak & Rein hero wordmark DESIGN.md in my current project.

First read AGENTS.md, the existing design/brand rules, package scripts and git
status. Preserve unrelated dirty worktree changes. Locate the real source
components before editing; the document’s file paths are candidates.

The verified issue is that the current large H1 uses VOLDOG’s compact-header
centre-out wipe. VOLDOG instead has three separate elements: a temporary masked
skew/rise intro wordmark, a large hero wordmark with progress-driven shrink/fade,
and a compact header brand reveal. Implement the distinct layers and exact
desktop timing/progress contract in this document for OAK & REIN.

Keep Fraunces, the current brand palette/CMS values, horse video/canvas, CTA,
storefront routes, commerce behavior, section order, locked cards and ribbon.
Do not use VOLDOG assets or import Divi CSS. Do not add a site-wide loader.

Replace conflicting hero tweens; do not stack the new system over the old one.
Use separate entrance, scroll and layout wrappers with one owner per property.
Implement the specified desktop pin, reversible header handoff, interruption,
repeat-visit, native touch and live reduced-motion behavior. Do not replace
position-based progress with scroll velocity or a generic spring/fade-up.

Complete the code, run the available frontend checks, inspect the acceptance
matrix in a browser, and correct mismatches. Return implementation evidence and
explicitly mark unverified checks. Proceed with implementation, not just a plan.
```
