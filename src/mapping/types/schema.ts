import { z } from "zod";
import { Entity, KeyAccessError } from "../../core/engine";
import { NounSchema, BidSchema, AuctionSchema, AccountSchema } from "../models";
import { store } from "../store";

type NounModel = z.infer<typeof NounSchema>;

export class Noun extends Entity<NounModel> {
    constructor(id: string, data?: NounModel) {
        super(id, NounSchema, store)
        this.data = data || {};
    }

    static async load(id: string): Promise<Noun | null> {
        const data = await store.get<NounModel>("noun", id);
        if (!data) {
           return new Noun(id);
        }

        return new Noun(id, data);
    }

    get id(): NounModel["id"] {
        const value = this.get("id")
        if (!value) {
          throw new KeyAccessError<Noun>("id")
        }

        return value
    }

    set id(value: NounModel["id"]) {
        this.set("id", value);
    }

    get seed(): NounModel["seed"] {
        const value = this.get("seed")
        if (!value && value !== null) {
          throw new KeyAccessError<Noun>("seed")
        }

        return value
    }

    set seed(value: NounModel["seed"]) {
        this.set("seed", value);
    }

    get owner(): NounModel["owner"] {
        const value = this.get("owner")
        if (!value) {
          throw new KeyAccessError<Noun>("owner")
        }

        return value
    }

    set owner(value: NounModel["owner"]) {
        this.set("owner", value);
    }

    get votes(): NounModel["votes"] {
        const value = this.get("votes")
        if (!value) {
          throw new KeyAccessError<Noun>("votes")
        }

        return value
    }

    set votes(value: NounModel["votes"]) {
        this.set("votes", value);
    }
}

type BidModel = z.infer<typeof BidSchema>;

export class Bid extends Entity<BidModel> {
    constructor(id: string, data?: BidModel) {
        super(id, BidSchema, store)
        this.data = data || {};
    }

    static async load(id: string): Promise<Bid | null> {
        const data = await store.get<BidModel>("bid", id);
        if (!data) {
           return new Bid(id);
        }

        return new Bid(id, data);
    }

    get id(): BidModel["id"] {
        const value = this.get("id")
        if (!value) {
          throw new KeyAccessError<Bid>("id")
        }

        return value
    }

    set id(value: BidModel["id"]) {
        this.set("id", value);
    }

    get noun(): BidModel["noun"] {
        const value = this.get("noun")
        if (!value) {
          throw new KeyAccessError<Bid>("noun")
        }

        return value
    }

    set noun(value: BidModel["noun"]) {
        this.set("noun", value);
    }

    get amount(): BidModel["amount"] {
        const value = this.get("amount")
        if (!value) {
          throw new KeyAccessError<Bid>("amount")
        }

        return value
    }

    set amount(value: BidModel["amount"]) {
        this.set("amount", value);
    }

    get bidder(): BidModel["bidder"] {
        const value = this.get("bidder")
        if (!value) {
          throw new KeyAccessError<Bid>("bidder")
        }

        return value
    }

    set bidder(value: BidModel["bidder"]) {
        this.set("bidder", value);
    }

    get auction(): BidModel["auction"] {
        const value = this.get("auction")
        if (!value) {
          throw new KeyAccessError<Bid>("auction")
        }

        return value
    }

    set auction(value: BidModel["auction"]) {
        this.set("auction", value);
    }

    get txIndex(): BidModel["txIndex"] {
        const value = this.get("txIndex")
        if (!value) {
          throw new KeyAccessError<Bid>("txIndex")
        }

        return value
    }

    set txIndex(value: BidModel["txIndex"]) {
        this.set("txIndex", value);
    }

    get blockNumber(): BidModel["blockNumber"] {
        const value = this.get("blockNumber")
        if (!value) {
          throw new KeyAccessError<Bid>("blockNumber")
        }

        return value
    }

    set blockNumber(value: BidModel["blockNumber"]) {
        this.set("blockNumber", value);
    }

    get blockTimestamp(): BidModel["blockTimestamp"] {
        const value = this.get("blockTimestamp")
        if (!value) {
          throw new KeyAccessError<Bid>("blockTimestamp")
        }

        return value
    }

    set blockTimestamp(value: BidModel["blockTimestamp"]) {
        this.set("blockTimestamp", value);
    }
}

type AuctionModel = z.infer<typeof AuctionSchema>;

export class Auction extends Entity<AuctionModel> {
    constructor(id: string, data?: AuctionModel) {
        super(id, AuctionSchema, store)
        this.data = data || {};
    }

    static async load(id: string): Promise<Auction | null> {
        const data = await store.get<AuctionModel>("auction", id);
        if (!data) {
           return new Auction(id);
        }

        return new Auction(id, data);
    }

