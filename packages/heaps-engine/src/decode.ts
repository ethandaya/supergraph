import { Abi, AbiEvent, ExtractAbiEventNames } from "abitype";
import { Interface } from "ethers";

type RawEvent<
  TAbi extends Abi,
  E extends ExtractAbiEventNames<TAbi> = ExtractAbiEventNames<TAbi>
> = {
  data: E;
  topics: string[];
};

export function makeEventDecoder<TAbi extends Abi>(events: AbiEvent[]) {
  const iface = new Interface([...events]);
  return (eventData: RawEvent<TAbi>) => {
    const logDescription = iface.parseLog(eventData);
    const keys =
      logDescription?.fragment.inputs
        .filter((i) => !!i.name)
        .map((i) => i.name) || [];

    return {
      event: logDescription!.name,
      data: keys.reduce((acc, key, i) => {
        const value = logDescription?.args[i];
        return {
          ...acc,
          [key]: value,
        };
      }, {}),
    };
  };
}
