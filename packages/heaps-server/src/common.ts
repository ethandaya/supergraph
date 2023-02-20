import {
  Abi,
  AbiParameter,
  ExtractAbiEvent,
  ExtractAbiEventNames,
} from "abitype";
import { SuperGraphEventType } from "@heaps/engine";
import { NextApiRequest, NextApiResponse } from "next";

export type EventLookup<
  TAbi extends Abi,
  J extends ExtractAbiEventNames<TAbi> = ExtractAbiEventNames<TAbi>
> = {
  [K in J]: ExtractAbiEvent<TAbi, K>["inputs"];
};

export type Handler<K extends string, T extends AbiParameter[]> = (
  body: SuperGraphEventType<K, T>
) => Promise<void> | void;

export type HandlerLookup<
  TAbi extends Abi,
  J extends ExtractAbiEventNames<TAbi> = ExtractAbiEventNames<TAbi>,
  T extends Record<J, AbiParameter[]> = Record<J, AbiParameter[]>
> = {
  [K in keyof T]: Handler<J, T[K]>;
};

export function baseHandlerFactory(
  internalHandler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<NextApiResponse>,
  allowedMethods: string[] = ["POST"]
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!allowedMethods.includes(req.method || "")) {
      return res.status(405).end("Method not allowed");
    }
    return internalHandler(req, res);
  };
}
