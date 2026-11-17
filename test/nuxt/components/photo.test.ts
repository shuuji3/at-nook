import { screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../utils/render'
import Photo from '~/components/photo.vue'

// The photo-viewer animation plan reads element dimensions and computed
// styles. jsdom returns zero for everything, which makes `plan` null and
// skips the animation path entirely. Stub the values so the animation
// path is exercised.
const origWidth = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'offsetWidth')
const origHeight = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'offsetHeight')

let prevComputed: typeof window.getComputedStyle

// jsdom has no Element.animate, but the photo-viewer uses it on every
// open/close cycle.
function mockAnimation(): Animation {
  return {
    finished: Promise.resolve(),
    cancel: () => {},
  } as unknown as Animation
}

beforeAll(() => {
  Element.prototype.animate = () => mockAnimation()
  // make every image with class pv-image report real-looking dimensions
  Object.defineProperty(HTMLImageElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLImageElement) {
      return this.classList?.contains('pv-image') ? 200 : 0
    },
  })
  Object.defineProperty(HTMLImageElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLImageElement) {
      return this.classList?.contains('pv-image') ? 150 : 0
    },
  })

  prevComputed = window.getComputedStyle
  window.getComputedStyle = (elt: Element, pseudo?: string | null) => {
    const base = prevComputed(elt, pseudo)
    // the print eats its padding through scale, so supply some
    if (elt.classList?.contains('photo')) {
      return new Proxy(base, {
        get(target, key) {
          if (key === 'paddingLeft' || key === 'paddingTop') return '8px'
          if (key === 'fontSize') return '18px'
          if (key === 'lineHeight') return '32px'
          if (key === 'marginTop') return '12px'
          return Reflect.get(target, key)
        },
      })
    }
    return base
  }
})

afterAll(() => {
  if (origWidth) {
    Object.defineProperty(HTMLImageElement.prototype, 'offsetWidth', origWidth)
  }
  if (origHeight) {
    Object.defineProperty(HTMLImageElement.prototype, 'offsetHeight', origHeight)
  }
  window.getComputedStyle = prevComputed
})

describe('photo', () => {
  it('enlarges on tap and puts the print back on the second tap', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { container } = await renderWithProviders(Photo, {
      props: {
        image: { fullsize: 'f', thumb: 't', alt: 'a caption' },
        tilt: 1.2,
        nudge: 6,
        tapeTilt: 3,
        tapeHue: 200,
      },
    })

    await user.click(screen.getByRole('button', { name: 'a caption' }))
    expect(screen.getByRole('dialog', { name: 'photo' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'close photo' })).toBeTruthy()
    expect(container.querySelector('.photo.is-away')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'close photo' }))
    await vi.advanceTimersByTimeAsync(400)
    expect(screen.queryByRole('button', { name: 'close photo' })).toBeNull()
    expect(screen.queryByRole('dialog', { name: 'photo' })).toBeNull()
    expect(container.querySelector('.photo.is-away')).toBeNull()
    expect(container.querySelector('.photo')).toBeTruthy()

    vi.useRealTimers()
  })

  it('re-opens correctly after being closed', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await renderWithProviders(Photo, {
      props: {
        image: { fullsize: 'f', thumb: 't', alt: 'a caption' },
        tilt: 1.2,
        nudge: 6,
        tapeTilt: 3,
        tapeHue: 200,
      },
    })

    // open → close → open → close
    await user.click(screen.getByRole('button', { name: 'a caption' }))
    expect(screen.getByRole('dialog', { name: 'photo' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'close photo' }))
    await vi.advanceTimersByTimeAsync(400)
    expect(screen.queryByRole('dialog', { name: 'photo' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'a caption' }))
    expect(screen.getByRole('dialog', { name: 'photo' })).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'close photo' }))
    await vi.advanceTimersByTimeAsync(400)
    expect(screen.queryByRole('dialog', { name: 'photo' })).toBeNull()

    vi.useRealTimers()
  })
})
