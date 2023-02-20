import { Abi, ExtractAbiEvent, ExtractAbiEventNames } from "abitype";
import { baseHandlerFactory, HandlerLookup } from "./common";
import { SuperGraphEventType } from "@heaps/engine";
import { ExcludeUnnamedParametersFromInputs } from "@heaps/engine/src";

export function cron<TAbi extends Abi>(
  handlers: HandlerLookup<TAbi>,
  fetcher: () => Promise<
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
      const events = await fetcher();
      console.log(events);
      return res.status(200).end();
    },
    ["POST"]
  );
}
