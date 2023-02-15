import {
  AuctionBid,
  AuctionCreated,
} from "./types/NounsAuctionHouse/NounsAuctionHouse";
import { Auction, Bid, Noun } from "./types/schema";
import { getOrCreateAccount } from "./utils/helpers";

const log = console;

export async function handleAuctionCreated(
  event: AuctionCreated
): Promise<void> {
  let nounId = event.params.nounId.toString();

  let noun = await Noun.load(nounId.toString());
  if (noun == null) {
    log.error("[handleAuctionCreated] Noun #{} not found. Hash: {}", [
      nounId,
      event.transaction.hash,
    ]);
    return;
  }

  let auction = new Auction(nounId);
  auction.noun = noun.id;
  auction.amount = event.params.value;
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  auction.settled = false;
  await auction.save();
}

export async function handleAuctionBid(event: AuctionBid): Promise<void> {
  let nounId = event.params.nounId.toString();
  let bidderAddress = event.params.sender;

  let bidder = await getOrCreateAccount(bidderAddress);
  let auction = await Auction.load(nounId);

  if (auction == null) {
    log.error("[handleAuctionBid] Auction not found for Noun #{}. Hash: {}", [
      nounId,
      event.transaction.hash,
    ]);
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;

  await auction.save();

  // Save Bid
  let bid = new Bid(event.transaction.hash);
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.noun = auction.noun;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = new Date(event.block.timestamp);
  bid.auction = auction.id;

  await bid.save();
}
//
// export function handleAuctionExtended(event: AuctionExtended): void {
//   let nounId = event.params.nounId.toString();
//
//   let auction = Auction.load(nounId);
//   if (auction == null) {
//     log.error(
//       "[handleAuctionExtended] Auction not found for Noun #{}. Hash: {}",
//       [nounId, event.transaction.hash]
//     );
//     return;
//   }
//
//   auction.endTime = event.params.endTime;
//   auction.save();
// }
//
// export function handleAuctionSettled(event: AuctionSettled): void {
//   let nounId = event.params.nounId.toString();
//
//   let auction = Auction.load(nounId);
//   if (auction == null) {
//     log.error(
//       "[handleAuctionSettled] Auction not found for Noun #{}. Hash: {}",
//       [nounId, event.transaction.hash]
//     );
//     return;
//   }
//
//   auction.settled = 1n;
//   auction.save();
// }
