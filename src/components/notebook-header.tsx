import type { AppBskyActorDefs } from "@atcute/bluesky";
import type { CSSProperties } from "react";
import { coverHue } from "../lib/format";
import { Avatar } from "./avatar";
import { RichText } from "./rich-text";

interface NotebookHeaderProps {
  profile: AppBskyActorDefs.ProfileViewDetailed;
}

/** The pasted-in front of a notebook: banner, portrait, and name. */
export const NotebookHeader = ({ profile }: NotebookHeaderProps) => {
  const name = profile.displayName ?? profile.handle;
  // descriptionFacets is not in the installed lexicon types but the AppView sends it
  const descriptionFacets = (profile as { descriptionFacets?: unknown }).descriptionFacets;

  return (
    <header className="notebook-header">
      <div
        className="header-banner"
        style={{ "--cover-hue": coverHue(profile.did) } as CSSProperties}
      >
        {profile.banner ? <img src={profile.banner} alt="" /> : null}
      </div>

      <div className="header-face">
        <span className="header-avatar">
          <Avatar src={profile.avatar} alt={name} size={80} />
        </span>
        <div className="header-words">
          <h1 className="header-name">{name}</h1>
          <p className="header-handle">@{profile.handle}</p>
          {profile.pronouns ? <p className="header-pronouns">{profile.pronouns}</p> : null}
          {profile.description ? (
            <p className="header-bio">
              <RichText text={profile.description} facets={descriptionFacets} />
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
};
