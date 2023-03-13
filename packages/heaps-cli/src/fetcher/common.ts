export type FetcherOptions = {
  contractAddresses: string[];
  startBlock?: number;
  endBlock?: number;
};

export type LogData = {
  txHash: string;
  txIndex: number;
  blockNumber: number;
  blockHash: string;
  blockTimestamp: number;
  logIndex: number;
  contractAddress: string;
  topics: string[];
  data: string;
  value: string;
  sender: string;
  recipient: string;
};

export function hexToInt(hexString: string): number {
  return parseInt(hexString, 16);
}

export function hexToString(hexString: string): string {
  return BigInt(hexString).toString();
}
