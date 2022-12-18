export interface Store {
  set<T extends {}>(
    table: string,
    pk: string | number,
    value: T
  ): Promise<void>;

  // setMany(values: { [key: string]: any }): void;
}

export class Entity {
  name: string = this.constructor.name;
  pk: string | number;
  data: any = {};
  store!: Store;

  constructor(pk: string | number) {
    this.pk = pk;
    this.store = require("../store").store;
  }

  getEntity() {
    return this.data;
  }

  set(key: string, value: any) {
    console.log("setting into temp store", key, value);
    this.data[key] = value;
    return value;
  }

  get(key: string) {
    console.log("getting from temp store", key);
    return this.data[key];
  }

  async save() {
    console.log("persisting to db");
    await this.store.set(this.name, this.pk, this.data);
  }
}

export class Batch<T extends Entity> {
  _queue: T[] = [];

  queue(entity: T) {
    this._queue.push(entity);
  }

  save() {
    const dtos = this._queue.map((e: T) => e.getEntity());
    console.log(`persisting batch w. len ${dtos.length} to db`);
  }
}

export class Seed extends Entity {
  get background(): string {
    let value = this.get("background");
    return value;
  }

  set background(value: string) {
    this.set("background", value);
  }

  get body(): string {
    let value = this.get("body");
    return value;
  }

  set body(value: string) {
    this.set("body", value);
  }

  get accessory(): string {
    let value = this.get("accessory");
    return value;
  }

  set accessory(value: string) {
    this.set("accessory", value);
  }

  get head(): string {
    let value = this.get("head");
    return value;
  }

  set head(value: string) {
    this.set("head", value);
  }

  get glasses(): string {
    let value = this.get("glasses");
    return value;
  }

  set glasses(value: string) {
    this.set("glasses", value);
  }
}

export class SeedBatch extends Batch<Seed> {}
