import type { AppBskyActorDefs } from "@atcute/bluesky";
import type { CSSProperties } from "react";
import { coverHue } from "../lib/format";
import { useRulingSnap } from "../lib/use-ruling-snap";
import { Avatar } from "./avatar";
import { RichText } from "./rich-text";

interface NotebookHeaderProps {
  profile: AppBskyActorDefs.ProfileViewDetailed;
}

/** The pasted-in front of a notebook: banner, portrait, and name. */
export const NotebookHeader = ({ profile }: NotebookHeaderProps) => {
  const name = profile.displayName ?? profile.handle;
  const bannerRef = useRulingSnap<HTMLDivElement>();
  // descriptionFacets is not in the installed lexicon types but the AppView sends it
  const descriptionFacets = (profile as { descriptionFacets?: unknown }).descriptionFacets;

  return (
    <header className="notebook-header">
      <div
        className="header-banner"
        ref={bannerRef}
        style={{ "--cover-hue": coverHue(profile.did) } as CSSProperties}
      >
        {profile.banner ? <img src={profile.banner} alt="" /> : null}
      </div>

      <div className="header-face">
        <span className="header-avatar">
          <Avatar src={profile.avatar} alt={name} size={88} />
        </span>
        <div className="header-words">
          <div className="header-title">
            <span className="header-who">
              <h1 className="header-name">{name}</h1>
              {profile.pronouns ? (
                <span className="header-pronouns">{profile.pronouns}</span>
              ) : null}
            </span>
            <span className="header-handle">@{profile.handle}</span>
          </div>
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
