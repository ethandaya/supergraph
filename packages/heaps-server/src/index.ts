import type { NextApiRequest, NextApiResponse } from "next";

export function heapsNextAdaptor(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  const { network, event } = req.query;
  if (method !== "POST") {
    return res.status(405).end();
  }
  console.log("Received event", event, "for network", network);
  return res.status(200).json({ event, network });
}
