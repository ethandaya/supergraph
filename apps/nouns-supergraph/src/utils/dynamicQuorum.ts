import { BIGINT_10K } from './constants';

export function dynamicQuorumVotes(
  againstVotes: bigint,
  totalSupply: bigint,
  minQuorumVotesBPS: number,
  maxQuorumVotesBPS: number,
  quorumCoefficient: bigint,
): bigint {
  const againstVotesBPS = (againstVotes * BIGINT_10K) / totalSupply;
  const quorumAdjustmentBPS = (quorumCoefficient * againstVotesBPS) / BigInt(1e6);
  const adjustedQuorumBPS = quorumAdjustmentBPS + BigInt(minQuorumVotesBPS);
  const quorumBPS = Math.min(maxQuorumVotesBPS, Number(adjustedQuorumBPS));

  return (totalSupply * BigInt(quorumBPS)) / BigInt(10000);
}
