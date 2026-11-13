import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { Entry } from "../components/entry";
import { NotebookHeader } from "../components/notebook-header";
import { NotebookShell } from "../components/notebook-shell";
import { documentTitle, dayOf } from "../lib/format";
import { authorFeedQuery, profileQuery } from "../lib/queries";
import { useSession } from "../lib/session";

/** One person's notebook: header band plus written entries. */
export const NotebookRoute = () => {
  const { session, ready } = useSession();

  if (!ready) {
    return null;
  }

  const { actor = "" } = useParams<{ actor: string }>();

  const profile = useQuery(profileQuery(actor));
  const feed = useInfiniteQuery({
    ...authorFeedQuery(actor),
    enabled: actor.length > 0,
  });

  const title = profile.data
    ? documentTitle({
        displayName: profile.data.displayName,
        handle: profile.data.handle,
      })
    : undefined;

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  if (!session) {
    return (
      <NotebookShell>
        <h1 className="page-note">
          open the notebook from the <Link to="/">cover</Link> first
        </h1>
      </NotebookShell>
    );
  }

  if (profile.isPending) {
    return (
      <NotebookShell>
        <p className="page-note">finding the notebook…</p>
      </NotebookShell>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <NotebookShell>
        <h1 className="page-note">this notebook could not be found</h1>
      </NotebookShell>
    );
  }

  const entries = (feed.data?.pages ?? [])
    .flatMap((page) => page.feed)
    .filter((item) => !item.reason);

  // the date is written once per day; same-day entries only carry the time
  let previousDay = "";
  const dated = entries.map((item) => {
    const record = item.post.record as { createdAt?: unknown };
    const day = typeof record.createdAt === "string" ? dayOf(record.createdAt) : "";
    const showDate = day !== "" && day !== previousDay;
    previousDay = day;
    return { item, showDate };
  });

  return (
    <NotebookShell>
      <NotebookHeader profile={profile.data} />

      <div className="entries">
        {dated.map(({ item, showDate }, index) => (
          <Entry key={item.post.uri} item={item} index={index} showDate={showDate} />
        ))}
      </div>

      {feed.isPending ? <p className="page-note">turning to the first page…</p> : null}
      {feed.isError ? <p className="page-note">this page could not be read</p> : null}
      {!feed.isPending && entries.length === 0 ? (
        <p className="page-note">the rest of the notebook is empty</p>
      ) : null}
      {feed.hasNextPage ? (
        <button
          className="page-turn"
          type="button"
          disabled={feed.isFetchingNextPage}
          onClick={() => void feed.fetchNextPage()}
        >
          turn the page
        </button>
      ) : null}
    </NotebookShell>
  );
};
