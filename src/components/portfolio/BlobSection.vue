<template>
  <section class="blob-section" id="blob">
    <div class="blob-glow blob-glow-1"></div>
    <div class="blob-glow blob-glow-2"></div>
    <div class="section-inner" v-reveal>
      <div class="section-head" style="margin-left:auto;margin-right:auto;text-align:center;margin-bottom:0;">
        <p class="eyebrow">Tell me what you need</p>
        <h2>Ask the blob.</h2>
        <p class="blob-intro">Pick what you're curious about below, or just type a question — my experience, projects, and skills will show up right inside the blob.</p>
      </div>

      <div class="hero-stage-wrap">
        <div class="stage" ref="stageEl">
          <svg class="lines" ref="linesSvgEl">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: var(--orb-a); stop-opacity: 0.9"/>
                <stop offset="100%" style="stop-color: var(--orb-b); stop-opacity: 0.15"/>
              </linearGradient>
              <linearGradient id="flareGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" style="stop-color: var(--flare-bright); stop-opacity: 0.95"/>
                <stop offset="45%" style="stop-color: var(--orb-a); stop-opacity: 0.5"/>
                <stop offset="100%" style="stop-color: var(--orb-b); stop-opacity: 0"/>
              </linearGradient>
            </defs>
          </svg>

          <div class="orb" ref="orbEl">
            <div class="orb-core" ref="orbCoreEl">
              <div class="orb-idle" ref="orbIdleEl">
                <div class="live-visitor-badge" v-if="liveVisitorCount > 0">
                  <span class="live-count">{{ liveVisitorCount }}</span>
                  <span class="live-label">{{ liveVisitorCount === 1 ? 'visitor' : 'visitors' }}</span>
                </div>
              </div>
              <div class="orb-card" ref="orbCardEl"></div>
            </div>
            <div class="orb-ring"></div>
          </div>

          <div class="bubble-layer" ref="bubbleLayerEl"></div>
        </div>

        <div class="picker-wrap">
          <p class="picker-label">Tell me what you need</p>
          <div class="picker" ref="pickerEl"></div>
        </div>

        <div class="ask-blob-row">
          <input
            type="text"
            class="ask-blob-input"
            ref="askBlobInputEl"
            placeholder="Or ask me something…"
            autocomplete="off"
            maxlength="140"
            @keydown.enter="submitAskBlob"
          >
          <button type="button" class="ask-blob-send" aria-label="Send" @click="submitAskBlob"><Icon icon="lucide:arrow-right" width="16" /></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { vReveal } from '@/composables/vReveal'
import { ChatServiceError, sendChatMessage } from '@/services/aiChat'
import type { ChatMessage } from '@/types/chat'
import { visitorSocket, type VisitorPresencePayload, type VisitorWelcomePayload } from '@/config/socket'

const iconTag = (name: string) => `<iconify-icon icon="${name}"></iconify-icon>`

interface Item {
  id: string
  label: string
  icon: string
  content: string
}

