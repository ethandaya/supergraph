import { handleNounCreated } from "./nouns-erc-721";

handleNounCreated({
  params: {
    tokenId: 3,
    seed: {
      background: 1,
      body: 2,
      accessory: 3,
      head: 4,
      glasses: 5,
    },
  },
});
//
// handleNounCreatedBatch([
//   {
//     params: {
//       seed: {
//         background: 1,
//       },
//     },
//   },
//   {
//     params: {
//       seed: {
//         background: 2,
//       },
//     },
//   },
// ]);
