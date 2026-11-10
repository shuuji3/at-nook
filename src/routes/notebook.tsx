import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Entry } from "../components/entry";
import { NotebookHeader } from "../components/notebook-header";
import { NotebookShell } from "../components/notebook-shell";
import { documentTitle, dayOf } from "../lib/format";
import { useRulingSnap } from "../lib/use-ruling-snap";
import { authorFeedQuery, profileQuery } from "../lib/queries";

/** One person's notebook: header band plus written entries. */
export const NotebookRoute = () => {
  const { actor = "" } = useParams<{ actor: string }>();

  const headerRef = useRulingSnap<HTMLDivElement>();

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

  if (profile.isPending) {
    return <p className="page-note">finding the notebook…</p>;
  }

  if (profile.isError || !profile.data) {
    return <h1 className="page-note">this notebook could not be found</h1>;
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
      <div className="header-snap" ref={headerRef}>
        <NotebookHeader profile={profile.data} />
      </div>

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
