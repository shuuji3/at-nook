import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GroupSidebar, type Group } from "../components/group-sidebar";
import { PersonTile } from "../components/person-tile";
import { profileHref } from "../lib/format";
import { followsQuery, listsQuery } from "../lib/queries";
import { useSession } from "../lib/session";

const FOLLOWING = "following";

/** The shelf: choose a group of people, and look at their notebooks. */
export const ShelfRoute = () => {
  const { session } = useSession();
  const [selected, setSelected] = useState(FOLLOWING);

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

  const groups: Group[] = [
    { id: FOLLOWING, label: "following" },
    ...curationLists.map((list) => ({
      id: list.uri,
      label: list.name,
      count: list.listItemCount,
    })),
  ];

  return (
    <section className="shelf">
      <div className="notebook-root">
        <GroupSidebar groups={groups} selected={selected} onSelect={setSelected} />

        <div className="shelf-page">
          <div className="shelf-grid">
            <PersonTile
              profile={{ did: session.did, handle: session.handle }}
              href={profileHref(session.handle)}
              caption="your notebook"
            />
            {people.map((profile) => (
              <PersonTile key={profile.did} profile={profile} href={profileHref(profile.handle)} />
            ))}
          </div>

          {follows.isPending ? <p className="shelf-note">finding notebooks…</p> : null}
          {follows.isError ? <p className="shelf-note">the shelf could not be reached</p> : null}
          {follows.hasNextPage ? (
            <button
              className="page-turn"
              type="button"
              disabled={follows.isFetchingNextPage}
              onClick={() => void follows.fetchNextPage()}
            >
              more notebooks
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};
