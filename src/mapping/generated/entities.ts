import { CrudEntity, Entity, KeyAccessError } from "../../core/engine";
import { AuctionSchema, NounSchema, SeedSchema } from "../models";
import { store } from "../store";
import { z } from "zod";

export type SeedModel = z.infer<typeof SeedSchema>;
export class Seed extends Entity<SeedModel> {
  constructor(id: number) {
    super(id, SeedSchema, store);
  }
  get background(): string {
    const value = this.get("background");
    if (!value) {
      throw new KeyAccessError<Seed>("background");
    }
    return value;
  }

  set background(value: string) {
    this.set("background", value);
  }

  get body(): string {
    const value = this.get("body");
    if (!value) {
      throw new KeyAccessError<Seed>("body");
    }
    return value;
  }

  set body(value: string) {
    this.set("body", value);
  }

  get accessory(): string {
    const value = this.get("accessory");
    if (!value) {
      throw new KeyAccessError<Seed>("accessory");
    }
    return value;
  }

  set accessory(value: string) {
    this.set("accessory", value);
  }

  get head(): string {
    const value = this.get("head");
    if (!value) {
      throw new KeyAccessError<Seed>("head");
    }
    return value;
  }

  set head(value: string) {
    this.set("head", value);
  }

  get glasses(): string {
    const value = this.get("glasses");
    if (!value) {
      throw new KeyAccessError<Seed>("glasses");
    }
    return value;
  }

  set glasses(value: string) {
    this.set("glasses", value);
  }
}

export type NounModel = z.infer<typeof NounSchema>;

export class Noun extends Entity<NounModel> {
  constructor(id: number) {
    super(id, NounSchema, store);
  }

  get seed(): number | null {
    let value = this.get("seed");
    if (!value) {
      return null;
    } else {
      return value;
    }
  }

  set seed(value: number | null) {
    this.set("seed", value);
  }

  get owner(): string {
    const value = this.get("owner");
    if (!value) {
      throw new KeyAccessError<Noun>("owner");
    }
    return value;
  }

  set owner(value: string) {
    this.set("owner", value);
  }

  get votes(): Array<string> {
    const value = this.get("votes");
    if (!value) {
      throw new KeyAccessError<Noun>("votes");
    }
    return value;
  }

  set votes(value: string[]) {
    this.set("votes", value);
  }

  static async load(id: string | number): Promise<CrudEntity<Noun>> {
    console.log("load", id);
    throw new Error("Method not implemented");
  }
}

export type AuctionModel = z.infer<typeof AuctionSchema>;

export class Auction extends Entity<AuctionModel> {
  constructor(id: number) {
    super(id, AuctionSchema, store);
  }
  get noun(): number {
    let value = this.get("noun");
    if (!value) {
      throw new KeyAccessError<Auction>("noun");
    }
    return value;
  }

  set noun(value: number) {
    this.set("noun", value);
  }

  get amount(): number {
    let value = this.get("amount");
    if (!value) {
      throw new KeyAccessError<Auction>("noun");
    }
    return value;
  }

  set amount(value: number) {
    this.set("amount", value);
  }

  get startTime(): number {
    let value = this.get("startTime");
    if (!value) {
      throw new KeyAccessError<Auction>("startTime");
    }
    return value;
  }

  set startTime(value: number) {
    this.set("startTime", value);
  }

  get endTime(): number {
    let value = this.get("endTime");
    if (!value) {
      throw new KeyAccessError<Auction>("endTime");
    }
    return value;
  }

  set endTime(value: number) {
    this.set("endTime", value);
  }

  get settled(): boolean {
    let value = this.get("settled");
    if (!value) {
      throw new KeyAccessError<Auction>("settled");
    }
    return value;
  }

  set settled(value: boolean) {
    this.set("settled", value);
  }

  get bidder(): string | null {
    const value = this.get("bidder");
    // TODO - mature null logic
    if (!value) {
      return null;
    } else {
      return value;
    }
  }

  set bidder(value: string | null) {
    if (!value) {
      this.unset("bidder");
    } else {
      this.set("bidder", value);
    }
  }

  get bids(): string[] {
    const value = this.get("bids");
    if (!value) {
      throw new KeyAccessError<Auction>("bids");
    }
    return value;
  }

  set bids(value: string[]) {
    this.set("bids", value);
  }
}
