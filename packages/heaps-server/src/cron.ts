import { Abi, ExtractAbiEvent, ExtractAbiEventNames } from "abitype";
import { baseHandlerFactory, HandlerLookup } from "./common";
import {
  ExcludeUnnamedParametersFromInputs,
  SuperGraphEventType,
} from "@heaps/engine";

export type FetcherOptions = {
  contractAddress: string;
  startBlock?: number;
  endBlock?: number;
};

export function cronHandler<TAbi extends Abi>(
  abi: TAbi,
  contractAddress: string,
  handlers: HandlerLookup<TAbi>,
  fetcher: (
    opts: FetcherOptions
  ) => Promise<
    SuperGraphEventType<
      ExtractAbiEventNames<TAbi>,
      ExcludeUnnamedParametersFromInputs<
        ExtractAbiEvent<TAbi, ExtractAbiEventNames<TAbi>>["inputs"]
      >
    >[]
  >
) {
  console.log(`Booting ${Object.keys(handlers).length} handlers...`);
  return baseHandlerFactory(
    async (_, res) => {
      const events = await fetcher({
        contractAddress,
        startBlock: 0,
      });
      await events.reduce(async (prev, event) => {
        await prev;
        const handler = handlers?.[event.event];
        if (!handler) return;
        try {
          await handler(event);
        } catch (e) {
          console.error(e);
        }
      }, Promise.resolve());
      return res.status(200).end();
    },
    ["POST"]
  );
}
