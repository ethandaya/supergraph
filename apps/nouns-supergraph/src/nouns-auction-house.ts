import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionSettled,
} from "./types/NounsAuctionHouse/NounsAuctionHouse";
import { Auction, Bid, Noun } from "./types/schema";
import { getOrCreateAccount } from "./utils/helpers";
const log = console;

export function handleAuctionCreated(event: AuctionCreated): void {
  let nounId = event.params.nounId.toString();

  let noun = Noun.load(nounId);
  if (noun == null) {
    log.error("[handleAuctionCreated] Noun #{} not found. Hash: {}", [
      nounId,
      event.transaction.hash,
    ]);
    return;
  }

  let auction = new Auction(nounId);
  auction.noun = noun.id;
  auction.amount = 0n;
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  // TODO - this doesn't feel ideal, this plays into respect the store but needs work
  auction.settled = 0;
  auction.save();
}

export function handleAuctionBid(event: AuctionBid): void {
  let nounId = event.params.nounId.toString();
  let bidderAddress = event.params.sender;

  let bidder = getOrCreateAccount(bidderAddress);

  let auction = Auction.load(nounId);
  if (auction == null) {
    log.error("[handleAuctionBid] Auction not found for Noun #{}. Hash: {}", [
      nounId,
      event.transaction.hash,
    ]);
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;
  auction.save();

  // Save Bid
  let bid = new Bid(event.transaction.hash);
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.noun = auction.noun;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}

export function handleAuctionExtended(event: AuctionExtended): void {
  let nounId = event.params.nounId.toString();

  let auction = Auction.load(nounId);
  if (auction == null) {
    log.error(
      "[handleAuctionExtended] Auction not found for Noun #{}. Hash: {}",
      [nounId, event.transaction.hash]
    );
    return;
  }

  auction.endTime = event.params.endTime;
  auction.save();
}

export function handleAuctionSettled(event: AuctionSettled): void {
  let nounId = event.params.nounId.toString();

  let auction = Auction.load(nounId);
  if (auction == null) {
    log.error(
      "[handleAuctionSettled] Auction not found for Noun #{}. Hash: {}",
      [nounId, event.transaction.hash]
    );
    return;
  }

  auction.settled = 1;
  auction.save();
}