// Real content categories — pick one to add it as a bubble and open its section in the card.
const ITEMS: Item[] = [
  {
    id: 'experience', label: 'Experience', icon: 'lucide:compass',
    content: `<div class="card-section">
      <div class="card-section-head"><span class="card-icon">${iconTag('lucide:compass')}</span><h4>Experience</h4></div>
      <div class="entry-row">
        <div class="entry-top"><strong>Revolution of Kitten INC</strong><span class="entry-date">Feb 2024 – Present</span></div>
        <ul>
          <li>Full-stack apps in Vue.js, web2py, and Python Lambda</li>
          <li>Shopify + Stripe integrated into Matterport virtual tours</li>
          <li>Real-time features with WebSockets and Socket.IO</li>
        </ul>
      </div>
      <div class="entry-row">
        <div class="entry-top"><strong>Human Incubator INC</strong><span class="entry-date">Jul 2021 – Feb 2024</span></div>
        <ul>
          <li>Enterprise apps with AngularJS + ASP.NET Core Web API</li>
          <li>RESTful APIs and improved error tracking</li>
        </ul>
      </div>
    </div>`
  },
  {
    id: 'education', label: 'Education', icon: 'lucide:graduation-cap',
    content: `<div class="card-section">
      <div class="card-section-head"><span class="card-icon">${iconTag('lucide:graduation-cap')}</span><h4>Education</h4></div>
      <div class="entry-row">
        <div class="entry-top"><strong>BS Information Technology</strong><span class="entry-date">2015 – 2021</span></div>
        <p>University of Cebu</p>
      </div>
    </div>`
  },
  {
    id: 'projects', label: 'Projects', icon: 'lucide:rocket',
    content: `<div class="card-section">
      <div class="card-section-head"><span class="card-icon">${iconTag('lucide:rocket')}</span><h4>Projects</h4></div>
      <div class="entry-row">
        <div class="entry-top"><span class="entry-emoji">${iconTag('lucide:map-pin')}</span><strong>Chat Geo</strong></div>
        <p>Real-time location messaging — Vue 3, Node, Socket.IO</p>
      </div>
      <div class="entry-row">
        <div class="entry-top"><span class="entry-emoji">${iconTag('mdi:rickshaw')}</span><strong>Trikerr</strong></div>
        <p>Real-time motorcycle booking — Socket.IO, Hasura GraphQL</p>
      </div>
      <div class="entry-row">
        <div class="entry-top"><span class="entry-emoji">${iconTag('lucide:trophy')}</span><strong>English Learning App</strong></div>
        <p>3rd place, Startup Contest 2024</p>
      </div>
    </div>`
  },
  {
    id: 'skills', label: 'Skills', icon: 'lucide:wrench',
    content: `<div class="card-section">
      <div class="card-section-head"><span class="card-icon">${iconTag('lucide:wrench')}</span><h4>Skills</h4></div>
      <div class="card-tags">
        <span>Vue</span><span>Angular</span><span>TypeScript</span><span>Node.js</span><span>Python</span>
        <span>.NET</span><span>Laravel</span><span>PostgreSQL</span><span>MySQL</span><span>Docker</span>
        <span>GraphQL</span><span>Socket.IO</span>
      </div>
    </div>`
  },
  {
    id: 'contact', label: 'Contact', icon: 'lucide:mail',
    content: `<div class="card-section">
      <div class="card-section-head"><span class="card-icon">${iconTag('lucide:mail')}</span><h4>Contact</h4></div>
      <div class="card-links">
        <a href="mailto:lojeevlim@gmail.com"><span>${iconTag('lucide:mail')}</span>lojeevlim@gmail.com</a>
        <a href="https://github.com/lojeevlim" target="_blank" rel="noopener"><span>${iconTag('simple-icons:github')}</span>github.com/lojeevlim</a>
        <a href="https://gitlab.com/lojeelim" target="_blank" rel="noopener"><span>${iconTag('simple-icons:gitlab')}</span>gitlab.com/lojeelim</a>
      </div>
    </div>`
  },
  {
    id: 'about', label: 'About', icon: 'lucide:smile',
    content: `<div class="card-section">
      <div class="card-section-head"><span class="card-icon">${iconTag('lucide:smile')}</span><h4>About</h4></div>
      <p>I'm a software engineer with hands-on experience across the full stack — from Vue and Angular frontends to Node.js, Python, and .NET backends. Lately that's meant real-time features (WebSockets, Socket.IO), RESTful and GraphQL APIs, and integrating commerce and virtual-tour platforms like Shopify, Stripe, and Matterport into production apps. I like clean system design and I'm always up for solving the problem nobody wants to touch.</p>
      <div class="card-tags">
        <span>5+ yrs experience</span><span>2 companies</span><span>Cebu, PH</span><span>BSIT &middot; Univ. of Cebu, 2021</span>
      </div>
    </div>`
  },
]

const VISITOR_ICON = iconTag('lucide:user')

const WARMTH: Array<null | { a: string; aRgb: string; b: string; bRgb: string; bright: string; status: string; label: string }> = [
  null,
  { a: '#fbbf24', aRgb: '251,191,36', b: '#fb923c', bRgb: '251,146,60', bright: '#fde68a', status: '#fbbf24', label: 'busy' },
  { a: '#f97316', aRgb: '249,115,22', b: '#ef4444', bRgb: '239,68,68', bright: '#fed7aa', status: '#f97316', label: 'high traffic' },
  { a: '#ef4444', aRgb: '239,68,68', b: '#dc2626', bRgb: '220,38,38', bright: '#fecaca', status: '#ef4444', label: 'very busy' },
  { a: '#dc2626', aRgb: '220,38,38', b: '#991b1b', bRgb: '153,27,27', bright: '#fee2e2', status: '#dc2626', label: 'peak load' },
]
const tierForCount = (n: number) => {
  if (n <= 20) return 0
  return Math.min(WARMTH.length - 1, Math.floor((n - 21) / 10) + 1)
}

