import { Abi, ExtractAbiEventNames } from "abitype";
import { baseHandlerFactory, HandlerLookup } from "./common";

export function webhook<TAbi extends Abi>(handlers: HandlerLookup<TAbi>) {
  return baseHandlerFactory(
    async (req, res) => {
      const { event }: { event?: ExtractAbiEventNames<TAbi> } = req.query;
      if (!event) return res.status(400).end("Missing event name");
      const handler = handlers?.[event];
      if (!handler) return res.status(400).end("Invalid event name");
      try {
        await handler(req.body);
      } catch (e) {
        console.error(e);
        return res.status(500).end("Internal server error");
      }
      return res.status(200).end("OK");
    },
    ["POST"]
  );
}
