import { describe, expect, it } from "vitest";
import { createQueryClient } from "./query-client";

describe("query client", () => {
  it("retries transient failures and keeps data fresh for a minute", () => {
    const queries = createQueryClient().getDefaultOptions().queries;

    expect(queries?.retry).toBe(2);
    expect(queries?.staleTime).toBe(60_000);
  });
});
