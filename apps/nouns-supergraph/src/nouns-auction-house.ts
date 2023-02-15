import { AuctionCreated } from "./types/NounsAuctionHouse/NounsAuctionHouse";
import { Auction, Noun } from "./types/schema";

const log = console;

export async function handleAuctionCreated(
  event: AuctionCreated
): Promise<void> {
  let nounId = event.params.nounId.toString();

  let noun = Noun.load(nounId.toString());
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
  auction.save();
}
//
// export function handleAuctionBid(event: AuctionBid): void {
//   let nounId = event.params.nounId.toString();
//   let bidderAddress = event.params.sender;
//
//   let bidder = getOrCreateAccount(bidderAddress);
//
//   let auction = Auction.load(nounId);
//   if (auction == null) {
//     log.error("[handleAuctionBid] Auction not found for Noun #{}. Hash: {}", [
//       nounId,
//       event.transaction.hash,
//     ]);
//     return;
//   }
//
//   auction.amount = event.params.value.toString();
//   auction.bidder = bidder.id;
//   auction.save();
//
//   // Save Bid
//   let bid = new Bid(event.transaction.hash);
//   bid.bidder = bidder.id;
//   // TODO - SQLITE does not support UINT256
//   bid.amount = auction.amount.toString();
//   bid.noun = auction.noun;
//   bid.txIndex = event.transaction.index;
//   bid.blockNumber = event.block.number;
//   bid.blockTimestamp = event.block.timestamp;
//   bid.auction = auction.id;
//   bid.save();
//
//   // TODO - do notification
//   if (!event.backfill) {
//     console.log("DO NOTIFICATION");
//   }
// }
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
