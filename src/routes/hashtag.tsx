import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Entry } from "../components/entry";
import { NotebookShell } from "../components/notebook-shell";
import { tagQuery } from "../lib/queries";

/** Every post carrying a hashtag, read like a notebook's pages. */
export const HashtagRoute = () => {
  const { tag = "" } = useParams<{ tag: string }>();

  const posts = useInfiniteQuery({
    ...tagQuery(tag),
    enabled: tag.length > 0,
  });

  const items = (posts.data?.pages ?? []).flatMap((page) => page.posts.map((post) => ({ post })));

  return (
    <NotebookShell>
      <h1 className="list-title">#{tag}</h1>
      <p className="list-count">{items.length} posts</p>

      <div className="entries">
        {items.map((item, index) => (
          <Entry key={item.post.uri} item={item} index={index} />
        ))}
      </div>

      {posts.isPending ? <p className="page-note">finding posts…</p> : null}
      {posts.isError ? <h1 className="page-note">this page is torn out</h1> : null}
      {posts.isSuccess && items.length === 0 ? (
        <p className="page-note">nothing carries this tag</p>
      ) : null}
      {posts.hasNextPage ? (
        <button
          className="page-turn"
          type="button"
          disabled={posts.isFetchingNextPage}
          onClick={() => void posts.fetchNextPage()}
        >
          turn the page
        </button>
      ) : null}
    </NotebookShell>
  );
};
