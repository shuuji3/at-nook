import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "react-router";
import { startLogin } from "../lib/auth";
import { stripAt } from "../lib/format";
import { profileQuery } from "../lib/queries";
import { useDebouncedValue } from "../lib/use-debounced-value";

const HANDLE_PATTERN = /^[a-z0-9.-]+\.[a-z0-9-]+$/i;

/** The closed notebook: the signing-in surface, and what an empty shelf falls back to. */
export const CoverRoute = () => {
  const location = useLocation();
  const [raw, setRaw] = useState("");
  const [opening, setOpening] = useState(false);

  const handle = stripAt(raw);
  const debounced = useDebouncedValue(handle, 400);
  const canLookUp = HANDLE_PATTERN.test(debounced);

  const profile = useQuery({
    ...profileQuery(debounced),
    enabled: canLookUp,
  });

  const loginFailed = Boolean((location.state as { loginFailed?: boolean } | null)?.loginFailed);

  const open = async () => {
    if (!profile.data) {
      return;
    }
    setOpening(true);
    try {
      const url = await startLogin(profile.data.handle);
      window.location.assign(url.toString());
    } catch {
      setOpening(false);
    }
  };

  return (
    <section className="cover">
      <h1 className="cover-title">notebook</h1>

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
            autoComplete="off"
            spellCheck={false}
            placeholder="bsky.app"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
          />
        </div>
        <p className="cover-name" aria-live="polite">
          {profile.data ? (profile.data.displayName ?? profile.data.handle) : null}
        </p>
      </div>

      {profile.isError ? <p className="cover-note">this handle could not be found</p> : null}
      {loginFailed ? <p className="cover-note">sign-in did not finish. try again.</p> : null}

      <button
        className="cover-open"
        type="button"
        disabled={!profile.data || opening}
        onClick={open}
      >
        open notebook
      </button>
    </section>
  );
};
