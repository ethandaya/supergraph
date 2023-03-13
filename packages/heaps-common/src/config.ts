export interface Event {
  name: string;
  interface: string;
  handler: string;
}

export interface Source {
  name: string;
  network: string;
  kind: "contract";
  abi: string;
  addresses: string[] | "*";
  events: Event[];
  mapping: string;
}

export interface SuperGraphConfig {
  name: string;
  version: string;
  description: string;
  sources: Source[];
}
