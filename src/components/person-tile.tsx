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

/** One person as a little closed notebook standing on the shelf. */
export const PersonTile = ({ profile, href, caption }: PersonTileProps) => (
  <Link
    className="mini-notebook"
    to={href}
    style={{ "--cover-hue": coverHue(profile.did) } as CSSProperties}
  >
    <span className="mini-spine" aria-hidden="true" />
    <span className="mini-face">
      <Avatar src={profile.avatar} alt={profile.displayName ?? profile.handle} size={64} />
      <span className="mini-name">{profile.displayName ?? profile.handle}</span>
      <span className="mini-handle">@{profile.handle}</span>
      {caption ? <span className="mini-caption">{caption}</span> : null}
    </span>
  </Link>
);