    get id(): AuctionModel["id"] {
        const value = this.get("id")
        if (!value) {
          throw new KeyAccessError<Auction>("id")
        }

        return value
    }

    set id(value: AuctionModel["id"]) {
        this.set("id", value);
    }

    get noun(): AuctionModel["noun"] {
        const value = this.get("noun")
        if (!value) {
          throw new KeyAccessError<Auction>("noun")
        }

        return value
    }

    set noun(value: AuctionModel["noun"]) {
        this.set("noun", value);
    }

    get amount(): AuctionModel["amount"] {
        const value = this.get("amount")
        if (!value) {
          throw new KeyAccessError<Auction>("amount")
        }

        return value
    }

    set amount(value: AuctionModel["amount"]) {
        this.set("amount", value);
    }

    get startTime(): AuctionModel["startTime"] {
        const value = this.get("startTime")
        if (!value) {
          throw new KeyAccessError<Auction>("startTime")
        }

        return value
    }

    set startTime(value: AuctionModel["startTime"]) {
        this.set("startTime", value);
    }

    get endTime(): AuctionModel["endTime"] {
        const value = this.get("endTime")
        if (!value) {
          throw new KeyAccessError<Auction>("endTime")
        }

        return value
    }

    set endTime(value: AuctionModel["endTime"]) {
        this.set("endTime", value);
    }

    get settled(): AuctionModel["settled"] {
        const value = this.get("settled")
        if (!value) {
          throw new KeyAccessError<Auction>("settled")
        }

        return value
    }

    set settled(value: AuctionModel["settled"]) {
        this.set("settled", value);
    }

    get bidder(): AuctionModel["bidder"] {
        const value = this.get("bidder")
        if (!value && value !== null) {
          throw new KeyAccessError<Auction>("bidder")
        }

        return value
    }

    set bidder(value: AuctionModel["bidder"]) {
        this.set("bidder", value);
    }

    get bids(): AuctionModel["bids"] {
        const value = this.get("bids")
        if (!value) {
          throw new KeyAccessError<Auction>("bids")
        }

        return value
    }

    set bids(value: AuctionModel["bids"]) {
        this.set("bids", value);
    }
}

type AccountModel = z.infer<typeof AccountSchema>;

export class Account extends Entity<AccountModel> {
    constructor(id: string, data?: AccountModel) {
        super(id, AccountSchema, store)
        this.data = data || {};
    }

    static async load(id: string): Promise<Account | null> {
        const data = await store.get<AccountModel>("account", id);
        if (!data) {
           return new Account(id);
        }

        return new Account(id, data);
    }

    get id(): AccountModel["id"] {
        const value = this.get("id")
        if (!value) {
          throw new KeyAccessError<Account>("id")
        }

        return value
    }

    set id(value: AccountModel["id"]) {
        this.set("id", value);
    }

    get delegate(): AccountModel["delegate"] {
        const value = this.get("delegate")
        if (!value) {
          throw new KeyAccessError<Account>("delegate")
        }

        return value
    }

    set delegate(value: AccountModel["delegate"]) {
        this.set("delegate", value);
    }

    get tokenBalanceRaw(): AccountModel["tokenBalanceRaw"] {
        const value = this.get("tokenBalanceRaw")
        if (!value) {
          throw new KeyAccessError<Account>("tokenBalanceRaw")
        }

        return value
    }

    set tokenBalanceRaw(value: AccountModel["tokenBalanceRaw"]) {
        this.set("tokenBalanceRaw", value);
    }

    get tokenBalance(): AccountModel["tokenBalance"] {
        const value = this.get("tokenBalance")
        if (!value) {
          throw new KeyAccessError<Account>("tokenBalance")
        }

        return value
    }

    set tokenBalance(value: AccountModel["tokenBalance"]) {
        this.set("tokenBalance", value);
    }

    get totalTokensHeldRaw(): AccountModel["totalTokensHeldRaw"] {
        const value = this.get("totalTokensHeldRaw")
        if (!value) {
          throw new KeyAccessError<Account>("totalTokensHeldRaw")
        }

        return value
    }

    set totalTokensHeldRaw(value: AccountModel["totalTokensHeldRaw"]) {
        this.set("totalTokensHeldRaw", value);
    }

    get totalTokensHeld(): AccountModel["totalTokensHeld"] {
        const value = this.get("totalTokensHeld")
        if (!value) {
          throw new KeyAccessError<Account>("totalTokensHeld")
        }

        return value
    }

    set totalTokensHeld(value: AccountModel["totalTokensHeld"]) {
        this.set("totalTokensHeld", value);
    }

    get nouns(): AccountModel["nouns"] {
        const value = this.get("nouns")
        if (!value) {
          throw new KeyAccessError<Account>("nouns")
        }

        return value
    }

    set nouns(value: AccountModel["nouns"]) {
        this.set("nouns", value);
    }
}
