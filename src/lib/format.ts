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
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone,
    })
      .format(date)
      .toLowerCase(),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(date),
  };
};

export const rotationFor = (seed: string, index: number): number => {
  const value = hash(`${seed}:${index}`) / 0xffffffff;
  return Math.round((value * 4 - 2) * 10) / 10;
};

export const coverHue = (did: string): number => hash(did) % 360;

export const documentTitle = (profile: { displayName?: string; handle: string }): string =>
  profile.displayName
    ? `notebook — ${profile.displayName} (@${profile.handle})`
    : `notebook — @${profile.handle}`;
