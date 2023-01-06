import { Account, Auction, Bid, Noun } from "./types/schema";

type AuctionBid = any;
type AuctionCreated = any;
type AuctionExtended = any;
type AuctionSettled = any;

export async function getOrCreateAccount(id: string): Promise<Account>;
export async function getOrCreateAccount(
  id: string,
  createIfNotFound: boolean = true,
  save: boolean = true
): Promise<Account | null> {
  let tokenHolder = await Account.load(id);

  if (tokenHolder == null && createIfNotFound) {
    tokenHolder = new Account(id);
    tokenHolder.tokenBalanceRaw = "0";
    tokenHolder.tokenBalance = "0";
    tokenHolder.totalTokensHeldRaw = "0";
    tokenHolder.totalTokensHeld = "0";
    tokenHolder.nouns = [];

    if (save) {
      await tokenHolder.save();
      return tokenHolder;
    }
  }

  return tokenHolder;
}

export async function handleAuctionCreated(
  event: AuctionCreated
): Promise<void> {
  let nounId = event.params.nounId.toString();

  let noun = await Noun.load(nounId);
  if (noun == null) {
    console.error("[handleAuctionCreated] Noun #{} not found. Hash: {}", [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let auction = new Auction(nounId);
  auction.noun = noun.id;
  auction.amount = "0";
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  auction.settled = false;
  await auction.save();
}

export async function handleAuctionBid(event: AuctionBid): Promise<void> {
  let nounId = event.params.nounId.toString();
  let bidderAddress = event.params.sender.toHex();

  let bidder = await getOrCreateAccount(bidderAddress);

  let auction = await Auction.load(nounId);
  if (auction == null) {
    console.error(
      "[handleAuctionBid] Auction not found for Noun #{}. Hash: {}",
      [nounId, event.transaction.hash.toHex()]
    );
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;
  await auction.save();

  // Save Bid
  let bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.noun = auction.noun;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  await bid.save();
}

export async function handleAuctionExtended(
  event: AuctionExtended
): Promise<void> {
  let nounId = event.params.nounId.toString();

  let auction = await Auction.load(nounId);
  if (auction == null) {
    console.error(
      "[handleAuctionExtended] Auction not found for Noun #{}. Hash: {}",
      [nounId, event.transaction.hash.toHex()]
    );
    return;
  }

  auction.endTime = event.params.endTime;
  await auction.save();
}

export async function handleAuctionSettled(
  event: AuctionSettled
): Promise<void> {
  let nounId = event.params.nounId.toString();

  let auction = await Auction.load(nounId);
  if (auction == null) {
    console.error(
      "[handleAuctionSettled] Auction not found for Noun #{}. Hash: {}",
      [nounId, event.transaction.hash.toHex()]
    );
    return;
  }

  auction.settled = true;
  await auction.save();
}
