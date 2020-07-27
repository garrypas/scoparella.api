import {v5} from "uuid";

export class PlayerService {
  constructor() {}

  static generateId(id: string, strategyUuid: string) {
    return v5(id, strategyUuid);
  }
}
