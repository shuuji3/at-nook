import { useEffect, useRef } from 'react'

/** must match --line-height in paper.css */
const RULING_PERIOD = 32

/**
 * Pads the bottom of a variable-height block (photos, banner, clippings) so its
 * outer height is a whole number of ruling lines, keeping the writing after it on
 * the ruling. Re-snaps when the element resizes, on window resize, and shortly
 * after, because the browser re-lays out a resized image asynchronously.
 */
export const useRulingSnap = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const snap = () => {
      element.style.marginBottom = '0px'
      // width updates immediately on resize, so derive the height from the image
      // aspect instead of waiting for the (async) image re-layout
      const height = element.getBoundingClientRect().height
      const remainder = height % RULING_PERIOD
      element.style.marginBottom = `${remainder === 0 ? 0 : RULING_PERIOD - remainder}px`
    }

    const timers: number[] = []
    const schedule = () => {
      snap()
      requestAnimationFrame(snap)
      for (const delay of [60, 200, 600]) {
        timers.push(window.setTimeout(snap, delay))
      }
    }

    const images = [...element.querySelectorAll('img')]
    for (const image of images) {
      image.addEventListener('load', schedule)
    }

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => schedule())
    observer?.observe(element)
    window.addEventListener('resize', schedule)
    snap()

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', schedule)
      for (const timer of timers) {
        clearTimeout(timer)
      }
      for (const image of images) {
        image.removeEventListener('load', schedule)
      }
    }
  }, [])

  return ref
}
