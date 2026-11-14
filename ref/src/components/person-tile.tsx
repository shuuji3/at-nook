import type { CSSProperties } from "react";
import { Link } from "react-router";
import { coverHue, spineShift } from "../lib/format";
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

/** One person as a book spine lying flat on the shelf. */
export const PersonTile = ({ profile, href, caption }: PersonTileProps) => (
  <Link
    className="spine-row"
    to={href}
    style={
      {
        "--spine-hue": coverHue(profile.did),
        "--spine-shift": spineShift(profile.did),
      } as CSSProperties
    }
  >
    <span className="spine-edge">
      <Avatar
        src={profile.avatar}
        alt={profile.displayName ?? profile.handle}
        size={44}
        viewable={false}
      />
    </span>
    <span className="spine-label">
      <span className="spine-name">{profile.displayName ?? profile.handle}</span>
      <span className="spine-handle">@{profile.handle}</span>
    </span>
    {caption ? <span className="spine-caption">{caption}</span> : null}
  </Link>
);
