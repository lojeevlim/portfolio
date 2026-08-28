<template>
  <section class="hero" id="top">
    <div class="hero-shell">
      <div class="hero-grid">
        <div class="hero-copy">
          <h1 class="hero-headline">Hi, I'm Lojee<br><span class="accent">Software Engineer</span></h1>
          <p class="hero-subtext">I build web and mobile products companies actually rely on — the screens people use, and the systems working behind them. 5+ years turning ideas into software that ships and holds up in production.</p>
          <div class="cta-row">
            <!-- <a href="#contact" class="btn btn-primary">Get in Touch</a> -->
            <a href="#blob" class="btn btn-primary">Ask the Blob</a>
          </div>
          <!-- <div class="skill-arrows">
            <div class="skill-arrow-item"><span class="arrow-line"></span>5+ years, full stack — frontend to backend</div>
            <div class="skill-arrow-item"><span class="arrow-line"></span>Real-time features (live chat, bookings, tracking)</div>
            <div class="skill-arrow-item"><span class="arrow-line"></span>E-commerce &amp; payments integrations</div>
            <div class="skill-arrow-item"><span class="arrow-line"></span>Comfortable owning a project start to finish</div>
          </div> -->
        </div>

        <div class="hero-visual" ref="heroVisualEl">
          <div class="hero-visual-glow glow-1"></div>
          <div class="hero-visual-glow glow-2"></div>
          <div class="photo-reveal" ref="photoRevealEl">
            <div class="photo-ground-shadow"></div>
            <img class="photo-layer photo-real" ref="photoRealEl" :src="photoReal" alt="Lojee Lim">
            <img class="photo-layer photo-ghibli" ref="photoGhibliEl" :src="ghibliSrc" alt="Illustrated portrait of Lojee Lim">
            <div class="photo-reveal-glow" ref="revealGlowEl"></div>
          </div>
          <p class="hero-visual-caption"><span class="cursor-hint"></span>Move your cursor over the art to see the real me underneath</p>
          <div class="floating-chip chip-1"><Icon icon="lucide:zap" width="14" /> Real-time</div>
          <div class="floating-chip chip-2"><Icon icon="lucide:puzzle" width="14" /> Full-stack</div>
          <div class="floating-chip chip-3"><Icon icon="lucide:code" width="14" /> Clean Code</div>
          <div class="floating-chip chip-4"><Icon icon="lucide:rocket" width="14" /> Ship Fast</div>
          <div class="floating-chip chip-5"><Icon icon="lucide:wrench" width="14" /> Problem Solver</div>
        </div>
      </div>
      <a href="#numbers" class="scroll-cue" aria-label="Scroll down"><span></span></a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import photoReal from '@/assets/photos/lojee_real.svg'
import ghibliOpenEyes from '@/assets/photos/lojee_gl_open_eyes.svg'
import ghibliHalfOpenEyes from '@/assets/photos/lojee_gl_half_open_eyes.svg'
import ghibliClosedEyes from '@/assets/photos/lojee_gl_close_eyes.svg'

const photoRevealEl = ref<HTMLElement | null>(null)
const photoRealEl = ref<HTMLElement | null>(null)
const photoGhibliEl = ref<HTMLElement | null>(null)
const revealGlowEl = ref<HTMLElement | null>(null)
const heroVisualEl = ref<HTMLElement | null>(null)

type EyeState = 'open' | 'half' | 'closed'
const ghibliEyeState = ref<EyeState>('open')
const ghibliSrc = computed(() => ({
  open: ghibliOpenEyes,
  half: ghibliHalfOpenEyes,
  closed: ghibliClosedEyes,
})[ghibliEyeState.value])

let rafId: number | null = null
let chipRafId: number | null = null

