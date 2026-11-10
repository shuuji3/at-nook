import { useInfiniteQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { listHref, profileHref, rkeyFromUri } from "../lib/format";
import { followsQuery, listsQuery } from "../lib/queries";
import { useSession } from "../lib/session";
import { Avatar } from "./avatar";

interface SidebarProps {
  activeActor?: string;
  activeListUri?: string;
}

interface SidebarRowProps {
  href: string;
  active: boolean;
  glyph?: ReactNode;
  avatar?: { src?: string; alt: string };
  primary: string;
  secondary: string;
}

const SidebarRow = ({ href, active, glyph, avatar, primary, secondary }: SidebarRowProps) => (
  <Link className="sidebar-row" to={href} aria-current={active ? "page" : undefined}>
    <span className="sidebar-mark">
      {avatar ? (
        <Avatar src={avatar.src} alt={avatar.alt} size={28} />
      ) : (
        <span aria-hidden="true">{glyph ?? "▤"}</span>
      )}
    </span>
    <span className="sidebar-text">
      <span className="sidebar-primary">{primary}</span>
      <span className="sidebar-secondary">{secondary}</span>
    </span>
  </Link>
);

/** Every notebook you can open, follows first then curation lists, one flat column. */
export const Sidebar = ({ activeActor, activeListUri }: SidebarProps) => {
  const { session } = useSession();

  const follows = useInfiniteQuery({
    ...followsQuery(session?.did ?? ""),
    enabled: Boolean(session),
  });
  const lists = useInfiniteQuery({
    ...listsQuery(session?.did ?? ""),
    enabled: Boolean(session),
  });

  if (!session) {
    return null;
  }

  const people = follows.data?.pages.flatMap((page) => page.follows) ?? [];
  const curationLists = lists.data?.pages.flatMap((page) => page.lists) ?? [];

  return (
    <nav className="sidebar" aria-label="notebooks">
      {people.map((profile) => (
        <SidebarRow
          key={profile.did}
          href={profileHref(profile.handle)}
          active={activeActor === profile.handle}
          avatar={{
            src: profile.avatar,
            alt: profile.displayName ?? profile.handle,
          }}
          primary={profile.displayName ?? profile.handle}
          secondary={`@${profile.handle}`}
        />
      ))}

      {curationLists.map((list) => (
        <SidebarRow
          key={list.uri}
          href={listHref(session.handle, rkeyFromUri(list.uri))}
          active={activeListUri === list.uri}
          primary={list.name}
          secondary={`${list.listItemCount ?? 0} people`}
        />
      ))}
    </nav>
  );
};
