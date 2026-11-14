export interface Group {
  id: string;
  label: string;
  count?: number;
}

interface GroupSidebarProps {
  groups: Group[];
  selected: string;
  onSelect: (id: string) => void;
}

/** The index of the notebook: one group per set of people (following, then lists). */
export const GroupSidebar = ({ groups, selected, onSelect }: GroupSidebarProps) => (
  <nav className="groups" aria-label="groups">
    {groups.map((group) => (
      <button
        className="group-row"
        key={group.id}
        type="button"
        aria-current={selected === group.id ? "page" : undefined}
        onClick={() => onSelect(group.id)}
      >
        <span className="group-label">{group.label}</span>
        {group.count != null ? <span className="group-count">{`${group.count}`}</span> : null}
      </button>
    ))}
  </nav>
);
