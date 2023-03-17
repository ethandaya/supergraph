import { Block, Hex, Log, PublicClient, Transaction } from "viem";

type BaseBlock = Omit<Block, "transactions">;

export type RawEvent = Log & {
  block: BaseBlock;
  transaction: Transaction;
};

export class RPCFetcher {
  constructor(
    private readonly addresses: Hex[],
    private readonly client: PublicClient,
    private readonly logChunkSize: bigint = 10000n,
    private readonly blockChunkSize: bigint = 100n
  ) {}
  async fetchLogsForRange(from: bigint, to: bigint): Promise<Log[]> {
    return this.client.getLogs({
      fromBlock: from,
      toBlock: to,
      address: this.addresses,
    });
  }

  async fetchBlocks(blockNumbers: bigint[]): Promise<Block[]> {
    return Promise.all(
      blockNumbers.map(async (num) =>
        this.client.getBlock({
          blockNumber: num,
          includeTransactions: true,
        })
      )
    );
  }

  async transformEvents(
    logs: Log[],
    blocks: BaseBlock[],
    transactions: Transaction[]
  ): Promise<RawEvent[]> {
    const blockMap = new Map<Hex, BaseBlock>();
    const txMap = new Map<Hex, Transaction>();
    blocks.forEach((block) => {
      if (!block.hash) {
        throw new Error(`Block ${block.number} has no hash`);
      }
      blockMap.set(block.hash, block);
    });
    transactions.forEach((tx) => {
      if (!tx.hash) return;
      txMap.set(tx.hash, tx);
    });
    return logs.map((log) => {
      if (!log.blockHash) {
        throw new Error(`Log ${log.logIndex} has no block hash`);
      }
      if (!log.transactionHash) {
        throw new Error(`Log ${log.logIndex} has no transaction hash`);
      }
      const block = blockMap.get(log.blockHash);
      if (!block) {
        throw new Error(`Block ${log.blockHash} not found`);
      }
      const transaction = txMap.get(log.transactionHash);
      if (!transaction) {
        throw new Error(`Transaction ${log.transactionHash} not found`);
      }
      return { ...log, block, transaction };
    });
  }

  async fetchEventsForRange(from: bigint, to: bigint): Promise<RawEvent[]> {
    const logs = await this.fetchLogsForRange(from, to);

    function isUniqueBlockNumber(
      value: bigint | null,
      index: number,
      array: (bigint | null)[]
    ): value is bigint {
      if (value === null) return false;
      return array.indexOf(value) === index;
    }

    const blockNumbers = logs
      .map((log) => log.blockNumber)
      .filter(isUniqueBlockNumber);

    const blocks: BaseBlock[] = [];
    const transactions: Transaction[] = [];

    console.log(
      `Fetching: ${blockNumbers.length} required blocks for range ${from} to ${to}...`
    );

    const blockChunk = Number(this.blockChunkSize);
    for (let i = 0; i < blockNumbers.length; i += blockChunk) {
      const numToFetch = i + blockChunk;
      const target =
        numToFetch < blockNumbers.length ? numToFetch : blockNumbers.length;
      const chunk = await this.fetchBlocks(blockNumbers.slice(i, target));
      chunk.forEach((block) => {
        transactions.push(...(block.transactions as Transaction[]));
      });
      blocks.push(...chunk.map(({ transactions, ...block }) => block));
    }
    console.log(`Fetched ${blocks.length} blocks...`);
    return this.transformEvents(logs, blocks, transactions);
  }

  async fetchEvents(from: bigint, to: bigint) {
    const events: RawEvent[] = [];
    for (let i = from; i < to; i += this.logChunkSize) {
      const time = Date.now();
      const numToFetch = i + this.logChunkSize;
      const target = numToFetch < to ? numToFetch : to;
      console.log(`Fetching logs from ${i} to ${target}...`);
      const chunk = await this.fetchEventsForRange(i, target);
      console.log(`Fetched ${chunk.length} logs...`);
      events.push(...chunk);
      const timeTaken = Date.now() - time;
      const eta = ((to - from) / this.logChunkSize) * BigInt(timeTaken);
      console.log(
        `Fetched ${to} logs in ${timeTaken}ms (ETA: ${this.formatETA(eta)})`
      );
    }
    return events;
  }

  private formatETA(eta: bigint) {
    const seconds = eta / 1000n;
    const minutes = seconds / 60n;
    const hours = minutes / 60n;
    const days = hours / 24n;
    const weeks = days / 7n;
    const months = days / 30n;
    const years = days / 365n;
    if (years > 1n) {
      return `${years} years`;
    } else if (months > 1n) {
      return `${months} months`;
    } else if (weeks > 1n) {
      return `${weeks} weeks`;
    } else if (days > 1n) {
      return `${days} days`;
    } else if (hours > 1n) {
      return `${hours} hours`;
    } else if (minutes > 1n) {
      return `${minutes} minutes`;
    } else if (seconds > 1n) {
      return `${seconds} seconds`;
    } else {
      return `${eta}ms`;
    }
  }
}
