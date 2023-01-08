export const NounSchema = `
type NounModel = z.infer<typeof NounSchema>;

export class Noun extends Entity<NounModel> {
  constructor(id: string, data?: NounModel) {
    super(id, NounSchema, store);
    this.data = data || {};
  }

  static load(id: string): Noun | null {
    const data = store.get<NounModel>("noun", id);
    if (!data) {
      return new Noun(id);
    }

    return new Noun(id, data);
  }

  get id(): NounModel["id"] {
    const value = this.get("id");
    if (!value) {
      throw new KeyAccessError<Noun>("id");
    }

    return value;
  }

  set id(value: NounModel["id"]) {
    this.set("id", value);
  }

  get seed(): NounModel["seed"] {
    const value = this.get("seed");
    if (!value && value !== null) {
      throw new KeyAccessError<Noun>("seed");
    }

    return value;
  }

  set seed(value: NounModel["seed"]) {
    this.set("seed", value);
  }

  get owner(): NounModel["owner"] {
    const value = this.get("owner");
    if (!value) {
      throw new KeyAccessError<Noun>("owner");
    }

    return value;
  }

  set owner(value: NounModel["owner"]) {
    this.set("owner", value);
  }

  get votes(): NounModel["votes"] {
    const value = this.get("votes");
    if (!value) {
      throw new KeyAccessError<Noun>("votes");
    }

    return value;
  }

  set votes(value: NounModel["votes"]) {
    this.set("votes", value);
  }
}
`;
