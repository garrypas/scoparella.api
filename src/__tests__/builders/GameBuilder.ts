import {GameDto} from "@scoparella/dtos";
import {Game as ScoparellaGame, GameStatus, Player} from "scoparella.engine";
import {v4 as newUuid} from "uuid";
import {Game, Statuses} from "../../models";

export class GameBuilder {
  private game: Game;
  private scoparellaGame: ScoparellaGame;

  constructor() {
    this.scoparellaGame = new ScoparellaGame({numberOfPlayers: 2});
    this.game = new Game({id: newUuid()});
  }
  addPlayer(playerId?: string): GameBuilder {
    if (this.game.isFull) {
      this.game = new Game({id: newUuid()});
      return this.addPlayer(playerId);
    }

    if (!this.game.player1) {
      this.game.player1 = playerId ?? newUuid();
      this.game.player1Added = new Date().toISOString();
      this.game.statusId = Statuses.waiting;
      this.scoparellaGame.addPlayer(new Player(this.game.player1));
    } else {
      this.game.player2 = playerId ?? newUuid();
      this.game.player2Added = new Date().toISOString();
      this.scoparellaGame.addPlayer(new Player(this.game.player2));
    }
    return this;
  }

  withState(state: GameDto): GameBuilder {
    this.scoparellaGame = ScoparellaGame.fromDto(state);
    this.game = new Game({id: newUuid()});
    this.game.player1 = state.hands[0]?.player?.id ?? null;
    this.game.player1Added = new Date().toISOString();
    this.game.player2 = state.hands[1]?.player?.id ?? null;
    this.game.player2Added = new Date().toISOString();
    this.game.statusId =
      state.status === GameStatus.IN_PROGRESS
        ? Statuses.inProgress
        : Statuses.waiting;
    this.game.gameState = ScoparellaGame.toJson(this.scoparellaGame);
    return this;
  }

  build(): Game {
    if (this.game.isFull) {
      this.game.gameState = ScoparellaGame.toJson(this.scoparellaGame);
      this.game.statusId = Statuses.inProgress;
    }
    return this.game;
  }
}
