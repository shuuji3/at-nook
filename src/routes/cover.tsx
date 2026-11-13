import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { Avatar } from "../components/avatar";
import { startLogin } from "../lib/auth";
import { stripAt } from "../lib/format";
import { actorCandidatesQuery } from "../lib/queries";
import { useDebouncedValue } from "../lib/use-debounced-value";

interface Candidate {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

/** The closed notebook: sign in by handle, with the people it might be. */
export const CoverRoute = () => {
  const location = useLocation();
  const [raw, setRaw] = useState("");
  const [chosen, setChosen] = useState<Candidate | null>(null);
  const [active, setActive] = useState(-1);
  const [dismissed, setDismissed] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typed = stripAt(raw);
  const query = useDebouncedValue(typed, 300);

  const candidates = useQuery({
    ...actorCandidatesQuery(query),
    enabled: query.length >= 2,
  });

  const people: Candidate[] = useMemo(
    () => (candidates.data?.actors ?? []).slice(0, 8),
    [candidates.data],
  );

  const open = people.length > 0 && !dismissed && !chosen;
  const handle = chosen?.handle ?? typed;
  const canOpen = handle.length > 0;

  useEffect(() => {
    setActive(-1);
    setDismissed(false);
  }, [raw]);

  const loginFailed = Boolean((location.state as { loginFailed?: boolean } | null)?.loginFailed);

  const choose = (person: Candidate) => {
    setChosen(person);
    setRaw(person.handle);
    setActive(-1);
  };

  const signIn = async () => {
    const target = open && active >= 0 ? (people[active]?.handle ?? handle) : handle;
    if (!target) {
      return;
    }
    setOpening(true);
    setError(null);
    try {
      const url = await startLogin(target);
      window.location.assign(url.toString());
    } catch (cause) {
      setOpening(false);
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setDismissed(false);
        return;
      }
      setActive((index) => (index + 1) % people.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (open) {
        setActive((index) => (index <= 0 ? people.length - 1 : index - 1));
      }
      return;
    }

    if (event.key === "Escape") {
      setDismissed(true);
      setActive(-1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (open && active >= 0 && people[active]) {
        choose(people[active]);
        return;
      }
      void signIn();
    }
  };

  return (
    <section className="cover">
      <div className="cover-book">
        <span className="cover-spine" aria-hidden="true" />

        <div className="cover-face">
          <h1 className="cover-title">at-nook</h1>

          <div className="cover-name-line">
            <label className="cover-label" htmlFor="handle">
              handle
            </label>
            <div className="cover-input-row">
              <span className="cover-at" aria-hidden="true">
                @
              </span>
              <input
                id="handle"
                className="cover-input"
                role="combobox"
                aria-expanded={open}
                aria-controls="cover-candidates"
                aria-autocomplete="list"
                aria-activedescendant={
                  open && active >= 0 ? `cover-candidate-${active}` : undefined
                }
                autoComplete="off"
                spellCheck={false}
                value={raw}
                onChange={(event) => setRaw(event.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>

            {open ? (
              <ul
                id="cover-candidates"
                className="cover-candidates"
                role="listbox"
                aria-label="people"
              >
                {people.map((person, index) => (
                  <li
                    key={person.did}
                    id={`cover-candidate-${index}`}
                    className="cover-candidate"
                    role="option"
                    aria-selected={index === active}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(person)}
                  >
                    <Avatar
                      src={person.avatar}
                      alt={person.displayName ?? person.handle}
                      size={28}
                    />
                    <span className="cover-candidate-name">
                      {person.displayName ?? person.handle}
                    </span>
                    <span className="cover-candidate-handle">@{person.handle}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="cover-name-field">
            <span className="cover-label">name</span>
            <p className="cover-name" aria-live="polite">
              {chosen ? (chosen.displayName ?? chosen.handle) : null}
            </p>
          </div>

          <p className="cover-note">
            {error ?? (loginFailed ? "sign-in did not finish. try again." : "")}
          </p>

          <button
            className="cover-open"
            type="button"
            disabled={!canOpen || opening}
            onClick={signIn}
          >
            open notebook
          </button>
        </div>
      </div>
    </section>
  );
};
