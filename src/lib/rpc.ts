import { Client, simpleFetchHandler } from "@atcute/client";
import type {} from "@atcute/bluesky";

export const rpc = new Client({
  handler: simpleFetchHandler({ service: "https://public.api.bsky.app" }),
});
