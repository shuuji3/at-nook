const hash = (input: string): number => {
  let value = 0x811c9dc5;
  for (const character of input) {
    value ^= character.codePointAt(0) ?? 0;
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
};

export const stripAt = (input: string): string => {
  const trimmed = input.trim();
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
};

export const profileHref = (actor: string): string => `/profile/${encodeURIComponent(actor)}`;

export const listHref = (actor: string, rkey: string): string =>
  `/profile/${encodeURIComponent(actor)}/list/${encodeURIComponent(rkey)}`;

export const listUri = (did: string, rkey: string): string =>
  `at://${did}/app.bsky.graph.list/${rkey}`;

export const rkeyFromUri = (uri: string): string => uri.split("/").at(-1) ?? "";

export const splitTimestamp = (iso: string, timeZone?: string): { date: string; time: string } => {
  const date = new Date(iso);
  return {
    date: `${dayOf(iso, timeZone)} (${new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone,
    }).format(date)})`,
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(date),
  };
};

/** The calendar day of a timestamp, used to show the date once per day. */
export const dayOf = (iso: string, timeZone?: string): string =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(new Date(iso));

export const rotationFor = (seed: string, index: number): number => {
  const value = hash(`${seed}:${index}`) / 0xffffffff;
  return Math.round((value * 4 - 2) * 10) / 10;
};

/**
 * One tilt per item, deterministic but re-selected when two items in the same
 * group would land on the same angle.
 */
export const pickTilts = (seed: string, keys: string[]): number[] => {
  const used = new Set<number>();

  return keys.map((key, index) => {
    let tilt = rotationFor(`${seed}:${key}`, index);
    for (let attempt = 1; used.has(tilt) && attempt <= 40; attempt += 1) {
      tilt = rotationFor(`${seed}:${key}`, index + attempt);
    }
    used.add(tilt);
    return tilt;
  });
};

/** A hand-pasted tape angle, in degrees, deterministic per photo. */
export const tapeTilt = (seed: string, index: number): number => {
  const value = hash(`${seed}:tape:${index}`) / 0xffffffff;
  return Math.round((value * 16 - 8) * 10) / 10;
};

/** A pastel hue for the tape, deterministic per photo. */
export const tapeHue = (seed: string, index: number): number => hash(`${seed}:hue:${index}`) % 360;

/** A small horizontal nudge for the print, in pixels. */
export const offsetFor = (seed: string, index: number): number => {
  const value = hash(`${seed}:x:${index}`) / 0xffffffff;
  return Math.round((value * 16 - 8) * 10) / 10;
};

export const coverHue = (did: string): number => hash(did) % 360;

export const documentTitle = (profile: { displayName?: string; handle: string }): string =>
  profile.displayName
    ? `notebook — ${profile.displayName} (@${profile.handle})`
    : `notebook — @${profile.handle}`;
