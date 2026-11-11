import { Link } from "react-router";
import { toFacetSegments } from "../lib/facets";

interface RichTextProps {
  text: string;
  facets?: unknown;
}

/** Post or bio text with mentions, links, and tags rendered as anchors. */
export const RichText = ({ text, facets }: RichTextProps) => (
  <>
    {toFacetSegments(text, facets).map((segment, index) =>
      segment.href ? (
        segment.href.startsWith("/") ? (
          <Link className="rich-link" key={index} to={segment.href}>
            {segment.text}
          </Link>
        ) : (
          <a className="rich-link" key={index} href={segment.href} target="_blank" rel="noreferrer">
            {segment.text}
          </a>
        )
      ) : (
        <span key={index}>{segment.text}</span>
      ),
    )}
  </>
);
