import { Noun, Seed } from "./generated/entities";

export async function handleNounCreated(event: any): Promise<void> {
  const nounId = event.params.tokenId.toString();

  const seed = new Seed(nounId);

  seed.background = event.params.seed.background;
  seed.body = event.params.seed.body;
  seed.accessory = event.params.seed.accessory;
  seed.head = event.params.seed.head;
  seed.glasses = event.params.seed.glasses;

  await seed.save();

  const noun = await Noun.load(nounId);

  if (!noun) {
    console.error("[handleNounCreated] Noun #{} not found. Hash: {}", [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  noun.seed = seed.id;
  await noun.save();
}
