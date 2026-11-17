import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/** must match --line-height in paper.css */
const RULING_PERIOD = 32

/**
 * Pads the bottom of a variable-height block (photos, banner, clippings) so its
 * outer height is a whole number of ruling lines, keeping the writing after it on
 * the ruling. Re-snaps when the element resizes, on window resize, and shortly
 * after, because the browser re-lays out a resized image asynchronously.
 */
export function useRulingSnap<T extends HTMLElement>(): Ref<T | null> {
  const elRef: Ref<T | null> = ref(null)

  const timers = new Set<number>()
  function snap() {
    const element = elRef.value
    if (!element) return

    element.style.marginBottom = '0px'
    const height = element.getBoundingClientRect().height
    const remainder = height % RULING_PERIOD
    element.style.marginBottom = `${remainder === 0 ? 0 : RULING_PERIOD - remainder}px`
  }

  function schedule() {
    snap()
    requestAnimationFrame(snap)
    for (const delay of [60, 200, 600]) {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        snap()
      }, delay)
      timers.add(timer)
    }
  }

  useResizeObserver(elRef, () => schedule())
  useEventListener(window, 'resize', schedule)

  onMounted(() => {
    const element = elRef.value
    if (!element) return

    for (const image of element.querySelectorAll('img')) {
      image.addEventListener('load', schedule)
    }

    snap()
  })

  onUnmounted(() => {
    for (const timer of timers) {
      clearTimeout(timer)
    }

    const element = elRef.value
    if (element) {
      for (const image of element.querySelectorAll('img')) {
        image.removeEventListener('load', schedule)
      }
    }
  })

  return elRef
}
