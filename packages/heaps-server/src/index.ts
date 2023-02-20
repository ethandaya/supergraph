import type { NextApiRequest, NextApiResponse } from "next";
import {
  Abi,
  AbiParameter,
  ExtractAbiEvent,
  ExtractAbiEventNames,
} from "abitype";
import { SuperGraphEventType } from "@heaps/engine/src";

export type EventLookup<
  TAbi extends Abi,
  J extends ExtractAbiEventNames<TAbi> = ExtractAbiEventNames<TAbi>
> = {
  [K in J]: ExtractAbiEvent<TAbi, K>["inputs"];
};

export type HandlerLookup<
  TAbi extends Abi,
  J extends ExtractAbiEventNames<TAbi> = ExtractAbiEventNames<TAbi>,
  T extends Record<J, AbiParameter[]> = Record<J, AbiParameter[]>
> = {
  [K in keyof T]: (body: SuperGraphEventType<T[K]>) => Promise<void> | void;
};

export function handlerFactory<TAbi extends Abi>(
  handlers: HandlerLookup<TAbi>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") return res.status(405).end("Method not allowed");
    const { event }: { event?: ExtractAbiEventNames<TAbi> } = req.query;
    if (!event) return res.status(400).end("Missing event name");
    const handler = handlers?.[event];
    if (!handler) return res.status(400).end("Invalid event name");
    await handler(req.body);
    return res.status(200).end("OK");
  };
}
