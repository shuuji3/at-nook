import { Link } from 'react-router'

/** Shown for any route the notebook does not have a page for. */
export const NotFoundRoute = () => (
  <section className="torn-page">
    <h1 className="torn-page-title">this page is torn out</h1>
    <Link className="torn-page-link" to="/">
      back to the cover
    </Link>
  </section>
)
