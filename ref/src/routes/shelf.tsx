import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { GroupSidebar, type Group } from '../components/group-sidebar'
import { PersonTile } from '../components/person-tile'
import { profileHref } from '../lib/format'
import { followsQuery, listQuery, listsQuery } from '../lib/queries'
import { useSession } from '../lib/session'

const FOLLOWING = 'following'

/** The shelf: choose a group of people, and look at their notebooks. */
export const ShelfRoute = () => {
  const { session } = useSession()
  const [selected, setSelected] = useState(FOLLOWING)

  const follows = useInfiniteQuery({
    ...followsQuery(session?.did ?? ''),
    enabled: Boolean(session),
  })
  const lists = useInfiniteQuery({
    ...listsQuery(session?.did ?? ''),
    enabled: Boolean(session),
  })
  const list = useInfiniteQuery({
    ...listQuery(selected === FOLLOWING ? '' : selected),
    enabled: Boolean(session) && selected !== FOLLOWING,
  })

  if (!session) {
    return null
  }

  const curating = selected !== FOLLOWING
  const followsPeople = follows.data?.pages.flatMap((page) => page.follows) ?? []
  const members = list.data?.pages.flatMap((page) => page.items.map((item) => item.subject)) ?? []
  const people = curating ? members : followsPeople
  const curationLists = lists.data?.pages.flatMap((page) => page.lists) ?? []

  const groups: Group[] = [
    { id: FOLLOWING, label: 'following' },
    ...curationLists.map((entry) => ({
      id: entry.uri,
      label: entry.name,
      count: entry.listItemCount,
    })),
  ]

  const active = curating ? list : follows

  return (
    <section className="shelf">
      <div className="notebook-root">
        <GroupSidebar groups={groups} selected={selected} onSelect={setSelected} />

        <div className="shelf-page">
          <div className="shelf-grid">
            {people.map((profile) => (
              <PersonTile key={profile.did} profile={profile} href={profileHref(profile.handle)} />
            ))}
          </div>

          {active.isPending ? <p className="loading-note">finding notebooks…</p> : null}
          {active.isError ? <p className="shelf-note">the shelf could not be reached</p> : null}
          {active.hasNextPage ? (
            <button
              className="page-turn"
              type="button"
              disabled={active.isFetchingNextPage}
              onClick={() => void active.fetchNextPage()}
            >
              more notebooks
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
