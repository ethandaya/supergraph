import { Seed } from "./core/engine";

export function handleNounCreated(event: any): void {
  let nounId = event.params.tokenId.toString();

  let seed = new Seed(nounId);
  seed.background = event.params.seed.background;
  seed.body = event.params.seed.body;
  seed.accessory = event.params.seed.accessory;
  seed.head = event.params.seed.head;
  seed.glasses = event.params.seed.glasses;
  seed.save();

  // let noun = Noun.load(nounId);
  // if (noun == null) {
  //   log.error('[handleNounCreated] Noun #{} not found. Hash: {}', [
  //     nounId,
  //     event.transaction.hash.toHex(),
  //   ]);
  //   return;
  // }
  //
  // noun.seed = seed.id;
  // noun.save();
}
//
// export function handleNounCreatedBatch(events: any[]): void {
//   let seedBatch = new SeedBatch();
//   events.forEach((event: any) => {
//     let seed = new Seed(0);
//     seed.background = event.params.seed.background;
//     seedBatch.queue(seed);
//   });
//   seedBatch.save();
// }
