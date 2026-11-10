import type { CSSProperties } from "react";
import { Link } from "react-router";
import { coverHue } from "../lib/format";
import { Avatar } from "./avatar";

export interface TileProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

interface PersonTileProps {
  profile: TileProfile;
  href: string;
  caption?: string;
}

/** One person on the shelf or in a list, dressed in that person's cover colour. */
export const PersonTile = ({ profile, href, caption }: PersonTileProps) => (
  <Link
    className="tile"
    to={href}
    style={{ "--cover-hue": coverHue(profile.did) } as CSSProperties}
  >
    <span className="tile-avatar">
      <Avatar src={profile.avatar} alt={profile.displayName ?? profile.handle} />
    </span>
    <span className="tile-name">{profile.displayName ?? profile.handle}</span>
    <span className="tile-handle">@{profile.handle}</span>
    {caption ? <span className="tile-caption">{caption}</span> : null}
  </Link>
);
