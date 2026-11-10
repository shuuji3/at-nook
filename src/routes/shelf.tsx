import { useInfiniteQuery } from "@tanstack/react-query";
import { profileHref } from "../lib/format";
import { followsQuery } from "../lib/queries";
import { useSession } from "../lib/session";
import { PersonTile } from "../components/person-tile";

/** The shelf of notebooks you follow, opened once you are signed in. */
export const ShelfRoute = () => {
  const { session } = useSession();

  const follows = useInfiniteQuery({
    ...followsQuery(session?.did ?? ""),
    enabled: Boolean(session),
  });

  if (!session) {
    return null;
  }

  const people = follows.data?.pages.flatMap((page) => page.follows) ?? [];

  return (
    <section className="shelf">
      <h1 className="shelf-title">your shelf</h1>

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
    </section>
  );
};
