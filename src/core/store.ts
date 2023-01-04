import { Store as StoreInterface } from "./engine";

export class PrismaStore implements StoreInterface {
  set(entity: string, id: number, data: any): void {
    console.log(`set ${entity} ${id} ${JSON.stringify(data)}`);
  }
}