const stageEl = ref<HTMLElement | null>(null)
const bubbleLayerEl = ref<HTMLElement | null>(null)
const linesSvgEl = ref<SVGSVGElement | null>(null)
const orbEl = ref<HTMLElement | null>(null)
const orbCoreEl = ref<HTMLElement | null>(null)
const orbIdleEl = ref<HTMLElement | null>(null)
const orbCardEl = ref<HTMLElement | null>(null)
const pickerEl = ref<HTMLElement | null>(null)
const askBlobInputEl = ref<HTMLInputElement | null>(null)
const liveVisitorCount = ref(0)

let clearActiveItems = () => {}
let askBlobSubmit = () => {}
const submitAskBlob = () => askBlobSubmit()

defineExpose({
  clearActiveItems: () => clearActiveItems(),
})

onMounted(() => {
  const stage = stageEl.value
  const bubbleLayer = bubbleLayerEl.value
  const linesSvg = linesSvgEl.value
  const orb = orbEl.value
  const orbCore = orbCoreEl.value
  const orbCard = orbCardEl.value
  const picker = pickerEl.value
  if (!stage || !bubbleLayer || !linesSvg || !orb || !orbCore || !orbCard || !picker) return

  let currentTier = -1
  const applyWarmth = (n: number) => {
    const tier = tierForCount(n)
    if (tier === currentTier) return
    currentTier = tier
    const root = document.documentElement
    if (tier === 0) {
      root.style.removeProperty('--orb-a')
      root.style.removeProperty('--orb-b')
      root.style.removeProperty('--orb-a-rgb')
      root.style.removeProperty('--orb-b-rgb')
      root.style.removeProperty('--flare-bright')
      root.style.removeProperty('--status-color')
    } else {
      const w = WARMTH[tier]!
      root.style.setProperty('--orb-a', w.a)
      root.style.setProperty('--orb-b', w.b)
      root.style.setProperty('--orb-a-rgb', w.aRgb)
      root.style.setProperty('--orb-b-rgb', w.bRgb)
      root.style.setProperty('--flare-bright', w.bright)
      root.style.setProperty('--status-color', w.status)
    }
  }

  let orbTargetW = 0
  let orbTargetH = 0

  const chipEls: Record<string, HTMLButtonElement> = {}
  const questionContents = new Map<string, string>()
  const questionIcons = new Map<string, string>()

  ITEMS.forEach((item) => {
    const chip = document.createElement('button')
    chip.className = 'chip'
    chip.type = 'button'
    chip.innerHTML = `<span class="icon">${iconTag(item.icon)}</span><span>${item.label}</span>`
    chip.addEventListener('click', () => toggleItem(item.id))
    picker.appendChild(chip)
    chipEls[item.id] = chip
  })

  interface Particle {
    el: HTMLElement
    pulse: SVGCircleElement
    pulseIn: SVGCircleElement
    linkGlow: SVGPathElement
    flare: SVGEllipseElement
    code?: string
    kind: 'visitor' | 'item'
    x: number
    y: number
    target: { x: number; y: number }
    scale: number
    targetScale: number
    opacity: number
    targetOpacity: number
    removing: boolean
    phase: number
    ampl: number
    speed: number
    sizeJitterW: number
    sizeJitterH: number
    sideAngle: number
    radiusJitter: number
    curveSign: number
    cardSide: number
    cardOffset: number
  }

  const order: string[] = []
  const particles = new Map<string, Particle>()
  let centerX = 0
  let centerY = 0
  let halfSize = 0
  let stageWidth = 0
  let mouseX = -9999
  let mouseY = -9999
  let draggingId: string | null = null
  let dragStart: { x: number; y: number; moved: boolean } | null = null
  let myVisitorId: string | null = null
  let removeMyPresence = () => {}

  const getActiveVisitorCount = () =>
    order.filter((id) => particles.has(id) && !particles.get(id)!.removing && particles.get(id)!.kind === 'visitor').length

  const measure = () => {
    const rect = stage.getBoundingClientRect()
    centerX = rect.width / 2
    centerY = rect.height / 2
    halfSize = Math.min(rect.width, rect.height) / 2
    stageWidth = rect.width
    return rect
  }
  measure()

  const applyOrbSize = () => {
    if (!stage.classList.contains('has-card')) {
      orb.style.width = ''
      orb.style.height = ''
      orbTargetW = 0
      orbTargetH = 0
      return
    }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const widthPct = vw < 480 ? 0.92 : vw < 768 ? 0.86 : 0.8
    orbTargetW = vw * widthPct
    orbTargetH = Math.min(380, Math.max(220, vh * 0.5))
    orb.style.width = orbTargetW + 'px'
    orb.style.height = orbTargetH + 'px'
  }

  const resizeObserver = new ResizeObserver(() => {
    measure()
    applyOrbSize()
    resizeAllBubbles()
    recomputeTargets()
  })
  resizeObserver.observe(stage)

  function ringPlan(n: number) {
    if (n <= 1) return [{ count: n, frac: 1.0 }]
    if (n <= 4) return [{ count: n, frac: 1.1 }]
    if (n <= 8) return [{ count: n, frac: 1.2 }]
    const rings: Array<{ count: number; frac: number }> = []
    let remaining = n
    let capCount = 8
    let frac = 1.2
    let step = 0.05
    while (remaining > 0) {
      const c = Math.min(capCount, remaining)
      rings.push({ count: c, frac: Math.min(1.3, frac) })
      remaining -= c
      frac += step
      step *= 0.85
      capCount += 6
    }
    return rings
  }

  function recomputeTargets() {
    const activeIds = order.filter((id) => particles.has(id) && !particles.get(id)!.removing)
    const hasCard = stage!.classList.contains('has-card') && orbTargetW > 0

    if (hasCard) {
      const halfW = orbTargetW / 2
      const halfH = orbTargetH / 2
      // keep bubbles off the card's top/bottom entirely — scatter them onto its
      // left/right sides only, using each bubble's own cardSide/cardOffset
      // (assigned once at creation, so a bubble doesn't jump around on
      // resize/relayout) rather than an evenly-spaced stack
      activeIds.forEach((id) => {
        const p = particles.get(id)!
        const margin = 46 * p.radiusJitter
        p.target.x = p.cardSide * (halfW + margin)
        p.target.y = p.cardOffset * halfH * 0.85
      })
      return
    }

    const rings = ringPlan(activeIds.length)
    let idx = 0
    rings.forEach((ring) => {
      for (let i = 0; i < ring.count; i++) {
        const id = activeIds[idx]!
        const p = particles.get(id)!
        const angle = p.sideAngle
        const r = halfSize * ring.frac * p.radiusJitter
        p.target.x = Math.cos(angle) * r
        p.target.y = Math.sin(angle) * r
        idx++
      }
    })
  }

  function resizeAllBubbles() {
    const visitorCount = getActiveVisitorCount()
    const visitorBase = Math.max(10, 24 - Math.max(0, visitorCount - 8) * 0.4)
    const itemBase = 72
    particles.forEach((p) => {
      if (p.removing) return
      const base = p.kind === 'visitor' ? visitorBase : itemBase
      p.el.style.width = (base * p.sizeJitterW).toFixed(1) + 'px'
      p.el.style.height = (base * p.sizeJitterH).toFixed(1) + 'px'
    })
  }

  function shortCode(id: string) {
    const clean = String(id).replace(/[^a-zA-Z0-9]/g, '')
    return 'V-' + clean.slice(-4).toUpperCase().padStart(4, '0')
  }

  function makeConnectionEls() {
    const flare = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    flare.setAttribute('class', 'orb-flare')
    flare.setAttribute('fill', 'url(#flareGrad)')
    linesSvg!.appendChild(flare)

    const linkGlow = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    linkGlow.setAttribute('class', 'conn-link-glow')
    linesSvg!.appendChild(linkGlow)

    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    pulse.setAttribute('class', 'conn-pulse')
    pulse.setAttribute('r', '2.6')
    linesSvg!.appendChild(pulse)

    const pulseIn = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    pulseIn.setAttribute('class', 'conn-pulse-in')
    pulseIn.setAttribute('r', '2.6')
    linesSvg!.appendChild(pulseIn)

    return { flare, linkGlow, pulse, pulseIn } as {
      flare: SVGEllipseElement
      linkGlow: SVGPathElement
      pulse: SVGCircleElement
      pulseIn: SVGCircleElement
    }
  }

  function addVisitorBubble(id: string) {
    if (particles.has(id)) return
    const code = shortCode(id)
    const variant = 1 + Math.floor(Math.random() * 4)

    const el = document.createElement('div')
    el.className = `bubble visitor blob-v${variant}`
    el.innerHTML = `<span class="icon">${VISITOR_ICON}</span>`
    el.style.setProperty('--blob-dur', (7 + Math.random() * 4).toFixed(1) + 's')
    el.style.animationDelay = '-' + (Math.random() * 8).toFixed(2) + 's'
    bubbleLayer!.appendChild(el)

    const { flare, linkGlow, pulse, pulseIn } = makeConnectionEls()

    particles.set(id, {
      el, pulse, pulseIn, linkGlow, flare, code,
      kind: 'visitor',
      x: 0, y: 0,
      target: { x: 0, y: 0 },
      scale: 0.25, targetScale: 1,
      opacity: 0, targetOpacity: 1,
      removing: false,
      phase: Math.random() * Math.PI * 2,
      ampl: 6 + Math.random() * 5,
      speed: 0.6 + Math.random() * 0.5,
      sizeJitterW: 0.85 + Math.random() * 0.3,
      sizeJitterH: 0.85 + Math.random() * 0.3,
      sideAngle: -Math.PI + Math.random() * Math.PI,
      radiusJitter: 1 + Math.random() * 0.28,
      curveSign: Math.random() < 0.5 ? -1 : 1,
      cardSide: Math.random() < 0.5 ? -1 : 1,
      cardOffset: Math.random() * 2 - 1,
    })
    order.push(id)

    bindPointer(id, el)
    recomputeTargets()
    resizeAllBubbles()
    pingOrb()
    updateCount()
  }

  function addItemBubble(id: string) {
    if (particles.has(id)) return
    const wasCardOpenBefore = stage!.classList.contains('has-card')
    const item = ITEMS.find((i) => i.id === id)
    const icon = item ? item.icon : questionIcons.get(id) || 'lucide:message-circle'
    const variant = 1 + Math.floor(Math.random() * 4)

    const el = document.createElement('div')
    el.className = `bubble item blob-v${variant}`
    el.innerHTML = `<span class="icon">${iconTag(icon)}</span>`
    el.style.setProperty('--blob-dur', (7 + Math.random() * 4).toFixed(1) + 's')
    el.style.animationDelay = '-' + (Math.random() * 8).toFixed(2) + 's'
    bubbleLayer!.appendChild(el)

    const { flare, linkGlow, pulse, pulseIn } = makeConnectionEls()

    particles.set(id, {
      el, pulse, pulseIn, linkGlow, flare,
      kind: 'item',
      x: 0, y: 0,
      target: { x: 0, y: 0 },
      scale: 0.25, targetScale: 1,
      opacity: 0, targetOpacity: 1,
      removing: false,
      phase: Math.random() * Math.PI * 2,
      ampl: 6 + Math.random() * 5,
      speed: 0.6 + Math.random() * 0.5,
      sizeJitterW: 0.9 + Math.random() * 0.2,
      sizeJitterH: 0.9 + Math.random() * 0.2,
      sideAngle: -Math.PI + Math.random() * Math.PI,
      radiusJitter: 1 + Math.random() * 0.28,
      curveSign: Math.random() < 0.5 ? -1 : 1,
      cardSide: Math.random() < 0.5 ? -1 : 1,
      cardOffset: Math.random() * 2 - 1,
    })
    order.push(id)
    if (chipEls[id]) chipEls[id].classList.add('active')

    bindPointer(id, el)
    rebuildCard()
    recomputeTargets()
    resizeAllBubbles()
    pingOrb()
    updateCount()

    const newSection = orbCard!.lastElementChild
    if (newSection) {
      const delay = wasCardOpenBefore ? 60 : 620
      setTimeout(() => {
        newSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, delay)
    }
  }

  function toggleItem(id: string) {
    if (particles.has(id) && !particles.get(id)!.removing) {
      startRemove(id)
    } else if (!particles.has(id)) {
      addItemBubble(id)
    }
  }

  function escapeHtml(str: string) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  // A system prompt priming the real model to answer in Lojee's voice, using
  // the same content the picker chips show, so a free-typed question gets a
  // real, grounded answer instead of a generic one.
  const BLOB_SYSTEM_PROMPT = `You are answering questions on Lojee Lim's portfolio site, speaking AS Lojee in first person. Keep replies short (2-3 sentences), warm, and specific. Only use these real facts about Lojee — do not invent anything beyond them:
- Software engineer based in Cebu, Philippines, 5+ years of experience.
- Experience: Revolution of Kitten INC (Feb 2024–Present) — full-stack apps in Vue.js, web2py, Python Lambda; Shopify + Stripe integrated into Matterport virtual tours; real-time features with WebSockets/Socket.IO. Human Incubator INC (Jul 2021–Feb 2024) — enterprise apps with AngularJS + ASP.NET Core Web API, RESTful APIs, error tracking.
- Education: BS Information Technology, University of Cebu (2015–2021).
- Projects: Chat Geo (real-time location messaging, Vue 3 + Node + Socket.IO); Trikerr (real-time motorcycle booking, Socket.IO + Hasura GraphQL); an English Learning App (3rd place, Startup Contest 2024).
- Skills: Vue, Angular, TypeScript, Node.js, Python, .NET, Laravel, PostgreSQL, MySQL, Docker, GraphQL, Socket.IO.
- Contact: lojeevlim@gmail.com, github.com/lojeevlim, gitlab.com/lojeelim.
If asked something unrelated to Lojee's work/background, gently redirect to what you can actually help with.`

  function renderAskBlobCard(id: string, question: string, reply: string | null, isError: boolean) {
    const replyHtml =
      reply === null
        ? `<div class="chat-msg chat-msg-reply"><span class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span></div>`
        : `<div class="chat-msg chat-msg-reply${isError ? ' chat-msg-error' : ''}">${escapeHtml(reply)}</div>`
    return `<div class="card-section" data-blob-id="${id}">
      <div class="card-section-head"><span class="card-icon">${iconTag('lucide:message-circle')}</span><h4>Ask the blob</h4></div>
      <div class="chat-thread">
        <div class="chat-msg chat-msg-sent">"${escapeHtml(question)}"</div>
        ${replyHtml}
      </div>
    </div>`
  }

  function patchCardContent(id: string) {
    // the bubble may have been dismissed (or the section scrolled away from
    // and auto-cleared) before the real reply came back — don't resurrect it
    const p = particles.get(id)
    if (!p || p.removing) return
    const html = questionContents.get(id)
    const node = orbCard!.querySelector(`[data-blob-id="${id}"]`)
    if (html && node) node.outerHTML = html
  }

  async function askBlob(question: string) {
    const trimmed = question.trim()
    if (!trimmed) return
    const id = 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
    questionIcons.set(id, 'lucide:message-circle')
    questionContents.set(id, renderAskBlobCard(id, trimmed, null, false))
    addItemBubble(id)

    const history: ChatMessage[] = [{ id, role: 'user', text: trimmed, createdAt: '' }]

    try {
      const reply = await sendChatMessage(history, BLOB_SYSTEM_PROMPT)
      questionContents.set(id, renderAskBlobCard(id, trimmed, reply, false))
    } catch (err) {
      const message = err instanceof ChatServiceError ? err.message : "Couldn't reach the AI service — try again in a moment."
      questionContents.set(id, renderAskBlobCard(id, trimmed, message, true))
    }
    patchCardContent(id)
  }

  const submitAskBlobHandler = () => {
    if (!askBlobInputEl.value) return
    askBlob(askBlobInputEl.value.value)
    askBlobInputEl.value.value = ''
  }
  // exposed to the template via the wrapper below

  function rebuildCard() {
    const activeItemIds = order.filter((id) => particles.has(id) && !particles.get(id)!.removing && particles.get(id)!.kind === 'item')
    if (activeItemIds.length === 0) {
      stage!.classList.remove('has-card')
      orbCard!.innerHTML = ''
      applyOrbSize()
      return
    }
    const wasActive = stage!.classList.contains('has-card')
    stage!.classList.add('has-card')
    orbCard!.innerHTML = activeItemIds
      .map((id) => questionContents.get(id) || ITEMS.find((i) => i.id === id)?.content || '')
      .join('')
    applyOrbSize()

    const baseDelay = wasActive ? 0 : 0.22
    orbCard!.querySelectorAll<HTMLElement>('.card-section').forEach((el, i) => {
      el.style.animationDelay = (baseDelay + i * 0.1).toFixed(2) + 's'
    })

    if (wasActive) {
      orbCore!.classList.remove('pulse')
      void orbCore!.offsetWidth
      orbCore!.classList.add('pulse')
    }
  }

  function startRemove(id: string) {
    const p = particles.get(id)
    if (!p) return
    p.removing = true
    p.target.x = 0
    p.target.y = 0
    p.targetScale = 0.2
    p.targetOpacity = 0
    if (p.kind === 'item') {
      if (chipEls[id]) chipEls[id].classList.remove('active')
      rebuildCard()
    }
    recomputeTargets()
    resizeAllBubbles()
    pingOrb()
    updateCount()
  }

  clearActiveItems = () => {
    order
      .filter((id) => particles.has(id) && !particles.get(id)!.removing && particles.get(id)!.kind === 'item')
      .forEach((id) => startRemove(id))
  }

  function finalizeRemove(id: string) {
    const p = particles.get(id)
    if (!p) return
    p.el.remove()
    p.pulse.remove()
    p.pulseIn.remove()
    p.linkGlow.remove()
    p.flare.remove()
    particles.delete(id)
    questionContents.delete(id)
    questionIcons.delete(id)
    const i = order.indexOf(id)
    if (i !== -1) order.splice(i, 1)
  }

  function updateCount() {
    const n = getActiveVisitorCount()
    liveVisitorCount.value = n
    orb!.classList.toggle('active', n > 0)
    applyWarmth(n)
  }

  function pingOrb() {
    orbCore!.classList.add('ping')
    setTimeout(() => orbCore!.classList.remove('ping'), 260)
  }

  const onStagePointerMove = (e: PointerEvent) => {
    const rect = stage!.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top
  }
  const onStagePointerLeave = () => {
    mouseX = -9999
    mouseY = -9999
  }
  stage.addEventListener('pointermove', onStagePointerMove)
  stage.addEventListener('pointerleave', onStagePointerLeave)

  function bindPointer(id: string, el: HTMLElement) {
    el.addEventListener('pointerdown', (e) => {
      draggingId = id
      dragStart = { x: e.clientX, y: e.clientY, moved: false }
      el.setPointerCapture(e.pointerId)
    })
    el.addEventListener('pointermove', (e) => {
      if (draggingId !== id || !dragStart) return
      if (Math.abs(e.clientX - dragStart.x) + Math.abs(e.clientY - dragStart.y) > 5) {
        dragStart.moved = true
      }
    })
    el.addEventListener('pointerup', () => {
      if (draggingId === id && dragStart && !dragStart.moved) {
        const p = particles.get(id)
        if (p && p.kind === 'item') startRemove(id)
      }
      draggingId = null
      dragStart = null
    })
  }

  function dist(x1: number, y1: number, x2: number, y2: number) {
    return Math.hypot(x1 - x2, y1 - y2)
  }

  function flareSetEllipse(el: SVGEllipseElement, cx: number, cy: number, rx: number, ry: number, angleDeg: number, pivotX: number, pivotY: number) {
    el.setAttribute('cx', String(cx))
    el.setAttribute('cy', String(cy))
    el.setAttribute('rx', String(rx))
    el.setAttribute('ry', String(ry))
    el.setAttribute('transform', `rotate(${angleDeg} ${pivotX} ${pivotY})`)
  }

  function getBlobSurfacePoint(dx: number, dy: number, d: number) {
    if (stage!.classList.contains('has-card') && orbTargetW > 0) {
      const halfW = orbTargetW / 2
      const halfH = orbTargetH / 2
      const sx = dx !== 0 ? halfW / Math.abs(dx) : Infinity
      const sy = dy !== 0 ? halfH / Math.abs(dy) : Infinity
      const s = Math.min(sx, sy, 1)
      return { x: centerX + dx * s, y: centerY + dy * s }
    }
    const circleRadius = stageWidth * 0.24
    return { x: centerX + (dx / d) * circleRadius, y: centerY + (dy / d) * circleRadius }
  }

  let rafId: number | null = null

  function tick(t: number) {
    particles.forEach((p, id) => {
      const isDragging = draggingId === id

      let tx = p.target.x
      let ty = p.target.y
      if (isDragging) {
        tx = mouseX - centerX
        ty = mouseY - centerY
      }

      p.x += (tx - p.x) * 0.12
      p.y += (ty - p.y) * 0.12
      p.scale += (p.targetScale - p.scale) * 0.15
      p.opacity += (p.targetOpacity - p.opacity) * 0.15

      const settled = dist(p.x, p.y, p.target.x, p.target.y) < 6 && !isDragging
      const floatX = settled ? Math.sin(t * 0.001 * p.speed + p.phase) * p.ampl : 0
      const floatY = settled ? Math.cos(t * 0.0013 * p.speed + p.phase) * p.ampl : 0

      const screenX = centerX + p.x + floatX
      const screenY = centerY + p.y + floatY
      const md = dist(mouseX, mouseY, screenX, screenY)
      const boost = Math.max(0, 1 - md / 90)

      const finalScale = p.scale * (1 + boost * 0.22)
      p.el.style.transform = `translate(-50%, -50%) translate(${p.x + floatX}px, ${p.y + floatY}px) scale(${finalScale})`
      p.el.style.opacity = String(p.opacity)
      p.el.style.setProperty('--glow', (0.35 + boost * 0.65).toFixed(2))

      const toBubbleX = screenX - centerX
      const toBubbleY = screenY - centerY
      const toBubbleDist = Math.max(1, Math.hypot(toBubbleX, toBubbleY))
      const surface = getBlobSurfacePoint(toBubbleX, toBubbleY, toBubbleDist)
      const originX = surface.x
      const originY = surface.y

      const angleRad = Math.atan2(p.y + floatY, p.x + floatX)
      const angleDeg = (angleRad * 180) / Math.PI
      const flareReach = halfSize * 0.5
      const flareRx = flareReach / 2
      const flareRy = halfSize * 0.13
      const beamPulse = 0.75 + Math.sin(t * 0.0016 * p.speed + p.phase) * 0.25
      flareSetEllipse(p.flare, originX + flareRx, originY, flareRx, flareRy, angleDeg, originX, originY)
      p.flare.style.opacity = String(Math.max(0, p.opacity * 0.55 * beamPulse))

      const segDX = screenX - originX
      const segDY = screenY - originY
      const segLen = Math.max(1, Math.hypot(segDX, segDY))
      const perpX = -segDY / segLen
      const perpY = segDX / segLen
      const curveAmt = segLen * 0.24 * p.curveSign
      const ctrlX = (originX + screenX) / 2 + perpX * curveAmt
      const ctrlY = (originY + screenY) / 2 + perpY * curveAmt
      p.linkGlow.setAttribute('d', `M ${originX} ${originY} Q ${ctrlX} ${ctrlY} ${screenX} ${screenY}`)
      p.linkGlow.style.opacity = String(Math.max(0, p.opacity * 0.55 * beamPulse))

      const travel = (t * 0.00058 * p.speed + p.phase / (Math.PI * 2)) % 1
      const mtT = 1 - travel
      const curveT = travel
      const bx = mtT * mtT * screenX + 2 * mtT * curveT * ctrlX + curveT * curveT * originX
      const by = mtT * mtT * screenY + 2 * mtT * curveT * ctrlY + curveT * curveT * originY
      const edgeFade = Math.min(1, travel / 0.1) * Math.min(1, (1 - travel) / 0.1)
      const orbRadiusPx = 11 - travel * 7.5
      p.pulseIn.setAttribute('cx', String(bx))
      p.pulseIn.setAttribute('cy', String(by))
      p.pulseIn.setAttribute('r', Math.max(2, orbRadiusPx).toFixed(1))
      p.pulseIn.style.opacity = String(Math.max(0, p.opacity * 0.7 * edgeFade * (0.6 + travel * 0.4)))

      if (p.removing && p.opacity < 0.02 && dist(p.x, p.y, 0, 0) < 3) {
        finalizeRemove(id)
      }
    })

    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  // Live visitor presence over Socket.IO — the server sends this client its
  // own id plus everyone already connected, then broadcasts join/leave for
  // everyone else for the rest of the session.
  const onVisitorWelcome = ({ id, others }: VisitorWelcomePayload) => {
    myVisitorId = id
    addVisitorBubble(id)
    others.forEach((otherId) => addVisitorBubble(otherId))
  }
  const onVisitorJoin = ({ id }: VisitorPresencePayload) => {
    if (id === myVisitorId) return
    addVisitorBubble(id)
  }
  const onVisitorLeave = ({ id }: VisitorPresencePayload) => {
    startRemove(id)
  }

  visitorSocket.on('visitor:welcome', onVisitorWelcome)
  visitorSocket.on('visitor:join', onVisitorJoin)
  visitorSocket.on('visitor:leave', onVisitorLeave)
  visitorSocket.connect()

  removeMyPresence = () => {
    visitorSocket.off('visitor:welcome', onVisitorWelcome)
    visitorSocket.off('visitor:join', onVisitorJoin)
    visitorSocket.off('visitor:leave', onVisitorLeave)
    visitorSocket.disconnect()
    if (myVisitorId) startRemove(myVisitorId)
  }

  // wire the ask-blob submit button/input (declared in the outer scope so the
  // template's @click/@keydown handlers can reach it)
  askBlobSubmit = submitAskBlobHandler

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver.disconnect()
    stage.removeEventListener('pointermove', onStagePointerMove)
    stage.removeEventListener('pointerleave', onStagePointerLeave)
    removeMyPresence()
  })
})
</script>
