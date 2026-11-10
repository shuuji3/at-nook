import { useSession } from "../lib/session";
import { CoverRoute } from "./cover";
import { ShelfRoute } from "./shelf";

/** The front of the app: the closed cover, or your shelf once signed in. */
export const HomeRoute = () => {
  const { session, ready } = useSession();

  if (!ready) {
    return null;
  }

  return session ? <ShelfRoute /> : <CoverRoute />;
};
