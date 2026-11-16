import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/** must match --line-height in paper.css */
const RULING_PERIOD = 32

/**
 * Pads the bottom of a variable-height block (photos, banner, clippings) so its
 * outer height is a whole number of ruling lines, keeping the writing after it on
 * the ruling. Re-snaps when the element resizes, on window resize, and shortly
 * after, because the browser re-lays out a resized image asynchronously.
 */
export const useRulingSnap = <T extends HTMLElement>(): Ref<T | null> => {
  const elRef: Ref<T | null> = ref(null)

  const observerRef = ref<ResizeObserver | null>(null)
  const timers: number[] = []
  const snap = () => {
    const element = elRef.value
    if (!element) return

    element.style.marginBottom = '0px'
    const height = element.getBoundingClientRect().height
    const remainder = height % RULING_PERIOD
    element.style.marginBottom = `${remainder === 0 ? 0 : RULING_PERIOD - remainder}px`
  }

  const schedule = () => {
    snap()
    requestAnimationFrame(snap)
    for (const delay of [60, 200, 600]) {
      timers.push(window.setTimeout(snap, delay))
    }
  }

  onMounted(() => {
    const element = elRef.value
    if (!element) return

    const images = [...element.querySelectorAll('img')]
    for (const image of images) {
      image.addEventListener('load', schedule)
    }

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => schedule())
    observer?.observe(element)
    observerRef.value = observer
    window.addEventListener('resize', schedule)
    snap()
  })

  onUnmounted(() => {
    observerRef.value?.disconnect()
    window.removeEventListener('resize', schedule)
    for (const timer of timers) {
      clearTimeout(timer)
    }
    const element = elRef.value
    if (element) {
      const images = [...element.querySelectorAll('img')]
      for (const image of images) {
        image.removeEventListener('load', schedule)
      }
    }
  })

  return elRef
}
