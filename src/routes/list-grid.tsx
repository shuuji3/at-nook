import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { PersonTile } from "../components/person-tile";
import { NotebookShell } from "../components/notebook-shell";
import { listUri, profileHref } from "../lib/format";
import { listQuery, profileQuery } from "../lib/queries";

/** A curation list: the people inside it, laid out like a shelf. */
export const ListGridRoute = () => {
  const { actor = "", rkey = "" } = useParams<{
    actor: string;
    rkey: string;
  }>();

  const profile = useQuery(profileQuery(actor));
  const uri = profile.data ? listUri(profile.data.did, rkey) : "";

  const list = useInfiniteQuery({
    ...listQuery(uri),
    enabled: Boolean(uri),
  });

  if (profile.isPending) {
    return <p className="page-note">finding the notebook…</p>;
  }

  if (profile.isError || !profile.data) {
    return <h1 className="page-note">this notebook could not be found</h1>;
  }

  const pages = list.data?.pages ?? [];
  const name = pages[0]?.list.name ?? "list";
  const members = pages.flatMap((page) => page.items.map((item) => item.subject));

  return (
    <NotebookShell activeListUri={uri}>
      {list.data ? (
        <>
          <h1 className="list-title">{name}</h1>
          <p className="list-count">{members.length} people</p>
        </>
      ) : null}

      <div className="shelf-grid">
        {members.map((member) => (
          <PersonTile key={member.did} profile={member} href={profileHref(member.handle)} />
        ))}
      </div>

      {list.isPending ? <p className="page-note">finding people…</p> : null}
      {list.isError ? <h1 className="page-note">this page is torn out</h1> : null}
      {list.isSuccess && members.length === 0 ? (
        <p className="page-note">this list is empty</p>
      ) : null}
      {list.hasNextPage ? (
        <button
          className="page-turn"
          type="button"
          disabled={list.isFetchingNextPage}
          onClick={() => void list.fetchNextPage()}
        >
          more people
        </button>
      ) : null}
    </NotebookShell>
  );
};
