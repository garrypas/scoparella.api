import {v4 as newUuid} from "uuid";
import {GameManagementAddPlayer} from "../../dtos";

export class GameManagementAddPlayerBuilder {
  private gameManagementAddPlayer: GameManagementAddPlayer;
  constructor() {
    this.gameManagementAddPlayer = new GameManagementAddPlayer();
  }

  addAnyPlayer(): GameManagementAddPlayerBuilder {
    this.add(newUuid());
    return this;
  }

  add(playerId: string): GameManagementAddPlayerBuilder {
    this.gameManagementAddPlayer.player = newUuid();
    this.gameManagementAddPlayer.playerAdded = new Date().toISOString();
    return this;
  }

  build(): GameManagementAddPlayer {
    return this.gameManagementAddPlayer;
  }
}
