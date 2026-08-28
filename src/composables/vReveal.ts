import type { Directive } from 'vue'

/**
 * v-reveal — fades/rises an element in as it scrolls into view, and back out
 * again on the way out (not a one-time reveal). Ported from portfolio.html's
 * shared IntersectionObserver + .reveal/.in-view class toggle.
 */

let observer: IntersectionObserver | null = null

const getObserver = () => {
  if (observer || !('IntersectionObserver' in window)) return observer

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('in-view', entry.isIntersecting)
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -12% 0px' },
  )

  return observer
}

export const vReveal: Directive<HTMLElement> = {
  mounted(el) {
    el.classList.add('reveal')
    const obs = getObserver()
    if (obs) {
      obs.observe(el)
    } else {
      el.classList.add('in-view')
    }
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
