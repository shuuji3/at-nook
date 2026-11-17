function hash(input: string): number {
  let value = 0x811c9dc5
  for (const character of input) {
    value ^= character.codePointAt(0) ?? 0
    value = Math.imul(value, 0x01000193)
  }
  return value >>> 0
}

export function stripAt(input: string): string {
  const trimmed = input.trim()
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed
}

export function profileHref(actor: string): string {
  return `/profile/${encodeURIComponent(actor)}`
}

export function listHref(actor: string, rkey: string): string {
  return `/profile/${encodeURIComponent(actor)}/list/${encodeURIComponent(rkey)}`
}

export function listUri(did: string, rkey: string): string {
  return `at://${did}/app.bsky.graph.list/${rkey}`
}

export function rkeyFromUri(uri: string): string {
  return uri.split('/').at(-1) ?? ''
}

export function splitTimestamp(iso: string, timeZone?: string): { date: string; time: string } {
  const date = new Date(iso)
  return {
    date: `${dayOf(iso, timeZone)} (${new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone,
    }).format(date)})`,
    time: new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    }).format(date),
  }
}

/** The calendar day of a timestamp, used to show the date once per day. */
export function dayOf(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).format(new Date(iso))
}

export function rotationFor(seed: string, index: number): number {
  const value = hash(`${seed}:${index}`) / 0xffffffff
  return Math.round((value * 4 - 2) * 10) / 10
}

function roundTo(value: number, step: number): number {
  return Number((Math.round(value / step) * step).toFixed(2))
}

interface SpreadOptions {
  min: number
  max: number
  step: number
  /** minimum distance to any already-picked value */
  gap: number
}

/**
 * One value per key, deterministic yet spread apart: a value is re-drawn until it
 * is at least `gap` away from every value already picked for this group.
 */
export function pickSpread(seed: string, keys: string[], options: SpreadOptions): number[] {
  const { min, max, step, gap } = options
  const span = max - min
  const picked: number[] = []

  return keys.map((key) => {
    let value = roundTo(min + (hash(`${seed}:${key}`) / 0xffffffff) * span, step)

    for (let attempt = 1; attempt <= 64; attempt += 1) {
      const clash = picked.some((other) => Math.abs(other - value) < gap)
      if (!clash) {
        break
      }
      value = roundTo(min + (hash(`${seed}:${key}:${attempt}`) / 0xffffffff) * span, step)
    }

    picked.push(value)
    return value
  })
}

/** A hand-pasted tape angle, in degrees, deterministic per photo. */
export function tapeTilt(seed: string, index: number): number {
  const value = hash(`${seed}:tape:${index}`) / 0xffffffff
  return Math.round((value * 16 - 8) * 10) / 10
}

/** A pastel hue for the tape, deterministic per photo. */
export function tapeHue(seed: string, index: number): number {
  return hash(`${seed}:hue:${index}`) % 360
}

/** A small horizontal nudge for the print, in pixels. */
export function offsetFor(seed: string, index: number): number {
  const value = hash(`${seed}:x:${index}`) / 0xffffffff
  return Math.round((value * 16 - 8) * 10) / 10
}

export function coverHue(did: string): number {
  return hash(did) % 360
}

/**
 * The old spine shift's math (seven whole-rem buckets), now used to give each book
 * extra height on top of the shelf's width, so books never stand level.
 */
export function spineHeight(seed: string): number {
  const value = hash(`${seed}:spine`) / 0xffffffff
  return Math.floor(value * 7)
}

export function documentTitle(profile: { displayName?: string; handle: string }): string {
  return profile.displayName
    ? `at-nook — ${profile.displayName} (@${profile.handle})`
    : `at-nook — @${profile.handle}`
}
