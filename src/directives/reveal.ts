import type { ObjectDirective } from 'vue'

let observer: IntersectionObserver | undefined
const targets = new Set<HTMLElement>()
const cleanups = new WeakMap<HTMLElement, () => void>()

function show(element: HTMLElement, immediate = false) {
  if (immediate) element.classList.add('reveal-instant')
  element.classList.remove('reveal-pending')
  element.classList.add('is-revealed')
  cleanups.get(element)?.()
}

function getObserver() {
  observer ??= new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) show(entry.target as HTMLElement)
    })
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' })
  return observer
}

export const vReveal: ObjectDirective<HTMLElement, number | undefined> = {
  mounted(element, binding) {
    element.classList.add('motion-reveal')
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches || !('IntersectionObserver' in window)) {
      element.classList.add('is-revealed')
      return
    }
    if (typeof binding.value === 'number') {
      element.style.setProperty('--reveal-delay', Math.min(240, Math.max(0, binding.value)) + 'ms')
    }
    const onFocus = () => show(element, true)
    const onPreference = () => { if (preference.matches) show(element, true) }
    cleanups.set(element, () => {
      observer?.unobserve(element)
      targets.delete(element)
      element.removeEventListener('focusin', onFocus)
      preference.removeEventListener('change', onPreference)
      cleanups.delete(element)
      if (!targets.size) { observer?.disconnect(); observer = undefined }
    })
    targets.add(element)
    element.addEventListener('focusin', onFocus)
    preference.addEventListener('change', onPreference)
    element.classList.add('reveal-pending')
    getObserver().observe(element)
  },
  beforeUnmount(element) {
    cleanups.get(element)?.()
  },
}
