import { Abi, ExtractAbiEvent, ExtractAbiEventNames } from "abitype";
import { baseHandlerFactory, HandlerLookup } from "./common";
import {
  ExcludeUnnamedParametersFromInputs,
  SuperGraphEventType,
} from "@heaps/engine";

export type FetcherOptions = {
  abi: Abi;
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
        abi,
        contractAddress,
        startBlock: 0,
      });
      console.log(events);
      return res.status(200).end();
    },
    ["POST"]
  );
}
