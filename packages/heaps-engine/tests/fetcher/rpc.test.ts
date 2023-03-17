import fetch from "node-fetch";
import { beforeAll, describe, expect, it } from "vitest";
import { RPCFetcher } from "../../src";
import { mainnet } from "viem/chains";
import { createPublicClient, http } from "viem";

// @ts-ignore // TODO - this is bad but works
global.fetch = fetch;

describe("RPC Fetcher", () => {
  let fetcher: RPCFetcher;
  beforeAll(() => {
    fetcher = new RPCFetcher(
      [],
      createPublicClient({
        chain: mainnet,
        transport: http(),
      }),
      500n,
      10n
    );
  });

  it("should be able to fetch logs for range", async () => {
    const logs = await fetcher.fetchLogsForRange(16844457n, 16844458n);
    expect(logs.length).toBe(558);
    expect(logs[0].blockNumber).toBe(16844457n);
    expect(logs[logs.length - 1].blockNumber).toBe(16844458n);
  });

  it("should be able to fetch blocks for range", async () => {
    const blocks = await fetcher.fetchBlocks([16844457n, 16844458n]);
    expect(blocks.length).toBe(2);
    expect(blocks[0].number).toBe(16844457n);
    expect(blocks[blocks.length - 1].number).toBe(16844458n);
  });

  // CHEAP TEST will update with specificity
  it("should be able to fetch events for range", async () => {
    const events = await fetcher.fetchEventsForRange(16844457n, 16844458n);
    expect(events.length).toBe(558);
    expect(events[0].block.number).toBe(16844457n);
    expect(events[events.length - 1].block.number).toBe(16844458n);
  }, 10000);

  it("should be able to fetch all event", async () => {
    const events = await fetcher.fetchEvents(16844457n, 16844458n);
    expect(events.length).toBe(558);
  }, 10000);
});