onMounted(() => {
  // floating chips trail behind the page scroll instead of snapping to it —
  // same eased lag whether scrolling up or down. Uses the standalone `translate`
  // property (not `transform`) so it composes with each chip's own chipFloat
  // bob animation instead of overriding it.
  const chipEls = heroVisualEl.value
    ? Array.from(heroVisualEl.value.querySelectorAll<HTMLElement>('.floating-chip'))
    : []
  if (chipEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let scrollTarget = window.scrollY
    let scrollLag = scrollTarget

    const onScroll = () => {
      scrollTarget = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const chipLoop = () => {
      scrollLag += (scrollTarget - scrollLag) * 0.06
      const offset = (scrollTarget - scrollLag).toFixed(1)
      chipEls.forEach((el) => {
        el.style.translate = `0px ${offset}px`
      })
      chipRafId = requestAnimationFrame(chipLoop)
    }
    chipRafId = requestAnimationFrame(chipLoop)

    onUnmounted(() => {
      window.removeEventListener('scroll', onScroll)
      if (chipRafId) cancelAnimationFrame(chipRafId)
    })
  }

  // random blink on the Ghibli illustration by swapping between the three
  // hand-drawn eye-state frames — timed with a recursive setTimeout
  // (randomized delay each cycle) rather than a looping CSS animation, so it
  // doesn't blink on a robotic fixed metronome
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let blinkTimeoutId: number
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 4500 // next blink in 2.5s–7s
      blinkTimeoutId = window.setTimeout(() => {
        ghibliEyeState.value = 'half'
        window.setTimeout(() => {
          ghibliEyeState.value = 'closed'
          window.setTimeout(() => {
            ghibliEyeState.value = 'half'
            window.setTimeout(() => {
              ghibliEyeState.value = 'open'
              scheduleBlink()
            }, 70)
          }, 90)
        }, 70)
      }, delay)
    }
    scheduleBlink()
    onUnmounted(() => clearTimeout(blinkTimeoutId))
  }

  const stage = photoRevealEl.value
  const real = photoRealEl.value
  const ghibli = photoGhibliEl.value
  const glow = revealGlowEl.value
  if (!stage || !real || !ghibli) return

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!supportsHover) return // touch devices keep the plain static Ghibli image, no reveal mechanics

  const REVEAL_R = 50 // px, radius of the fully-revealed core
  let targetR = 0
  let curR = 0
  // lerped in screen-pixel space, not %, because .photo-real and .photo-ghibli
  // render at different box widths (their source images have different aspect
  // ratios) — % computed once against the shared stage doesn't line up with
  // either photo's own mask box, especially away from the left edge
  let targetClientX = 0
  let targetClientY = 0
  let curClientX = 0
  let curClientY = 0

  const setFromEvent = (e: PointerEvent) => {
    targetClientX = e.clientX
    targetClientY = e.clientY
  }

  const onPointerEnter = (e: PointerEvent) => {
    setFromEvent(e)
    targetR = REVEAL_R
  }
  const onPointerMove = (e: PointerEvent) => {
    setFromEvent(e)
    targetR = REVEAL_R
  }
  const onPointerLeave = () => {
    targetR = 0
  }

  stage.addEventListener('pointerenter', onPointerEnter)
  stage.addEventListener('pointermove', onPointerMove)
  stage.addEventListener('pointerleave', onPointerLeave)

  // projects the shared cursor position onto one layer's own rendered box,
  // so each layer's mask lines up with the cursor regardless of that layer's
  // own width
  const applyToLayer = (el: HTMLElement, r: number) => {
    const rect = el.getBoundingClientRect()
    const x = ((curClientX - rect.left) / rect.width) * 100
    const y = ((curClientY - rect.top) / rect.height) * 100
    el.style.setProperty('--reveal-r', r.toFixed(1) + 'px')
    el.style.setProperty('--reveal-x', x.toFixed(1) + '%')
    el.style.setProperty('--reveal-y', y.toFixed(1) + '%')
  }

  const loop = () => {
    curR += (targetR - curR) * 0.15
    curClientX += (targetClientX - curClientX) * 0.28
    curClientY += (targetClientY - curClientY) * 0.28

    applyToLayer(real, curR)
    applyToLayer(ghibli, curR)
    if (glow) {
      applyToLayer(glow, curR * 1.3)
      glow.style.opacity = Math.min(1, curR / REVEAL_R).toFixed(2)
    }

    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)

  onUnmounted(() => {
    stage.removeEventListener('pointerenter', onPointerEnter)
    stage.removeEventListener('pointermove', onPointerMove)
    stage.removeEventListener('pointerleave', onPointerLeave)
    if (rafId) cancelAnimationFrame(rafId)
  })
})
</script>
