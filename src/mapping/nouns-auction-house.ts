import { Auction, Noun } from "./generated/entities";

export async function handleAuctionCreated(event: any): Promise<void> {
  let nounId = event.params.nounId.toString();

  let noun = await Noun.load(nounId);
  if (noun == null) {
    console.error("[handleAuctionCreated] Noun #{} not found. Hash: {}", [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const auction = new Auction(nounId);

  auction.noun = noun.id;
  auction.amount = 0;
  auction.startTime = "3";
  auction.endTime = event.params.endTime;
  auction.settled = false;

  await auction.save();
}
